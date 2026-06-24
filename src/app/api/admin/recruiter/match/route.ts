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

  const system = `Te a Feedback Jobs MUNKAERŐ-KÖZVETÍTŐ ÜGYNÖKSÉG (Personalvermittlung) asszisztense vagy. Egy JELÖLT profilját és EGY ÁLLÁSHIRDETÉST kapsz. A feladat: a MUNKÁLTATÓNAK (a hirdetést feladó cégnek) írj egy profi, üzleti (B2B) megkereső e-mailt ${lang} nyelven, amelyben FELAJÁNLOD a jelöltünket erre a pozícióra.

KÖTELEZŐ keretezés:
- MI vagyunk a közvetítő ügynökség (Feedback Jobs), NEM a jelölt. SOHA ne írj első személyű álláspályázatot (TILOS: "ich bewerbe mich", "mit Begeisterung bewerbe ich mich", "ich bin überzeugt"). Az ilyen HIBÁS.
- A jelöltről HARMADIK személyben beszélj ("unser Kandidat", "ein erfahrener ...", "die Kandidatin").
- A jelölt NEVÉT és elérhetőségét NE add meg ebben az első levélben — csak rövid, anonim szakmai profil; a teljes CV-t érdeklődés esetén küldjük.
- Sikerdíjas közvetítés: a jutalék CSAK sikeres felvétel esetén jár, és a MUNKÁLTATÓ fizeti (a jelöltnek ingyenes).

Az "email" mező felépítése (${lang} nyelven, ehhez igazítva a megszólítást/zárást):
1. Tárgysor (pl. "Betreff: Qualifizierter Kandidat für Ihre offene Stelle – <pozíció>").
2. Megszólítás a cégnek (pl. "Sehr geehrte Damen und Herren,").
3. Bemutatkozás: a Feedback Jobs munkaerő-közvetítő, és van egy alkalmas jelöltünk az Önök által meghirdetett <pozíció> pozícióra <helyszín>.
4. 2-3 mondatos ANONIM jelölt-profil, a hirdetés követelményeihez illesztve (tapasztalat, fő készségek, nyelvtudás).
5. Ajánlat: szívesen küldjük a teljes profilt/CV-t; a közvetítés sikerdíjas, provízió csak sikeres felvételnél, a munkáltató oldalán.
6. Felhívás: érdeklődés esetén válaszoljanak erre az e-mailre.
7. Zárás aláírással, a végén pontosan ezzel a kitöltendő hellyel: "[Az Ön neve] – Feedback Jobs".

Add vissza KIZÁRÓLAG ezt a JSON-t (semmi más):
{
  "score": <0-100 egész: mennyire illik a jelölt erre az állásra>,
  "reason": "<1 rövid mondat MAGYARUL, miért ennyi a pont>",
  "email": "<a fenti felépítésű, kész ${lang} nyelvű megkereső e-mail>"
}
Csak a megadott profilból és hirdetésből dolgozz, ne találj ki konkrétumot (céget, évszámot).`;

  const userMsg = `JELÖLT PROFIL:\n"""\n${brief}\n"""\n\nÁLLÁS:\n- Pozíció: ${job.title}\n- Cég: ${job.company ?? "(nincs megadva)"}\n- Hely: ${job.location ?? "(nincs megadva)"}`;

  try {
    let ai = await runAiChat({ model: PRIMARY_MODEL, system, user: userMsg, maxTokens: 850, temperature: 0.5, timeoutMs: 26_000 });
    if (!ai.ok) ai = await runAiChat({ model: FALLBACK_MODEL, system, user: userMsg, maxTokens: 850, temperature: 0.5, timeoutMs: 20_000 });
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
