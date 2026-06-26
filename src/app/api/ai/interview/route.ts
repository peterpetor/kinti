import { NextResponse } from "next/server";
import { runAiMultiTurnChat, checkAiRateLimit, logAiRateLimit } from "@/lib/ai";
import { hashIp } from "@/lib/security";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      profession?: string;
      language?: string;
      country?: string;
      messages?: Array<{ role: "user" | "assistant"; content: string }>;
    };

    const profession = typeof body.profession === "string" ? body.profession.trim() : "Allgemein";
    const language = typeof body.language === "string" ? body.language.trim() : "Hochdeutsch";
    const country = body.country === "AT" ? "AT" : body.country === "DE" ? "DE" : "CH";
    const messages = Array.isArray(body.messages) ? body.messages : [];

    if (messages.length === 0) {
      return NextResponse.json({ error: "Üzenetlista üres." }, { status: 400 });
    }

    // Rate-limit ellenőrzés
    const ipHash = await hashIp(req.headers.get("cf-connecting-ip"));
    const rl = await checkAiRateLimit("interview-sim", ipHash);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Túl sok kérés. Kérlek pihenj egy kicsit a következő interjú előtt." },
        { status: 429 },
      );
    }

    // System prompt: ország-tudatos HR-menedzser (CH / AT / DE).
    const ctx =
      country === "AT"
        ? { adj: "österreichischer", land: "Österreich", landDat: "in Österreich", motiv: "Motivation für Österreich" }
        : country === "DE"
          ? { adj: "deutscher", land: "Deutschland", landDat: "in Deutschland", motiv: "Motivation für Deutschland" }
          : { adj: "Schweizer", land: "der Schweiz", landDat: "in der Schweiz", motiv: "Motivation für die Schweiz" };
    const systemPrompt = `Du bist Herr Müller (oder Frau Keller), ein strenger aber fairer ${ctx.adj} HR-Manager (Personalchef) in der Branche "${profession}".
Du führst gerade ein Bewerbungsgespräch auf ${language}.
Der Bewerber (User) kommt aus Ungarn und möchte ${ctx.landDat} arbeiten.

Regeln für dich:
1. Stelle IMMER NUR EINE Frage auf einmal! Warte auf die Antwort.
2. Wenn der Bewerber antwortet, reagiere kurz (z.B. "Verstehe", "Interessant") und stelle die nächste logische Frage.
3. Typische Themen: Pünktlichkeit, Erfahrung, ${ctx.motiv}, Deutschkenntnisse, Teamfähigkeit.
4. Sei professionell (Siezen).
5. Wenn das Gespräch beendet scheint (oder nach ca. 5-6 Fragen), bedanke dich und gib dem Bewerber auf Ungarisch ein kurzes Feedback zu seiner Performance und seinen Deutschkenntnissen.

Beginne das Gespräch NICHT neu, wenn schon eine Historie existiert. Führe es einfach fort.`;

    const finalRes = await runAiMultiTurnChat({
      system: systemPrompt,
      messages: messages,
      maxTokens: 250,
      temperature: 0.7,
    });

    if (!finalRes.ok) {
      return NextResponse.json({ error: "Az AI jelenleg nem elérhető." }, { status: 503 });
    }

    await logAiRateLimit("interview-sim", ipHash);

    return NextResponse.json({
      answer: finalRes.text,
    });
  } catch (err) {
    safeLogError("api/ai/interview", err);
    return NextResponse.json({ error: "Belső szerverhiba történt." }, { status: 500 });
  }
}
