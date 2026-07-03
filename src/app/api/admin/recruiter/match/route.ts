import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { getMediaBucket } from "@/lib/cloudflare";
import { extractCvText } from "@/lib/cv-extract";
import { runAiChat, extractJsonObject, checkAiRateLimit, logAiRateLimit } from "@/lib/ai";
import { hashIp } from "@/lib/security";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const PRIMARY_MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";
const FALLBACK_MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";

const LANG: Record<string, string> = { AT: "német", DE: "német", NL: "holland (vagy ha az nem megy, angol)" };

/**
 * POST /api/admin/recruiter/match — admin. Egy jelölt profilját + EGY hirdetést
 * kap, és AI-val egy KÉSZ megkereső e-mail PISZKOZATOT ad a hirdetőnek a
 * célország nyelvén (Feedback Jobs nevében).
 *
 * ⚖️ EU AI Act (A-út, 2026-07-03): az AI ILLESZKEDÉS-PONTOZÁSA ELTÁVOLÍTVA —
 * a jelölt AI általi értékelése/rangsorolása az Annex III 4. (magas kockázatú
 * toborzási) sáv triggere volt. Az AI itt kizárólag SZÖVEGEZŐ asszisztens
 * (levél-piszkozat); az alkalmasságról a közvetítő (ember) dönt. Lásd
 * docs/AI_ACT_KLASSZIFIKACIO.md 3. pont.
 *
 * Body: { brief?, cvKey?, country, job: { title, company?, location? } }.
 * Ha `brief` van (a cv-parse összegzése), abból dolgozik (gyors); különben a CV-t
 * olvassa ki a cvKey-ből.
 */
export async function POST(req: Request) {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const rlKey = await hashIp(`recruiter-match:${adminId}`);
  const rl = await checkAiRateLimit("recruiter-match", rlKey);
  if (!rl.allowed) return NextResponse.json({ error: `Mára elérted a megkeresés-generálások napi keretét (${rl.max}).` }, { status: 429 });

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

FONTOS korlát: te KIZÁRÓLAG szövegező asszisztens vagy. NE értékeld, NE pontozd és NE rangsorold a jelöltet, és ne minősítsd az alkalmasságát — arról a közvetítő munkatárs dönt. A levélben csak a profil TÉNYEIT használd.

Add vissza KIZÁRÓLAG ezt a JSON-t (semmi más):
{
  "email": "<a fenti felépítésű, kész ${lang} nyelvű megkereső e-mail>"
}
Csak a megadott profilból és hirdetésből dolgozz, ne találj ki konkrétumot (céget, évszámot).`;

  const userMsg = `JELÖLT PROFIL:\n"""\n${brief}\n"""\n\nÁLLÁS:\n- Pozíció: ${job.title}\n- Cég: ${job.company ?? "(nincs megadva)"}\n- Hely: ${job.location ?? "(nincs megadva)"}`;

  try {
    let ai = await runAiChat({ model: PRIMARY_MODEL, system, user: userMsg, maxTokens: 850, temperature: 0.5, timeoutMs: 26_000 });
    if (!ai.ok) ai = await runAiChat({ model: FALLBACK_MODEL, system, user: userMsg, maxTokens: 850, temperature: 0.5, timeoutMs: 20_000 });
    if (!ai.ok) return NextResponse.json({ error: "Az AI épp túlterhelt — próbáld újra." }, { status: 503 });
    await logAiRateLimit("recruiter-match", rlKey);

    const p = extractJsonObject<{ email?: string }>(ai.text);
    if (!p) return NextResponse.json({ error: "Nem értelmezhető AI-válasz." }, { status: 502 });

    return NextResponse.json({
      email: String(p.email ?? "").slice(0, 2500).trim(),
    });
  } catch (err) {
    safeLogError("admin/recruiter/match", err);
    return NextResponse.json({ error: "Belső hiba." }, { status: 500 });
  }
}
