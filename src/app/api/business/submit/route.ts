import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getCategories,
  createBusinessSubmission,
  countRecentBusinessSubmissions,
  purgeExpiredBusinessSubmissions,
  logModerationStrike,
} from "@/lib/repo";
import { verifyTurnstile } from "@/lib/turnstile";
import { moderateText } from "@/lib/text-moderation";
import { notifyAdminContentPending } from "@/lib/admin-notify";
import { checkBlocklistOrReject } from "@/lib/blocklist-guard";
import { sendBusinessConfirmationEmail } from "@/lib/email";
import { TERMS_VERSION, hashIp } from "@/lib/security";
import {
  validateBusinessInput,
  BUSINESS_CONFIRM_TTL_MS,
  BUSINESS_DAILY_LIMIT,
} from "@/lib/business";
import { getCloudflareEnv, getCloudflareCtx } from "@/lib/cloudflare";
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

  // 3.1) Admin-tiltólista (ban): ha az IP vagy email a blocklist-en, 403.
  const banned = await checkBlocklistOrReject({
    ip,
    email: typeof validation.value.email === "string" ? validation.value.email : null,
  });
  if (banned) return banned;

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

  // 5.1) AI szöveg-moderáció — PII, rágalmazás, engedélyköteles ajánlat
  //      Fail-open: ha az AI nem elérhető, ne blokkoljuk a feladást.
  const businessText = [validation.value.name, validation.value.blurb]
    .filter((s): s is string => typeof s === "string" && s.length > 0)
    .join("\n");
  if (businessText.length > 0) {
    const textMod = await moderateText(businessText);
    if (textMod.action === "block") {
      await logModerationStrike(ipHash, "Business text moderation failed: " + textMod.reason);
      return NextResponse.json(
        {
          error:
            textMod.reason ||
            "A vállalkozási leírás nem felel meg a közösségi irányelveknek.",
        },
        { status: 400 },
      );
    }
  }

  const id = crypto.randomUUID();
  const manageToken = crypto.randomUUID().replace(/-/g, "");
  const now = new Date();
  const hasEmail = validation.value.email.length > 0;

  const { userId: clerkUserId } = await auth();

  // === ÚJ FŐÚT (local-first, no-email) ===
  // Ha nincs email: azonnal publikáljuk a vállalkozást és visszaadjuk a manage_token-t.
  if (!hasEmail) {
    const { createBusinessFromSubmission, getBusinessById, findLikelyDuplicates } = await import("@/lib/repo");
    const { slugifyBusinessName, approxCoordsForRegion } = await import("@/lib/business");
    let bizId = `${slugifyBusinessName(validation.value.name)}-${crypto.randomUUID().slice(0, 6)}`;
    if (await getBusinessById(bizId)) {
      bizId = `${slugifyBusinessName(validation.value.name)}-${crypto.randomUUID().slice(0, 8)}`;
    }
    // Duplikátum-jelzés a LÉTREHOZÁS ELŐTT (különben a most publikált saját sort
    // is „duplikátumnak" látná) — TELEFON alapján, az admin moderálásához. NEM
    // blokkol; best-effort. A 2026-07-18-i audit dup-osztálya ellen.
    let dupHint = "";
    try {
      const dups = await findLikelyDuplicates(validation.value.phone);
      if (dups.length > 0) {
        dupHint = `⚠️ LEHET DUPLIKÁTUM (azonos telefonszám): ${dups.map((d) => d.name).join(", ")} — ellenőrizd jóváhagyás előtt.\n\n`;
      }
    } catch {
      /* a dup-jelzés best-effort — sose törheti a beküldést */
    }
    // Pontos koordináta a térképes címkeresőből; ha nincs, régió-közelítés (ország-tudatos).
    const approx = approxCoordsForRegion(validation.value.country, validation.value.cantonCode);
    const lat = validation.value.lat ?? approx?.lat ?? null;
    const lng = validation.value.lng ?? approx?.lng ?? null;
    await createBusinessFromSubmission({
      id: bizId,
      name: validation.value.name,
      categoryId: validation.value.categoryId,
      categoryLabel: validation.value.categoryLabel,
      address: validation.value.address,
      country: validation.value.country,
      cantonCode: validation.value.cantonCode || null,
      phone: validation.value.phone,
      blurb: validation.value.blurb,
      licenseNumber: validation.value.licenseNumber,
      contactEmail: "",
      lat,
      lng,
      languages: validation.value.languages,
      workingHours: validation.value.workingHours,
      ownerUserId: clerkUserId,
      manageToken,
    });
    // Új tartalom-moderációs réteg (0044): admin-jóváhagyás szükséges.
    notifyAdminContentPending({
      contentType: "vállalkozás",
      title: validation.value.name,
      preview: dupHint + (validation.value.blurb ?? validation.value.address ?? ""),
      submitterEmail: null,
    }).catch(() => {});
    return NextResponse.json(
      {
        ok: true,
        published: true,
        id: bizId,
        manageToken,
        manageUrl: `/szaknevsor/kezeles/${manageToken}`,
        moderationPending: true,
      },
      { headers: { "cache-control": "no-store" } },
    );
  }

  // === RÉGI ÚT (legacy email-confirm) — visszafelé kompat ===
  const confirmToken = crypto.randomUUID().replace(/-/g, "");
  // SZÓKÖZ-elválasztó (nem 'T'/'Z') — a D1 `datetime('now')` így tárol, és az
  // `expires_at > datetime('now')` string-összehasonlítás csak így pontos.
  // 'T'-vel (0x54 > 0x20 space) az aznapi, már lejárt token éjfélig érvényesnek
  // látszana.
  const expiresAt = new Date(now.getTime() + BUSINESS_CONFIRM_TTL_MS)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  await createBusinessSubmission({
    id,
    name: validation.value.name,
    categoryId: validation.value.categoryId,
    categoryLabel: validation.value.categoryLabel,
    address: validation.value.address,
    cantonCode: validation.value.cantonCode,
    country: validation.value.country,
    phone: validation.value.phone,
    email: validation.value.email,
    blurb: validation.value.blurb,
    licenseNumber: validation.value.licenseNumber,
    confirmToken,
    expiresAt,
    termsVersion: TERMS_VERSION,
    acceptedTermsAt: now.toISOString(),
    ageConfirmed: 1,
    ipHash,
    ownerUserId: clerkUserId,
    manageToken,
  });

  // Opportunista, nem-blokkoló takarítás: a lejárt, MEG NEM ERŐSÍTETT beküldések
  // törlése (email + ip_hash PII-t tartalmaznak) — GDPR adatminimalizálás, és
  // nincs DB-bloat. A beküldés rate-limitelt, így ez ritkán fut.
  getCloudflareCtx()?.waitUntil(purgeExpiredBusinessSubmissions());

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
