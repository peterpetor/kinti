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

/**
 * Triggerezi az Állás-riasztás radarokat egy újonnan jóváhagyott állás esetén.
 */
export async function triggerJobAlertRadars(job: { id: string, title: string, description: string, location: string }) {
  try {
    const radars = await getActiveRadarsByType("job_alert");
    if (radars.length === 0) return;

    const env = getCloudflareEnv();
    const privKey = env.VAPID_PRIVATE_KEY;
    if (!privKey) return;

    const jobText = (job.title + " " + job.description).toLowerCase();
    
    // We need cantonFromAddress or matchCantonByName to check canton matching
    // But since this is a server-side module, we can just do a lazy require or inline check.
    const { cantonFromAddress, matchCantonByName } = await import("./cantons");
    const jobCanton = cantonFromAddress(job.location) || matchCantonByName(job.location);
    const jobCantonCode = jobCanton?.code;

    const targets = radars.filter(r => {
      try {
        const p = JSON.parse(r.parameters);
        const targetCanton = p.cantonCode;
        const kw = (p.keyword || "").trim().toLowerCase();

        // Kanton ellenőrzés
        if (targetCanton && targetCanton !== "all") {
          if (targetCanton !== jobCantonCode) return false;
        }

        // Kulcsszó ellenőrzés
        if (kw) {
          if (!jobText.includes(kw)) return false;
        }

        return true;
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
    safeLogError("triggerJobAlertRadars", err);
  }
}
