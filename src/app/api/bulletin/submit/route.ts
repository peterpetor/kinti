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
import { getCloudflareEnv, getMediaBucket } from "@/lib/cloudflare";
import { isDisposableEmail } from "@/lib/disposable-emails";
import { safeLogError } from "@/lib/safe-log";
import { moderateImage } from "@/lib/moderation";
import { moderateText } from "@/lib/text-moderation";
import { triggerAlberletRadars } from "@/lib/radars";

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

  // 4.1) AI szöveg-moderáció — PII, rágalmazás, engedélyköteles tartalom
  //      Fail-open: ha az AI nem elérhető, ne blokkoljuk a feladást.
  const combinedText = [
    validation.value.title,
    validation.value.meta,
    validation.value.body,
  ]
    .filter((s): s is string => typeof s === "string" && s.length > 0)
    .join("\n");
  if (combinedText.length > 0) {
    const textMod = await moderateText(combinedText);
    if (textMod.safe === false) {
      return NextResponse.json(
        {
          error:
            textMod.reason ||
            "A hirdetés szövege nem felel meg a közösségi irányelveknek.",
        },
        { status: 400 },
      );
    }
  }

  // 5) Kép moderáció Cloudflare Workers AI-val
  const imageKey = validation.value.imageKey;
  if (imageKey) {
    let keys: string[] = [];
    if (imageKey.startsWith("[")) {
      try {
        keys = JSON.parse(imageKey);
      } catch {
        keys = [imageKey];
      }
    } else {
      keys = [imageKey];
    }

    for (const key of keys) {
      if (!key) continue;
      const obj = await getMediaBucket().get(key);
      if (obj) {
        const arrayBuffer = await obj.arrayBuffer();
        const moderation = await moderateImage(arrayBuffer);
        if (!moderation.safe) {
          await getMediaBucket().delete(key).catch(() => { /* silent */ });
          return NextResponse.json(
            { error: moderation.reason || "A kép moderációs okokból elutasításra került." },
            { status: 400 },
          );
        }
      }
    }
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
      phone: validation.value.phone,
      whatsapp: validation.value.whatsapp,
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

    if (validation.value.kindId === 'alberlet' && validation.value.cantonCode) {
      // Értesítjük azokat, akik erre a kantonra (vagy 'all'-ra) iratkoztak fel
      triggerAlberletRadars(validation.value.cantonCode).catch(() => {});
    }

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
    phone: validation.value.phone,
    whatsapp: validation.value.whatsapp,
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
