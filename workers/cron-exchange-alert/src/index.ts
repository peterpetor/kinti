/**
 * kinti-cron-exchange-alert — óránkénti push-cron (árfolyam + esemény-emlékeztető).
 *
 * Óránként lefutva két dolgot csinál:
 *   A) Árfolyam-riasztás:
 *      1) lekéri a Frankfurter API-tól az aktuális CHF→HUF árfolyamot
 *      2) végigjárja az aktív `exchange_rate_alerts` rekordokat
 *      3) ha az árfolyam átlépte a küszöböt ÉS a last_fired_at ≥ 6 órája volt,
 *         payload-mentes push-t küld a feliratkozónak.
 *   B) Esemény-emlékeztető: az esedékes (`event_reminders.remind_at ≤ most`)
 *      RSVP-emlékeztetőket küldi ki, majd `sent = 1`-re állítja.
 *
 * A push payload nélküli — a service worker egy generikus "kinti — új
 * értesítés" üzenetet jelenít meg, a user a kinti.app/arfolyam-on látja az
 * aktuális árfolyamot. (A payload-os push aes128gcm titkosítása sok extra
 * kód lenne; ezt később adhatjuk hozzá.)
 *
 * Manuális teszt: GET /?token=<CRON_SECRET>
 */

export interface Env {
  DB: D1Database;
  VAPID_PRIVATE_KEY?: string;
  VAPID_PUBLIC_KEY?: string;
  VAPID_SUBJECT?: string;
  CRON_SECRET?: string;
}

interface AlertRow {
  id: string;
  push_endpoint: string;
  threshold_huf: number;
  direction: string;
  last_fired_at: string | null;
}

interface RunResult {
  rateChfHuf: number;
  totalAlerts: number;
  triggered: number;
  pushSent: number;
  pushRemoved: number;
  pushFailed: number;
  skippedCooldown: number;
  ranAt: string;
}

// --- Web Push helpers (a Pages projektből másolt — payload-mentes) ---------

function b64urlToBytes(s: string): Uint8Array {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const b64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToB64url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function strToB64url(s: string): string {
  return bytesToB64url(new TextEncoder().encode(s));
}

async function importSigningKey(
  privateKeyB64url: string,
  publicKeyB64url: string,
): Promise<CryptoKey> {
  const pub = b64urlToBytes(publicKeyB64url);
  if (pub.length !== 65 || pub[0] !== 0x04) {
    throw new Error("Érvénytelen VAPID publikus kulcs (65 bájt, 0x04 prefix kell).");
  }
  const jwk: JsonWebKey = {
    kty: "EC",
    crv: "P-256",
    x: bytesToB64url(pub.slice(1, 33)),
    y: bytesToB64url(pub.slice(33, 65)),
    d: privateKeyB64url,
    ext: true,
  };
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
}

async function buildVapidJwt(
  audience: string,
  subject: string,
  key: CryptoKey,
): Promise<string> {
  const header = strToB64url(JSON.stringify({ typ: "JWT", alg: "ES256" }));
  const payload = strToB64url(
    JSON.stringify({
      aud: audience,
      exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
      sub: subject,
    }),
  );
  const signingInput = `${header}.${payload}`;
  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    new TextEncoder().encode(signingInput),
  );
  return `${signingInput}.${bytesToB64url(new Uint8Array(sig))}`;
}

async function sendPush(
  env: Env,
  endpoint: string,
): Promise<number> {
  if (!env.VAPID_PRIVATE_KEY || !env.VAPID_PUBLIC_KEY || !env.VAPID_SUBJECT) {
    throw new Error("Hiányos VAPID konfiguráció.");
  }
  const audience = new URL(endpoint).origin;
  const key = await importSigningKey(env.VAPID_PRIVATE_KEY, env.VAPID_PUBLIC_KEY);
  const jwt = await buildVapidJwt(audience, env.VAPID_SUBJECT, key);
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `vapid t=${jwt}, k=${env.VAPID_PUBLIC_KEY}`,
      TTL: "86400",
    },
  });
  return res.status;
}

// --- Árfolyam-lekérés és értékelés ----------------------------------------

async function fetchChfToHuf(): Promise<number | null> {
  try {
    const res = await fetch(
      "https://api.frankfurter.app/latest?from=CHF&to=HUF",
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { rates?: { HUF?: number } };
    const huf = data.rates?.HUF;
    return typeof huf === "number" && Number.isFinite(huf) ? huf : null;
  } catch {
    return null;
  }
}

/** Cooldown: re-trigger előtt 6 órának kell eltelnie. */
function isCooldown(lastFiredAt: string | null): boolean {
  if (!lastFiredAt) return false;
  const last = new Date(lastFiredAt).getTime();
  if (Number.isNaN(last)) return false;
  return Date.now() - last < 6 * 60 * 60 * 1000;
}

async function runAlerts(env: Env): Promise<RunResult> {
  const rate = await fetchChfToHuf();
  if (rate == null) {
    return {
      rateChfHuf: 0,
      totalAlerts: 0,
      triggered: 0,
      pushSent: 0,
      pushRemoved: 0,
      pushFailed: 0,
      skippedCooldown: 0,
      ranAt: new Date().toISOString(),
    };
  }

  const { results: alerts } = await env.DB
    .prepare(
      `SELECT id, push_endpoint, threshold_huf, direction, last_fired_at
       FROM exchange_rate_alerts
       WHERE active = 1`,
    )
    .all<AlertRow>();

  let pushSent = 0;
  let pushRemoved = 0;
  let pushFailed = 0;
  let triggered = 0;
  let skippedCooldown = 0;

  for (const a of alerts) {
    const trips =
      a.direction === "above" ? rate >= a.threshold_huf : rate <= a.threshold_huf;
    if (!trips) continue;
    triggered++;
    if (isCooldown(a.last_fired_at)) {
      skippedCooldown++;
      continue;
    }
    try {
      const status = await sendPush(env, a.push_endpoint);
      if (status >= 200 && status < 300) {
        pushSent++;
        await env.DB
          .prepare(
            `UPDATE exchange_rate_alerts SET last_fired_at = datetime('now') WHERE id = ?`,
          )
          .bind(a.id)
          .run();
      } else if (status === 404 || status === 410) {
        // Endpoint megszűnt — töröljük a subscription-t és az alert-eket.
        pushRemoved++;
        await env.DB
          .prepare(`DELETE FROM push_subscriptions WHERE endpoint = ?`)
          .bind(a.push_endpoint)
          .run();
        await env.DB
          .prepare(
            `DELETE FROM exchange_rate_alerts WHERE push_endpoint = ?`,
          )
          .bind(a.push_endpoint)
          .run();
      } else {
        pushFailed++;
      }
    } catch (err) {
      console.error("[cron-exchange-alert] push hiba:", err);
      pushFailed++;
    }
  }

  return {
    rateChfHuf: rate,
    totalAlerts: alerts.length,
    triggered,
    pushSent,
    pushRemoved,
    pushFailed,
    skippedCooldown,
    ranAt: new Date().toISOString(),
  };
}

// --- Esemény RSVP push-emlékeztetők ---------------------------------------

interface ReminderResult {
  due: number;
  sent: number;
  removed: number;
  failed: number;
}

/**
 * Esedékes (remind_at ≤ most), még el nem küldött esemény-emlékeztetők
 * kiküldése — csak élő feliratkozással és még be nem fejezett eseményre.
 * A push payload-mentes (mint az árfolyam-riasztásnál): a SW egy generikus
 * „kinti — új értesítés"-t mutat, a user a Közösség oldalon látja a részleteket.
 */
async function runEventReminders(env: Env): Promise<ReminderResult> {
  const { results } = await env.DB
    .prepare(
      `SELECT r.id AS id, r.push_endpoint AS push_endpoint
       FROM event_reminders r
       JOIN push_subscriptions s ON s.endpoint = r.push_endpoint
       JOIN events e ON e.id = r.event_id
       WHERE r.sent = 0
         AND r.remind_at <= datetime('now')
         AND r.remind_at >= datetime('now', '-1 day')
         AND e.event_date >= date('now')
       LIMIT 200`,
    )
    .all<{ id: string; push_endpoint: string }>();

  let sent = 0;
  let removed = 0;
  let failed = 0;

  for (const r of results) {
    try {
      const status = await sendPush(env, r.push_endpoint);
      if (status >= 200 && status < 300) {
        sent++;
        await env.DB
          .prepare(`UPDATE event_reminders SET sent = 1 WHERE id = ?`)
          .bind(r.id)
          .run();
      } else if (status === 404 || status === 410) {
        // Endpoint megszűnt — takarítjuk a feliratkozást és az emlékeztetőit.
        removed++;
        await env.DB
          .prepare(`DELETE FROM push_subscriptions WHERE endpoint = ?`)
          .bind(r.push_endpoint)
          .run();
        await env.DB
          .prepare(`DELETE FROM event_reminders WHERE push_endpoint = ?`)
          .bind(r.push_endpoint)
          .run();
      } else {
        failed++;
      }
    } catch (err) {
      console.error("[cron-exchange-alert] reminder push hiba:", err);
      failed++;
    }
  }

  // Elavult (2+ napja esedékes) emlékeztetők takarítása.
  await env.DB
    .prepare(`DELETE FROM event_reminders WHERE remind_at < datetime('now', '-2 days')`)
    .run();

  return { due: results.length, sent, removed, failed };
}

export default {
  async scheduled(
    _event: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    ctx.waitUntil(
      Promise.all([
        runAlerts(env).then((result) => {
          console.log("[cron-exchange-alert]", JSON.stringify(result));
        }),
        runEventReminders(env).then((result) => {
          console.log("[cron-exchange-alert][reminders]", JSON.stringify(result));
        }),
      ]).then(() => undefined),
    );
  },

  async fetch(req: Request, env: Env): Promise<Response> {
    const auth = req.headers.get("authorization") ?? "";
    const expected = env.CRON_SECRET ? `Bearer ${env.CRON_SECRET}` : null;
    if (!expected || auth !== expected) {
      return new Response("Unauthorized", { status: 401 });
    }
    const result = await runAlerts(env);
    const reminders = await runEventReminders(env);
    return Response.json({ ...result, reminders });
  },
};
