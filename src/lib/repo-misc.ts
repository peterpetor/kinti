/**
 * repo-misc.ts — Push notifikációk, heti hírlevél, radarok és statisztikák.
 */
import { getDB } from "./cloudflare";

// --- Web Push ----------------------------------------------------------------

export interface PushSubscriptionRow { id: string; endpoint: string; p256dh: string; auth: string; canton_code: string | null; }

export interface SavePushSubscriptionInput { id: string; endpoint: string; p256dh: string; auth: string; cantonCode: string | null; }

export async function savePushSubscription(input: SavePushSubscriptionInput): Promise<void> {
  await getDB().prepare(`INSERT INTO push_subscriptions (id, endpoint, p256dh, auth, canton_code) VALUES (?, ?, ?, ?, ?) ON CONFLICT(endpoint) DO UPDATE SET p256dh = excluded.p256dh, auth = excluded.auth, canton_code = excluded.canton_code`).bind(input.id, input.endpoint, input.p256dh, input.auth, input.cantonCode).run();
}

export async function deletePushSubscription(endpoint: string): Promise<void> {
  await getDB().prepare("DELETE FROM push_subscriptions WHERE endpoint = ?").bind(endpoint).run();
}

export async function listPushSubscriptions(cantonCode?: string | null): Promise<PushSubscriptionRow[]> {
  if (cantonCode) {
    const { results } = await getDB().prepare("SELECT * FROM push_subscriptions WHERE canton_code = ? OR canton_code IS NULL").bind(cantonCode).all<PushSubscriptionRow>();
    return results;
  }
  const { results } = await getDB().prepare("SELECT * FROM push_subscriptions").all<PushSubscriptionRow>();
  return results;
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

export interface AdminStats { businesses: number; businessesVerified: number; eventsApproved: number; reviews: number; digestSubscribersConfirmed: number; pushSubscriptions: number; }

export async function getAdminStats(): Promise<AdminStats> {
  const db = getDB();
  const q = (sql: string) => db.prepare(sql).first<{ n: number }>();
  const [businesses, verified, events, reviews, push] = await Promise.all([
    q("SELECT COUNT(*) AS n FROM businesses"),
    q("SELECT COUNT(*) AS n FROM businesses WHERE verified = 1"),
    q("SELECT COUNT(*) AS n FROM events WHERE status = 'approved'"),
    q("SELECT COUNT(*) AS n FROM reviews WHERE hidden = 0"),
    q("SELECT COUNT(*) AS n FROM push_subscriptions"),
  ]);
  return { businesses: businesses?.n ?? 0, businessesVerified: verified?.n ?? 0, eventsApproved: events?.n ?? 0, reviews: reviews?.n ?? 0, digestSubscribersConfirmed: 0, pushSubscriptions: push?.n ?? 0 };
}

// --- Exchange Rate Alerts ----------------------------------------------------

export type ExchangeRateDirection = "above" | "below";

export interface ExchangeRateAlert { id: string; pushEndpoint: string; thresholdHuf: number; direction: ExchangeRateDirection; active: boolean; createdAt: string; lastFiredAt: string | null; }

export async function saveExchangeRateAlert(params: { id: string; pushEndpoint: string; thresholdHuf: number; direction: ExchangeRateDirection; }): Promise<void> {
  await getDB().prepare(`INSERT INTO exchange_rate_alerts (id, push_endpoint, threshold_huf, direction, active) VALUES (?, ?, ?, ?, 1)`).bind(params.id, params.pushEndpoint, params.thresholdHuf, params.direction).run();
}

export async function listExchangeRateAlertsByEndpoint(pushEndpoint: string): Promise<ExchangeRateAlert[]> {
  const { results } = await getDB().prepare(`SELECT * FROM exchange_rate_alerts WHERE push_endpoint = ? AND active = 1 ORDER BY created_at DESC`).bind(pushEndpoint).all<any>();
  return results.map(r => ({ id: r.id, pushEndpoint: r.push_endpoint, thresholdHuf: r.threshold_huf, direction: r.direction === "below" ? "below" : "above", active: !!r.active, createdAt: r.created_at, lastFiredAt: r.last_fired_at }));
}

export async function deleteExchangeRateAlert(id: string, pushEndpoint: string): Promise<boolean> {
  const res = await getDB().prepare(`DELETE FROM exchange_rate_alerts WHERE id = ? AND push_endpoint = ?`).bind(id, pushEndpoint).run();
  return (res.meta.changes ?? 0) > 0;
}

// --- Radars ------------------------------------------------------------------

export interface KintiRadar { id: string; pushEndpoint: string; radarType: 'exchange_rate'; parameters: string; active: number; createdAt: string; }

export async function saveRadar(data: { id: string; pushEndpoint: string; radarType: string; parameters: string; }) {
  await getDB().prepare('INSERT INTO kinti_radars (id, push_endpoint, radar_type, parameters) VALUES (?, ?, ?, ?)').bind(data.id, data.pushEndpoint, data.radarType, data.parameters).run();
}

export async function listRadarsByEndpoint(endpoint: string): Promise<KintiRadar[]> {
  const { results } = await getDB().prepare('SELECT * FROM kinti_radars WHERE push_endpoint = ? ORDER BY created_at DESC').bind(endpoint).all<any>();
  return (results ?? []).map((r) => ({ id: String(r.id), pushEndpoint: String(r.push_endpoint), radarType: String(r.radar_type) as any, parameters: String(r.parameters), active: Number(r.active), createdAt: String(r.created_at) }));
}

export async function deleteRadar(id: string, endpoint: string): Promise<boolean> {
  const res = await getDB().prepare('DELETE FROM kinti_radars WHERE id = ? AND push_endpoint = ?').bind(id, endpoint).run();
  return (res.meta.changes ?? 0) > 0;
}

export async function getActiveRadarsByType(radarType: string): Promise<{id: string, pushEndpoint: string, parameters: string}[]> {
  const { results } = await getDB().prepare('SELECT id, push_endpoint, parameters FROM kinti_radars WHERE radar_type = ? AND active = 1').bind(radarType).all<any>();
  return (results ?? []).map(r => ({ id: String(r.id), pushEndpoint: String(r.push_endpoint), parameters: String(r.parameters) }));
}
