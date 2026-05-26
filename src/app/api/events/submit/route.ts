import { NextResponse } from "next/server";
import { verifyTurnstile } from "@/lib/turnstile";
import { validateEventInput } from "@/lib/events-validation";
import {
  createEvent,
  getEventByToken,
} from "@/lib/repo";
import {
  sendEventConfirmationEmail,
  sendEventAdminModerationEmail,
} from "@/lib/email";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { isDisposableEmail } from "@/lib/disposable-emails";

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

  // 3) D1 INSERT — status: 'pending_confirm', egyedi token
  const id = crypto.randomUUID();
  const confirmToken = crypto.randomUUID().replace(/-/g, "");
  const moderateToken = crypto.randomUUID().replace(/-/g, "");

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
    status: "pending_confirm",
    token: confirmToken,
  });

  const baseUrl =
    getCloudflareEnv().PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    new URL(req.url).origin;

  // 4) Megerősítő email a beküldőnek
  try {
    await sendEventConfirmationEmail({
      to: validation.value.email,
      title: validation.value.title,
      eventDate: validation.value.eventDate,
      venue: validation.value.venue,
      confirmUrl: `${baseUrl}/api/events/confirm/${confirmToken}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ismeretlen email-hiba.";
    return NextResponse.json(
      { error: "Az emailt nem sikerült elküldeni. Próbáld újra később.", detail: message },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
