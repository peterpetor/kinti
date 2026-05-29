import { NextResponse } from "next/server";
import {
  getBulletinKinds,
  createBulletinDraft,
  countRecentBulletins,
  publishBulletinPost,
} from "@/lib/repo";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendConfirmationEmail } from "@/lib/email";
import {
  validateBulletinInput,
  CONFIRM_TTL_MS,
  TERMS_VERSION,
  hashIp,
} from "@/lib/bulletin";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { isDisposableEmail } from "@/lib/disposable-emails";
import { safeLogError } from "@/lib/safe-log";

/** A 30 napos publikus életidő — a publish flow-ban használjuk. */
const POST_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/bulletin/submit  — publikus (account NÉLKÜLI hirdetésfeladás).
 *
 * Flow:
 *   1) honeypot + form-validáció (lib/bulletin)
 *   2) Cloudflare Turnstile token verifikáció
 *   3) kindId létezésének ellenőrzése a DB-ben
 *   4) 3 hirdetés/nap limit ellenőrzése (email/IP alapján)
 *   5) bulletin_drafts INSERT (confirm_token + manage_token UUID-k, 24h TTL)
 *   6) Resend → email megerősítő linkkel
 *
 * Visszatérés: 200 + { ok: true } — sose áruljuk el, hogy az email tényleg
 * létezik-e a rendszerben (privacy + enumerációs spam-szűrés szempontjából).
 */
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  // 1) form-validáció
  const validation = validateBulletinInput(body);
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

  // 2) Turnstile (CAPTCHA)
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

  // 3) kindId létezés
  const kinds = await getBulletinKinds();
  if (!kinds.find((k) => k.id === validation.value.kindId)) {
    return NextResponse.json({ error: "Ismeretlen kategória." }, { status: 400 });
  }

  // 4) 3 hirdetés/nap limit ellenőrzése
  const ipHash = await hashIp(ip);
  const recentCount = await countRecentBulletins(validation.value.email, ipHash);
  if (recentCount >= 3) {
    return NextResponse.json(
      { error: "Napi limit túllépve. Egy nap (24 óra) legfeljebb 3 hirdetés adható fel ugyanazzal az e-mail címmel vagy IP-címmel." },
      { status: 429 },
    );
  }

  const id = crypto.randomUUID();
  const manageToken = crypto.randomUUID().replace(/-/g, "");
  const now = new Date();
  const hasEmail = validation.value.email.length > 0;

  // === ÚJ FŐÚT (local-first, no-email) ===
  // Ha a feladó NEM adott meg emailt: azonnal publikáljuk a posztot, és a
  // manage_token-t visszaadjuk a kliensnek (PostSavePrompt a localStorage-ba teszi).
  if (!hasEmail) {
    const postExpiresAt = new Date(now.getTime() + POST_TTL_MS).toISOString();
    await publishBulletinPost({
      id,
      kindId: validation.value.kindId,
      title: validation.value.title,
      meta: validation.value.meta,
      body: validation.value.body,
      poster: validation.value.poster,
      email: "",
      manageToken,
      expiresAt: postExpiresAt,
      isPending: 0,
      termsVersion: TERMS_VERSION,
      acceptedTermsAt: now.toISOString(),
      ageConfirmed: 1,
      ipHash,
      imageKey: validation.value.imageKey,
      cantonCode: validation.value.cantonCode,
      price: validation.value.price,
    });

    return NextResponse.json(
      {
        ok: true,
        published: true,
        id,
        manageToken,
        manageUrl: `/hirdetes-kezeles/${manageToken}`,
      },
      { headers: { "cache-control": "no-store" } },
    );
  }

  // === RÉGI ÚT (legacy email-confirm) — visszafelé kompat ===
  const confirmToken = crypto.randomUUID().replace(/-/g, "");
  const expiresAt = new Date(now.getTime() + CONFIRM_TTL_MS).toISOString();

  await createBulletinDraft({
    id,
    email: validation.value.email,
    kindId: validation.value.kindId,
    title: validation.value.title,
    meta: validation.value.meta,
    body: validation.value.body,
    poster: validation.value.poster,
    confirmToken,
    manageToken,
    expiresAt,
    termsVersion: TERMS_VERSION,
    acceptedTermsAt: now.toISOString(),
    ageConfirmed: 1,
    ipHash,
    imageKey: validation.value.imageKey,
    cantonCode: validation.value.cantonCode,
    price: validation.value.price,
  });

  const baseUrl =
    getCloudflareEnv().PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    new URL(req.url).origin;

  try {
    await sendConfirmationEmail({
      to: validation.value.email,
      posterName: validation.value.poster,
      title: validation.value.title,
      confirmUrl: `${baseUrl}/api/bulletin/confirm/${confirmToken}`,
      manageUrl: `${baseUrl}/hirdetes-kezeles/${manageToken}`,
      confirmExpiresAt: expiresAt,
    });
  } catch (err) {
    safeLogError("[bulletin/submit] email send failed", err);
    return NextResponse.json(
      { error: "Az emailt nem sikerült elküldeni. Próbáld újra később." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, published: false }, { headers: { "cache-control": "no-store" } });
}
