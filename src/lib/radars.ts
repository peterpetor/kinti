import { getActiveRadarsByType, markRadarFired, enqueueRadarDigest, getRadarDigestQueue, deleteRadarDigestItems } from "./repo";
import { sendPush } from "./push";
import { getCloudflareEnv } from "./cloudflare";
import { safeLogError } from "./safe-log";
import { parseDbDate } from "./dates";

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
  /** Régi (migráció előtti) sornál hiányozhat → CH-nak vesszük (mindig az volt). */
  country?: string | null;
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
    // hirdetésnél a szabad-szöveges helyből próbáljuk kitalálni. A svájci
    // PLZ/kanton-feloldó (cantonFromAddress) CSAK CH-állásra hívható — AT/DE/NL
    // irányítószámok álpozitívat adnának (lásd a PLZ-csapda korábbi eseteit).
    let jobCantonCode = job.cantonCode ?? null;
    if (!jobCantonCode && (job.country ?? "CH") === "CH") {
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

    // HIBRID értesítés (frequency capping): a nap ELSŐ illeszkedő állását a radar
    // AZONNAL küldi (push + email), a többit a digest-sorba teszi → egy napi
    // összefoglaló cron küldi ki (processRadarDigests). Így nincs 15-email-spam.
    const todayStartMs = (() => { const d = new Date(); d.setUTCHours(0, 0, 0, 0); return d.getTime(); })();
    await Promise.allSettled(
      targets.map(async (t) => {
        const firedAt = parseDbDate(t.lastFiredAt);
        const firedToday = firedAt ? firedAt.getTime() >= todayStartMs : false;
        if (firedToday) {
          // Ma már ment azonnali — a többi a napi digestbe gyűlik.
          try { await enqueueRadarDigest(t.id, job.id); } catch { /* per-radar */ }
          return;
        }
        // A nap első találata → azonnal, majd jelöljük, hogy ma már kilőtt.
        if (t.pushEndpoint) { try { await sendPush(privKey, { endpoint: t.pushEndpoint }); } catch { /* per-endpoint */ } }
        if (t.email) { try { await sendJobAlertEmail(t.email, t.id, job); } catch { /* per-email */ } }
        try { await markRadarFired(t.id); } catch { /* best-effort */ }
      }),
    );
  } catch (err) {
    safeLogError("triggerJobAlertRadars", err);
  }
}

/**
 * A digest-sor feldolgozása — a napi összefoglaló kiküldése radaronként.
 * NAPI cronból hívva (send-lead-digests). A nap első találatát már azonnal
 * elküldtük; itt a TÖBBIT küldjük egy összefoglalóban. Visszaadja a kiküldött
 * digestek számát.
 */
export async function processRadarDigests(): Promise<number> {
  let queue: Awaited<ReturnType<typeof getRadarDigestQueue>>;
  try {
    queue = await getRadarDigestQueue();
  } catch (err) {
    safeLogError("processRadarDigests:queue", err);
    return 0;
  }
  if (queue.length === 0) return 0;

  const privKey = getCloudflareEnv().VAPID_PRIVATE_KEY;
  const { getJobById } = await import("./repo-jobs");

  // Csoportosítás radaronként.
  const byRadar = new Map<string, { pushEndpoint: string; email: string | null; queueIds: string[]; jobIds: string[] }>();
  for (const q of queue) {
    let g = byRadar.get(q.radarId);
    if (!g) { g = { pushEndpoint: q.pushEndpoint, email: q.email, queueIds: [], jobIds: [] }; byRadar.set(q.radarId, g); }
    g.queueIds.push(q.queueId);
    g.jobIds.push(q.jobId);
  }

  let sent = 0;
  for (const [radarId, g] of byRadar) {
    try {
      const jobsRaw = await Promise.all(g.jobIds.map((id) => getJobById(id).catch(() => null)));
      const jobs = jobsRaw.filter((j): j is NonNullable<typeof j> => !!j && j.moderationStatus === 1);
      if (jobs.length > 0) {
        if (g.pushEndpoint && privKey) { try { await sendPush(privKey, { endpoint: g.pushEndpoint }); } catch { /* per-endpoint */ } }
        if (g.email) { try { await sendJobAlertDigestEmail(g.email, radarId, jobs); } catch { /* per-email */ } }
        sent++;
      }
    } catch (err) {
      safeLogError("processRadarDigests:radar", err);
    }
    // A sort akkor is ürítjük, ha a job már nem aktív — ne ragadjon bent.
    try { await deleteRadarDigestItems(g.queueIds); } catch { /* best-effort */ }
  }
  return sent;
}

/** Napi digest-email egy radarhoz — a nap (első utáni) találatainak listája. */
async function sendJobAlertDigestEmail(
  to: string,
  radarId: string,
  jobs: { id: string; title: string; location: string }[],
) {
  const { sendEmail } = await import("./email");
  const esc = (s: string) => s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c] ?? c);
  const unsubUrl = `https://kinti.app/api/radars/unsubscribe?id=${encodeURIComponent(radarId)}`;
  const items = jobs.slice(0, 25).map((j) => {
    const url = `https://kinti.app/allasok/${j.id}`;
    const loc = j.location ? ` <span style="color:#6b7280">· ${esc(j.location)}</span>` : "";
    return `<li style="margin:0 0 9px"><a href="${url}" style="color:#1d4434;font-weight:700;text-decoration:none">${esc(j.title)}</a>${loc}</li>`;
  }).join("");
  await sendEmail({
    to,
    subject: `${jobs.length} új állás a radarodon`,
    html: `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:16px">
      <p style="font-size:12px;color:#6b7280;margin:0 0 6px;text-transform:uppercase;letter-spacing:.04em">Kinti · Állás-radar (napi összefoglaló)</p>
      <h2 style="font-size:18px;color:#1d4434;margin:0 0 12px">${jobs.length} új találat a radarodon</h2>
      <ul style="padding-left:18px;margin:0 0 16px;font-size:14px;line-height:1.4">${items}</ul>
      <a href="https://kinti.app/allasok" style="display:inline-block;background:#1d4434;color:#fff;text-decoration:none;font-weight:700;padding:10px 18px;border-radius:999px;font-size:14px">Összes állás</a>
      <p style="font-size:11px;color:#9ca3af;margin:24px 0 0;line-height:1.5">Ezt azért kaptad, mert állás-radart állítottál be a Kintin. <a href="${unsubUrl}" style="color:#9ca3af">Leiratkozás erről a radarról</a>.</p>
    </div>`,
    text: `${jobs.length} új állás a radarodon:\n\n` + jobs.map((j) => `• ${j.title}${j.location ? ` (${j.location})` : ""} — https://kinti.app/allasok/${j.id}`).join("\n") + `\n\nLeiratkozás: ${unsubUrl}`,
  });
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
