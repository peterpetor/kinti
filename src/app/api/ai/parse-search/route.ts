import { NextResponse } from "next/server";
import { runAiChat, extractJsonObject, checkAiRateLimit, logAiRateLimit } from "@/lib/ai";
import { getCategories } from "@/lib/repo";
import { CANTONS } from "@/lib/cantons";
import { hashIp } from "@/lib/security";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface ParsedFilter {
  categoryId: string | null;
  cantonCode: string | null;
  language: string | null;
  /** Keresett szabad-szöveg (név vagy egyéb), ha az AI nem tudta kategorizálni. */
  keywords: string;
  /** Az AI 1 mondatos magyarázata a felhasználónak. */
  explanation: string;
}

/**
 * POST /api/ai/parse-search
 *
 * Természetes nyelvű kereső a Szaknévsorhoz. A felhasználó pl. ezt írja:
 *   "magyar villanyszerelő Aargau-ban aki angolul is tud"
 * és visszakapja:
 *   { categoryId: "villany", cantonCode: "AG", language: "en", keywords: "" }
 *
 * Body: { query: string }
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { query?: string };
    const query = typeof body.query === "string" ? body.query.trim() : "";
    if (!query || query.length < 3 || query.length > 200) {
      return NextResponse.json({ error: "Adj meg egy keresési szöveget." }, { status: 400 });
    }

    // Rate-limit ellenőrzés (20/IP/óra)
    const ipHash = await hashIp(req.headers.get("cf-connecting-ip"));
    const rl = await checkAiRateLimit("parse-search", ipHash);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Túl sok keresés. Próbáld újra egy óra múlva. (${rl.current}/${rl.max})` },
        { status: 429 },
      );
    }

    const cats = await getCategories();
    const catList = cats.map((c) => `  • ${c.id} (${c.label})`).join("\n");
    const cantonList = CANTONS.map((c) => `  • ${c.code} (${c.name})`).join("\n");

    const system = `Te a kinti.app Szaknévsor keresési asszisztense vagy.
A felhasználó természetes magyar nyelven leírja, hogy milyen vállalkozót keres
Svájcban. A feladatod: kinyerni a strukturált szűrőket egy JSON objektumba.

KATEGÓRIÁK (csak ezeket használhatod, az id mezőt írd vissza):
${catList}

KANTON-KÓDOK (ISO 2 betűs, csak ezeket használhatod):
${cantonList}

NYELV-KÓDOK (csak ezek):
  • hu (magyar - alapból feltesszük, csak akkor jelezd ha külön említi)
  • de (német)
  • en (angol)
  • fr (francia)
  • it (olasz)

VÁLASZ FORMÁTUM (KIZÁRÓLAG JSON, semmi más):
{
  "categoryId": "<id vagy null>",
  "cantonCode": "<2-betűs kód vagy null>",
  "language": "<2-betűs kód vagy null - csak ha kifejezetten említi>",
  "keywords": "<egyéb szabad szövegrész vagy üres string>",
  "explanation": "<rövid 1 mondatos magyar magyarázat>"
}

Ha valamit nem értesz vagy nincs benne a query-ben, írj null-t. Ne találj ki!`;

    const ai = await runAiChat({
      system,
      user: query,
      maxTokens: 240,
      temperature: 0.1,
    });
    if (!ai.ok) {
      return NextResponse.json({ error: "Az AI nem elérhető." }, { status: 503 });
    }

    // Sikeres AI-hívás után naplózzuk
    await logAiRateLimit("parse-search", ipHash);

    const parsed = extractJsonObject<Partial<ParsedFilter>>(ai.text);
    if (!parsed) {
      return NextResponse.json({ error: "Nem sikerült értelmezni a választ." }, { status: 502 });
    }

    // Validálás: csak ismert id-ket/kódokat engedünk át.
    const validCategoryIds = new Set(cats.map((c) => c.id));
    const validCantonCodes = new Set(CANTONS.map((c) => c.code));
    const validLangs = new Set(["hu", "de", "en", "fr", "it"]);

    const result: ParsedFilter = {
      categoryId:
        typeof parsed.categoryId === "string" && validCategoryIds.has(parsed.categoryId)
          ? parsed.categoryId
          : null,
      cantonCode:
        typeof parsed.cantonCode === "string" && validCantonCodes.has(parsed.cantonCode)
          ? parsed.cantonCode
          : null,
      language:
        typeof parsed.language === "string" && validLangs.has(parsed.language)
          ? parsed.language
          : null,
      keywords: typeof parsed.keywords === "string" ? parsed.keywords.slice(0, 80) : "",
      explanation:
        typeof parsed.explanation === "string" ? parsed.explanation.slice(0, 160) : "",
    };

    return NextResponse.json(result);
  } catch (err) {
    safeLogError("api/ai/parse-search", err);
    return NextResponse.json({ error: "Belső hiba." }, { status: 500 });
  }
}
