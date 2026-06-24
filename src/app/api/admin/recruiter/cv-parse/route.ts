import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { getMediaBucket } from "@/lib/cloudflare";
import { extractCvText } from "@/lib/cv-extract";
import { runAiChat, extractJsonObject, checkAiRateLimit, logAiRateLimit } from "@/lib/ai";
import { hashIp } from "@/lib/security";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// Kulcsszó/skill kinyerés EGYSZERŰ feladat → a gyors 8B a primary (olcsóbb),
// a 17B csak fallback, ha a gyors nem ad választ (#2 AI-költség-csökkentés).
const PRIMARY_MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";
const FALLBACK_MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";
const MAX_INPUT = 4000; // a kulcsszóhoz ennyi bőven elég (#3)

const LANG: Record<string, string> = { AT: "német", DE: "német", NL: "holland vagy angol" };

/**
 * POST /api/admin/recruiter/cv-parse — admin. A jelölt CV-jét (R2 cvKey) szöveggé
 * alakítja (AI.toMarkdown), majd AI kiszedi: kereső-kulcsszó (a CÉLORSZÁG nyelvén),
 * skillek, nyelvek, 1-2 mondatos összegzés. A közvetítő-keresőt ebből töltjük.
 * Body: { cvKey, country }.
 */
export async function POST(req: Request) {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  // Runaway-guard: admin-only, de a futamidő-költség miatt napi sapka (#5).
  const rlKey = await hashIp(`recruiter-parse:${adminId}`);
  const rl = await checkAiRateLimit("recruiter-parse", rlKey);
  if (!rl.allowed) return NextResponse.json({ error: `Mára elérted a CV-elemzések napi keretét (${rl.max}).` }, { status: 429 });

  const body = (await req.json().catch(() => ({}))) as { cvKey?: string; country?: string };
  const cvKey = typeof body.cvKey === "string" ? body.cvKey : null;
  const country = (body.country ?? "AT").toUpperCase();
  const lang = LANG[country] ?? "német";

  const extracted = await extractCvText(getMediaBucket(), cvKey);
  if (!extracted.ok) {
    return NextResponse.json({ error: "A CV nem olvasható (hiányzik vagy szkennelt PDF).", reason: extracted.reason }, { status: 422 });
  }
  const cvText = extracted.text.slice(0, MAX_INPUT);

  const system = `Te egy munkaerő-közvetítő asszisztense vagy. A jelölt nyers CV-szövegét kapod. Add vissza KIZÁRÓLAG ezt a JSON-t (semmi más):
{
  "keyword": "<a jelölt FŐ szakmája/munkaköre EGY rövid állás-kereső kulcsszóként, ${lang} nyelven — pl. Maler, Krankenpfleger, Lagerlogistiker, Koch>",
  "skills": ["<max 8 fő készség/kompetencia, rövid>"],
  "languages": ["<beszélt nyelv + szint, ha kiderül, pl. Német B2>"],
  "summary": "<1-2 mondatos MAGYAR összegzés a jelöltről, recruiter-szemmel>"
}
Szabályok: KIZÁRÓLAG a CV-ből dolgozz, NE találj ki céget/évszámot/képesítést. A "keyword" a célország (${lang}) álláskeresőjébe illő, rövid szakma-kifejezés legyen. Tömör.`;

  try {
    const userMsg = `CV-szöveg:\n"""\n${cvText}\n"""`;
    let ai = await runAiChat({ model: PRIMARY_MODEL, system, user: userMsg, maxTokens: 300, temperature: 0.3, timeoutMs: 20_000 });
    if (!ai.ok) ai = await runAiChat({ model: FALLBACK_MODEL, system, user: userMsg, maxTokens: 300, temperature: 0.3, timeoutMs: 20_000 });
    if (!ai.ok) return NextResponse.json({ error: "Az AI épp túlterhelt — próbáld újra." }, { status: 503 });
    await logAiRateLimit("recruiter-parse", rlKey);

    const p = extractJsonObject<{ keyword?: string; skills?: string[]; languages?: string[]; summary?: string }>(ai.text);
    if (!p) return NextResponse.json({ error: "Nem értelmezhető AI-válasz." }, { status: 502 });

    const arr = (a: unknown, n: number) => (Array.isArray(a) ? a.filter((x): x is string => typeof x === "string").map((s) => s.slice(0, 120).trim()).filter(Boolean).slice(0, n) : []);
    return NextResponse.json({
      keyword: String(p.keyword ?? "").slice(0, 80).trim(),
      skills: arr(p.skills, 8),
      languages: arr(p.languages, 6),
      summary: String(p.summary ?? "").slice(0, 500).trim(),
    });
  } catch (err) {
    safeLogError("admin/recruiter/cv-parse", err);
    return NextResponse.json({ error: "Belső hiba." }, { status: 500 });
  }
}
