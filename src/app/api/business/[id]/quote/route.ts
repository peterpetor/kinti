import { NextResponse } from "next/server";
import {
  countRecentSpamLog,
  getBusinessById,
  logSpamSubmit,
} from "@/lib/repo";
import { sendBusinessQuoteEmail } from "@/lib/email";
import { verifyTurnstile } from "@/lib/turnstile";
import { hashIp } from "@/lib/bulletin";
import { isDisposableEmail } from "@/lib/disposable-emails";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const SPAM_KIND = "quote";
const HOURLY_LIMIT = 3;
const HONEYPOT_FIELD = "website";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/business/[id]/quote — árajánlat-kérés egy vállalkozótól.
 *
 * Védelmi rétegek:
 *   1) Honeypot (`website` mező)
 *   2) Cloudflare Turnstile CAPTCHA
 *   3) Input-validáció (név/email/üzenet hossz + email-formátum)
 *   4) Disposable email tiltás
 *   5) IP-alapú rate-limit: max 3 / IP / 60 perc (spam_log)
 *   6) Vállalkozás létezés + aktív contactEmail ellenőrzés
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  // 1) Honeypot — bot felismerésre szándékosan 200-at adunk vissza
  if (typeof body[HONEYPOT_FIELD] === "string" && (body[HONEYPOT_FIELD] as string).trim() !== "") {
    return NextResponse.json({ success: true });
  }

  // 2) Turnstile
  const turnstileToken = typeof body.turnstileToken === "string" ? body.turnstileToken : null;
  const ip = req.headers.get("cf-connecting-ip") ?? null;
  const captcha = await verifyTurnstile(turnstileToken, ip);
  if (!captcha.ok) {
    return NextResponse.json(
      { error: "A robot-ellenőrzés sikertelen. Próbáld újra." },
      { status: 400 },
    );
  }

  // 3) Input validáció
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Kérlek, töltsd ki az összes kötelező mezőt." },
      { status: 400 },
    );
  }
  if (name.length > 100 || email.length > 254 || phone.length > 30 || message.length > 2000) {
    return NextResponse.json({ error: "A mezők túl hosszúak." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Érvénytelen e-mail formátum." }, { status: 400 });
  }

  // 4) Disposable email
  if (isDisposableEmail(email)) {
    return NextResponse.json(
      { error: "Eldobható e-mail cím nem megengedett. Használj valós címet." },
      { status: 400 },
    );
  }

  // 5) IP rate-limit
  const ipHash = await hashIp(ip);
  const recent = await countRecentSpamLog(SPAM_KIND, ipHash, 60);
  if (recent >= HOURLY_LIMIT) {
    return NextResponse.json(
      { error: "Túl sok kérés egy óra alatt. Próbáld újra később." },
      { status: 429 },
    );
  }

  // 6) Vállalkozás létezés + email
  const b = await getBusinessById(params.id);
  if (!b) {
    return NextResponse.json({ error: "Nem található a vállalkozás." }, { status: 404 });
  }
  const toEmail = b.contactEmail || null;
  if (!toEmail) {
    return NextResponse.json(
      { error: "A vállalkozó nem fogad üzeneteket, kérlek hívd fel." },
      { status: 400 },
    );
  }

  try {
    await sendBusinessQuoteEmail({
      to: toEmail,
      businessName: b.name,
      senderName: name,
      senderEmail: email,
      senderPhone: phone || undefined,
      message,
    });
  } catch (err) {
    safeLogError("[business/quote] email send failed", err);
    return NextResponse.json(
      { error: "Az emailt nem sikerült elküldeni. Próbáld újra később." },
      { status: 502 },
    );
  }

  // 7) Log (fire-and-forget)
  logSpamSubmit(SPAM_KIND, ipHash).catch(() => { /* silent */ });

  return NextResponse.json({ success: true });
}
