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
import { safeLogError } from "./safe-log";
import { getDueDeadlineReminders, markDeadlineSent } from "./repo";

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

    if (r.p256dh && r.auth) {
      const when = d === 0 ? "MA" : d === 1 ? "holnap" : `${d} nap múlva`;
      try {
        await sendPush(
          privKey,
          { endpoint: r.endpoint, p256dh: r.p256dh, auth: r.auth },
          { title: "⏰ Közeledő határidő", body: `${r.title} — ${when} lejár.`, url: "/hatarido" },
        );
        sent++;
      } catch (e) {
        safeLogError("processDeadlineReminders:push", e);
      }
    }
    // Minden ELÉRT küszöböt jelölünk (a múltbelieket is), hogy ne fire-oljon utólag.
    THRESHOLDS.forEach((T) => { if (d <= T) already.add(T); });
    try {
      await markDeadlineSent(r.id, [...already].sort((a, b) => b - a).join(","));
    } catch { /* best-effort */ }
  }
  return sent;
}
