import { NextResponse } from "next/server";
import {
  countRecentSpamLog,
  createDigestSubscriber,
  logSpamSubmit,
} from "@/lib/repo";
import { validateDigestSubscribe } from "@/lib/digest";
import { sendDigestConfirmEmail } from "@/lib/email";
import { isDisposableEmail } from "@/lib/disposable-emails";
import { hashIp, TERMS_VERSION } from "@/lib/bulletin";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { verifyTurnstile } from "@/lib/turnstile";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const SPAM_KIND = "digest";
/** Egy IP-ről max 3 hírlevél-feliratkozási kísérlet óránként. */
const HOURLY_LIMIT = 3;

/**
 * POST /api/digest/subscribe — heti hírlevél feliratkozás (double opt-in).
 * Body: { email, cantonCode?, acceptTerms, website? (honeypot), turnstileToken }
 *
 * 1) Honeypot + validáció
 * 2) Turnstile CAPTCHA
 * 3) Eldobható email tiltás
 * 4) IP-rate-limit (max 3/IP/óra) — random emaileknek küldött confirm-spam ellen
 * 5) Subscriber INSERT confirmed=0, confirm_token + unsubscribe_token
 * 6) Megerősítő email (kattintás után élesedik)
 */
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  const validation = validateDigestSubscribe(body);
  if (!validation.ok) {
    return NextResponse.json(
      { error: "Hibás bemenet.", details: validation.errors },
      { status: 400 },
    );
  }
  const { email, cantonCode } = validation.value;

  // Turnstile — minden public submit-on kötelező
  const turnstileToken = typeof body.turnstileToken === "string" ? body.turnstileToken : null;
  const ip = req.headers.get("cf-connecting-ip") ?? null;
  const captcha = await verifyTurnstile(turnstileToken, ip);
  if (!captcha.ok) {
    return NextResponse.json(
      { error: "A robot-ellenőrzés sikertelen. Próbáld újra." },
      { status: 400 },
    );
  }

  if (isDisposableEmail(email)) {
    return NextResponse.json(
      { error: "Eldobható vagy ideiglenes e-mail címek nem megengedettek." },
      { status: 400 },
    );
  }

  const ipHash = await hashIp(ip);

  // IP rate-limit
  const recent = await countRecentSpamLog(SPAM_KIND, ipHash, 60);
  if (recent >= HOURLY_LIMIT) {
    return NextResponse.json(
      { error: "Túl sok feliratkozási kísérlet egy óra alatt. Próbáld újra később." },
      { status: 429 },
    );
  }

  const id = crypto.randomUUID();
  const confirmToken = crypto.randomUUID().replace(/-/g, "");
  const unsubscribeToken = crypto.randomUUID().replace(/-/g, "");
  const now = new Date().toISOString();

  await createDigestSubscriber({
    id,
    email,
    cantonCode,
    confirmToken,
    unsubscribeToken,
    termsVersion: TERMS_VERSION,
    acceptedTermsAt: now,
    ipHash,
  });

  const baseUrl =
    getCloudflareEnv().PUBLIC_BASE_URL?.replace(/\/$/, "") || new URL(req.url).origin;

  try {
    await sendDigestConfirmEmail({
      to: email,
      confirmUrl: `${baseUrl}/api/digest/confirm/${confirmToken}`,
      unsubscribeUrl: `${baseUrl}/api/digest/unsubscribe/${unsubscribeToken}`,
    });
  } catch (err) {
    console.error("[digest/subscribe] email send failed:", err);
    return NextResponse.json(
      { error: "Az emailt nem sikerült elküldeni. Próbáld újra később." },
      { status: 502 },
    );
  }

  // Rate-limit napló (fire-and-forget)
  logSpamSubmit(SPAM_KIND, ipHash).catch(() => { /* silent */ });

  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
