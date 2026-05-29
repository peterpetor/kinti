import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getCategories,
  createBusinessSubmission,
  countRecentBusinessSubmissions,
} from "@/lib/repo";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendBusinessConfirmationEmail } from "@/lib/email";
import { TERMS_VERSION, hashIp } from "@/lib/bulletin";
import {
  validateBusinessInput,
  BUSINESS_CONFIRM_TTL_MS,
  BUSINESS_DAILY_LIMIT,
} from "@/lib/business";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { isDisposableEmail } from "@/lib/disposable-emails";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/business/submit — publikus (account NÉLKÜLI vállalkozás-beküldés).
 *
 * Flow:
 *   1) honeypot + form-validáció (lib/business — svájci cím, profanitás, 18+)
 *   2) eldobható email tiltás
 *   3) Turnstile token verifikáció
 *   4) categoryId létezésének ellenőrzése a DB-ben
 *   5) napi limit (2 / email vagy IP / 24h)
 *   6) business_submissions INSERT (confirm_token + 24h TTL, audit-mezők)
 *   7) Resend → megerősítő email
 *
 * Megerősítés UTÁN a /api/business/confirm AUTOMATIKUSAN publikálja (nincs
 * kézi admin-jóváhagyás).
 */
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  // 1) form-validáció
  const validation = validateBusinessInput(body);
  if (!validation.ok) {
    return NextResponse.json(
      { error: "Hibás bemenet.", details: validation.errors },
      { status: 400 },
    );
  }

  // 2) eldobható email
  if (isDisposableEmail(validation.value.email)) {
    return NextResponse.json(
      { error: "Eldobható vagy ideiglenes e-mail címek nem megengedettek. Kérlek, használj valódi címet!" },
      { status: 400 },
    );
  }

  // 3) Turnstile
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

  // 4) categoryId létezés
  const categories = await getCategories();
  if (!categories.find((c) => c.id === validation.value.categoryId)) {
    return NextResponse.json({ error: "Ismeretlen kategória." }, { status: 400 });
  }

  // 5) napi limit
  const ipHash = await hashIp(ip);
  const recent = await countRecentBusinessSubmissions(validation.value.email, ipHash);
  if (recent >= BUSINESS_DAILY_LIMIT) {
    return NextResponse.json(
      { error: `Napi limit túllépve. 24 óra alatt legfeljebb ${BUSINESS_DAILY_LIMIT} vállalkozás küldhető be ugyanazzal az emaillel vagy IP-vel.` },
      { status: 429 },
    );
  }

  const id = crypto.randomUUID();
  const manageToken = crypto.randomUUID().replace(/-/g, "");
  const now = new Date();
  const hasEmail = validation.value.email.length > 0;

  const { userId: clerkUserId } = await auth();

  // === ÚJ FŐÚT (local-first, no-email) ===
  // Ha nincs email: azonnal publikáljuk a vállalkozást és visszaadjuk a manage_token-t.
  if (!hasEmail) {
    const { createBusinessFromSubmission, getBusinessById } = await import("@/lib/repo");
    const { slugifyBusinessName, approxCoordsForCanton } = await import("@/lib/business");
    let bizId = `${slugifyBusinessName(validation.value.name)}-${crypto.randomUUID().slice(0, 6)}`;
    if (await getBusinessById(bizId)) {
      bizId = `${slugifyBusinessName(validation.value.name)}-${crypto.randomUUID().slice(0, 8)}`;
    }
    const coords = approxCoordsForCanton(validation.value.cantonCode);
    await createBusinessFromSubmission({
      id: bizId,
      name: validation.value.name,
      categoryId: validation.value.categoryId,
      categoryLabel: validation.value.categoryLabel,
      address: validation.value.address,
      phone: validation.value.phone,
      blurb: validation.value.blurb,
      contactEmail: "",
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      ownerUserId: clerkUserId,
      manageToken,
    });
    return NextResponse.json(
      {
        ok: true,
        published: true,
        id: bizId,
        manageToken,
        manageUrl: `/szaknevsor/kezeles/${manageToken}`,
      },
      { headers: { "cache-control": "no-store" } },
    );
  }

  // === RÉGI ÚT (legacy email-confirm) — visszafelé kompat ===
  const confirmToken = crypto.randomUUID().replace(/-/g, "");
  const expiresAt = new Date(now.getTime() + BUSINESS_CONFIRM_TTL_MS).toISOString();

  await createBusinessSubmission({
    id,
    name: validation.value.name,
    categoryId: validation.value.categoryId,
    categoryLabel: validation.value.categoryLabel,
    address: validation.value.address,
    cantonCode: validation.value.cantonCode,
    phone: validation.value.phone,
    email: validation.value.email,
    blurb: validation.value.blurb,
    confirmToken,
    expiresAt,
    termsVersion: TERMS_VERSION,
    acceptedTermsAt: now.toISOString(),
    ageConfirmed: 1,
    ipHash,
    ownerUserId: clerkUserId,
    manageToken,
  });

  const baseUrl =
    getCloudflareEnv().PUBLIC_BASE_URL?.replace(/\/$/, "") || new URL(req.url).origin;

  try {
    await sendBusinessConfirmationEmail({
      to: validation.value.email,
      businessName: validation.value.name,
      confirmUrl: `${baseUrl}/api/business/confirm/${confirmToken}`,
      confirmExpiresAt: expiresAt,
      manageUrl: `${baseUrl}/szaknevsor/kezeles/${manageToken}`,
    });
  } catch (err) {
    safeLogError("[business/submit] email send failed", err);
    return NextResponse.json(
      { error: "Az emailt nem sikerült elküldeni. Próbáld újra később." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, published: false }, { headers: { "cache-control": "no-store" } });
}
