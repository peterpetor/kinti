import { NextResponse } from "next/server";
import { runAiChat, checkAiRateLimit, logAiRateLimit } from "@/lib/ai";
import { hashIp } from "@/lib/bulletin";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
/** Edge cache: a választ 7 napra cache-eljük, ugyanaz a kifejezés mindig ugyanazt jelenti. */
export const revalidate = 604800;

/**
 * GET /api/ai/german-term?term=Vorsorgeauftrag
 *
 * Rövid magyar magyarázat egy svájci német/francia hivatali kifejezéshez.
 * Cache-elhető — ugyanaz a kifejezés mindig ugyanazt jelenti, ezért edge-cache
 * 7 napra (a Workers AI hívási kvótát is takarjuk).
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    // toLowerCase a cache-key normalizáláshoz — anélkül case-variációkkal
    // (Vorsorgeauftrag / vorsorgeauftrag / VorSorGe...) a cache megkerülhető
    // és a rate-limit is ki-bypassolható volna.
    const term = (url.searchParams.get("term") ?? "").trim().toLowerCase();

    if (!term || term.length < 2 || term.length > 60) {
      return NextResponse.json(
        { error: "Adj meg egy 2-60 karakter hosszú német/francia kifejezést." },
        { status: 400 },
      );
    }

    // Egyszerű alap-validáció: csak betűk, kötőjel, szóköz, ékezet engedélyezett
    if (!/^[\p{L}\s\-/.()]+$/u.test(term)) {
      return NextResponse.json(
        { error: "Érvénytelen karakterek a kifejezésben." },
        { status: 400 },
      );
    }

    // Rate-limit (50/IP/óra) — cache-miss esetén lép életbe
    const ipHash = await hashIp(req.headers.get("cf-connecting-ip"));
    const rl = await checkAiRateLimit("german-term", ipHash);
    if (!rl.allowed) {
      return NextResponse.json(
        { explanation: null, error: `Túl sok kérelem. Próbáld újra egy óra múlva. (${rl.current}/${rl.max})` },
        { status: 429 },
      );
    }

    const system = `Te a kinti.app svájci ügyintézés-szótár AI-asszisztense vagy.
A felhasználó egy svájci hivatali német vagy francia kifejezést ad meg, és te
rövid magyar magyarázatot adsz hozzá.

SZABÁLYOK:
• Csak magyarul válaszolj, 2-3 mondatban (max 250 karakter).
• 1. mondat: a szó jelentése — szó-szerinti fordítás + tartalmi jelentés.
• 2. mondat: hol találkozhatsz vele a svájci ügyintézésben (kontextus).
• Ha nem ismered a kifejezést, írd: "Nem ismerem ezt a kifejezést, kérdezz rá hivatalos
  oldalon (pl. ch.ch)."
• TILOS jogi vagy adótanácsot adni!
• Hivatalos hangnem, NE kezdj köszöntéssel.`;

    const ai = await runAiChat({
      system,
      user: `Kifejezés: "${term}"`,
      maxTokens: 200,
      temperature: 0.2,
    });

    if (!ai.ok) {
      return NextResponse.json(
        { explanation: null, error: "AI nem elérhető." },
        { status: 503 },
      );
    }
    await logAiRateLimit("german-term", ipHash);

    const explanation = ai.text.slice(0, 400);
    return NextResponse.json(
      { term, explanation },
      {
        headers: {
          "cache-control": "public, max-age=604800, stale-while-revalidate=86400",
        },
      },
    );
  } catch (err) {
    safeLogError("api/ai/german-term", err);
    return NextResponse.json({ explanation: null, error: "Belső hiba." }, { status: 500 });
  }
}
