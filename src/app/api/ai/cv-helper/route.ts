import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isPro } from "@/lib/subscriptions";
import { runAiChat, extractJsonObject, checkAiRateLimit, logAiRateLimit } from "@/lib/ai";
import { hashIp } from "@/lib/security";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/ai/cv-helper — PRO CV-asszisztens.
 *
 * A felhasználó nyers tapasztalat-/CV-szövegéből svájci álláspiacra szabott
 * összefoglalót, eredmény-orientált bullet pontokat és jelentkezési tippeket ad.
 * Csak SUGGESTION; a felhasználó dönt. Body: { text: string }.
 *
 * PRO-gated: csak aktív előfizetőnek.
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Bejelentkezés szükséges." }, { status: 401 });
    }
    if (!(await isPro(userId))) {
      return NextResponse.json({ error: "Ez a funkció a Kinti PRO előfizetés része." }, { status: 403 });
    }

    const body = (await req.json().catch(() => ({}))) as { text?: string };
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (text.length < 20 || text.length > 2000) {
      return NextResponse.json(
        { error: "Írj a tapasztalatodról 20–2000 karakter között." },
        { status: 400 },
      );
    }

    const ipHash = await hashIp(req.headers.get("cf-connecting-ip"));
    const rl = await checkAiRateLimit("cv-helper", ipHash);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Túl sok kérés. Próbáld újra egy óra múlva. (${rl.current}/${rl.max})` },
        { status: 429 },
      );
    }

    const system = `Te a kinti.app CV-asszisztense vagy, a SVÁJCI álláspiacra szakosodva.
A felhasználó nyers tapasztalat-szövegéből készíts magyar nyelven:

1. SUMMARY: tömör, profi szakmai összefoglaló (3-4 mondat, svájci CV-stílus, tárgyilagos, nem túlzó).
2. BULLETS: 3-5 eredmény-orientált felsorolás-pont (konkrét, cselekvő igével kezdődő).
3. TIPS: 2-3 rövid, konkrét tipp a svájci jelentkezéshez (pl. Motivationsschreiben, Arbeitszeugnis, nyelvtudás feltüntetése).

Szabályok:
- KIZÁRÓLAG abból dolgozz, amit a felhasználó megadott — NE találj ki céget, évszámot, képesítést.
- Ne ígérj és ne dicsekedj túlzóan ("világszínvonalú" stb.).

VÁLASZ FORMÁTUM (KIZÁRÓLAG JSON, semmi más):
{
  "summary": "<összefoglaló>",
  "bullets": ["<pont1>", "<pont2>"],
  "tips": ["<tipp1>", "<tipp2>"]
}`;

    const ai = await runAiChat({
      system,
      user: `Nyers tapasztalat: """${text}"""`,
      maxTokens: 600,
      temperature: 0.5,
      // 600 token a legnagyobb budget az appban — a 8B „fast" modellnek a hosszú
      // system prompttal ez >12-20s is lehet, ezért bő keret kell, különben mindig
      // „túlterhelt"-be fut. 30s biztonságos a Pages Function I/O-keretén belül.
      timeoutMs: 30_000,
    });
    if (!ai.ok) {
      return NextResponse.json(
        { error: "Az AI épp túlterhelt — próbáld újra pár másodperc múlva." },
        { status: 503 },
      );
    }
    await logAiRateLimit("cv-helper", ipHash);

    const parsed = extractJsonObject<{ summary?: string; bullets?: string[]; tips?: string[] }>(ai.text);
    if (!parsed) {
      return NextResponse.json({ error: "Nem értelmezhető válasz." }, { status: 502 });
    }

    const clean = (arr: unknown): string[] =>
      Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string").map((s) => s.slice(0, 240).trim()).filter(Boolean).slice(0, 6) : [];

    return NextResponse.json({
      summary: typeof parsed.summary === "string" ? parsed.summary.slice(0, 800).trim() : "",
      bullets: clean(parsed.bullets),
      tips: clean(parsed.tips),
    });
  } catch (err) {
    safeLogError("api/ai/cv-helper", err);
    return NextResponse.json({ error: "Belső hiba." }, { status: 500 });
  }
}
