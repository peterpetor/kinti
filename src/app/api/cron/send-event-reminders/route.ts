import { getCloudflareEnv } from "@/lib/cloudflare";
import { getAdminUserId } from "@/lib/admin";
import { getDueEventReminders, markEventReminderSent, deletePushSubscription } from "@/lib/repo";
import { sendPush, type PushPayload } from "@/lib/push";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET|POST /api/cron/send-event-reminders — esemény-emlékeztető push kiküldése.
 *
 * Az esedékes (sent=0, remind_at ≤ most) emlékeztetőket küldi ki (24h és 1h a
 * kezdés előtt), majd sent=1-re állítja. A megszűnt (404/410) feliratkozásokat
 * törli. Óránként (vagy gyakrabban) érdemes futtatni.
 *
 * Auth: `Authorization: Bearer <CRON_SECRET>` (külső ütemező), VAGY admin.
 */
function buildPayload(r: { leadMinutes: number; title: string; startTime: string | null; venue: string | null; eventId: string }): PushPayload {
  const time = r.startTime ? r.startTime : null;
  const url = `/kozosseg/esemeny/${r.eventId}`;
  if (r.leadMinutes >= 1440) {
    return {
      title: `Holnap${time ? ` ${time}` : ""}: ${r.title}`,
      body: r.venue ? `📍 ${r.venue} — ne maradj le róla!` : "Ne felejtsd el! 📅",
      url,
    };
  }
  // 1h (és a régi 3h) — közeli emlékeztető
  const parts = [time, r.venue].filter(Boolean).join(" · ");
  return {
    title: `Hamarosan: ${r.title}`,
    body: `🔔 ${parts || "Kezdődik az esemény"}`,
    url,
  };
}

async function handle(req: Request): Promise<Response> {
  const env = getCloudflareEnv() as unknown as { CRON_SECRET?: string; VAPID_PRIVATE_KEY?: string };
  const auth = req.headers.get("authorization") ?? "";
  const okSecret = !!env.CRON_SECRET && auth === `Bearer ${env.CRON_SECRET}`;
  const okAdmin = okSecret ? false : !!(await getAdminUserId());
  if (!okSecret && !okAdmin) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!env.VAPID_PRIVATE_KEY) {
    return Response.json({ ok: false, error: "VAPID_PRIVATE_KEY missing" }, { status: 503 });
  }

  let sent = 0;
  let removed = 0;
  let skipped = 0;
  try {
    const due = await getDueEventReminders(new Date().toISOString());
    for (const r of due) {
      // Törölt/hiányzó feliratkozás → zárjuk le az árva sort.
      if (!r.p256dh || !r.auth) {
        await markEventReminderSent(r.id);
        skipped++;
        continue;
      }
      try {
        const status = await sendPush(
          env.VAPID_PRIVATE_KEY,
          { endpoint: r.endpoint, p256dh: r.p256dh, auth: r.auth },
          buildPayload(r),
        );
        if (status === 404 || status === 410) {
          await deletePushSubscription(r.endpoint);
          removed++;
        } else {
          sent++;
        }
        // Csak nem-dobó küldés (siker vagy halott feliratkozás) után jelöljük
        // elküldöttnek — egy tranziens push-hiba így a következő futáskor újrapróbálódik.
        await markEventReminderSent(r.id);
      } catch (err) {
        safeLogError("send-event-reminders push", err);
      }
    }
  } catch (err) {
    safeLogError("send-event-reminders", err);
    return Response.json({ ok: false, error: "internal" }, { status: 500 });
  }

  return Response.json({ ok: true, sent, removed, skipped });
}

export const GET = handle;
export const POST = handle;
