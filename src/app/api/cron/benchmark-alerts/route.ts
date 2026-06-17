import { getCloudflareEnv } from "@/lib/cloudflare";
import { getAdminUserId } from "@/lib/admin";
import { getAlertsToFire, markAlertFired } from "@/lib/benchmark";
import { getPushKeysByEndpoint, deletePushSubscription } from "@/lib/repo";
import { sendPush } from "@/lib/push";
import { sendEmail } from "@/lib/email";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET|POST /api/cron/benchmark-alerts — béradat-riasztások kiküldése.
 *
 * Azokat a feliratkozókat értesíti (PUSH és/vagy EMAIL), akiknél az iparág
 * 3-havi átlagbére ±10%-ot mozdult (getAlertsToFire), majd markAlertFired-del
 * elmenti az új átlagot referenciának. Naponta 1× elég futtatni.
 *
 * Auth: `Authorization: Bearer <CRON_SECRET>` (külső ütemező), VAGY admin.
 */
async function handle(req: Request): Promise<Response> {
  const env = getCloudflareEnv() as unknown as { CRON_SECRET?: string; VAPID_PRIVATE_KEY?: string };
  const auth = req.headers.get("authorization") ?? "";
  const okSecret = !!env.CRON_SECRET && auth === `Bearer ${env.CRON_SECRET}`;
  const okAdmin = okSecret ? false : !!(await getAdminUserId());
  if (!okSecret && !okAdmin) {
    return new Response("Unauthorized", { status: 401 });
  }

  let pushSent = 0;
  let emailSent = 0;
  let removed = 0;
  try {
    const alerts = await getAlertsToFire();
    for (const a of alerts) {
      const dir = a.newAvg > a.lastAvgChf ? "nőtt" : "csökkent";
      const pct = Math.round((Math.abs(a.newAvg - a.lastAvgChf) / a.lastAvgChf) * 100);
      const avgChf = Math.round(a.newAvg).toLocaleString("de-CH");
      const where = a.cantonCode && a.cantonCode !== "all" ? ` (${a.cantonCode})` : "";

      // --- PUSH ---
      if (a.pushEndpoint && env.VAPID_PRIVATE_KEY) {
        const keys = await getPushKeysByEndpoint(a.pushEndpoint);
        if (keys) {
          try {
            const status = await sendPush(
              env.VAPID_PRIVATE_KEY,
              { endpoint: a.pushEndpoint, p256dh: keys.p256dh, auth: keys.auth },
              {
                title: `Béradat-változás: ${a.industry}`,
                body: `Az átlagbér ${dir} ~${pct}%-kal${where} — most ~${avgChf} CHF. 📊`,
                url: "/iranytu",
              },
            );
            if (status === 404 || status === 410) {
              await deletePushSubscription(a.pushEndpoint);
              removed++;
            } else {
              pushSent++;
            }
          } catch (err) {
            safeLogError("benchmark-alerts push", err);
          }
        }
      }

      // --- EMAIL ---
      if (a.email) {
        try {
          await sendEmail({
            to: a.email,
            subject: `Béradat-változás: ${a.industry}`,
            html: `<p>Szia!</p><p>A(z) <strong>${a.industry}</strong> iparág átlagbére <strong>${dir} ~${pct}%-kal</strong>${where} — most körülbelül <strong>${avgChf} CHF</strong>.</p><p>Részletek a Kinti Iránytű bér-statisztikáiban: <a href="https://kinti.app/iranytu">kinti.app/iranytu</a></p>`,
            text: `A(z) ${a.industry} átlagbére ${dir} ~${pct}%-kal${where} — most ~${avgChf} CHF. Részletek: https://kinti.app/iranytu`,
          });
          emailSent++;
        } catch (err) {
          safeLogError("benchmark-alerts email", err);
        }
      }

      await markAlertFired(a.id, a.newAvg);
    }
  } catch (err) {
    safeLogError("benchmark-alerts", err);
    return Response.json({ ok: false, error: "internal" }, { status: 500 });
  }

  return Response.json({ ok: true, pushSent, emailSent, removed });
}

export const GET = handle;
export const POST = handle;
