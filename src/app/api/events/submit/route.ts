import { NextResponse } from "next/server";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkBlocklistOrReject } from "@/lib/blocklist-guard";
import { validateEventInput } from "@/lib/events-validation";
import {
  createEvent,
  countRecentEventSubmits,
  logEventSubmit,
} from "@/lib/repo";
import {
  sendEventConfirmationEmail,
} from "@/lib/email";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { isDisposableEmail } from "@/lib/disposable-emails";
import { hashIp } from "@/lib/bulletin";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/events/submit — Közösségi esemény beküldése (account nélkül).
 *
 * Flow:
 *   1) Honeypot + form-validáció + trágárság-szűrő
 *   2) Cloudflare Turnstile CAPTCHA ellenőrzés
 *   3) Esemény INSERT status='pending_confirm' + confirm_token
 *   4) Email a beküldőnek: erősítsd meg az email-cíedet
 *   → A confirm link a /api/events/confirm/[token] végpontra mutat
 *   → Ott kerül admin-értesítő küldésre (approve/reject gombokkal)
 */
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  // 1) Validáció (profanity filter is benne van)
  const validation = validateEventInput(body);
  if (!validation.ok) {
    return NextResponse.json(
      { error: "Hibás bemenet.", details: validation.errors },
      { status: 400 },
    );
  }

  // Eldobható email cím kizárása
  if (isDisposableEmail(validation.value.email)) {
    return NextResponse.json(
      { error: "Eldobható vagy ideiglenes e-mail címek használata nem megengedett." },
      { status: 400 },
    );
  }

  // 2) Turnstile CAPTCHA
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

  // 2a) Admin-tiltólista (ban): ha az IP vagy email a blocklist-en, 403.
  const banned = await checkBlocklistOrReject({
    ip,
    email: typeof validation.value.email === "string" ? validation.value.email : null,
  });
  if (banned) return banned;

  // 2b) IP rate-limit: max 3 esemény / IP / 24 óra
  const ipHash = await hashIp(ip);
  const recentEventCount = await countRecentEventSubmits(ipHash);
  if (recentEventCount >= 3) {
    return NextResponse.json(
      { error: "Napi limit túllépve. Egy nap alatt legfeljebb 3 eseményt lehet beküldeni ugyanarról a kapcsolatról." },
      { status: 429 },
    );
  }

  const id = crypto.randomUUID();
  const confirmToken = crypto.randomUUID().replace(/-/g, "");
  const manageToken = crypto.randomUUID().replace(/-/g, "");
  const hasEmail = validation.value.email.length > 0;

  // Dátumból number/hónap/nap neve leképezés
  const [year, month, day] = validation.value.eventDate.split("-").map(Number);
  const dtObj = new Date(year, month - 1, day);
  const HU_MONTHS = ["JAN","FEB","MÁR","ÁPR","MÁJ","JÚN","JÚL","AUG","SZEP","OKT","NOV","DEC"];
  const HU_DAYS = ["vasárnap","hétfő","kedd","szerda","csütörtök","péntek","szombat"];

  await createEvent({
    id,
    title: validation.value.title,
    eventDate: validation.value.eventDate,
    dateDay: String(day),
    dateMonth: HU_MONTHS[month - 1],
    dateWeekday: HU_DAYS[dtObj.getDay()],
    startTime: validation.value.startTime,
    venue: validation.value.venue,
    going: 0,
    tag: validation.value.tag,
    color: "#1d4434",
    description: validation.value.description,
    imageKey: validation.value.imageKey,
    email: validation.value.email,
    // Local-first: ha nincs email → admin-jóváhagyásra rögtön; egyébként email-confirm után
    status: hasEmail ? "pending_confirm" : "pending_admin",
    token: confirmToken,
    manageToken,
  });

  logEventSubmit(crypto.randomUUID(), ipHash).catch(() => { /* silent */ });

  // Local-first mód: nincs email-küldés, csak manage_token vissza
  if (!hasEmail) {
    return NextResponse.json(
      {
        ok: true,
        published: false, // admin-jóváhagyásra vár
        pendingAdmin: true,
        id,
        manageToken,
        manageUrl: `/esemeny-kezeles/${manageToken}`,
      },
      { headers: { "cache-control": "no-store" } },
    );
  }

  // Régi email-confirm flow
  const baseUrl =
    getCloudflareEnv().PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    new URL(req.url).origin;

  try {
    await sendEventConfirmationEmail({
      to: validation.value.email,
      title: validation.value.title,
      eventDate: validation.value.eventDate,
      venue: validation.value.venue,
      confirmUrl: `${baseUrl}/api/events/confirm/${confirmToken}`,
      manageUrl: `${baseUrl}/esemeny-kezeles/${manageToken}`,
    });
  } catch (err) {
    safeLogError("[events/submit] email send failed", err);
    return NextResponse.json(
      { error: "Az emailt nem sikerült elküldeni. Próbáld újra később." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, published: false }, { headers: { "cache-control": "no-store" } });
}
