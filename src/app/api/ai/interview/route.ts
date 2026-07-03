import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isPro } from "@/lib/subscriptions";
import { runAiMultiTurnChat, checkAiRateLimit, logAiRateLimit } from "@/lib/ai";
import { hashIp } from "@/lib/security";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // PRO-kapu SZERVER-OLDALON: az interjú-szimulátor oldala mostantól nem-PRO
    // usernek is betölt (előnézet + paywall), ezért a drága AI-hívást ITT kell
    // védeni — a kliens előnézete nem tudja lefuttatni.
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Bejelentkezés szükséges." }, { status: 401 });
    }
    if (!(await isPro(userId))) {
      return NextResponse.json({ error: "Ez PRO funkció — oldd fel a Kinti PRO-val." }, { status: 403 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      profession?: string;
      language?: string;
      country?: string;
      messages?: Array<{ role: "user" | "assistant"; content: string }>;
    };

    const profession = typeof body.profession === "string" ? body.profession.trim() : "Allgemein";
    const language = typeof body.language === "string" ? body.language.trim() : "Hochdeutsch";
    const country = body.country === "AT" ? "AT" : body.country === "DE" ? "DE" : body.country === "NL" ? "NL" : "CH";
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
    // A slot LEFOGLALÁSA a drága AI-hívás ELŐTT (TOCTOU-zárás).
    await logAiRateLimit("interview-sim", ipHash);

    // System prompt: ország-tudatos HR-menedzser. CH/AT/DE → német nyelvű; NL →
    // holland/angol (a Netherlands munkaerőpiac nyelve), NL-kontextussal.
    let systemPrompt: string;
    if (country === "NL") {
      systemPrompt = `You are Mr. De Vries (or Ms. Jansen), a strict but fair Dutch HR manager (recruiter) in the "${profession}" sector.
You are conducting a job interview in ${language}. (If the language is "Nederlands", speak Dutch; otherwise speak English.)
The applicant (User) is from Hungary and wants to work in the Netherlands.

Your rules:
1. Always ask ONLY ONE question at a time. Wait for the answer.
2. When the applicant answers, react briefly (e.g. "I see", "Interesting") and ask the next logical question.
3. Typical topics: reliability, experience, motivation for working in the Netherlands, Dutch/English language skills, teamwork.
4. Be professional and polite.
5. When the conversation seems finished (or after ~5-6 questions), thank the applicant and give short feedback IN HUNGARIAN about their performance and their language skills.

Fairness rules (mandatory):
- Evaluate ONLY the professional content of the answers and how clearly the applicant communicates. Never judge or comment on accent, origin, nationality, age, gender, family status, religion or appearance — and never ask about them.
- Do not assess or label the applicant's emotional state; focus on what they said, not how they might feel.
- In the final feedback, be constructive and encouraging: name 1-2 concrete strengths and 1-2 concrete, actionable improvements. This is practice feedback to help them prepare — not a real hiring decision.

Do NOT restart the conversation if a history already exists. Just continue it.`;
    } else {
      const ctx =
        country === "AT"
          ? { adj: "österreichischer", land: "Österreich", landDat: "in Österreich", motiv: "Motivation für Österreich" }
          : country === "DE"
            ? { adj: "deutscher", land: "Deutschland", landDat: "in Deutschland", motiv: "Motivation für Deutschland" }
            : { adj: "Schweizer", land: "der Schweiz", landDat: "in der Schweiz", motiv: "Motivation für die Schweiz" };
      // Nyelvi variáns-útmutató: az „osztrák német"/„svájci német" ne csak címke
      // legyen — a modell ténylegesen a variánst beszélje.
      const langNote =
        language === "Österreichisches Deutsch"
          ? `\nSprach-Hinweis: Verwende österreichisches Standarddeutsch — österreichische Begrüßungen und Wendungen (z.B. "Grüß Gott"), österreichisches Vokabular (z.B. Jänner, heuer, Karenz), österreichische Arbeitswelt-Begriffe. Bleib dabei gut verständlich.`
          : language === "Schweizerdeutsch"
            ? `\nSprach-Hinweis: Führe das Gespräch auf Schweizerdeutsch (Dialekt, z.B. "Grüezi"), aber halte es für einen Lernenden verständlich. Das Abschluss-Feedback bleibt auf Ungarisch.`
            : "";
      systemPrompt = `Du bist Herr Müller (oder Frau Keller), ein strenger aber fairer ${ctx.adj} HR-Manager (Personalchef) in der Branche "${profession}".
Du führst gerade ein Bewerbungsgespräch auf ${language}.${langNote}
Der Bewerber (User) kommt aus Ungarn und möchte ${ctx.landDat} arbeiten.

Regeln für dich:
1. Stelle IMMER NUR EINE Frage auf einmal! Warte auf die Antwort.
2. Wenn der Bewerber antwortet, reagiere kurz (z.B. "Verstehe", "Interessant") und stelle die nächste logische Frage.
3. Typische Themen: Pünktlichkeit, Erfahrung, ${ctx.motiv}, Deutschkenntnisse, Teamfähigkeit.
4. Sei professionell (Siezen).
5. Wenn das Gespräch beendet scheint (oder nach ca. 5-6 Fragen), bedanke dich und gib dem Bewerber auf Ungarisch ein kurzes Feedback zu seiner Performance und seinen Deutschkenntnissen.

Fairness-Regeln (verpflichtend):
- Bewerte AUSSCHLIESSLICH den fachlichen Inhalt der Antworten und die Verständlichkeit der Kommunikation. Urteile NIE über Akzent, Herkunft, Nationalität, Alter, Geschlecht, Familienstand, Religion oder Aussehen — und frage auch nicht danach.
- Bewerte oder etikettiere NICHT den emotionalen Zustand des Bewerbers; es zählt, WAS gesagt wurde.
- Das Abschluss-Feedback ist konstruktiv und ermutigend: nenne 1-2 konkrete Stärken und 1-2 konkrete, umsetzbare Verbesserungen. Es ist Übungs-Feedback zur Vorbereitung — keine echte Einstellungsentscheidung.

Beginne das Gespräch NICHT neu, wenn schon eine Historie existiert. Führe es einfach fort.`;
    }

    const finalRes = await runAiMultiTurnChat({
      system: systemPrompt,
      messages: messages,
      maxTokens: 250,
      temperature: 0.7,
    });

    if (!finalRes.ok) {
      return NextResponse.json({ error: "Az AI jelenleg nem elérhető." }, { status: 503 });
    }

    return NextResponse.json({
      answer: finalRes.text,
    });
  } catch (err) {
    safeLogError("api/ai/interview", err);
    return NextResponse.json({ error: "Belső szerverhiba történt." }, { status: 500 });
  }
}
