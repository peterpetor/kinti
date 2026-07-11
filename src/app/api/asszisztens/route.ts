import { NextResponse } from "next/server";
import { runAiChat, extractJsonObject, checkAiRateLimit, logAiRateLimit } from "@/lib/ai";
import { getCategories } from "@/lib/repo";
import { getQuizCtaBusinesses } from "@/lib/repo-business";
import { heuristicParseSearch } from "@/lib/search-heuristic";
import { scoreGuides } from "@/lib/assistant-match";
import { getGuides } from "@/lib/guides";
import { getRegions } from "@/lib/regions";
import { isValidCountry } from "@/lib/countries";
import { hashIp } from "@/lib/security";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/asszisztens — a Kinti Asszisztens: szabad szöveges probléma →
 * releváns TUDÁSBÁZIS-cikkek + magyar SZAKEMBEREK a Szaknévsorból.
 *
 * Architektúra (szándékos döntések):
 *  • NEM generál szabad-szöveges tanácsot (hallucináció + jogi kockázat) —
 *    kurált tartalomhoz IRÁNYÍT. A cikk-illesztés determinisztikus pontozás
 *    (assistant-match), NEM Vectorize (az index kicsi, a kurált bank pontosabb).
 *  • Heurisztika-először (search-heuristic, ingyenes): tiszta „szakma+hely"
 *    kérdésnél AI-hívás SINCS. Hosszabb, természetes mondatnál EGY Workers
 *    AI-hívás értelmez (kategória+régió), saját kvótával (assistant, 10/óra/IP).
 *
 * Body: { query: string, country?: "CH"|"AT"|"DE"|"NL" }
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { query?: string; country?: string };
    const query = typeof body.query === "string" ? body.query.trim() : "";
    const country = isValidCountry(body.country) ? body.country : "CH";
    if (query.length < 3 || query.length > 300) {
      return NextResponse.json({ error: "Írd le 3–300 karakterben, miben segítsünk." }, { status: 400 });
    }

    const categories = await getCategories();

    // 1) Heurisztika (ingyenes, determinisztikus) — tiszta „szakma+hely" mintára.
    let categoryId: string | null = null;
    let cantonCode: string | null = null;
    let explanation = "";
    let usedAi = false;

    const h = heuristicParseSearch(query.slice(0, 200), country, categories);
    if (h) {
      categoryId = h.categoryId;
      cantonCode = h.cantonCode;
      explanation = h.explanation;
    } else {
      // 2) AI-értelmezés — CSAK ha a heurisztika nem tudta; saját kvótával.
      const ipHash = await hashIp(req.headers.get("cf-connecting-ip"));
      const rl = await checkAiRateLimit("assistant", ipHash);
      if (rl.allowed) {
        // Slot-foglalás a drága hívás ELŐTT (TOCTOU-zárás, a parse-search mintája).
        await logAiRateLimit("assistant", ipHash);
        usedAi = true;
        try {
          const catList = categories.map((c) => `  • ${c.id} (${c.label})`).join("\n");
          const regionList = getRegions(country).map((r) => `  • ${r.code} (${r.name})`).join("\n");
          const system = `Te a kinti.app asszisztense vagy. A felhasználó egy külföldön élő magyar,
aki leír egy problémát. A feladatod KIZÁRÓLAG strukturált szűrők kinyerése JSON-ba:
melyik SZAKEMBER-kategória segíthet neki, és melyik régióban van (ha említi).

KATEGÓRIÁK (csak ezek id-jét használhatod; ha egyik sem illik, null):
${catList}

RÉGIÓK (csak ezek kódját; ha nem említ helyet, null):
${regionList}

FONTOS: a városnevet a RÉGIÓJÁRA képezd le (például Ausztriában „Bécs/Bécsben" → "W",
Németországban „München" → "BY", Svájcban „Zürich" → "ZH"). Ha nem vagy BIZTOS a
régióban, a cantonCode legyen null — a rossz régió rosszabb, mint a semmi.
Az explanation legfeljebb 12 szó.

Válaszolj KIZÁRÓLAG ezzel a JSON-nal:
{"categoryId": "…"|null, "cantonCode": "…"|null, "explanation": "1 rövid magyar mondat, mit értettél meg"}`;
          const raw = await runAiChat({ system, user: query, maxTokens: 200, temperature: 0 });
          const parsed = raw.ok
            ? extractJsonObject<{ categoryId?: unknown; cantonCode?: unknown; explanation?: unknown }>(raw.text)
            : null;
          const cid = typeof parsed?.categoryId === "string" ? parsed.categoryId : null;
          const ccode = typeof parsed?.cantonCode === "string" ? parsed.cantonCode : null;
          if (cid && categories.some((c) => c.id === cid)) categoryId = cid;
          if (ccode && getRegions(country).some((r) => r.code === ccode)) cantonCode = ccode;
          if (typeof parsed?.explanation === "string") explanation = parsed.explanation.slice(0, 160);
        } catch (aiErr) {
          safeLogError("asszisztens/ai", aiErr);
          // AI-hiba → megyünk tovább a cikk-illesztéssel (a válasz így is hasznos).
        }
      }
    }

    // 3) Tudásbázis-cikkek — determinisztikus pontozás a user ORSZÁGÁNAK cikkein.
    const guides = scoreGuides(
      query,
      getGuides(country).map((g) => ({ slug: g.slug, title: g.title, summary: g.summary })),
    );

    // 4) Szakemberek — ha van kategória (kiemelt=PRO elöl, kontakt nélkül).
    const businesses = categoryId ? await getQuizCtaBusinesses(country, [categoryId], 3) : [];

    return NextResponse.json(
      {
        categoryId,
        cantonCode,
        explanation,
        usedAi,
        guides,
        businesses,
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (err) {
    safeLogError("api/asszisztens", err);
    return NextResponse.json({ error: "Belső hiba. Próbáld újra később." }, { status: 500 });
  }
}
