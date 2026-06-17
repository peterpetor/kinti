/**
 * repo-misc.ts — Push notifikációk, heti hírlevél, radarok és statisztikák.
 */
import { getDB } from "./cloudflare";

// --- Web Push ----------------------------------------------------------------

export interface PushSubscriptionRow { id: string; endpoint: string; p256dh: string; auth: string; canton_code: string | null; notify_business?: number; notify_event?: number; }

export interface SavePushSubscriptionInput { id: string; endpoint: string; p256dh: string; auth: string; cantonCode: string | null; }

export async function savePushSubscription(input: SavePushSubscriptionInput): Promise<void> {
  await getDB().prepare(`INSERT INTO push_subscriptions (id, endpoint, p256dh, auth, canton_code) VALUES (?, ?, ?, ?, ?) ON CONFLICT(endpoint) DO UPDATE SET p256dh = excluded.p256dh, auth = excluded.auth, canton_code = excluded.canton_code`).bind(input.id, input.endpoint, input.p256dh, input.auth, input.cantonCode).run();
}

export async function deletePushSubscription(endpoint: string): Promise<void> {
  await getDB().prepare("DELETE FROM push_subscriptions WHERE endpoint = ?").bind(endpoint).run();
}

/** Egy push-feliratkozás titkosító-kulcsai endpoint alapján (cron-célzott küldéshez). */
export async function getPushKeysByEndpoint(endpoint: string): Promise<{ p256dh: string; auth: string } | null> {
  const row = await getDB()
    .prepare("SELECT p256dh, auth FROM push_subscriptions WHERE endpoint = ? LIMIT 1")
    .bind(endpoint)
    .first<{ p256dh: string; auth: string }>();
  return row ?? null;
}

export type PushCategory = "business" | "event";

export async function listPushSubscriptions(
  cantonCode?: string | null,
  category?: PushCategory,
): Promise<PushSubscriptionRow[]> {
  const conds: string[] = [];
  const binds: unknown[] = [];
  if (cantonCode) {
    conds.push("(canton_code = ? OR canton_code IS NULL)");
    binds.push(cantonCode);
  }
  // Kategória-preferencia: csak az adott típusra feliratkozottakat (alapból be).
  if (category === "business") conds.push("notify_business = 1");
  else if (category === "event") conds.push("notify_event = 1");

  const where = conds.length ? ` WHERE ${conds.join(" AND ")}` : "";
  const { results } = await getDB().prepare(`SELECT * FROM push_subscriptions${where}`).bind(...binds).all<PushSubscriptionRow>();
  return results;
}

export interface PushPreferences { notifyBusiness: boolean; notifyEvent: boolean; }

/** A feliratkozás kategória-preferenciái endpoint alapján (a beállítások UI-hoz). */
export async function getPushPreferences(endpoint: string): Promise<PushPreferences | null> {
  const row = await getDB()
    .prepare("SELECT notify_business, notify_event FROM push_subscriptions WHERE endpoint = ? LIMIT 1")
    .bind(endpoint)
    .first<{ notify_business: number; notify_event: number }>();
  if (!row) return null;
  return { notifyBusiness: row.notify_business === 1, notifyEvent: row.notify_event === 1 };
}

export async function updatePushPreferences(endpoint: string, prefs: PushPreferences): Promise<boolean> {
  const res = await getDB()
    .prepare("UPDATE push_subscriptions SET notify_business = ?, notify_event = ? WHERE endpoint = ?")
    .bind(prefs.notifyBusiness ? 1 : 0, prefs.notifyEvent ? 1 : 0, endpoint)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

// --- Email Digest ------------------------------------------------------------

export interface DigestSubscriberRow {
  id: string; email: string; canton_code: string | null; confirmed: number; confirm_token: string | null; unsubscribe_token: string; terms_version: string | null; accepted_terms_at: string | null; ip_hash: string | null; created_at: string; last_sent_at: string | null;
}

export interface CreateDigestSubscriberInput {
  id: string; email: string; cantonCode: string | null; confirmToken: string; unsubscribeToken: string; termsVersion: string; acceptedTermsAt: string; ipHash: string | null;
}

export async function createDigestSubscriber(input: CreateDigestSubscriberInput): Promise<void> {
  await getDB().prepare(`INSERT INTO digest_subscribers (id, email, canton_code, confirm_token, unsubscribe_token, terms_version, accepted_terms_at, ip_hash, confirmed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0) ON CONFLICT(email) DO UPDATE SET canton_code = excluded.canton_code, confirm_token = excluded.confirm_token, unsubscribe_token = excluded.unsubscribe_token, terms_version = excluded.terms_version, accepted_terms_at = excluded.accepted_terms_at, ip_hash = excluded.ip_hash, confirmed = 0`).bind(input.id, input.email.toLowerCase(), input.cantonCode, input.confirmToken, input.unsubscribeToken, input.termsVersion, input.acceptedTermsAt, input.ipHash).run();
}

export async function confirmDigestSubscriber(confirmToken: string): Promise<boolean> {
  const res = await getDB().prepare("UPDATE digest_subscribers SET confirmed = 1, confirm_token = NULL WHERE confirm_token = ?").bind(confirmToken).run();
  return (res.meta.changes ?? 0) > 0;
}

export async function deleteDigestSubscriberByUnsubToken(token: string): Promise<boolean> {
  const res = await getDB().prepare("DELETE FROM digest_subscribers WHERE unsubscribe_token = ?").bind(token).run();
  return (res.meta.changes ?? 0) > 0;
}

// --- Admin Stats -------------------------------------------------------------

export interface AdminStats { businesses: number; businessesVerified: number; eventsApproved: number; reviews: number; digestSubscribersConfirmed: number; pushSubscriptions: number; jobs: number; employers: number; }

export async function getAdminStats(): Promise<AdminStats> {
  const db = getDB();
  const q = (sql: string) => db.prepare(sql).first<{ n: number }>();
  const [businesses, verified, events, reviews, push, jobs, employers] = await Promise.all([
    q("SELECT COUNT(*) AS n FROM businesses"),
    q("SELECT COUNT(*) AS n FROM businesses WHERE verified = 1"),
    q("SELECT COUNT(*) AS n FROM events WHERE status = 'approved'"),
    q("SELECT COUNT(*) AS n FROM reviews WHERE hidden = 0"),
    q("SELECT COUNT(*) AS n FROM push_subscriptions"),
    q("SELECT COUNT(*) AS n FROM jobs WHERE status = 'active' AND moderation_status = 1"),
    q("SELECT COUNT(*) AS n FROM employers"),
  ]);
  // Megerősített hírlevél-feliratkozók. A régi digest_subscribers táblát eldobtuk
  // (0033); az új newsletter_subscribers (0066). Defenzív: ha a tábla hiányozna
  // (migráció nem futott), 0-ra esünk vissza a régi viselkedés szerint.
  const newsletter = await db
    .prepare("SELECT COUNT(*) AS n FROM newsletter_subscribers WHERE confirmed_at IS NOT NULL")
    .first<{ n: number }>()
    .catch(() => null);
  return {
    businesses: businesses?.n ?? 0,
    businessesVerified: verified?.n ?? 0,
    eventsApproved: events?.n ?? 0,
    reviews: reviews?.n ?? 0,
    digestSubscribersConfirmed: newsletter?.n ?? 0,
    pushSubscriptions: push?.n ?? 0,
    jobs: jobs?.n ?? 0,
    employers: employers?.n ?? 0
  };
}

// --- Admin Trends (14 napos napi bontás) -------------------------------------

export interface AdminTrends {
  /** 14 nap ISO-dátum címkéi (UTC, régitől újig). */
  days: string[];
  /** Napi új vállalkozás-regisztrációk. */
  businessRegistrations: number[];
  /** Napi benchmark-beküldések (bér + lakbér együtt). */
  benchmarkSubmissions: number[];
  /** Napi aktív beküldők — egyedi ip_hash a fő közreműködési táblákból (DAU-proxy). */
  activeContributors: number[];
  /** Összegzések az utolsó 7 napra. */
  newBusinesses7d: number;
  newBenchmark7d: number;
  /** Egyedi beküldő (ip_hash) az utolsó 7 napban — NEM a napi értékek összege. */
  activeContributors7d: number;
}

const TREND_DAYS = 14;

/** Az utolsó n nap ISO-dátumai (UTC), régitől újig. */
function lastNDatesUtc(n: number): string[] {
  const now = new Date();
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export async function getAdminTrends(): Promise<AdminTrends> {
  const db = getDB();
  const since = `datetime('now', '-${TREND_DAYS} days')`;

  // Napi bontású lekérdezések (UTC dátumkulcs). A hiányzó napokat JS-ben 0-zzuk.
  const dailyBusiness = db
    .prepare(`SELECT strftime('%Y-%m-%d', created_at) AS d, COUNT(*) AS n
              FROM businesses WHERE created_at >= ${since} GROUP BY d`)
    .all<{ d: string; n: number }>();

  const dailyBenchmark = db
    .prepare(`SELECT strftime('%Y-%m-%d', created_at) AS d, COUNT(*) AS n FROM (
                SELECT created_at FROM salary_benchmarks WHERE created_at >= ${since}
                UNION ALL
                SELECT created_at FROM rent_benchmarks   WHERE created_at >= ${since}
              ) GROUP BY d`)
    .all<{ d: string; n: number }>();

  // DAU-proxy: egyedi ip_hash/nap a fő közreműködési táblákból. Account nincs,
  // így ez "aktív beküldőt" mér (nem passzív olvasót) — adatvédelem-barát.
  const activitySubquery = `
    SELECT strftime('%Y-%m-%d', created_at) AS d, ip_hash FROM salary_benchmarks   WHERE created_at >= ${since} AND ip_hash IS NOT NULL
    UNION ALL
    SELECT strftime('%Y-%m-%d', created_at) AS d, ip_hash FROM rent_benchmarks     WHERE created_at >= ${since} AND ip_hash IS NOT NULL
    UNION ALL
    SELECT strftime('%Y-%m-%d', created_at) AS d, ip_hash FROM business_submissions WHERE created_at >= ${since} AND ip_hash IS NOT NULL
    UNION ALL
    SELECT strftime('%Y-%m-%d', created_at) AS d, ip_hash FROM reviews             WHERE created_at >= ${since} AND ip_hash IS NOT NULL`;

  const dailyActive = db
    .prepare(`SELECT d, COUNT(DISTINCT ip_hash) AS n FROM (${activitySubquery}) GROUP BY d`)
    .all<{ d: string; n: number }>();

  // 7 napos egyedi beküldő (a napi distinct-ek összege félrevezetne).
  const active7d = db
    .prepare(`SELECT COUNT(DISTINCT ip_hash) AS n FROM (${activitySubquery.replace(
      new RegExp(`datetime\\('now', '-${TREND_DAYS} days'\\)`, "g"),
      "datetime('now', '-7 days')",
    )})`)
    .first<{ n: number }>();

  const [biz, bench, active, a7] = await Promise.all([dailyBusiness, dailyBenchmark, dailyActive, active7d]);

  const days = lastNDatesUtc(TREND_DAYS);
  const toSeries = (rows: { d: string; n: number }[]): number[] => {
    const map = new Map(rows.map((r) => [r.d, r.n]));
    return days.map((d) => map.get(d) ?? 0);
  };

  const businessRegistrations = toSeries(biz.results);
  const benchmarkSubmissions = toSeries(bench.results);
  const activeContributors = toSeries(active.results);
  const sumLast7 = (arr: number[]) => arr.slice(-7).reduce((s, n) => s + n, 0);

  return {
    days,
    businessRegistrations,
    benchmarkSubmissions,
    activeContributors,
    newBusinesses7d: sumLast7(businessRegistrations),
    newBenchmark7d: sumLast7(benchmarkSubmissions),
    activeContributors7d: a7?.n ?? 0,
  };
}

// --- Exchange Rate Alerts ----------------------------------------------------

export type ExchangeRateDirection = "above" | "below";

export interface ExchangeRateAlert { id: string; pushEndpoint: string; thresholdHuf: number; direction: ExchangeRateDirection; active: boolean; createdAt: string; lastFiredAt: string | null; }

export async function saveExchangeRateAlert(params: { id: string; pushEndpoint: string; thresholdHuf: number; direction: ExchangeRateDirection; }): Promise<void> {
  await getDB().prepare(`INSERT INTO exchange_rate_alerts (id, push_endpoint, threshold_huf, direction, active) VALUES (?, ?, ?, ?, 1)`).bind(params.id, params.pushEndpoint, params.thresholdHuf, params.direction).run();
}

export async function listExchangeRateAlertsByEndpoint(pushEndpoint: string): Promise<ExchangeRateAlert[]> {
  const { results } = await getDB().prepare(`SELECT * FROM exchange_rate_alerts WHERE push_endpoint = ? AND active = 1 ORDER BY created_at DESC`).bind(pushEndpoint).all<{
    id: string; push_endpoint: string; threshold_huf: number; direction: string; active: number; created_at: string; last_fired_at: string | null;
  }>();
  return results.map(r => ({ id: r.id, pushEndpoint: r.push_endpoint, thresholdHuf: r.threshold_huf, direction: r.direction === "below" ? "below" : "above", active: !!r.active, createdAt: r.created_at, lastFiredAt: r.last_fired_at }));
}

export async function deleteExchangeRateAlert(id: string, pushEndpoint: string): Promise<boolean> {
  const res = await getDB().prepare(`DELETE FROM exchange_rate_alerts WHERE id = ? AND push_endpoint = ?`).bind(id, pushEndpoint).run();
  return (res.meta.changes ?? 0) > 0;
}

// --- Radars ------------------------------------------------------------------

export interface KintiRadar { id: string; pushEndpoint: string; radarType: 'exchange_rate' | 'job_alert'; parameters: string; active: number; createdAt: string; }

export async function saveRadar(data: { id: string; pushEndpoint: string; radarType: string; parameters: string; }) {
  await getDB().prepare('INSERT INTO kinti_radars (id, push_endpoint, radar_type, parameters) VALUES (?, ?, ?, ?)').bind(data.id, data.pushEndpoint, data.radarType, data.parameters).run();
}

export async function listRadarsByEndpoint(endpoint: string): Promise<KintiRadar[]> {
  const { results } = await getDB().prepare('SELECT * FROM kinti_radars WHERE push_endpoint = ? ORDER BY created_at DESC').bind(endpoint).all<{
    id: string; push_endpoint: string; radar_type: string; parameters: string; active: number; created_at: string;
  }>();
  return (results ?? []).map((r) => ({ id: String(r.id), pushEndpoint: String(r.push_endpoint), radarType: String(r.radar_type) as KintiRadar["radarType"], parameters: String(r.parameters), active: Number(r.active), createdAt: String(r.created_at) }));
}

export async function deleteRadar(id: string, endpoint: string): Promise<boolean> {
  const res = await getDB().prepare('DELETE FROM kinti_radars WHERE id = ? AND push_endpoint = ?').bind(id, endpoint).run();
  return (res.meta.changes ?? 0) > 0;
}

export async function getActiveRadarsByType(radarType: string): Promise<{id: string, pushEndpoint: string, parameters: string}[]> {
  const { results } = await getDB().prepare('SELECT id, push_endpoint, parameters FROM kinti_radars WHERE radar_type = ? AND active = 1').bind(radarType).all<{ id: string; push_endpoint: string; parameters: string }>();
  return (results ?? []).map(r => ({ id: String(r.id), pushEndpoint: String(r.push_endpoint), parameters: String(r.parameters) }));
}
