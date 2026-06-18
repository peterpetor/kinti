import { NextResponse } from "next/server";
import { runAiChat, extractJsonObject, checkAiRateLimit, logAiRateLimit } from "@/lib/ai";
import { getCategories } from "@/lib/repo";
import { hashIp } from "@/lib/security";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/ai/business-helper
 *
 * Két dolgot ad vissza egyszerre a vállalkozó-feladás formhoz:
 *
 *   1) "polishedDescription" — a beküldött nyers leírás letisztított, magyaros
 *      verziója (helyesírás-ellenőrzés + tömörebb fogalmazás, max 200 char).
 *   2) "suggestedCategoryId" — a legjobban illő kategória id-je a meglévők közül.
 *
 * Csak SUGGESTION; a felhasználó dönt, hogy elfogadja-e. Body:
 *   { description: string, currentCategoryId?: string }
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      description?: string;
      currentCategoryId?: string;
    };
    const description = typeof body.description === "string" ? body.description.trim() : "";
    if (!description || description.length < 10 || description.length > 1000) {
      return NextResponse.json(
        { error: "A leírás 10-1000 karakter hosszú legyen." },
        { status: 400 },
      );
    }

    // Rate-limit (10/IP/óra)
    const ipHash = await hashIp(req.headers.get("cf-connecting-ip"));
    const rl = await checkAiRateLimit("business-helper", ipHash);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Túl sok AI-segítség kérelem. Próbáld újra egy óra múlva. (${rl.current}/${rl.max})` },
        { status: 429 },
      );
    }

    const cats = await getCategories();
    const catList = cats.map((c) => `  • ${c.id} (${c.label})`).join("\n");

    const system = `Te a kinti.app vállalkozó-katalógus szerkesztő-asszisztense vagy.
Két feladatod van egyszerre:

1. POLISHED DESCRIPTION:
   • Vedd a felhasználó nyers leírását, és csiszolt, magyaros változatban add vissza.
   • Helyesírás-ellenőrzés (vesszők, ékezetek, nagybetű, németes szavak átírása).
   • Tömör, hívogató fogalmazás. MAX 200 karakter.
   • NE találj ki új információt, csak abból dolgozz amit megkaptál!
   • NE használj túl marketinges szavakat (pl. "felülmúlhatatlan", "legjobb").

2. SUGGESTED CATEGORY:
   • A leírás alapján válaszd ki, melyik kategóriába illik legjobban.
   • Csak az alábbi listából választhatsz (az id-t add vissza):
${catList}
   • Ha nem illik egyikbe sem, írj null-t.

VÁLASZ FORMÁTUM (KIZÁRÓLAG JSON, semmi más):
{
  "polishedDescription": "<csiszolt magyar szöveg>",
  "suggestedCategoryId": "<id vagy null>",
  "reasoning": "<rövid 1 mondatos magyarázat a kategóriához>"
}`;

    const ai = await runAiChat({
      system,
      user: `Nyers leírás: """${description}"""`,
      maxTokens: 400,
      temperature: 0.4,
      timeoutMs: 28_000,
    });
    if (!ai.ok) {
      return NextResponse.json(
        { error: "Az AI épp túlterhelt — próbáld újra pár másodperc múlva." },
        { status: 503 },
      );
    }
    await logAiRateLimit("business-helper", ipHash);

    const parsed = extractJsonObject<{
      polishedDescription?: string;
      suggestedCategoryId?: string | null;
      reasoning?: string;
    }>(ai.text);
    if (!parsed) {
      return NextResponse.json({ error: "Nem értelmezhető válasz." }, { status: 502 });
    }

    const validCategoryIds = new Set(cats.map((c) => c.id));
    const suggestedCategoryId =
      typeof parsed.suggestedCategoryId === "string" &&
      validCategoryIds.has(parsed.suggestedCategoryId)
        ? parsed.suggestedCategoryId
        : null;

    const polished =
      typeof parsed.polishedDescription === "string"
        ? parsed.polishedDescription.slice(0, 260).trim()
        : "";

    return NextResponse.json({
      polishedDescription: polished || null,
      suggestedCategoryId,
      reasoning:
        typeof parsed.reasoning === "string" ? parsed.reasoning.slice(0, 160) : "",
    });
  } catch (err) {
    safeLogError("api/ai/business-helper", err);
    return NextResponse.json({ error: "Belső hiba." }, { status: 500 });
  }
}
