import { NextResponse } from "next/server";
import { getDB } from "@/lib/cloudflare";
import { sendBulletinContactEmail } from "@/lib/email";
import { verifyTurnstile } from "@/lib/turnstile";
import { isDisposableEmail } from "@/lib/disposable-emails";
import { hashIp } from "@/lib/bulletin";
import { countRecentContacts, logContactAttempt } from "@/lib/repo";
import { findProfanityInFields } from "@/lib/profanity";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/** Max üzenet / IP-cím / óra */
const CONTACT_RATE_LIMIT = 5;
/** Max üzenet-hossz */
const MESSAGE_MAX = 2000;
/** Min üzenet-hossz (anti-spam: üres/1-betűs üzenetek) */
const MESSAGE_MIN = 10;
/** Max mezőhosszak */
const NAME_MAX = 80;
const EMAIL_MAX = 254;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface PostRow {
  email: string | null;
  poster: string | null;
  title: string;
}

/**
 * POST /api/bulletin/contact  — Biztosított kapcsolatfelvétel (P0 javítás).
 *
 * Védelmi rétegek:
 *   1) Input-validáció (min/max hossz, email-formátum)
 *   2) Cloudflare Turnstile CAPTCHA (bot-szűrő)
 *   3) Disposable email szűrő (Mailinator, tempmail, stb.)
 *   4) IP-alapú rate-limit: max 5 üzenet / IP / óra (D1-log)
 *   5) Hirdetés létezés + aktív email ellenőrzés
 *   6) Resend email küldés
 */
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  // 0) HONEYPOT — bot-csapda. Ha a rejtett `website` mező nem üres → bot.
  //    Korai elutasítás, mielőtt Turnstile-kvótát égetnénk.
  if (typeof body.website === "string" && body.website.trim().length > 0) {
    return NextResponse.json({ error: "Hibás kérés." }, { status: 400 });
  }

  const str = (v: unknown, max = 500) =>
    typeof v === "string" ? v.trim().slice(0, max) : "";

  const postId     = str(body.postId, 36);
  const senderName = str(body.senderName, NAME_MAX);
  const senderEmail = str(body.senderEmail, EMAIL_MAX).toLowerCase();
  const message    = str(body.message, MESSAGE_MAX);
  const turnstileToken = typeof body.turnstileToken === "string" ? body.turnstileToken : null;

  // 1) Input validáció
  if (!postId) {
    return NextResponse.json({ error: "Hiányzó hirdetés-azonosító." }, { status: 400 });
  }
  if (!senderName || senderName.length < 2) {
    return NextResponse.json({ error: "Kérlek add meg a nevedet (legalább 2 karakter)." }, { status: 400 });
  }
  if (!senderEmail || !EMAIL_RE.test(senderEmail)) {
    return NextResponse.json({ error: "Érvénytelen email-cím." }, { status: 400 });
  }
  if (!message || message.length < MESSAGE_MIN) {
    return NextResponse.json(
      { error: `Az üzenet legalább ${MESSAGE_MIN} karakter legyen.` },
      { status: 400 },
    );
  }

  // 1/b) Profanitás-szűrő a publikus mezőkre (név + üzenet).
  const dirty = findProfanityInFields({ senderName, message });
  if (dirty) {
    return NextResponse.json(
      { error: "Az üzeneted olyan szót tartalmaz, amit nem engedünk. Kérlek, fogalmazd meg másképp." },
      { status: 400 },
    );
  }

  // 2) Turnstile CAPTCHA
  const ip = req.headers.get("cf-connecting-ip") ?? null;
  const captcha = await verifyTurnstile(turnstileToken, ip);
  if (!captcha.ok) {
    return NextResponse.json(
      { error: "A robot-ellenőrzés sikertelen. Töltsd be újra az oldalt és próbáld újra." },
      { status: 400 },
    );
  }

  // 3) Disposable email szűrés
  if (isDisposableEmail(senderEmail)) {
    return NextResponse.json(
      { error: "Eldobható vagy ideiglenes e-mail cím nem használható. Kérjük, adj meg valódi e-mail címet." },
      { status: 400 },
    );
  }

  // 4) IP rate-limit (5 üzenet/IP/óra)
  const ipHash = await hashIp(ip);
  const recentCount = await countRecentContacts(ipHash);
  if (recentCount >= CONTACT_RATE_LIMIT) {
    return NextResponse.json(
      { error: "Óránként legfeljebb 5 üzenetet küldhetsz. Próbáld újra később." },
      { status: 429 },
    );
  }

  // 5) Hirdetés lekérése + aktív email ellenőrzés
  const post = await getDB()
    .prepare(
      `SELECT email, poster, title FROM bulletin_posts
       WHERE id = ? AND is_pending = 0 AND hidden = 0
         AND (expires_at IS NULL OR expires_at > datetime('now'))`,
    )
    .bind(postId)
    .first<PostRow>();

  if (!post || !post.email) {
    return NextResponse.json(
      { error: "A hirdetés nem található vagy már lejárt." },
      { status: 404 },
    );
  }

  // 6) Resend email küldés
  try {
    await sendBulletinContactEmail({
      to: post.email,
      posterName: post.poster || "Hirdető",
      adTitle: post.title,
      senderName,
      senderEmail,
      message,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Ismeretlen hiba.";
    return NextResponse.json(
      { error: `Az üzenet elküldése nem sikerült: ${errorMsg}` },
      { status: 500 },
    );
  }

  // Rate-limit log bejegyzés (sikeres küldés után)
  const logId = crypto.randomUUID();
  await logContactAttempt(logId, postId, ipHash).catch(() => {
    // Ha a log nem sikerül, nem blokkoljuk a választ — silent fail
  });

  return NextResponse.json({ ok: true });
}
