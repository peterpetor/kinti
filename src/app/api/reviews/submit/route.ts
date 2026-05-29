import { NextResponse } from "next/server";
import {
  createReviewDraft,
  getBusinessById,
  hasReviewByEmail,
} from "@/lib/repo";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendReviewConfirmationEmail } from "@/lib/email";
import {
  validateReviewInput,
  REVIEW_CONFIRM_TTL_MS,
} from "@/lib/reviews";
import { safeLogError } from "@/lib/safe-log";
import { TERMS_VERSION, hashIp } from "@/lib/bulletin";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { isDisposableEmail } from "@/lib/disposable-emails";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/reviews/submit — account NÉLKÜLI vélemény-beküldés.
 *
 *   1) form-validáció (lib/reviews)
 *   2) Cloudflare Turnstile
 *   3) businessId létezés
 *   4) duplikáció-szűrés (1 email = 1 vélemény / vállalkozás)
 *   5) review_drafts INSERT (24h TTL)
 *   6) Resend → email a confirm + manage URL-lel
 *
 * A válasz mindig `{ ok: true }`, hogy az email-enumeráció ne lehessen
 * támadási vektor (kivéve, ha már van vélemény → 409, mert ez nyilvános).
 */
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  const validation = validateReviewInput(body);
  if (!validation.ok) {
    return NextResponse.json(
      { error: "Hibás bemenet.", details: validation.errors },
      { status: 400 },
    );
  }

  // Eldobható email címek kizárása
  if (isDisposableEmail(validation.value.email)) {
    return NextResponse.json(
      { error: "Eldobható vagy ideiglenes e-mail címek használata nem megengedett. Kérjük, használj valódi e-mail címet!" },
      { status: 400 },
    );
  }

  const turnstileToken =
    typeof body.turnstileToken === "string" ? body.turnstileToken : null;
  const ip = req.headers.get("cf-connecting-ip") ?? null;
  const captcha = await verifyTurnstile(turnstileToken, ip);
  if (!captcha.ok) {
    return NextResponse.json(
      { error: "A robot-ellenőrzés sikertelen. Próbáld újra.", codes: captcha.errorCodes },
      { status: 400 },
    );
  }

  const business = await getBusinessById(validation.value.businessId);
  if (!business) {
    return NextResponse.json({ error: "Ismeretlen vállalkozás." }, { status: 400 });
  }

  // Duplikáció-szűrés: 1 email / vállalkozás
  const id = crypto.randomUUID();
  const manageToken = crypto.randomUUID().replace(/-/g, "");
  const now = new Date();
  const ipHash = await hashIp(ip);
  const hasEmail = validation.value.email.length > 0;

  // === ÚJ FŐÚT (local-first) — azonnal publikálva, manage_token a kliensnek ===
  if (!hasEmail) {
    const { publishReview, recomputeBusinessRating } = await import("@/lib/repo");
    await publishReview({
      id,
      businessId: business.id,
      email: "",
      rating: validation.value.rating,
      body: validation.value.body,
      reviewerName: validation.value.reviewerName,
      manageToken,
      termsVersion: TERMS_VERSION,
      acceptedTermsAt: now.toISOString(),
      ageConfirmed: 1,
      ipHash,
    });
    await recomputeBusinessRating(business.id);
    return NextResponse.json(
      {
        ok: true,
        published: true,
        id,
        manageToken,
        manageUrl: `/velemeny-kezeles/${manageToken}`,
      },
      { headers: { "cache-control": "no-store" } },
    );
  }

  // === RÉGI ÚT (email-confirm) ===
  if (await hasReviewByEmail(business.id, validation.value.email)) {
    return NextResponse.json(
      {
        error:
          "Erről az email-címről már van vélemény ehhez a vállalkozáshoz. Töröld előbb a kezelő linkkel.",
      },
      { status: 409 },
    );
  }

  const confirmToken = crypto.randomUUID().replace(/-/g, "");
  const expiresAt = new Date(now.getTime() + REVIEW_CONFIRM_TTL_MS).toISOString();

  await createReviewDraft({
    id,
    businessId: business.id,
    email: validation.value.email,
    rating: validation.value.rating,
    body: validation.value.body,
    reviewerName: validation.value.reviewerName,
    confirmToken,
    manageToken,
    expiresAt,
    termsVersion: TERMS_VERSION,
    acceptedTermsAt: now.toISOString(),
    ageConfirmed: 1,
    ipHash,
  });

  const baseUrl =
    getCloudflareEnv().PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    new URL(req.url).origin;

  try {
    await sendReviewConfirmationEmail({
      to: validation.value.email,
      reviewerName: validation.value.reviewerName,
      businessName: business.name,
      rating: validation.value.rating,
      confirmUrl: `${baseUrl}/api/reviews/confirm/${confirmToken}`,
      manageUrl: `${baseUrl}/velemeny-kezeles/${manageToken}`,
      confirmExpiresAt: expiresAt,
    });
  } catch (err) {
    safeLogError("[reviews/submit] email send failed", err);
    return NextResponse.json(
      { error: "Az emailt nem sikerült elküldeni. Próbáld újra később." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
