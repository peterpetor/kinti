import { NextResponse } from "next/server";
import { getBulletinKinds, createBulletinDraft } from "@/lib/repo";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendConfirmationEmail } from "@/lib/email";
import { validateBulletinInput, CONFIRM_TTL_MS } from "@/lib/bulletin";
import { getCloudflareEnv } from "@/lib/cloudflare";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/bulletin/submit  — publikus (account NÉLKÜLI hirdetésfeladás).
 *
 * Flow:
 *   1) honeypot + form-validáció (lib/bulletin)
 *   2) Cloudflare Turnstile token verifikáció
 *   3) kindId létezésének ellenőrzése a DB-ben
 *   4) bulletin_drafts INSERT (confirm_token + manage_token UUID-k, 24h TTL)
 *   5) Resend → email megerősítő linkkel
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

  // 4) piszkozat-INSERT
  const id = crypto.randomUUID();
  const confirmToken = crypto.randomUUID().replace(/-/g, "");
  const manageToken = crypto.randomUUID().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + CONFIRM_TTL_MS).toISOString();

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
  });

  // 5) Email küldés
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
    // Az email-küldés bukása komoly hiba: nem kérünk újra a usertől, csak
    // jelezzük neki — a piszkozatot meghagyjuk, és 24h múlva az auto-purge
    // törli (a confirm_token egyébként sose került ki).
    const message = err instanceof Error ? err.message : "Ismeretlen email-hiba.";
    return NextResponse.json(
      { error: "Az emailt nem sikerült elküldeni. Próbáld újra később.", detail: message },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
