/**
 * repo-magyar-bolt.ts — „Magyar bolt a sarkon" közösségi hely-térkép adatréteg.
 * A (megszűnt Hofladen) hofladen_spots táblát újrahasznosítja: magyar élelmiszer-helyek.
 * Modell: azonnali megjelenés (hidden=0) + közösségi jelentés → auto-hide. Lásd 0101.
 */
import { getDB } from "./cloudflare";

const AUTOHIDE_REPORTS = 3; // ennyi jelentés után automatikusan elrejtjük

export interface BoltSpot {
  id: string;
  name: string;
  category: string | null;
  locationName: string | null;
  lat: number;
  lng: number;
  country: string;
  cantonCode: string | null;
  note: string | null;
  createdAt: string;
}

interface Row {
  id: string; name: string; category: string | null; location_name: string | null;
  lat: number; lng: number; country_code: string; canton_code: string | null;
  note: string | null; created_at: string;
}

function toSpot(r: Row): BoltSpot {
  return {
    id: r.id, name: r.name, category: r.category, locationName: r.location_name,
    lat: r.lat, lng: r.lng, country: r.country_code, cantonCode: r.canton_code,
    note: r.note, createdAt: r.created_at,
  };
}

/** Látható (nem elrejtett) helyek egy országban. */
export async function getBoltSpots(country: string): Promise<BoltSpot[]> {
  const { results } = await getDB()
    .prepare(
      `SELECT id, name, category, location_name, lat, lng, country_code, canton_code, note, created_at
       FROM hofladen_spots WHERE country_code = ? AND hidden = 0 ORDER BY created_at DESC LIMIT 500`,
    )
    .bind(country)
    .all<Row>();
  return (results ?? []).map(toSpot);
}

/** Mai (24h) beküldések egy ip_hash-ről — rate-limit. */
export async function countBoltSpotsByIp(ipHash: string | null): Promise<number> {
  if (!ipHash) return 0;
  const row = await getDB()
    .prepare("SELECT COUNT(*) AS n FROM hofladen_spots WHERE ip_hash = ? AND datetime(created_at) > datetime('now','-1 day')")
    .bind(ipHash)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

/** Új hely (azonnal látható). @returns manage_token (a beküldő szerkesztheti/törölheti). */
export async function createBoltSpot(input: {
  name: string; category: string; locationName: string | null; lat: number; lng: number;
  country: string; cantonCode: string | null; note: string | null; ipHash: string;
}): Promise<string> {
  const id = crypto.randomUUID();
  const manageToken = crypto.randomUUID();
  await getDB()
    .prepare(
      `INSERT INTO hofladen_spots
         (id, name, category, location_name, lat, lng, country_code, canton_code, note,
          categories, payment_methods, open_24h, manage_token, ip_hash, hidden)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', '[]', 0, ?, ?, 0)`,
    )
    .bind(
      id, input.name, input.category, input.locationName, input.lat, input.lng,
      input.country, input.cantonCode, input.note, manageToken, input.ipHash,
    )
    .run();
  return manageToken;
}

/** Közösségi jelentés (hibás/megszűnt). N jelentés után auto-hide. @returns elrejtve?. */
export async function reportBoltSpot(id: string): Promise<{ hidden: boolean }> {
  const db = getDB();
  await db.prepare("UPDATE hofladen_spots SET reports_count = reports_count + 1 WHERE id = ?").bind(id).run();
  const row = await db.prepare("SELECT reports_count FROM hofladen_spots WHERE id = ?").bind(id).first<{ reports_count: number }>();
  if ((row?.reports_count ?? 0) >= AUTOHIDE_REPORTS) {
    await db.prepare("UPDATE hofladen_spots SET hidden = 1 WHERE id = ?").bind(id).run();
    return { hidden: true };
  }
  return { hidden: false };
}
