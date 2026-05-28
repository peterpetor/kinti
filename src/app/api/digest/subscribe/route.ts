import { NextResponse } from "next/server";
import { createDigestSubscriber } from "@/lib/repo";
import { validateDigestSubscribe } from "@/lib/digest";
import { sendDigestConfirmEmail } from "@/lib/email";
import { isDisposableEmail } from "@/lib/disposable-emails";
import { hashIp, TERMS_VERSION } from "@/lib/bulletin";
import { getCloudflareEnv } from "@/lib/cloudflare";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/digest/subscribe — heti hírlevél feliratkozás (double opt-in).
 * Body: { email, cantonCode?, acceptTerms, website? (honeypot) }
 *
 * 1) Honeypot + validáció
 * 2) Eldobható email tiltás
 * 3) Subscriber INSERT confirmed=0, confirm_token + unsubscribe_token
 * 4) Megerősítő email (kattintás után élesedik)
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

  if (isDisposableEmail(email)) {
    return NextResponse.json(
      { error: "Eldobható vagy ideiglenes e-mail címek nem megengedettek." },
      { status: 400 },
    );
  }

  const ip = req.headers.get("cf-connecting-ip") ?? null;
  const ipHash = await hashIp(ip);

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

  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
