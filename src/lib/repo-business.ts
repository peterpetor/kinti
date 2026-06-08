/**
 * repo-business.ts — Vállalkozás (business) és kategória adatréteg.
 * Tartalmazza: kategóriák, vállalkozások, beküldési folyamat, analitika.
 */
import { getDB } from "./cloudflare";
import type { Business, Category, DashboardStats } from "./types";
import { bool, jsonArray } from "./repo-shared";

// --- Row types ---------------------------------------------------------------

interface CategoryRow {
  id: string;
  label: string;
  glyph: string | null;
  sort_order: number;
}

interface BusinessRow {
  id: string; name: string; category_id: string; category_label: string | null;
  rating: number; reviews: number; dist_text: string | null; dist_meters: number | null;
  address: string | null; phone: string | null; pin_x: number; pin_y: number;
  lat: number | null; lng: number | null; featured: number; verified: number;
  blurb: string | null; license_number: string | null; open_now: number;
  open_text: string | null; years_here: number | null; languages: string | null;
  photo: string | null; accent_photo: string | null; logo_key: string | null;
  owner_user_id: string | null; contact_email: string | null; working_hours: string | null;
  social_links: string | null; manage_token: string | null; gallery_keys: string | null;
  view_count: number | null; phone_click_count: number | null;
  moderation_status: number | null; moderation_decision_at: string | null;
  moderation_decided_by: string | null; created_at: string | null; updated_at: string | null;
}

interface BusinessSubmissionRow {
  id: string; name: string; category_id: string; category_label: string | null;
  address: string | null; canton_code: string; phone: string | null; email: string;
  blurb: string | null; license_number: string | null; confirm_token: string;
  expires_at: string; created_at: string; terms_version: string | null;
  accepted_terms_at: string | null; age_confirmed: number; owner_user_id: string | null;
  manage_token: string | null; ip_hash: string | null;
}

// --- Mappers -----------------------------------------------------------------

function toCategory(r: CategoryRow): Category {
  return { id: r.id, label: r.label, glyph: r.glyph, sortOrder: r.sort_order };
}

export function toBusiness(r: BusinessRow): Business {
  return {
    id: r.id, name: r.name, categoryId: r.category_id, categoryLabel: r.category_label,
    rating: r.rating, reviews: r.reviews, distText: r.dist_text, distMeters: r.dist_meters,
    address: r.address, phone: r.phone, pinX: r.pin_x, pinY: r.pin_y, lat: r.lat, lng: r.lng,
    featured: bool(r.featured), verified: bool(r.verified), blurb: r.blurb,
    licenseNumber: r.license_number, openNow: bool(r.open_now), openText: r.open_text,
    yearsHere: r.years_here, languages: jsonArray(r.languages), photo: r.photo,
    accentPhoto: r.accent_photo, logoKey: r.logo_key, ownerUserId: r.owner_user_id,
    contactEmail: r.contact_email, workingHours: r.working_hours, socialLinks: r.social_links,
    manageToken: r.manage_token, galleryKeys: jsonArray(r.gallery_keys),
    viewCount: r.view_count ?? 0, phoneClickCount: r.phone_click_count ?? 0,
    moderationStatus: r.moderation_status ?? 0, moderationDecisionAt: r.moderation_decision_at,
    moderationDecidedBy: r.moderation_decided_by, updatedAt: r.updated_at ?? null,
    createdAt: r.created_at ?? null,
  };
}

function toBusinessSubmission(r: BusinessSubmissionRow): BusinessSubmission {
  return {
    id: r.id, name: r.name, categoryId: r.category_id, categoryLabel: r.category_label,
    address: r.address, cantonCode: r.canton_code, phone: r.phone, email: r.email,
    blurb: r.blurb, licenseNumber: r.license_number, ownerUserId: r.owner_user_id,
    manageToken: r.manage_token, confirmToken: r.confirm_token, expiresAt: r.expires_at,
  };
}

// --- Public types ------------------------------------------------------------

export interface BusinessSubmission {
  id: string; name: string; categoryId: string; categoryLabel: string | null;
  address: string | null; cantonCode: string; phone: string | null; email: string;
  blurb: string | null; licenseNumber: string | null; ownerUserId: string | null;
  manageToken: string | null; confirmToken: string; expiresAt: string;
}

export interface BusinessSubmissionInput {
  id: string; name: string; categoryId: string; categoryLabel: string | null;
  address: string | null; cantonCode: string; phone: string | null; email: string;
  blurb: string | null; licenseNumber: string | null; confirmToken: string;
  expiresAt: string; termsVersion: string; acceptedTermsAt: string; ageConfirmed: number;
  ipHash: string | null; ownerUserId: string | null; manageToken: string;
}

export interface BusinessQuery {
  category?: string | null;
  featured?: boolean;
  limit?: number;
}

export interface UpdateBusinessProfileInput {
  name: string; phone: string | null; blurb: string | null; address: string | null;
  categoryLabel: string | null; openText: string | null; workingHours?: string | null;
  socialLinks?: string | null; yearsHere?: number | null; languages?: string[] | null;
}

export interface UpdateBusinessFields {
  name?: string; categoryLabel?: string | null; address?: string | null;
  phone?: string | null; blurb?: string | null; openText?: string | null;
  workingHours?: string | null; socialLinks?: string | null; languages?: string[] | null;
}

export interface CreateBusinessFromSubmissionInput {
  id: string; name: string; categoryId: string; categoryLabel: string | null;
  address: string | null; phone: string | null; blurb: string | null;
  licenseNumber: string | null; contactEmail: string; lat: number | null;
  lng: number | null; ownerUserId: string | null; manageToken: string;
}

export type BusinessAnalyticsKind = "view" | "phone" | "lead";
export interface BusinessAnalyticsSummary { total: number; last7Days: number; last30Days: number; }
export interface BusinessAnalytics {
  views: BusinessAnalyticsSummary;
  phoneClicks: BusinessAnalyticsSummary;
  leads: BusinessAnalyticsSummary;
  daily: Array<{ day: string; views: number; phoneClicks: number; leads: number }>;
  /** Competitor rank in same category+canton (1 = best rated). */
  competitorRank: { rank: number; total: number; categoryLabel: string | null } | null;
  /** Rating and review summary. */
  reviewSummary: { rating: number; reviews: number };
}

// --- Queries: Categories -----------------------------------------------------

export async function getCategories(): Promise<Category[]> {
  const { results } = await getDB()
    .prepare("SELECT * FROM categories ORDER BY sort_order ASC")
    .all<CategoryRow>();
  return results.map(toCategory);
}

// --- Queries: Businesses -----------------------------------------------------

export async function getBusinesses(opts: BusinessQuery = {}): Promise<Business[]> {
  const where: string[] = ["COALESCE(hidden, 0) = 0", "moderation_status = 1"];
  const binds: unknown[] = [];
  if (opts.category && opts.category !== "all") { where.push("category_id = ?"); binds.push(opts.category); }
  if (opts.featured) where.push("featured = 1");
  let sql = "SELECT * FROM businesses";
  if (where.length) sql += " WHERE " + where.join(" AND ");
  sql += " ORDER BY featured DESC, dist_meters ASC";
  if (opts.limit) { sql += " LIMIT ?"; binds.push(opts.limit); }
  const { results } = await getDB().prepare(sql).bind(...binds).all<BusinessRow>();
  return results.map(toBusiness);
}

export async function getBusinessById(id: string): Promise<Business | null> {
  const row = await getDB()
    .prepare("SELECT * FROM businesses WHERE id = ? AND COALESCE(hidden, 0) = 0")
    .bind(id).first<BusinessRow>();
  return row ? toBusiness(row) : null;
}

export async function getBusinessByOwner(ownerUserId: string): Promise<Business | null> {
  const row = await getDB()
    .prepare("SELECT * FROM businesses WHERE owner_user_id = ? AND COALESCE(hidden, 0) = 0 LIMIT 1")
    .bind(ownerUserId).first<BusinessRow>();
  return row ? toBusiness(row) : null;
}

export async function claimBusiness(businessId: string, ownerUserId: string): Promise<boolean> {
  const res = await getDB()
    .prepare("UPDATE businesses SET owner_user_id = ?, updated_at = datetime('now') WHERE id = ? AND owner_user_id IS NULL")
    .bind(ownerUserId, businessId).run();
  return (res.meta.changes ?? 0) > 0;
}

export async function setBusinessHidden(id: string, hidden: boolean): Promise<void> {
  await getDB()
    .prepare("UPDATE businesses SET hidden = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(hidden ? 1 : 0, id).run();
}

export async function deleteBusinessById(id: string): Promise<void> {
  await getDB().prepare("DELETE FROM businesses WHERE id = ?").bind(id).run();
}

export async function setBusinessLogoByManageToken(manageToken: string, logoKey: string): Promise<boolean> {
  const res = await getDB()
    .prepare("UPDATE businesses SET logo_key = ?, updated_at = datetime('now') WHERE manage_token = ?")
    .bind(logoKey, manageToken).run();
  return (res.meta.changes ?? 0) > 0;
}

export async function setBusinessLogo(businessId: string, ownerUserId: string, logoKey: string): Promise<boolean> {
  const res = await getDB()
    .prepare("UPDATE businesses SET logo_key = ?, updated_at = datetime('now') WHERE id = ? AND owner_user_id = ?")
    .bind(logoKey, businessId, ownerUserId).run();
  return (res.meta.changes ?? 0) > 0;
}

export async function updateBusinessProfile(
  businessId: string, ownerUserId: string, input: UpdateBusinessProfileInput,
): Promise<boolean> {
  const res = await getDB()
    .prepare(
      `UPDATE businesses SET name=?,phone=?,blurb=?,address=?,category_label=?,open_text=?,
       working_hours=?,social_links=?,years_here=?,languages=?,updated_at=datetime('now')
       WHERE id=? AND owner_user_id=?`,
    )
    .bind(input.name, input.phone, input.blurb, input.address, input.categoryLabel,
      input.openText, input.workingHours ?? null, input.socialLinks ?? null,
      input.yearsHere ?? null, input.languages ? JSON.stringify(input.languages) : null,
      businessId, ownerUserId)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

export async function getBusinessByManageToken(token: string): Promise<Business | null> {
  const row = await getDB()
    .prepare("SELECT * FROM businesses WHERE manage_token = ? LIMIT 1")
    .bind(token).first<BusinessRow>();
  return row ? toBusiness(row) : null;
}

export async function updateBusinessByManageToken(token: string, fields: UpdateBusinessFields): Promise<boolean> {
  const sets: string[] = [];
  const values: unknown[] = [];
  const map: Record<string, string> = {
    name: "name", categoryLabel: "category_label", address: "address",
    phone: "phone", blurb: "blurb", openText: "open_text",
    workingHours: "working_hours", socialLinks: "social_links",
  };
  for (const [k, col] of Object.entries(map)) {
    const v = fields[k as keyof UpdateBusinessFields];
    if (v !== undefined) { sets.push(`${col} = ?`); values.push(v as string | null); }
  }
  if (fields.languages !== undefined) {
    sets.push("languages = ?");
    values.push(fields.languages ? JSON.stringify(fields.languages) : null);
  }
  if (sets.length === 0) return true;
  const contentSensitive: (keyof UpdateBusinessFields)[] = ["name", "blurb", "categoryLabel", "address"];
  if (contentSensitive.some((k) => fields[k] !== undefined)) { sets.push("verified = 0"); }
  sets.push("updated_at = datetime('now')");
  const sql = `UPDATE businesses SET ${sets.join(", ")} WHERE manage_token = ?`;
  values.push(token);
  const res = await getDB().prepare(sql).bind(...values).run();
  return (res.meta.changes ?? 0) > 0;
}

export async function deleteBusinessByManageToken(token: string): Promise<boolean> {
  const db = getDB();
  const biz = await db.prepare("SELECT id FROM businesses WHERE manage_token = ?").bind(token).first<{ id: string }>();
  if (!biz) return false;
  await db.prepare("DELETE FROM reviews WHERE business_id = ?").bind(biz.id).run();
  const res = await db.prepare("DELETE FROM businesses WHERE id = ?").bind(biz.id).run();
  return (res.meta.changes ?? 0) > 0;
}

// --- Gallery -----------------------------------------------------------------

export async function updateBusinessLogo(id: string, key: string): Promise<boolean> {
  const res = await getDB().prepare("UPDATE businesses SET logo_key = ? WHERE id = ?").bind(key, id).run();
  return res.success;
}

export async function addBusinessGalleryKey(id: string, key: string): Promise<boolean> {
  const db = getDB();
  const b = await db.prepare("SELECT gallery_keys FROM businesses WHERE id = ?").bind(id).first<{ gallery_keys: string | null }>();
  if (!b) return false;
  const keys = jsonArray(b.gallery_keys); keys.push(key);
  const res = await db.prepare("UPDATE businesses SET gallery_keys = ? WHERE id = ?").bind(JSON.stringify(keys), id).run();
  return res.success;
}

export async function removeBusinessGalleryKey(id: string, key: string): Promise<boolean> {
  const db = getDB();
  const b = await db.prepare("SELECT gallery_keys FROM businesses WHERE id = ?").bind(id).first<{ gallery_keys: string | null }>();
  if (!b) return false;
  const keys = jsonArray(b.gallery_keys).filter((k) => k !== key);
  const res = await db.prepare("UPDATE businesses SET gallery_keys = ? WHERE id = ?").bind(JSON.stringify(keys), id).run();
  return res.success;
}

// --- Business Submissions ----------------------------------------------------

export async function createBusinessSubmission(input: BusinessSubmissionInput): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO business_submissions
       (id,name,category_id,category_label,address,canton_code,phone,email,blurb,
        license_number,confirm_token,expires_at,terms_version,accepted_terms_at,age_confirmed,ip_hash,
        owner_user_id,manage_token)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .bind(input.id, input.name, input.categoryId, input.categoryLabel, input.address,
      input.cantonCode, input.phone, input.email.toLowerCase(), input.blurb, input.licenseNumber,
      input.confirmToken, input.expiresAt, input.termsVersion, input.acceptedTermsAt,
      input.ageConfirmed, input.ipHash, input.ownerUserId, input.manageToken)
    .run();
}

export async function getBusinessSubmissionByConfirmToken(confirmToken: string): Promise<BusinessSubmission | null> {
  const row = await getDB()
    .prepare("SELECT * FROM business_submissions WHERE confirm_token = ? AND expires_at > datetime('now')")
    .bind(confirmToken).first<BusinessSubmissionRow>();
  return row ? toBusinessSubmission(row) : null;
}

export async function getBusinessSubmissionByManageToken(manageToken: string): Promise<BusinessSubmission | null> {
  const row = await getDB()
    .prepare("SELECT * FROM business_submissions WHERE manage_token = ? AND expires_at > datetime('now')")
    .bind(manageToken).first<BusinessSubmissionRow>();
  return row ? toBusinessSubmission(row) : null;
}

export async function deleteBusinessSubmission(id: string): Promise<void> {
  await getDB().prepare("DELETE FROM business_submissions WHERE id = ?").bind(id).run();
}

export async function purgeExpiredBusinessSubmissions(): Promise<number> {
  const res = await getDB().prepare("DELETE FROM business_submissions WHERE expires_at <= datetime('now')").run();
  return res.meta.changes ?? 0;
}

export async function countRecentBusinessSubmissions(email: string, ipHash: string | null): Promise<number> {
  const res = await getDB()
    .prepare(
      `SELECT COUNT(*) AS n FROM business_submissions
       WHERE (lower(email)=? OR (ip_hash IS NOT NULL AND ip_hash=?))
         AND created_at >= datetime('now', '-24 hours')`,
    )
    .bind(email.toLowerCase(), ipHash)
    .first<{ n: number }>();
  return res?.n ?? 0;
}

export async function createBusinessFromSubmission(input: CreateBusinessFromSubmissionInput): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO businesses
       (id,name,category_id,category_label,address,phone,blurb,license_number,
        contact_email,source,languages,lat,lng,pin_x,pin_y,rating,reviews,featured,open_now,owner_user_id,manage_token)
       VALUES (?,?,?,?,?,?,?,?,?,'self_submitted','["Magyar"]',?,?,50,50,0,0,0,0,?,?)`,
    )
    .bind(input.id, input.name, input.categoryId, input.categoryLabel, input.address,
      input.phone, input.blurb, input.licenseNumber, input.contactEmail.toLowerCase(),
      input.lat, input.lng, input.ownerUserId, input.manageToken)
    .run();
}

export async function createOwnerDraftBusiness(input: {
  id: string; name: string; categoryId: string; cantonCode: string;
  contactEmail: string; lat: number | null; lng: number | null;
  ownerUserId: string; manageToken: string;
}): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO businesses
       (id,name,category_id,category_label,address,phone,blurb,
        contact_email,source,languages,lat,lng,pin_x,pin_y,rating,reviews,featured,open_now,owner_user_id,manage_token)
       VALUES (?,?,?,NULL,NULL,NULL,NULL,?,'owner_draft','["Magyar"]',?,?,50,50,0,0,0,0,?,?)`,
    )
    .bind(input.id, input.name, input.categoryId, input.contactEmail.toLowerCase(),
      input.lat, input.lng, input.ownerUserId, input.manageToken)
    .run();
}

// --- Business Analytics ------------------------------------------------------

export async function incrementBusinessAnalytic(
  businessId: string, kind: BusinessAnalyticsKind, ipHash: string | null,
): Promise<void> {
  if (!businessId) return;
  const db = getDB();
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const hourBucket = now.toISOString().slice(0, 13);
  if (ipHash) {
    const dedupe = await db
      .prepare("INSERT OR IGNORE INTO business_analytics_dedupe (business_id,kind,ip_hash,hour_bucket) VALUES (?,?,?,?)")
      .bind(businessId, kind, ipHash, hourBucket).run();
    if ((dedupe.meta.changes ?? 0) === 0) return;
  }
  const dailyCol = kind === "view" ? "view_count" : kind === "phone" ? "phone_click_count" : "lead_count";
  await db
    .prepare(`INSERT INTO business_analytics_daily (business_id,day,${dailyCol}) VALUES (?,?,1)
              ON CONFLICT(business_id,day) DO UPDATE SET ${dailyCol}=${dailyCol}+1`)
    .bind(businessId, day).run();
  const totalCol = kind === "view" ? "view_count" : kind === "phone" ? "phone_click_count" : "lead_count";
  await db.prepare(`UPDATE businesses SET ${totalCol}=${totalCol}+1 WHERE id=?`).bind(businessId).run();
}

export async function getBusinessAnalytics(businessId: string): Promise<BusinessAnalytics> {
  const db = getDB();

  // 1. Totals + review summary
  let totals: { view_count: number | null; phone_click_count: number | null; lead_count: number | null; rating: number; reviews: number; category_id: string | null; category_label: string | null; address: string | null } | null = null;
  try {
    totals = await db
      .prepare("SELECT view_count, phone_click_count, lead_count, rating, reviews, category_id, category_label, address FROM businesses WHERE id = ?")
      .bind(businessId).first<{ view_count: number | null; phone_click_count: number | null; lead_count: number | null; rating: number; reviews: number; category_id: string | null; category_label: string | null; address: string | null }>();
  } catch { totals = null; }

  // 2. Daily rows (last 30 days)
  let dailyRows: { day: string; views: number; phoneClicks: number; leads: number }[] = [];
  try {
    const res = await db
      .prepare(
        `SELECT day, view_count AS views, phone_click_count AS phoneClicks, lead_count AS leads
         FROM business_analytics_daily
         WHERE business_id=? AND day>=date('now','-30 days') ORDER BY day DESC`,
      ).bind(businessId).all<{ day: string; views: number; phoneClicks: number; leads: number }>();
    dailyRows = res.results;
  } catch { dailyRows = []; }

  const today = new Date();
  const minus = (n: number) => { const d = new Date(today); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };
  const d7 = minus(7); const d30 = minus(30);
  let v7 = 0, v30 = 0, p7 = 0, p30 = 0, l7 = 0, l30 = 0;
  for (const r of dailyRows) {
    if (r.day >= d30) { v30 += r.views ?? 0; p30 += r.phoneClicks ?? 0; l30 += r.leads ?? 0; }
    if (r.day >= d7)  { v7  += r.views ?? 0; p7  += r.phoneClicks ?? 0; l7  += r.leads ?? 0; }
  }

  // 3. Competitor rank (same category, approved businesses ordered by rating desc)
  let competitorRank: BusinessAnalytics["competitorRank"] = null;
  if (totals?.category_id) {
    try {
      const peers = await db
        .prepare(
          `SELECT id, rating FROM businesses
           WHERE category_id=? AND moderation_status=1
           ORDER BY rating DESC, reviews DESC`,
        )
        .bind(totals.category_id)
        .all<{ id: string; rating: number }>();
      const idx = peers.results.findIndex((r) => r.id === businessId);
      if (idx !== -1) {
        competitorRank = { rank: idx + 1, total: peers.results.length, categoryLabel: totals.category_label };
      }
    } catch { competitorRank = null; }
  }

  return {
    views: { total: totals?.view_count ?? 0, last7Days: v7, last30Days: v30 },
    phoneClicks: { total: totals?.phone_click_count ?? 0, last7Days: p7, last30Days: p30 },
    leads: { total: totals?.lead_count ?? 0, last7Days: l7, last30Days: l30 },
    daily: dailyRows.map((r) => ({ day: r.day, views: r.views ?? 0, phoneClicks: r.phoneClicks ?? 0, leads: r.leads ?? 0 })),
    competitorRank,
    reviewSummary: { rating: totals?.rating ?? 0, reviews: totals?.reviews ?? 0 },
  };
}

export async function purgeBusinessAnalyticsDedupe(): Promise<number> {
  const res = await getDB()
    .prepare("DELETE FROM business_analytics_dedupe WHERE created_at < datetime('now', '-7 days')")
    .run();
  return res.meta.changes ?? 0;
}

export async function setBusinessVerified(id: string, verified: boolean): Promise<boolean> {
  const res = await getDB()
    .prepare("UPDATE businesses SET verified = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(verified ? 1 : 0, id).run();
  return (res.meta.changes ?? 0) > 0;
}

export async function setBusinessAiReviewSummary(params: {
  businessId: string; summary: string; reviewCount: number;
}): Promise<void> {
  await getDB()
    .prepare(
      `UPDATE businesses SET ai_review_summary=?,ai_review_summary_at=datetime('now'),ai_review_summary_count=? WHERE id=?`,
    )
    .bind(params.summary, params.reviewCount, params.businessId).run();
}

// --- Dashboard ---------------------------------------------------------------

export interface DashboardResult { business: Business; stats: DashboardStats; }

export async function getDashboard(businessId: string): Promise<DashboardResult | null> {
  const business = await getBusinessById(businessId);
  if (!business) return null;
  const db = getDB();
  const statsRow = await db
    .prepare("SELECT * FROM business_stats WHERE business_id = ?")
    .bind(businessId)
    .first<{ week_views: number; week_views_delta: string | null; week_clicks: number; week_clicks_delta: string | null; week_calls: number; week_calls_delta: string | null }>();
  const { results: trendRows } = await db
    .prepare("SELECT stat_date, views FROM business_daily_views WHERE business_id = ? ORDER BY stat_date ASC")
    .bind(businessId).all<{ stat_date: string; views: number }>();
  const stats: DashboardStats = {
    weekViews: statsRow?.week_views ?? 0, weekViewsDelta: statsRow?.week_views_delta ?? null,
    weekClicks: statsRow?.week_clicks ?? 0, weekClicksDelta: statsRow?.week_clicks_delta ?? null,
    weekCalls: statsRow?.week_calls ?? 0, weekCallsDelta: statsRow?.week_calls_delta ?? null,
    trend: trendRows.map((r) => ({ date: r.stat_date, views: r.views })),
  };
  return { business, stats };
}

// --- Admin helpers -----------------------------------------------------------

export interface AdminBusinessRow {
  id: string; name: string; categoryLabel: string | null; verified: boolean;
  rating: number; reviews: number; source: string | null; createdAt: string; manageToken: string | null;
}

export async function listBusinessesForAdmin(): Promise<AdminBusinessRow[]> {
  const { results } = await getDB()
    .prepare("SELECT id,name,category_label,verified,rating,reviews,source,created_at,manage_token FROM businesses ORDER BY verified DESC,created_at DESC LIMIT 100")
    .all<{ id: string; name: string; category_label: string | null; verified: number; rating: number; reviews: number; source: string | null; created_at: string; manage_token: string | null }>();
  return results.map((r) => ({
    id: r.id, name: r.name, categoryLabel: r.category_label, verified: r.verified === 1,
    rating: r.rating, reviews: r.reviews, source: r.source, createdAt: r.created_at, manageToken: r.manage_token,
  }));
}

export async function deleteBusinessAsAdmin(id: string): Promise<boolean> {
  const db = getDB();
  await db.prepare("DELETE FROM reviews WHERE business_id = ?").bind(id).run();
  const res = await db.prepare("DELETE FROM businesses WHERE id = ?").bind(id).run();
  return (res.meta.changes ?? 0) > 0;
}
