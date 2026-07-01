import { NextResponse } from "next/server";
import { runAiChat, checkAiRateLimit, logAiRateLimit } from "@/lib/ai";
import { lookupOfficialTerm } from "@/lib/official-terms";
import { hashIp } from "@/lib/security";
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

    // 1) KURÁLT szótár ELŐSZÖR: a fontos hivatali kifejezésekre kézzel ellenőrzött,
    // PONTOS választ adunk — AI nélkül (nincs hallucináció, nincs AI-kvóta/rate-limit).
    const curated = lookupOfficialTerm(term);
    if (curated) {
      return NextResponse.json(
        { term, explanation: curated, source: "curated" },
        { headers: { "cache-control": "public, max-age=604800, stale-while-revalidate=86400" } },
      );
    }

    // 2) Ismeretlen kifejezés → AI. Rate-limit (50/IP/óra) — cache-miss esetén lép életbe
    const ipHash = await hashIp(req.headers.get("cf-connecting-ip"));
    const rl = await checkAiRateLimit("german-term", ipHash);
    if (!rl.allowed) {
      return NextResponse.json(
        { explanation: null, error: `Túl sok kérelem. Próbáld újra egy óra múlva. (${rl.current}/${rl.max})` },
        { status: 429 },
      );
    }
    // A slot LEFOGLALÁSA a drága AI-hívás ELŐTT (TOCTOU-zárás).
    await logAiRateLimit("german-term", ipHash);

    const system = `Te a kinti.app hivatali ügyintézés-szótár asszisztense vagy (Svájc/Ausztria/Németország).
A felhasználó egy hivatali német (vagy francia) kifejezést ad meg; te rövid magyar magyarázatot adsz.

KRITIKUS SZABÁLYOK:
• Ezek HIVATALI/JOGI/PÉNZÜGYI szakkifejezések. A HELYES, TÉNYLEGES jelentést add meg —
  SOHA NE fordíts szó szerint az összetett szó darabjaiból (a "Betreibung" NEM „kivégzés/üzemeltetés",
  hanem ADÓSSÁGBEHAJTÁS). Ha a szó darabjaiból „ijesztő" vagy fura jelentés jönne ki, az BIZTOSAN hibás.
• Ha NEM vagy teljesen biztos a szakkifejezés pontos hivatali jelentésében, EZT írd (és SEMMI mást):
  "Ezt a kifejezést nem ismerem biztosan — ellenőrizd hivatalos forrásnál (pl. ch.ch)."
  Inkább mondd, hogy nem tudod, mint hogy rosszat találj ki.
• Formátum: csak magyarul, 1-2 tömör mondat (max ~280 karakter), a jelentés + hol találkozol vele.
• TILOS jogi/adó-tanácsot adni; NE kezdj köszöntéssel.`;

    const ai = await runAiChat({
      system,
      user: `Kifejezés: "${term}"`,
      maxTokens: 220,
      temperature: 0.1,
    });

    if (!ai.ok) {
      return NextResponse.json(
        { explanation: null, error: "AI nem elérhető." },
        { status: 503 },
      );
    }

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
