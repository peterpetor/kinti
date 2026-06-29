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
        // Push — csak ha valódi endpoint van (az email-only radaré üres).
        if (t.pushEndpoint) {
          try { await sendPush(privKey, { endpoint: t.pushEndpoint }); } catch { /* per-endpoint */ }
        }
        // Email — ha a radarhoz email-cím tartozik (push nélkül is működik).
        if (t.email) {
          try { await sendJobAlertEmail(t.email, t.id, job); } catch { /* per-email */ }
        }
      })
    );
  } catch (err) {
    safeLogError("triggerJobAlertRadars", err);
  }
}

/** Egy találati email egy állás-radarhoz. Leiratkozó-linkkel (radar törlése id alapján). */
async function sendJobAlertEmail(
  to: string,
  radarId: string,
  job: { id: string; title: string; location: string },
) {
  const { sendEmail } = await import("./email");
  const esc = (s: string) => s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c] ?? c);
  const title = esc(job.title);
  const loc = esc(job.location || "");
  const jobUrl = `https://kinti.app/allasok/${job.id}`;
  const unsubUrl = `https://kinti.app/api/radars/unsubscribe?id=${encodeURIComponent(radarId)}`;
  await sendEmail({
    to,
    subject: `Új állás a radarodon: ${job.title}`,
    html: `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:16px">
      <p style="font-size:12px;color:#6b7280;margin:0 0 6px;text-transform:uppercase;letter-spacing:.04em">Kinti · Állás-radar</p>
      <h2 style="font-size:19px;color:#1d4434;margin:0 0 4px">${title}</h2>
      ${loc ? `<p style="font-size:14px;color:#374151;margin:0 0 16px">📍 ${loc}</p>` : ""}
      <a href="${jobUrl}" style="display:inline-block;background:#1d4434;color:#fff;text-decoration:none;font-weight:700;padding:11px 20px;border-radius:999px;font-size:14px">Megnézem az állást</a>
      <p style="font-size:11px;color:#9ca3af;margin:28px 0 0;line-height:1.5">Ezt azért kaptad, mert állás-radart állítottál be a Kintin. <a href="${unsubUrl}" style="color:#9ca3af">Leiratkozás erről a radarról</a>.</p>
    </div>`,
    text: `Új állás a radarodon: ${job.title}${loc ? ` (${job.location})` : ""}\n\n${jobUrl}\n\nLeiratkozás erről a radarról: ${unsubUrl}`,
  });
}
