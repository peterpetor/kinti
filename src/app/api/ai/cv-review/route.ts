import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isPro } from "@/lib/subscriptions";
import { runAiChat, extractJsonObject, checkAiRateLimit, logAiRateLimit } from "@/lib/ai";
import { getMediaBucket } from "@/lib/cloudflare";
import { getWorkerProfileByUser } from "@/lib/repo";
import { extractCvText } from "@/lib/cv-extract";
import { hashIp } from "@/lib/security";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/ai/cv-review — PRO: a FELTÖLTÖTT CV (PDF) komoly elemzése.
 *
 * 1) Kiolvassa a user worker-profiljához tartozó CV-t az R2-ből (unpdf, edge).
 * 2) Svájci HR-szempontú AUDIT: 0–100 pont, erősségek, szakaszonkénti konkrét
 *    hibák + javítások.
 * 3) A 2–3 leggyengébb szakaszt ÚJRAÍRJA svájci formátumban.
 *
 * Egyetlen, erős (70B) modell-hívás, strukturált JSON kimenettel.
 */

const MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

interface CvIssue {
  section: string;
  problem: string;
  fix: string;
}
interface CvRewrite {
  title: string;
  content: string;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Bejelentkezés szükséges." }, { status: 401 });
    }
    if (!(await isPro(userId))) {
      return NextResponse.json(
        { error: "A CV-audit a Kinti PRO előfizetés része." },
        { status: 403 },
      );
    }

    // Napi limit (drága 70B hívás)
    const ipHash = await hashIp(req.headers.get("cf-connecting-ip"));
    const rl = await checkAiRateLimit("cv-review", ipHash);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Mára elérted a CV-auditok számát. Próbáld holnap. (${rl.current}/${rl.max})` },
        { status: 429 },
      );
    }

    // A feltöltött CV kulcsa a worker-profilból
    const profile = await getWorkerProfileByUser(userId);
    const extracted = await extractCvText(getMediaBucket(), profile?.cvKey ?? null);
    if (!extracted.ok) {
      const msg =
        extracted.reason === "no-cv"
          ? "Előbb tölts fel egy CV-t (PDF) a profilodban, aztán futtasd az auditot."
          : extracted.reason === "empty"
            ? "A CV-ből nem sikerült szöveget kinyerni. Valószínűleg szkennelt/kép-alapú PDF — tölts fel szöveges (kimásolható) PDF-et."
            : "A CV-t most nem sikerült beolvasni. Próbáld újra kicsit később.";
      return NextResponse.json({ error: msg }, { status: 422 });
    }

    const system = `Te a kinti.app SVÁJCI CV-szakértője vagy, magyar anyanyelvű, Svájcban álláskereső ügyfeleknek. A felhasználó nyers CV-szövegét kapod (PDF-ből kinyerve). Készíts MAGYAR nyelven egy komoly, konkrét auditot a SVÁJCI munkaerőpiac elvárásai szerint.

Vizsgáld kiemelten (svájci specifikumok):
- Personalien-blokk (név, születési év, lakhely/kanton, elérhetőség) és — CH-ban elvárt — szakmai fotó megléte.
- Nyelvtudás CEFR-skálán (Deutsch B2, Französisch A2 stb.) — a "jó/alap" megfogalmazás gyenge.
- Tartózkodási/munkavállalási engedély (B/C/L Bewilligung) feltüntetése — a HR ezt rögtön keresi.
- Eredmény-orientált tapasztalat (számszerű hatás), nem csak feladat-felsorolás.
- Időrendi hézagok, túl hosszú szöveg, magyar-specifikus, CH-ban szokatlan elemek.
- Arbeitszeugnis / Motivationsschreiben utalások, releváns CH-képesítés-megfeleltetés.

Szabályok:
- KIZÁRÓLAG a megadott CV-tartalomból dolgozz — NE találj ki céget, évszámot, képesítést, eredményt. Ahol adat hiányzik, a "fix"-ben kérd be, ne pótold kitalálttal.
- A "rewrite" mezőben a 2–3 LEGGYENGÉBB szakaszt írd újra svájci formátumban, a meglévő tényekre építve (a hiányzó számokat jelöld [...]-tal).
- Pontozz reálisan, ne hízelegj.

VÁLASZ KIZÁRÓLAG EZ A JSON (semmi más, semmi markdown):
{
  "score": <egész 0-100>,
  "summary": "<2-3 mondatos összegzés>",
  "strengths": ["<erősség>", "..."],
  "issues": [{"section":"<szakasz neve>","problem":"<mi a baj>","fix":"<konkrét javítás>"}],
  "rewrite": [{"title":"<szakasz címe, pl. Kurzprofil>","content":"<újraírt, svájci formátumú szöveg>"}]
}`;

    const ai = await runAiChat({
      model: MODEL,
      system,
      user: `CV-tartalom:\n"""\n${extracted.text}\n"""`,
      maxTokens: 1800,
      temperature: 0.4,
      timeoutMs: 45_000,
    });

    if (!ai.ok) {
      return NextResponse.json(
        { error: "Az AI épp túlterhelt — próbáld újra pár másodperc múlva." },
        { status: 503 },
      );
    }
    await logAiRateLimit("cv-review", ipHash);

    const parsed = extractJsonObject<{
      score?: number;
      summary?: string;
      strengths?: string[];
      issues?: CvIssue[];
      rewrite?: CvRewrite[];
    }>(ai.text);
    if (!parsed) {
      return NextResponse.json({ error: "Nem értelmezhető AI-válasz. Próbáld újra." }, { status: 502 });
    }

    const strArr = (a: unknown, n: number): string[] =>
      Array.isArray(a)
        ? a.filter((x): x is string => typeof x === "string").map((s) => s.slice(0, 400).trim()).filter(Boolean).slice(0, n)
        : [];

    const issues: CvIssue[] = Array.isArray(parsed.issues)
      ? parsed.issues
          .filter((i): i is CvIssue => !!i && typeof i === "object")
          .map((i) => ({
            section: String(i.section ?? "").slice(0, 80).trim(),
            problem: String(i.problem ?? "").slice(0, 400).trim(),
            fix: String(i.fix ?? "").slice(0, 400).trim(),
          }))
          .filter((i) => i.problem || i.fix)
          .slice(0, 8)
      : [];

    const rewrite: CvRewrite[] = Array.isArray(parsed.rewrite)
      ? parsed.rewrite
          .filter((r): r is CvRewrite => !!r && typeof r === "object")
          .map((r) => ({
            title: String(r.title ?? "").slice(0, 80).trim(),
            content: String(r.content ?? "").slice(0, 1500).trim(),
          }))
          .filter((r) => r.content)
          .slice(0, 4)
      : [];

    const scoreRaw = typeof parsed.score === "number" ? parsed.score : Number(parsed.score);
    const score = Number.isFinite(scoreRaw) ? Math.max(0, Math.min(100, Math.round(scoreRaw))) : null;

    return NextResponse.json({
      score,
      summary: typeof parsed.summary === "string" ? parsed.summary.slice(0, 600).trim() : "",
      strengths: strArr(parsed.strengths, 6),
      issues,
      rewrite,
    });
  } catch (err) {
    safeLogError("api/ai/cv-review", err);
    return NextResponse.json({ error: "Belső hiba." }, { status: 500 });
  }
}
