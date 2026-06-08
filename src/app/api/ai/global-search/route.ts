import { NextResponse } from "next/server";
import { runAiChat, extractJsonObject, checkAiRateLimit, logAiRateLimit } from "@/lib/ai";
import { getBusinesses, getCategories } from "@/lib/repo";
import { CANTONS } from "@/lib/cantons";
import { detectCanton, detectCategory, tokenize, rankBusinesses } from "@/lib/global-search";
import { hashIp } from "@/lib/security";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const CANTON_CODES = new Set(CANTONS.map((c) => c.code));

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { query?: string };
    const query = typeof body.query === "string" ? body.query.trim() : "";

    if (!query || query.length < 3) {
      return NextResponse.json({ error: "Kérlek írd le részletesen, hogy mit keresel." }, { status: 400 });
    }

    // 1. Rate-limit ellenőrzés
    const ipHash = await hashIp(req.headers.get("cf-connecting-ip"));
    const rl = await checkAiRateLimit("parse-search", ipHash);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Túl sok kérés. Próbáld újra később." },
        { status: 429 },
      );
    }

    const cats = await getCategories();
    const validCategoryIds = new Set(cats.map((c) => c.id));

    // 2. Szándék — ELŐSZÖR determinisztikusan (AI nélkül, gyors + ingyenes).
    let cantonCode: string | null = detectCanton(query)?.code ?? null;
    let categoryId: string | null = detectCategory(query, cats);
    const queryTokens = tokenize(query);

    // 3. AI-fallback CSAK akkor, ha a kategóriát nem sikerült determinisztikusan
    //    felismerni (pl. körülírás: „valaki aki megjavítja a kocsim"). Így a
    //    tipikus lekérdezésnél megspóroljuk ezt az AI-hívást.
    if (!categoryId) {
      const catList = cats.filter((c) => c.id !== "all").map((c) => `  • ${c.id} (${c.label})`).join("\n");
      const cantonList = CANTONS.map((c) => `  • ${c.code} (${c.name})`).join("\n");
      const systemExtract = `A felhasználó egy szolgáltatót keres Svájcban. Nyerd ki a kategóriát és a kantont.
KATEGÓRIÁK (csak az ID-ket használd):
${catList}

KANTON-KÓDOK (ISO 2 betűs):
${cantonList}

VÁLASZ FORMÁTUM (KIZÁRÓLAG JSON):
{ "categoryId": "<id vagy null>", "cantonCode": "<kód vagy null>" }`;

      const extractRes = await runAiChat({
        system: systemExtract,
        user: query,
        maxTokens: 80,
        temperature: 0.1,
      });

      if (extractRes.ok) {
        const parsed = extractJsonObject<{ categoryId: string | null; cantonCode: string | null }>(extractRes.text);
        if (parsed?.categoryId && validCategoryIds.has(parsed.categoryId)) {
          categoryId = parsed.categoryId;
        }
        // Kantont csak akkor vesszük az AI-tól, ha determinisztikusan nem találtuk.
        if (!cantonCode && parsed?.cantonCode && CANTON_CODES.has(parsed.cantonCode)) {
          cantonCode = parsed.cantonCode;
        }
      }
    }

    // 4. Visszakeresés + relevancia-rangsorolás (determinisztikus).
    const allBiz = await getBusinesses({ category: categoryId || "all" });
    const ranked = rankBusinesses(allBiz, { cantonCode, queryTokens });

    // Top 5 a válasz-prompthoz.
    const topBiz = ranked.slice(0, 5).map((b) =>
      `- ${b.name} (Értékelés: ${b.rating}/5, Cím: ${b.address || "Nincs megadva"}). ${b.blurb ? "Leírás: " + b.blurb : ""} ${b.openText ? "Nyitva: " + b.openText : ""}`.trim(),
    );

    // 5. Természetes nyelvű válasz generálása.
    const systemResponse = `Te vagy Kinti, a svájci-magyar közösségi platform barátságos, segítőkész AI asszisztense.
A felhasználó kérdésére kell válaszolnod a rendelkezésedre bocsátott adatbázis-találatok alapján.

Szabályok:
1. Légy kedves, informatív és tegeződj. Röviden és lényegretörően válaszolj.
2. Ha van találat, sorold fel a cégek nevét és címét, és emelj ki hasznos információt (pl. nyitvatartás, leírás). Javasold, hogy keressék meg a Szaknévsorban őket.
3. Ha a találatok közt nincs ott pontosan amit keres, ajánld a legközelebbieket amiket megkaptál.
4. Ha egyáltalán nincs találat, kérd meg, hogy próbáljon más kategóriát vagy várost, vagy nézzen körül a kinti.app/szaknevsor oldalon.

EZEKET A VÁLLALKOZÓKAT TALÁLTAM A RENDSZERBEN:
${topBiz.length > 0 ? topBiz.join("\n") : "Nincs találat az adatbázisban a megadott feltételekkel."}`;

    const finalRes = await runAiChat({
      system: systemResponse,
      user: query,
      maxTokens: 350,
      temperature: 0.5,
    });

    if (!finalRes.ok) {
      return NextResponse.json({ error: "Az AI jelenleg nem elérhető." }, { status: 503 });
    }

    await logAiRateLimit("parse-search", ipHash);

    return NextResponse.json({
      answer: finalRes.text,
      businessesFound: ranked.length,
    });

  } catch (err) {
    safeLogError("api/ai/global-search", err);
    return NextResponse.json({ error: "Belső szerverhiba történt." }, { status: 500 });
  }
}
