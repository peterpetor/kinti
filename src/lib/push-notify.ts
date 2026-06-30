/**
 * push-notify.ts — kanton-célzott push kiküldése a feliratkozóknak.
 *
 * A `listPushSubscriptions(cantonCode)` az adott kanton + az „egész Svájc"
 * feliratkozóit adja. A push payload nélküli (a service worker mutat egy
 * általános „új a Kintin a kantonodban" értesítést) — a célzás itt történik.
 * A megszűnt (404/410) endpointokat törli.
 */
import { sendPush, type PushPayload } from "./push";
import { listPushSubscriptions, deletePushSubscription, type PushCategory } from "./repo-misc";
import { getCloudflareEnv } from "./cloudflare";

export interface NotifyResult { total: number; sent: number; removed: number; failed: number }

/**
 * Kanton-célzott push. Ha `payload` meg van adva, titkosítva küldjük (a SW a
 * konkrét „mi az új" szöveget mutatja); egyébként payload nélküli tickle.
 * `category`: ha megadod, csak az adott típusra feliratkozottak kapják meg
 * (push kategória-preferencia — beállítások UI).
 */
export async function notifyCanton(
  cantonCode: string | null,
  payload?: PushPayload,
  category?: PushCategory,
): Promise<NotifyResult> {
  const env = getCloudflareEnv();
  if (!env.VAPID_PRIVATE_KEY) return { total: 0, sent: 0, removed: 0, failed: 0 };

  const subs = await listPushSubscriptions(cantonCode, category);
  let sent = 0, removed = 0, failed = 0;

  // Chunkolt fan-out: ~50-es kötegekben dolgozzuk fel a feliratkozókat, hogy ne
  // indítsunk korlátlan számú EGYIDEJŰ subrequestet (a korlátlan Promise.all már
  // pár száz feliratkozónál is connection-storm-ot okozhat). NAGY skálán (>~1000
  // címzett, a Cloudflare per-invocation subrequest-plafonja közelében) ezt
  // Cloudflare Queues-ra kell mozgatni — addig ez a köteg-feldolgozás biztonságos.
  const CHUNK = 50;
  for (let i = 0; i < subs.length; i += CHUNK) {
    await Promise.all(
      subs.slice(i, i + CHUNK).map(async (s) => {
        try {
          const status = await sendPush(
            env.VAPID_PRIVATE_KEY!,
            { endpoint: s.endpoint, p256dh: s.p256dh, auth: s.auth },
            payload,
          );
          if (status >= 200 && status < 300) sent++;
          else if (status === 404 || status === 410) {
            await deletePushSubscription(s.endpoint);
            removed++;
          } else failed++;
        } catch {
          failed++;
        }
      }),
    );
  }

  return { total: subs.length, sent, removed, failed };
}
