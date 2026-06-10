/**
 * repo-piac.ts — Piactér és közösségi apró (Spontán meetup, határellenőrzés, SOS, akciók, Hofladen).
 */
import { getDB } from "./cloudflare";
import { bool, jsonArray } from "./repo-shared";

// --- Spontán mikro-események (24-48h TTL) ------------------------------------

export interface Spontaneous {
  id: string; title: string; locationName: string; cantonCode: string | null;
  lat: number | null; lng: number | null; meetupTime: string; maxPeople: number;
  contactPhone: string; contactWhatsapp: string | null; poster: string | null;
  notes: string | null; manageToken: string | null; createdAt: string; expiresAt: string;
}

export type PublicSpontaneous = Omit<Spontaneous, "manageToken">;

interface SpontaneousRow {
  id: string; title: string; location_name: string; canton_code: string | null;
  lat: number | null; lng: number | null; meetup_time: string; max_people: number;
  contact_phone: string; contact_whatsapp: string | null; poster: string | null;
  notes: string | null; manage_token: string | null; created_at: string; expires_at: string;
}

function toSpontaneous(r: SpontaneousRow): Spontaneous {
  return { id: r.id, title: r.title, locationName: r.location_name, cantonCode: r.canton_code, lat: r.lat, lng: r.lng, meetupTime: r.meetup_time, maxPeople: r.max_people, contactPhone: r.contact_phone, contactWhatsapp: r.contact_whatsapp, poster: r.poster, notes: r.notes, manageToken: r.manage_token, createdAt: r.created_at, expiresAt: r.expires_at };
}

export function toPublicSpontaneous(s: Spontaneous): PublicSpontaneous {
  const { manageToken: _omit, ...pub } = s; return pub;
}

export interface CreateSpontaneousInput {
  id: string; title: string; locationName: string; cantonCode: string | null;
  lat: number | null; lng: number | null; meetupTime: string; maxPeople: number;
  contactPhone: string; contactWhatsapp: string | null; poster: string | null;
  notes: string | null; manageToken: string | null; ipHash: string | null; expiresAt: string;
}

export async function createSpontaneous(input: CreateSpontaneousInput): Promise<void> {
  await getDB().prepare(`INSERT INTO spontaneous_meetups (id, title, location_name, canton_code, lat, lng, meetup_time, max_people, contact_phone, contact_whatsapp, poster, notes, manage_token, ip_hash, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(input.id, input.title, input.locationName, input.cantonCode, input.lat, input.lng, input.meetupTime, input.maxPeople, input.contactPhone, input.contactWhatsapp, input.poster, input.notes, input.manageToken, input.ipHash, input.expiresAt).run();
}

export async function getActiveSpontaneous(): Promise<PublicSpontaneous[]> {
  const { results } = await getDB().prepare(`SELECT * FROM spontaneous_meetups WHERE expires_at > datetime('now') ORDER BY meetup_time ASC`).all<SpontaneousRow>();
  return results.map(toSpontaneous).map(toPublicSpontaneous);
}

export async function getSpontaneousByManageToken(token: string): Promise<Spontaneous | null> {
  const row = await getDB().prepare("SELECT * FROM spontaneous_meetups WHERE manage_token = ?").bind(token).first<SpontaneousRow>();
  return row ? toSpontaneous(row) : null;
}

export async function deleteSpontaneousByManageToken(token: string): Promise<boolean> {
  const res = await getDB().prepare("DELETE FROM spontaneous_meetups WHERE manage_token = ?").bind(token).run();
  return (res.meta.changes ?? 0) > 0;
}

export async function purgeExpiredSpontaneous(): Promise<number> {
  const res = await getDB().prepare("DELETE FROM spontaneous_meetups WHERE expires_at <= datetime('now')").run();
  return res.meta.changes ?? 0;
}

export async function countRecentSpontaneous(ipHash: string | null): Promise<number> {
  if (!ipHash) return 0;
  const row = await getDB().prepare(`SELECT COUNT(*) AS n FROM spontaneous_meetups WHERE ip_hash = ? AND created_at > datetime('now', '-1 day')`).bind(ipHash).first<{ n: number }>();
  return row?.n ?? 0;
}

// --- Border reports (4h TTL) -------------------------------------------------

export type BorderStatus = "strict" | "moderate" | "easy" | "closed" | "traffic";

export interface BorderReport { id: string; crossingId: string; status: BorderStatus; note: string | null; createdAt: string; expiresAt: string; }

export interface CreateBorderReportInput {
  id: string; crossingId: string; status: BorderStatus; note: string | null;
  ipHash: string | null; expiresAt: string;
}

interface BorderReportRow {
  id: string; crossing_id: string; status: string; note: string | null;
  created_at: string; expires_at: string;
}

export async function createBorderReport(input: CreateBorderReportInput): Promise<void> {
  await getDB().prepare(`INSERT INTO border_reports (id, crossing_id, status, note, ip_hash, expires_at) VALUES (?, ?, ?, ?, ?, ?)`).bind(input.id, input.crossingId, input.status, input.note, input.ipHash, input.expiresAt).run();
}

export async function getActiveBorderReports(): Promise<BorderReport[]> {
  const { results } = await getDB().prepare(`SELECT * FROM border_reports WHERE expires_at > datetime('now') ORDER BY created_at DESC`).all<BorderReportRow>();
  return results.map((r) => ({ id: r.id, crossingId: r.crossing_id, status: r.status as BorderStatus, note: r.note, createdAt: r.created_at, expiresAt: r.expires_at }));
}

export async function countRecentBorderReports(ipHash: string | null): Promise<number> {
  if (!ipHash) return 0;
  const row = await getDB().prepare(`SELECT COUNT(*) AS n FROM border_reports WHERE ip_hash = ? AND created_at > datetime('now', '-1 hour')`).bind(ipHash).first<{ n: number }>();
  return row?.n ?? 0;
}

export async function purgeExpiredBorderReports(): Promise<number> {
  const res = await getDB().prepare("DELETE FROM border_reports WHERE expires_at <= datetime('now')").run();
  return res.meta.changes ?? 0;
}

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
  const { results } = await getDB().prepare(`SELECT * FROM deal_reports WHERE expires_at > datetime('now') ORDER BY discount_pct DESC, created_at DESC`).all<DealReportRow>();
  return results.map(r => ({ id: r.id, storeId: r.store_id, categoryId: r.category_id, discountPct: r.discount_pct, lat: r.lat, lng: r.lng, locationName: r.location_name, cantonCode: r.canton_code, note: r.note, createdAt: r.created_at, expiresAt: r.expires_at }));
}

export async function countRecentDealReports(ipHash: string | null): Promise<number> {
  if (!ipHash) return 0;
  const row = await getDB().prepare(`SELECT COUNT(*) AS n FROM deal_reports WHERE ip_hash = ? AND created_at > datetime('now', '-1 hour')`).bind(ipHash).first<{ n: number }>();
  return row?.n ?? 0;
}

export async function purgeExpiredDealReports(): Promise<number> {
  const res = await getDB().prepare("DELETE FROM deal_reports WHERE expires_at <= datetime('now')").run();
  return res.meta.changes ?? 0;
}

// --- Hofladen spots ----------------------------------------------------------

export interface HofladenSpot { id: string; name: string; locationName: string | null; lat: number; lng: number; cantonCode: string | null; categories: string[]; paymentMethods: string[]; open24h: boolean; openText: string | null; note: string | null; manageToken: string | null; reportsCount: number; createdAt: string; }
export type PublicHofladenSpot = Omit<HofladenSpot, "manageToken">;

export interface CreateHofladenSpotInput {
  id: string; name: string; locationName: string | null; lat: number; lng: number; cantonCode: string | null;
  categories: string[]; paymentMethods: string[]; open24h: boolean; openText: string | null;
  note: string | null; manageToken: string | null; ipHash: string | null;
}

interface HofladenSpotRow {
  id: string; name: string; location_name: string | null; lat: number; lng: number; canton_code: string | null;
  categories: string | null; payment_methods: string | null; open_24h: number; open_text: string | null;
  note: string | null; manage_token: string | null; reports_count: number; created_at: string;
}

export async function createHofladenSpot(input: CreateHofladenSpotInput): Promise<void> {
  await getDB().prepare(`INSERT INTO hofladen_spots (id, name, location_name, lat, lng, canton_code, categories, payment_methods, open_24h, open_text, note, manage_token, ip_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(input.id, input.name, input.locationName, input.lat, input.lng, input.cantonCode, JSON.stringify(input.categories), JSON.stringify(input.paymentMethods), input.open24h ? 1 : 0, input.openText, input.note, input.manageToken, input.ipHash).run();
}

export async function getActiveHofladenSpots(): Promise<HofladenSpot[]> {
  const { results } = await getDB().prepare(`SELECT * FROM hofladen_spots WHERE hidden = 0 ORDER BY created_at DESC`).all<HofladenSpotRow>();
  return results.map(r => ({
    id: r.id, name: r.name, locationName: r.location_name, lat: r.lat, lng: r.lng, cantonCode: r.canton_code,
    categories: jsonArray(r.categories), paymentMethods: jsonArray(r.payment_methods), open24h: r.open_24h === 1,
    openText: r.open_text, note: r.note, manageToken: r.manage_token, reportsCount: r.reports_count, createdAt: r.created_at
  }));
}

export async function deleteHofladenSpotByManageToken(token: string): Promise<boolean> {
  const res = await getDB().prepare("DELETE FROM hofladen_spots WHERE manage_token = ?").bind(token).run();
  return (res.meta.changes ?? 0) > 0;
}

export async function countRecentHofladenSubmissions(ipHash: string | null): Promise<number> {
  if (!ipHash) return 0;
  const row = await getDB().prepare(`SELECT COUNT(*) AS n FROM hofladen_spots WHERE ip_hash = ? AND created_at > datetime('now', '-1 day')`).bind(ipHash).first<{ n: number }>();
  return row?.n ?? 0;
}

// --- SOS Alerts (72h TTL) ----------------------------------------------------

export interface SosAlert { id: string; alertType: string; lat: number | null; lng: number | null; locationName: string | null; cantonCode: string | null; description: string; contactPhone: string | null; contactWhatsapp: string | null; manageToken: string | null; createdAt: string; expiresAt: string; }
export type PublicSosAlert = Omit<SosAlert, "manageToken">;

export interface CreateSosAlertInput {
  id: string; alertType: string; lat: number | null; lng: number | null; locationName: string | null;
  cantonCode: string | null; description: string; contactPhone: string | null; contactWhatsapp: string | null;
  manageToken: string | null; ipHash: string | null; expiresAt: string;
}

interface SosAlertRow {
  id: string; alert_type: string; lat: number | null; lng: number | null; location_name: string | null;
  canton_code: string | null; description: string; contact_phone: string | null; contact_whatsapp: string | null;
  manage_token: string | null; created_at: string; expires_at: string;
}

export async function createSosAlert(input: CreateSosAlertInput): Promise<void> {
  await getDB().prepare(`INSERT INTO sos_alerts (id, alert_type, lat, lng, location_name, canton_code, description, contact_phone, contact_whatsapp, manage_token, ip_hash, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(input.id, input.alertType, input.lat, input.lng, input.locationName, input.cantonCode, input.description, input.contactPhone, input.contactWhatsapp, input.manageToken, input.ipHash, input.expiresAt).run();
}

export async function getActiveSosAlerts(): Promise<PublicSosAlert[]> {
  const { results } = await getDB().prepare(`SELECT * FROM sos_alerts WHERE expires_at > datetime('now') AND hidden = 0 ORDER BY created_at DESC`).all<SosAlertRow>();
  return results.map(r => ({ id: r.id, alertType: r.alert_type, lat: r.lat, lng: r.lng, locationName: r.location_name, cantonCode: r.canton_code, description: r.description, contactPhone: r.contact_phone, contactWhatsapp: r.contact_whatsapp, createdAt: r.created_at, expiresAt: r.expires_at }));
}

export async function getSosAlertByManageToken(token: string): Promise<SosAlert | null> {
  const r = await getDB().prepare("SELECT * FROM sos_alerts WHERE manage_token = ?").bind(token).first<SosAlertRow>();
  if (!r) return null;
  return { id: r.id, alertType: r.alert_type, lat: r.lat, lng: r.lng, locationName: r.location_name, cantonCode: r.canton_code, description: r.description, contactPhone: r.contact_phone, contactWhatsapp: r.contact_whatsapp, manageToken: r.manage_token, createdAt: r.created_at, expiresAt: r.expires_at };
}

export async function deleteSosAlertByManageToken(token: string): Promise<boolean> {
  const res = await getDB().prepare("DELETE FROM sos_alerts WHERE manage_token = ?").bind(token).run();
  return (res.meta.changes ?? 0) > 0;
}

export async function purgeExpiredSosAlerts(): Promise<number> {
  const res = await getDB().prepare("DELETE FROM sos_alerts WHERE expires_at <= datetime('now')").run();
  return res.meta.changes ?? 0;
}

export async function countRecentSosAlerts(ipHash: string | null): Promise<number> {
  if (!ipHash) return 0;
  const row = await getDB().prepare(`SELECT COUNT(*) AS n FROM sos_alerts WHERE ip_hash = ? AND created_at > datetime('now', '-24 hours')`).bind(ipHash).first<{ n: number }>();
  return row?.n ?? 0;
}
