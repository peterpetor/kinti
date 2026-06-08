import { NextResponse } from "next/server";
import { runAiChat, extractJsonObject, checkAiRateLimit, logAiRateLimit } from "@/lib/ai";
import { getBusinesses, getCategories } from "@/lib/repo";
import { CANTONS, cantonFromAddress, matchCantonByName } from "@/lib/cantons";
import { hashIp } from "@/lib/security";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { query?: string };
    const query = typeof body.query === "string" ? body.query.trim() : "";

    if (!query || query.length < 3) {
      return NextResponse.json({ error: "Kérlek írd le részletesen, hogy mit keresel." }, { status: 400 });
    }

    // 1. Rate-limit ellenőrzés
    const ipHash = await hashIp(req.headers.get("cf-connecting-ip"));
    const rl = await checkAiRateLimit("parse-search", ipHash); // Ugyanazt a limittípust használjuk
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Túl sok kérés. Próbáld újra később." },
        { status: 429 },
      );
    }

    const cats = await getCategories();
    const catList = cats.map((c) => `  • ${c.id} (${c.label})`).join("\n");
    const cantonList = CANTONS.map((c) => `  • ${c.code} (${c.name})`).join("\n");

    // 2. Szándék megértése (Entity extraction)
    const systemExtract = `A felhasználó egy szolgáltatót vagy információt keres Svájcban.
A feladatod kinyerni a kategóriát, a kantont és a kulcsszavakat.
KATEGÓRIÁK (csak az ID-ket írd vissza):
${catList}

KANTON-KÓDOK (ISO 2 betűs):
${cantonList}

VÁLASZ FORMÁTUM (KIZÁRÓLAG JSON):
{
  "categoryId": "<id vagy null>",
  "cantonCode": "<kód vagy null>",
  "keywords": "<egyéb szöveg, pl. szombaton nyitva, magyarul beszélő>"
}`;

    const extractRes = await runAiChat({
      system: systemExtract,
      user: query,
      maxTokens: 150,
      temperature: 0.1,
    });

    if (!extractRes.ok) {
      return NextResponse.json({ error: "Az AI jelenleg nem elérhető." }, { status: 503 });
    }

    const parsed = extractJsonObject<{ categoryId: string | null; cantonCode: string | null; keywords: string | null }>(extractRes.text);

    // 3. Keresés az adatbázisban
    let matchedBusinesses = [];
    if (parsed) {
      const allBiz = await getBusinesses({ category: parsed.categoryId || "all" });
      
      matchedBusinesses = allBiz.filter(b => {
        if (parsed.cantonCode) {
          const c = cantonFromAddress(b.address) || matchCantonByName(b.address ?? "");
          if (c?.code !== parsed.cantonCode) return false;
        }
        if (parsed.keywords && parsed.keywords.length > 2) {
          const kw = parsed.keywords.toLowerCase();
          const text = (b.name + " " + (b.blurb || "") + " " + (b.openText || "") + " " + (b.languages?.join(" ") || "")).toLowerCase();
          if (!text.includes(kw)) return false;
        }
        return true;
      });

      // Ha nincs találat pontos kulcsszóra, próbáljuk meg csak kategóriára/kantonra
      if (matchedBusinesses.length === 0 && parsed.keywords) {
         matchedBusinesses = allBiz.filter(b => {
            if (parsed.cantonCode) {
              const c = cantonFromAddress(b.address) || matchCantonByName(b.address ?? "");
              if (c?.code !== parsed.cantonCode) return false;
            }
            return true;
         });
      }
    }

    // Vesszük a top 5-öt, hogy beférjen az AI promptba
    const topBiz = matchedBusinesses.slice(0, 5).map(b => 
      `- ${b.name} (Értékelés: ${b.rating}/5, Cím: ${b.address || "Nincs megadva"}). ${b.blurb ? "Leírás: " + b.blurb : ""} ${b.openText ? "Nyitva: " + b.openText : ""}`
    );

    // 4. Válasz generálása (Natural language)
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
      return NextResponse.json({ error: "Nem sikerült legenerálni a választ." }, { status: 503 });
    }

    await logAiRateLimit("parse-search", ipHash);

    return NextResponse.json({
      answer: finalRes.text,
      businessesFound: matchedBusinesses.length
    });

  } catch (err) {
    safeLogError("api/ai/global-search", err);
    return NextResponse.json({ error: "Belső szerverhiba történt." }, { status: 500 });
  }
}
