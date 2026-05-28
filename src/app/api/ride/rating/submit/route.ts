import { NextResponse } from "next/server";
import { z } from "zod";
import { addRideRatingDraft, countRecentSpamLog, logSpamSubmit } from "@/lib/repo";
import { sendRideRatingConfirmEmail } from "@/lib/email";
import { verifyTurnstile } from "@/lib/turnstile";
import { hashIp } from "@/lib/bulletin";
import { isDisposableEmail } from "@/lib/disposable-emails";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const SPAM_KIND = "rating";
/** Egy IP-ről max 5 értékelés-küldés óránként. */
const HOURLY_LIMIT = 5;
const HONEYPOT_FIELD = "website";

const ratingSchema = z.object({
  targetPhone: z.string().min(3).max(30),
  email: z.string().email().max(254),
  rating: z.number().int().min(1).max(5),
  turnstileToken: z.string().optional(),
  website: z.string().optional(), // honeypot
});

/**
 * POST /api/ride/rating/submit — telekocsi-rating bekérése.
 *
 * Védelmi rétegek:
 *   1) Honeypot
 *   2) Cloudflare Turnstile CAPTCHA
 *   3) Zod input validáció
 *   4) Disposable email tiltás (ne lehessen mailinator-ról zaklatást indítani)
 *   5) IP-alapú rate-limit: max 5 / IP / 60 perc
 */
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  // 1) Honeypot
  if (typeof body[HONEYPOT_FIELD] === "string" && (body[HONEYPOT_FIELD] as string).trim() !== "") {
    return NextResponse.json({ ok: true });
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

  // 3) Zod validáció
  const parsed = ratingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Érvénytelen adatok." }, { status: 400 });
  }
  const { targetPhone, email, rating } = parsed.data;

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
      { error: "Túl sok értékelés egy óra alatt. Próbáld újra később." },
      { status: 429 },
    );
  }

  try {
    const confirmToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const success = await addRideRatingDraft(targetPhone, email, rating, confirmToken, expiresAt);
    if (!success) {
      return NextResponse.json({ error: "Adatbázis hiba." }, { status: 500 });
    }

    const confirmUrl = `https://kinti.app/api/ride/rating/confirm/${confirmToken}`;
    await sendRideRatingConfirmEmail(email, targetPhone, rating, confirmUrl);

    logSpamSubmit(SPAM_KIND, ipHash).catch(() => { /* silent */ });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[ride/rating/submit] failed:", error);
    return NextResponse.json({ error: "Szerverhiba történt." }, { status: 500 });
  }
}
