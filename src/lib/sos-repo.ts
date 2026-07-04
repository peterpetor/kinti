import { getDB } from "./cloudflare";

export interface SosAlert {
  id: string;
  lat: number;
  lng: number;
  description: string;
  contactPhone: string;
  posterUserId: string;
  resolved: boolean;
  createdAt: string;
  expiresAt: string;
}

/** Beküldéskor generált titok a lezáráshoz — a kliens tartja (localStorage). */
export interface SosAlertCreateInput extends Omit<SosAlert, "createdAt" | "resolved"> {
  resolveToken: string;
}

interface SosAlertRow {
  id: string;
  lat: number;
  lng: number;
  description: string;
  contact_phone: string;
  poster_user_id: string;
  resolved: number;
  created_at: string;
  expires_at: string;
}

function toSosAlert(r: SosAlertRow): SosAlert {
  return {
    id: r.id,
    lat: r.lat,
    lng: r.lng,
    description: r.description,
    contactPhone: r.contact_phone,
    posterUserId: r.poster_user_id,
    resolved: r.resolved === 1,
    createdAt: r.created_at,
    expiresAt: r.expires_at,
  };
}

export async function createSosAlert(input: SosAlertCreateInput): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO sos_alerts
       (id, lat, lng, description, contact_phone, poster_user_id, expires_at, resolve_token)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      input.id,
      input.lat,
      input.lng,
      input.description,
      input.contactPhone,
      input.posterUserId,
      input.expiresAt,
      input.resolveToken
    )
    .run();
}

export async function getActiveSosAlerts(): Promise<SosAlert[]> {
  const { results } = await getDB()
    .prepare(
      `SELECT * FROM sos_alerts
       WHERE expires_at > datetime('now') AND resolved = 0`
    )
    .all<SosAlertRow>();
  return results.map(toSosAlert);
}

export async function getActiveAlertCountForUser(userId: string): Promise<number> {
  const { results } = await getDB()
    .prepare(
      `SELECT count(*) as count FROM sos_alerts
       WHERE poster_user_id = ? AND expires_at > datetime('now') AND resolved = 0`
    )
    .bind(userId)
    .all<{ count: number }>();
  return results[0]?.count ?? 0;
}

/**
 * Lezárás tulajdonlás-ellenőrzéssel: token-es riasztásnál KIZÁRÓLAG a
 * beküldéskor kapott resolve_token számít (IP-változás-immún, és azonos
 * CGNAT-IP mögül sem zárhatja le idegen). Az IP-hash (poster_user_id) csak a
 * token ELŐTTI riasztások fallbackje (max 3 órás élettartam → gyorsan kihal).
 * Az üres stringgé normalizált token sosem matchel NULL/valós tokenre.
 */
export async function resolveSosAlert(
  id: string,
  ownership: { resolveToken: string | null; posterUserId: string },
): Promise<boolean> {
  const res = await getDB()
    .prepare(
      `UPDATE sos_alerts SET resolved = 1
       WHERE id = ?
         AND ((resolve_token IS NOT NULL AND resolve_token = ?)
           OR (resolve_token IS NULL AND poster_user_id = ?))`
    )
    .bind(id, ownership.resolveToken || "", ownership.posterUserId)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

export async function getSosAlertById(id: string): Promise<SosAlert | null> {
  const { results } = await getDB()
    .prepare("SELECT * FROM sos_alerts WHERE id = ?")
    .bind(id)
    .all<SosAlertRow>();
  return results.length > 0 ? toSosAlert(results[0]) : null;
}

export async function hideSosAlert(id: string): Promise<boolean> {
  const res = await getDB()
    .prepare("UPDATE sos_alerts SET resolved = 1 WHERE id = ?")
    .bind(id)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

export async function unresolveSosAlert(id: string): Promise<boolean> {
  const res = await getDB()
    .prepare("UPDATE sos_alerts SET resolved = 0 WHERE id = ?")
    .bind(id)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

export async function deleteSosAlert(id: string): Promise<boolean> {
  const res = await getDB()
    .prepare("DELETE FROM sos_alerts WHERE id = ?")
    .bind(id)
    .run();
  return (res.meta.changes ?? 0) > 0;
}
