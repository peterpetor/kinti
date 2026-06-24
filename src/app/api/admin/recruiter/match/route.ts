import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { getMediaBucket } from "@/lib/cloudflare";
import { extractCvText } from "@/lib/cv-extract";
import { runAiChat, extractJsonObject } from "@/lib/ai";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const PRIMARY_MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";
const FALLBACK_MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";

const LANG: Record<string, string> = { AT: "német", DE: "német", NL: "holland (vagy ha az nem megy, angol)" };

/**
 * POST /api/admin/recruiter/match — admin. Egy jelölt profilját + EGY hirdetést
 * kap, és AI-val ad: illeszkedés-pontot (0-100), rövid indoklást, és egy KÉSZ
 * megkereső e-mailt a hirdetőnek a célország nyelvén (Feedback Jobs nevében).
 * Body: { brief?, cvKey?, country, job: { title, company?, location? } }.
 * Ha `brief` van (a cv-parse összegzése), abból dolgozik (gyors); különben a CV-t
 * olvassa ki a cvKey-ből.
 */
export async function POST(req: Request) {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as {
    brief?: string; cvKey?: string; country?: string;
    job?: { title?: string; company?: string; location?: string };
  };
  const country = (body.country ?? "AT").toUpperCase();
  const lang = LANG[country] ?? "német";
  const job = body.job ?? {};
  if (!job.title) return NextResponse.json({ error: "Hiányzó állás." }, { status: 400 });

  let brief = typeof body.brief === "string" ? body.brief.trim() : "";
  if (!brief && body.cvKey) {
    const ex = await extractCvText(getMediaBucket(), body.cvKey);
    if (ex.ok) brief = ex.text.slice(0, 3000);
  }
  if (!brief) return NextResponse.json({ error: "Nincs jelölt-profil (előbb fuss AI CV-elemzést, vagy tölts fel CV-t)." }, { status: 422 });

  const system = `Te egy munkaerő-közvetítő asszisztense vagy (Feedback Jobs). Egy JELÖLT profilját és EGY ÁLLÁSHIRDETÉST kapsz. Add vissza KIZÁRÓLAG ezt a JSON-t (semmi más):
{
  "score": <0-100 egész: mennyire illik a jelölt erre az állásra>,
  "reason": "<1 rövid mondat MAGYARUL, miért ennyi a pont>",
  "email": "<KÉSZ megkereső e-mail a HIRDETŐNEK, ${lang} nyelven, a Feedback Jobs közvetítő nevében. Formátum: 'Betreff/Tárgy: ...' majd 4-6 mondatos udvarias levél, amiben bemutatod a jelöltet ERRE az állásra és kéred a kapcsolatfelvételt. NE találj ki adatot a profilon túl.>"
}
Csak a megadott profilból és hirdetésből dolgozz.`;

  const userMsg = `JELÖLT PROFIL:\n"""\n${brief}\n"""\n\nÁLLÁS:\n- Pozíció: ${job.title}\n- Cég: ${job.company ?? "(nincs megadva)"}\n- Hely: ${job.location ?? "(nincs megadva)"}`;

  try {
    let ai = await runAiChat({ model: PRIMARY_MODEL, system, user: userMsg, maxTokens: 600, temperature: 0.5, timeoutMs: 24_000 });
    if (!ai.ok) ai = await runAiChat({ model: FALLBACK_MODEL, system, user: userMsg, maxTokens: 600, temperature: 0.5, timeoutMs: 18_000 });
    if (!ai.ok) return NextResponse.json({ error: "Az AI épp túlterhelt — próbáld újra." }, { status: 503 });

    const p = extractJsonObject<{ score?: number; reason?: string; email?: string }>(ai.text);
    if (!p) return NextResponse.json({ error: "Nem értelmezhető AI-válasz." }, { status: 502 });

    const scoreRaw = typeof p.score === "number" ? p.score : Number(p.score);
    const score = Number.isFinite(scoreRaw) ? Math.max(0, Math.min(100, Math.round(scoreRaw))) : null;
    return NextResponse.json({
      score,
      reason: String(p.reason ?? "").slice(0, 300).trim(),
      email: String(p.email ?? "").slice(0, 2500).trim(),
    });
  } catch (err) {
    safeLogError("admin/recruiter/match", err);
    return NextResponse.json({ error: "Belső hiba." }, { status: 500 });
  }
}
