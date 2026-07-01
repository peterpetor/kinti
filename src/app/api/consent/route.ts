import { NextResponse } from "next/server";
import { getDB } from "@/lib/cloudflare";
import { hashIp } from "@/lib/security";
import { checkAiRateLimit, logAiRateLimit } from "@/lib/ai";
import { safeLogError } from "@/lib/safe-log";
import { isValidCountry } from "@/lib/countries";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/consent — GDPR hozzájárulás-napló (7. cikk (1): demonstrálhatóság).
 *
 * A jogi kapu elfogadását szerver-oldalon is rögzítjük, hogy BIZONYÍTHATÓ legyen,
 * ki (melyik eszköz-consent_id), MIKOR, milyen VERZIÓT és MIT fogadott el. Privacy:
 * NINCS IP/PII tárolva — csak a kliens véletlen `consentId`-je (nem tracking-cél).
 * Csak akkor jegyzünk, ha mind a három nyilatkozat igaz (valódi elfogadás).
 */
interface Body {
  consentId?: unknown;
  version?: unknown;
  age18?: unknown;
  aszf?: unknown;
  privacy?: unknown;
  country?: unknown;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  const consentId = typeof body.consentId === "string" ? body.consentId.slice(0, 64) : "";
  const version = typeof body.version === "string" ? body.version.slice(0, 32) : "";
  const age18 = body.age18 === true;
  const aszf = body.aszf === true;
  const privacy = body.privacy === true;
  const country = typeof body.country === "string" && isValidCountry(body.country) ? body.country : null;

  // Csak valódi, teljes elfogadást naplózunk (mindhárom jelölőnégyzet).
  if (!consentId || consentId.length < 8 || !version || !age18 || !aszf || !privacy) {
    return NextResponse.json({ error: "Hiányos hozzájárulás." }, { status: 400 });
  }

  // Anti-flood: a hozzájárulás user-akciónként egyszer megy; egy IP-től óránként
  // korlátozott (a napló elárasztása ellen). Az IP-t CSAK a rate-limithez hasheljük.
  const ipHash = await hashIp(req.headers.get("cf-connecting-ip"));
  const rl = await checkAiRateLimit("consent-log", ipHash);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Túl sok kérés." }, { status: 429 });
  }
  await logAiRateLimit("consent-log", ipHash);

  try {
    await getDB()
      .prepare(
        `INSERT INTO consent_log (id, consent_id, version, age18, aszf, privacy, country)
         VALUES (?, ?, ?, 1, 1, 1, ?)`,
      )
      .bind(crypto.randomUUID(), consentId, version, country)
      .run();
    return NextResponse.json({ ok: true });
  } catch (e) {
    // Best-effort: a naplózás hibája NE blokkolja a belépést (a kliens úgyis belép).
    safeLogError("api/consent", e);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
