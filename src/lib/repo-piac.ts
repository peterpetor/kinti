/**
 * repo-piac.ts — Közösségi apró: bolt-akciók (deal reports).
 *
 * (A Spontán meetup, Hofladen, a határátkelő-jelentések és a régi SOS-duplikátum
 * réteg megszűnt — a border_reports táblát a 0057 ejtette; a SOS élő rétege a
 * sos-repo.ts.)
 */
import { getDB } from "./cloudflare";

// --- Deal reports (24h TTL) --------------------------------------------------

export interface DealReport { id: string; storeId: string; categoryId: string; discountPct: number; lat: number; lng: number; locationName: string | null; cantonCode: string | null; note: string | null; createdAt: string; expiresAt: string; }

export interface CreateDealReportInput {
  id: string; storeId: string; categoryId: string; discountPct: number; lat: number; lng: number;
  locationName: string | null; cantonCode: string | null; note: string | null;
  ipHash: string | null; expiresAt: string;
}

interface DealReportRow {
  id: string; store_id: string; category_id: string; discount_pct: number; lat: number; lng: number;
  location_name: string | null; canton_code: string | null; note: string | null;
  created_at: string; expires_at: string;
}

export async function createDealReport(input: CreateDealReportInput): Promise<void> {
  await getDB().prepare(`INSERT INTO deal_reports (id, store_id, category_id, discount_pct, lat, lng, location_name, canton_code, note, ip_hash, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(input.id, input.storeId, input.categoryId, input.discountPct, input.lat, input.lng, input.locationName, input.cantonCode, input.note, input.ipHash, input.expiresAt).run();
}

export async function getActiveDealReports(): Promise<DealReport[]> {
  const { results } = await getDB().prepare(`SELECT * FROM deal_reports WHERE datetime(expires_at) > datetime('now') ORDER BY discount_pct DESC, created_at DESC`).all<DealReportRow>();
  return results.map(r => ({ id: r.id, storeId: r.store_id, categoryId: r.category_id, discountPct: r.discount_pct, lat: r.lat, lng: r.lng, locationName: r.location_name, cantonCode: r.canton_code, note: r.note, createdAt: r.created_at, expiresAt: r.expires_at }));
}

export async function countRecentDealReports(ipHash: string | null): Promise<number> {
  if (!ipHash) return 0;
  const row = await getDB().prepare(`SELECT COUNT(*) AS n FROM deal_reports WHERE ip_hash = ? AND datetime(created_at) > datetime('now', '-1 hour')`).bind(ipHash).first<{ n: number }>();
  return row?.n ?? 0;
}

export async function purgeExpiredDealReports(): Promise<number> {
  const res = await getDB().prepare("DELETE FROM deal_reports WHERE datetime(expires_at) <= datetime('now')").run();
  return res.meta.changes ?? 0;
}
