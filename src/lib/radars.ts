import { getActiveRadarsByType } from "./repo";
import { sendPush } from "./push";
import { getCloudflareEnv } from "./cloudflare";
import { safeLogError } from "./safe-log";

/**
 * Triggerezi az Árfolyam radarokat, ha a beállított küszöböt átlépte a CHF/HUF árfolyam.
 */
export async function triggerExchangeRateRadars(currentHuf: number) {
  if (!currentHuf || currentHuf <= 0) return;
  try {
    const radars = await getActiveRadarsByType("exchange_rate");
    if (radars.length === 0) return;

    const env = getCloudflareEnv();
    const privKey = env.VAPID_PRIVATE_KEY;
    if (!privKey) return;

    const targets = radars.filter(r => {
      try {
        const p = JSON.parse(r.parameters);
        const threshold = Number(p.threshold);
        const dir = p.direction;
        if (!Number.isFinite(threshold)) return false;
        if (dir === "above") return currentHuf >= threshold;
        if (dir === "below") return currentHuf <= threshold;
        return false;
      } catch {
        return false;
      }
    });

    await Promise.allSettled(
      targets.map(async (t) => {
        try {
          await sendPush(privKey, { endpoint: t.pushEndpoint });
        } catch (e) {
          // silent fail per endpoint
        }
      })
    );
  } catch (err) {
    safeLogError("triggerExchangeRateRadars", err);
  }
}
