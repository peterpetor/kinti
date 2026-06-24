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

  const body = (await req.json().catch(() => ({}))) as { cvKey?: string; country?: string };
  const cvKey = typeof body.cvKey === "string" ? body.cvKey : null;
  const country = (body.country ?? "AT").toUpperCase();
  const lang = LANG[country] ?? "német";

  const extracted = await extractCvText(getMediaBucket(), cvKey);
  if (!extracted.ok) {
    return NextResponse.json({ error: "A CV nem olvasható (hiányzik vagy szkennelt PDF).", reason: extracted.reason }, { status: 422 });
  }

  const system = `Te egy munkaerő-közvetítő asszisztense vagy. A jelölt nyers CV-szövegét kapod. Add vissza KIZÁRÓLAG ezt a JSON-t (semmi más):
{
  "keyword": "<a jelölt FŐ szakmája/munkaköre EGY rövid állás-kereső kulcsszóként, ${lang} nyelven — pl. Maler, Krankenpfleger, Lagerlogistiker, Koch>",
  "skills": ["<max 8 fő készség/kompetencia, rövid>"],
  "languages": ["<beszélt nyelv + szint, ha kiderül, pl. Német B2>"],
  "summary": "<1-2 mondatos MAGYAR összegzés a jelöltről, recruiter-szemmel>"
}
Szabályok: KIZÁRÓLAG a CV-ből dolgozz, NE találj ki céget/évszámot/képesítést. A "keyword" a célország (${lang}) álláskeresőjébe illő, rövid szakma-kifejezés legyen. Tömör.`;

  try {
    let ai = await runAiChat({ model: PRIMARY_MODEL, system, user: `CV-szöveg:\n"""\n${extracted.text}\n"""`, maxTokens: 350, temperature: 0.3, timeoutMs: 22_000 });
    if (!ai.ok) ai = await runAiChat({ model: FALLBACK_MODEL, system, user: `CV-szöveg:\n"""\n${extracted.text}\n"""`, maxTokens: 350, temperature: 0.3, timeoutMs: 18_000 });
    if (!ai.ok) return NextResponse.json({ error: "Az AI épp túlterhelt — próbáld újra." }, { status: 503 });

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
