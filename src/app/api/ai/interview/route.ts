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
      messages?: Array<{ role: "user" | "assistant"; content: string }>;
    };

    const profession = typeof body.profession === "string" ? body.profession.trim() : "Allgemein";
    const language = typeof body.language === "string" ? body.language.trim() : "Hochdeutsch";
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

    // System prompt: Svájci HR Menedzser
    const systemPrompt = `Du bist Herr Müller (oder Frau Keller), ein strenger aber fairer Schweizer HR-Manager (Personalchef) in der Branche "${profession}".
Du führst gerade ein Bewerbungsgespräch auf ${language}.
Der Bewerber (User) kommt aus Ungarn und möchte in der Schweiz arbeiten.

Regeln für dich:
1. Stelle IMMER NUR EINE Frage auf einmal! Warte auf die Antwort.
2. Wenn der Bewerber antwortet, reagiere kurz (z.B. "Verstehe", "Interessant") und stelle die nächste logische Frage.
3. Typische Schweizer Themen: Pünktlichkeit, Erfahrung, Motivation für die Schweiz, Deutschkenntnisse, Teamfähigkeit.
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
