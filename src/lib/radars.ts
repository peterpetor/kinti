import { getActiveRadarsByType } from "./repo";
import { sendPush } from "./push";
import { getCloudflareEnv } from "./cloudflare";
import { safeLogError } from "./safe-log";

/**
 * Triggerezi az Árfolyam radarokat, ha a beállított küszöböt átlépte az árfolyam.
 * A radar `currency` paramétere (CHF vagy EUR) dönti el, melyik rátához mérünk;
 * régi (currency nélküli) radar = CHF. `rates`: { chf: CHF→HUF, eur: EUR→HUF }.
 */
export async function triggerExchangeRateRadars(rates: { chf: number; eur: number }) {
  if ((!rates.chf || rates.chf <= 0) && (!rates.eur || rates.eur <= 0)) return;
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
        const current = p.currency === "EUR" ? rates.eur : rates.chf;
        if (!Number.isFinite(threshold) || !current || current <= 0) return false;
        if (dir === "above") return current >= threshold;
        if (dir === "below") return current <= threshold;
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
export async function triggerJobAlertRadars(job: {
  id: string;
  title: string;
  description: string;
  location: string;
  cantonCode?: string | null;
  category?: string | null;
}) {
  try {
    const radars = await getActiveRadarsByType("job_alert");
    if (radars.length === 0) return;

    const env = getCloudflareEnv();
    const privKey = env.VAPID_PRIVATE_KEY;
    if (!privKey) return;

    const jobText = (job.title + " " + job.description).toLowerCase();

    // A kanton elsősorban a strukturált mezőből jön; régi (migráció előtti)
    // hirdetésnél a szabad-szöveges helyből próbáljuk kitalálni.
    let jobCantonCode = job.cantonCode ?? null;
    if (!jobCantonCode) {
      const { cantonFromAddress, matchCantonByName } = await import("./cantons");
      jobCantonCode = (cantonFromAddress(job.location) || matchCantonByName(job.location))?.code ?? null;
    }

    const targets = radars.filter(r => {
      try {
        const p = JSON.parse(r.parameters);

        // Kanton ellenőrzés
        const targetCanton = p.cantonCode;
        if (targetCanton && targetCanton !== "all") {
          if (targetCanton !== jobCantonCode) return false;
        }

        // Szakma (új, strukturált radar) VAGY kulcsszó (régi radar) ellenőrzés
        if (p.category) {
          if (p.category !== job.category) return false;
        } else if (p.keyword) {
          const kw = String(p.keyword).trim().toLowerCase();
          if (kw && !jobText.includes(kw)) return false;
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
