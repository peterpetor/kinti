/**
 * deadlines.ts — a Határidő-asszisztens push-emlékeztetője.
 *
 * NAPI cronból hívva (send-lead-digests). A 14 napon belül esedékes határidőkre
 * a 14/7/1 napos küszöböknél küld push-t az anonim endpointnak (privacy: nincs
 * user-azonosító, csak a push-feliratkozás — mint a radarok). A `sent` mezőben
 * tárolt küszöbökre nem küld újra (anti-spam).
 */
import { getCloudflareEnv } from "./cloudflare";
import { sendPush } from "./push";
import { sendDeadlineReminderEmail } from "./email";
import { safeLogError } from "./safe-log";
import { getDueDeadlineReminders, markDeadlineSent, deleteDeadlineReminders } from "./repo";

const THRESHOLDS = [14, 7, 1];

function daysUntil(dateISO: string): number {
  const due = new Date(dateISO + "T00:00:00Z").getTime();
  const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z").getTime();
  return Math.round((due - today) / 86_400_000);
}

/** A küszöböknél push-t küld; visszaadja a kiküldött emlékeztetők számát. */
export async function processDeadlineReminders(): Promise<number> {
  let rows: Awaited<ReturnType<typeof getDueDeadlineReminders>>;
  try {
    rows = await getDueDeadlineReminders();
  } catch (e) {
    safeLogError("processDeadlineReminders:fetch", e);
    return 0;
  }
  if (!rows.length) return 0;

  const privKey = getCloudflareEnv().VAPID_PRIVATE_KEY;
  if (!privKey) return 0;

  let sent = 0;
  for (const r of rows) {
    const d = daysUntil(r.due_date);
    if (d < 0 || d > 14) continue;
    const already = new Set((r.sent || "").split(",").filter(Boolean).map(Number));
    const due = THRESHOLDS.filter((T) => d <= T && !already.has(T));
    if (!due.length) continue;

    if (!r.p256dh || !r.auth) continue; // payload nélkül nincs értelmes push

    const when = d === 0 ? "MA" : d === 1 ? "holnap" : `${d} nap múlva`;

    // Emailes emlékeztető (OPT-IN) — best-effort, a push MELLETT. A sikerét külön
    // követjük: ha az email KIMENT, a küszöböt akkor is elküldöttnek jelöljük, ha a
    // push átmenetileg hibázik → nem küld a cron NAPONTA ismételt emailt.
    let emailOk = false;
    if (r.email) {
      try { await sendDeadlineReminderEmail(r.email, r.title, when); emailOk = true; }
      catch (e) { safeLogError("processDeadlineReminders:email", e); }
    }

    let status = 0;
    try {
      status = await sendPush(
        privKey,
        { endpoint: r.endpoint, p256dh: r.p256dh, auth: r.auth },
        { title: "⏰ Közeledő határidő", body: `${r.title} — ${when} lejár.`, url: "/hatarido" },
      );
    } catch (e) {
      safeLogError("processDeadlineReminders:push", e);
    }

    // Halott feliratkozás (404/410) → az endpoint összes emlékeztetőjének törlése.
    if (status === 404 || status === 410) {
      try { await deleteDeadlineReminders(r.endpoint); } catch { /* best-effort */ }
      continue;
    }
    // Elküldöttnek jelöljük, ha a push VAGY az email sikeres volt (különben holnap
    // újrapróbálja — de az email-ismétlést az `emailOk`-jelölés megakadályozza).
    if ((status >= 200 && status < 300) || emailOk) {
      sent++;
      THRESHOLDS.forEach((T) => { if (d <= T) already.add(T); });
      try {
        await markDeadlineSent(r.id, [...already].sort((a, b) => b - a).join(","));
      } catch { /* best-effort */ }
    }
  }
  return sent;
}
