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

export async function createSosAlert(input: Omit<SosAlert, "createdAt" | "resolved">): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO sos_alerts
       (id, lat, lng, description, contact_phone, poster_user_id, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      input.id,
      input.lat,
      input.lng,
      input.description,
      input.contactPhone,
      input.posterUserId,
      input.expiresAt
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

export async function resolveSosAlert(id: string, posterUserId: string): Promise<boolean> {
  const res = await getDB()
    .prepare("UPDATE sos_alerts SET resolved = 1 WHERE id = ? AND poster_user_id = ?")
    .bind(id, posterUserId)
    .run();
  return (res.meta.changes ?? 0) > 0;
}
