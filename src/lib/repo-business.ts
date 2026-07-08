/**
 * repo-business.ts — Vállalkozás (business) és kategória adatréteg.
 * Tartalmazza: kategóriák, vállalkozások, beküldési folyamat, analitika.
 */
import { getDB } from "./cloudflare";
import type { Business, Category, DashboardStats, ListBusiness } from "./types";
import { bool, jsonArray } from "./repo-shared";
import { DEFAULT_COUNTRY } from "./countries";
import { cached } from "./edge-cache";

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
  photo: string | null; accent_photo: string | null; accent_color: string | null; logo_key: string | null;
  owner_user_id: string | null; contact_email: string | null; working_hours: string | null;
  social_links: string | null; manage_token: string | null; gallery_keys: string | null;
  view_count: number | null; phone_click_count: number | null;
  moderation_status: number | null; moderation_decision_at: string | null;
  moderation_decided_by: string | null; created_at: string | null; updated_at: string | null;
  claimed: number | null; lead_opt_out: number | null;
  country_code: string | null; canton_code: string | null;
  kinti_pass_active: number | null; kinti_pass_offer: string | null;
}

interface BusinessSubmissionRow {
  id: string; name: string; category_id: string; category_label: string | null;
  address: string | null; canton_code: string; country_code?: string | null; phone: string | null; email: string;
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
    accentPhoto: r.accent_photo, accentColor: r.accent_color ?? null, logoKey: r.logo_key, ownerUserId: r.owner_user_id,
    contactEmail: r.contact_email, workingHours: r.working_hours, socialLinks: r.social_links,
    manageToken: r.manage_token, galleryKeys: jsonArray(r.gallery_keys),
    viewCount: r.view_count ?? 0, phoneClickCount: r.phone_click_count ?? 0,
    moderationStatus: r.moderation_status ?? 0, moderationDecisionAt: r.moderation_decision_at,
    moderationDecidedBy: r.moderation_decided_by, updatedAt: r.updated_at ?? null,
    createdAt: r.created_at ?? null,
    claimed: bool(r.claimed ?? 1),
    leadOptOut: bool(r.lead_opt_out ?? 0),
    country: r.country_code ?? DEFAULT_COUNTRY,
    canton: r.canton_code ?? null,
    kintiPassActive: bool(r.kinti_pass_active ?? 0),
    kintiPassOffer: r.kinti_pass_offer ?? null,
  };
}

function toBusinessSubmission(r: BusinessSubmissionRow): BusinessSubmission {
  return {
    id: r.id, name: r.name, categoryId: r.category_id, categoryLabel: r.category_label,
    address: r.address, cantonCode: r.canton_code, country: r.country_code ?? DEFAULT_COUNTRY, phone: r.phone, email: r.email,
    blurb: r.blurb, licenseNumber: r.license_number, ownerUserId: r.owner_user_id,
    manageToken: r.manage_token, confirmToken: r.confirm_token, expiresAt: r.expires_at,
  };
}

// --- Public types ------------------------------------------------------------

export interface BusinessSubmission {
  id: string; name: string; categoryId: string; categoryLabel: string | null;
  address: string | null; cantonCode: string; country: string; phone: string | null; email: string;
  blurb: string | null; licenseNumber: string | null; ownerUserId: string | null;
  manageToken: string | null; confirmToken: string; expiresAt: string;
}

export interface BusinessSubmissionInput {
  id: string; name: string; categoryId: string; categoryLabel: string | null;
  address: string | null; cantonCode: string; country: string; phone: string | null; email: string;
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
  accentColor?: string | null;
  /** A vállalkozás országa (CH/AT/DE/NL) — a route validálja. */
  country?: string;
  /** Régió-kód; ország-váltáskor a route null-ra állítja (más országban érvénytelen). */
  cantonCode?: string | null;
  /** Térkép-pin koordináta (a cím-keresőből). A route csak érvényes, ország-beli
   *  párnál frissíti; egyébként a meglévő értéket adja vissza (nem null-oz). */
  lat?: number | null;
  lng?: number | null;
  /** Kinti Pass elfogadóhely be/ki (CSAK Szaknévsor PRO — a route gate-eli). */
  kintiPassActive?: boolean;
  /** Kinti Pass ajánlat-szöveg (null = törlés). */
  kintiPassOffer?: string | null;
}

export interface UpdateBusinessFields {
  name?: string; categoryLabel?: string | null; address?: string | null;
  phone?: string | null; blurb?: string | null; openText?: string | null;
  workingHours?: string | null; socialLinks?: string | null; languages?: string[] | null;
  /** Árajánlat-kérések fogadásának kikapcsolása (lead_opt_out). */
  leadOptOut?: boolean;
  /** Kinti Pass elfogadóhely be/ki (CSAK Szaknévsor PRO — az API gate-eli). */
  kintiPassActive?: boolean;
  /** Kinti Pass ajánlat-szöveg (null = törlés). */
  kintiPassOffer?: string | null;
}

export interface CreateBusinessFromSubmissionInput {
  id: string; name: string; categoryId: string; categoryLabel: string | null;
  address: string | null; country: string; phone: string | null; blurb: string | null;
  licenseNumber: string | null; contactEmail: string; lat: number | null;
  lng: number | null; ownerUserId: string | null; manageToken: string;
  languages?: string[] | null; workingHours?: string | null;
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

/**
 * Publikus szerializáló: a `Business`-ből NULL-ozza azokat a mezőket, amiknek
 * SOHA nem szabad a böngészőbe (RSC-payload / JSON-API) jutniuk:
 *   • manageToken   — tulajdonosi szerkesztő-kulcs (átvétel!) → csak a beküldés
 *                     saját POST-válaszában és az admin-nézetben szabad látszania.
 *   • ownerUserId   — Clerk belső azonosító.
 *   • contactEmail  — a tulaj privát e-mailje (a lead/digest e-mailek SZERVER-
 *                     oldalon használják; a publikus kártyának nem kell).
 *   • moderationDecidedBy — belső admin-audit.
 * A lista- és részletoldal-megjelenítés egyik mezőt sem olvassa, így a kiszűrés
 * nem tör el semmit — viszont megszünteti a tömeges átvétel/PII-scrape esélyét.
 */
export function toPublicBusiness(b: Business): Business {
  return {
    ...b,
    manageToken: null,
    ownerUserId: null,
    contactEmail: null,
    moderationDecidedBy: null,
  };
}

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
  // A lista MINDIG publikus felületre megy → érzékeny mezők nélkül.
  return results.map((r) => toPublicBusiness(toBusiness(r)));
}

// --- Karcsú lista-vetület (payload-diéta) -------------------------------------

/** A ListBusiness-hez szükséges oszlopok — SELECT * helyett (kevesebb D1-olvasás
 *  és fele/harmada RSC-payload; a blurb marad, mert a kliens-kereső abban is keres). */
const LIST_COLUMNS =
  "id,name,category_id,category_label,rating,reviews,address,phone,lat,lng," +
  "featured,verified,blurb,open_text,working_hours,years_here,languages,photo," +
  "logo_key,country_code,canton_code,kinti_pass_active,kinti_pass_offer,created_at";

type ListBusinessRow = Pick<
  BusinessRow,
  | "id" | "name" | "category_id" | "category_label" | "rating" | "reviews"
  | "address" | "phone" | "lat" | "lng" | "featured" | "verified" | "blurb"
  | "open_text" | "working_hours" | "years_here" | "languages" | "photo"
  | "logo_key" | "country_code" | "canton_code" | "kinti_pass_active"
  | "kinti_pass_offer" | "created_at"
>;

function toListBusiness(r: ListBusinessRow): ListBusiness {
  return {
    id: r.id, name: r.name, categoryId: r.category_id, categoryLabel: r.category_label,
    rating: r.rating, reviews: r.reviews, address: r.address, phone: r.phone,
    lat: r.lat, lng: r.lng, featured: bool(r.featured), verified: bool(r.verified),
    blurb: r.blurb, openText: r.open_text, workingHours: r.working_hours,
    yearsHere: r.years_here, languages: jsonArray(r.languages), photo: r.photo,
    logoKey: r.logo_key, country: r.country_code ?? DEFAULT_COUNTRY,
    canton: r.canton_code ?? null, kintiPassActive: bool(r.kinti_pass_active ?? 0),
    kintiPassOffer: r.kinti_pass_offer ?? null, createdAt: r.created_at ?? null,
  };
}

/** A teljes publikus lista élettartama az izolátum-cache-ben (lásd edge-cache.ts). */
const LIST_TTL_MS = 180_000; // 3 perc

/**
 * A teljes publikus vállalkozás-lista a lista-/térkép-nézeteknek — karcsú
 * vetülettel ÉS izolátum-cache-sel (a kezdőlap és a /szaknevsor OSZTOZIK a
 * kulcson, így TTL-enként egyszer megy D1-re). Érzékeny mező (manage_token,
 * contact_email, owner) be sem kerül a SELECT-be → toPublicBusiness sem kell.
 */
export async function getBusinessesForList(): Promise<ListBusiness[]> {
  return cached("biz:list-v1", LIST_TTL_MS, async () => {
    const { results } = await getDB()
      .prepare(
        `SELECT ${LIST_COLUMNS} FROM businesses
         WHERE COALESCE(hidden, 0) = 0 AND moderation_status = 1
         ORDER BY featured DESC, rating DESC`,
      )
      .all<ListBusinessRow>();
    return results.map(toListBusiness);
  });
}

export async function getBusinessById(id: string): Promise<Business | null> {
  const row = await getDB()
    .prepare("SELECT * FROM businesses WHERE id = ? AND COALESCE(hidden, 0) = 0")
    .bind(id).first<BusinessRow>();
  return row ? toBusiness(row) : null;
}

/**
 * „Hasonló magyar szakemberek" a részlet-oldal aljára: ugyanaz a kategória +
 * ország, önmaga nélkül. Rangsor: azonos kanton/tartomány előre, azon belül
 * koordináta-közelség a megnézett céghez (durva sík-közelítés — rangsoroláshoz
 * elég), majd PRO/értékelés. GPS nem kell hozzá: a viszonyítási pont maga a cég.
 */
export async function getSimilarBusinesses(b: Business, limit = 3): Promise<Business[]> {
  const hasCoord = b.lat != null && b.lng != null;
  const { results } = await getDB()
    .prepare(
      `SELECT * FROM businesses
       WHERE COALESCE(hidden, 0) = 0 AND moderation_status = 1
         AND id != ? AND category_id = ? AND country_code = ?
       ORDER BY (canton_code = ?) DESC, featured DESC,
         CASE WHEN ? = 1 AND lat IS NOT NULL
              THEN (lat - ?) * (lat - ?) + 0.5 * (lng - ?) * (lng - ?)
              ELSE 9999 END ASC,
         rating DESC
       LIMIT ?`,
    )
    .bind(
      b.id, b.categoryId, b.country,
      b.canton ?? "",
      hasCoord ? 1 : 0, b.lat ?? 0, b.lat ?? 0, b.lng ?? 0, b.lng ?? 0,
      limit,
    )
    .all<BusinessRow>();
  return results.map((r) => toPublicBusiness(toBusiness(r)));
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
       working_hours=?,social_links=?,years_here=?,languages=?,accent_color=?,
       country_code=?,canton_code=?,lat=?,lng=?,kinti_pass_active=?,kinti_pass_offer=?,updated_at=datetime('now')
       WHERE id=? AND owner_user_id=?`,
    )
    .bind(input.name, input.phone, input.blurb, input.address, input.categoryLabel,
      input.openText, input.workingHours ?? null, input.socialLinks ?? null,
      input.yearsHere ?? null, input.languages ? JSON.stringify(input.languages) : null,
      input.accentColor ?? null,
      input.country ?? "CH", input.cantonCode ?? null,
      input.lat ?? null, input.lng ?? null,
      input.kintiPassActive ? 1 : 0, input.kintiPassOffer ?? null,
      businessId, ownerUserId)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

/** Keresőszó rögzítése egy vállalkozás-megnyitáshoz (aggregált, PII-mentes). */
export async function recordBusinessSearchTerm(businessId: string, term: string): Promise<void> {
  const t = term.trim().toLowerCase().slice(0, 60);
  if (t.length < 2) return;
  try {
    await getDB()
      .prepare(
        `INSERT INTO business_search_terms (business_id, term, count, last_seen)
         VALUES (?, ?, 1, datetime('now'))
         ON CONFLICT(business_id, term) DO UPDATE SET count = count + 1, last_seen = datetime('now')`,
      )
      .bind(businessId, t)
      .run();
  } catch {
    /* best-effort */
  }
}

/** Egy vállalkozás leggyakoribb keresőszavai (Analytics Dashboard). */
export async function getTopSearchTerms(businessId: string, limit = 6): Promise<{ term: string; count: number }[]> {
  try {
    const { results } = await getDB()
      .prepare("SELECT term, count FROM business_search_terms WHERE business_id = ? ORDER BY count DESC LIMIT ?")
      .bind(businessId, limit)
      .all<{ term: string; count: number }>();
    return results;
  } catch {
    return [];
  }
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
  if (fields.leadOptOut !== undefined) {
    sets.push("lead_opt_out = ?");
    values.push(fields.leadOptOut ? 1 : 0);
  }
  if (fields.kintiPassActive !== undefined) {
    sets.push("kinti_pass_active = ?");
    values.push(fields.kintiPassActive ? 1 : 0);
  }
  if (fields.kintiPassOffer !== undefined) {
    sets.push("kinti_pass_offer = ?");
    values.push(fields.kintiPassOffer);
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
  return (res.meta.changes ?? 0) > 0;
}

export async function addBusinessGalleryKey(id: string, key: string): Promise<boolean> {
  const db = getDB();
  const b = await db.prepare("SELECT gallery_keys FROM businesses WHERE id = ?").bind(id).first<{ gallery_keys: string | null }>();
  if (!b) return false;
  const keys = jsonArray(b.gallery_keys); keys.push(key);
  const res = await db.prepare("UPDATE businesses SET gallery_keys = ? WHERE id = ?").bind(JSON.stringify(keys), id).run();
  return (res.meta.changes ?? 0) > 0;
}

export async function removeBusinessGalleryKey(id: string, key: string): Promise<boolean> {
  const db = getDB();
  const b = await db.prepare("SELECT gallery_keys FROM businesses WHERE id = ?").bind(id).first<{ gallery_keys: string | null }>();
  if (!b) return false;
  const keys = jsonArray(b.gallery_keys).filter((k) => k !== key);
  const res = await db.prepare("UPDATE businesses SET gallery_keys = ? WHERE id = ?").bind(JSON.stringify(keys), id).run();
  return (res.meta.changes ?? 0) > 0;
}

// --- Business Submissions ----------------------------------------------------

export async function createBusinessSubmission(input: BusinessSubmissionInput): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO business_submissions
       (id,name,category_id,category_label,address,canton_code,country_code,phone,email,blurb,
        license_number,confirm_token,expires_at,terms_version,accepted_terms_at,age_confirmed,ip_hash,
        owner_user_id,manage_token)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .bind(input.id, input.name, input.categoryId, input.categoryLabel, input.address,
      input.cantonCode, input.country, input.phone, input.email.toLowerCase(), input.blurb, input.licenseNumber,
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
       (id,name,category_id,category_label,address,country_code,phone,blurb,license_number,
        contact_email,source,languages,working_hours,lat,lng,pin_x,pin_y,rating,reviews,featured,open_now,owner_user_id,manage_token)
       VALUES (?,?,?,?,?,?,?,?,?,?,'self_submitted',?,?,?,?,50,50,0,0,0,0,?,?)`,
    )
    .bind(input.id, input.name, input.categoryId, input.categoryLabel, input.address,
      input.country, input.phone, input.blurb, input.licenseNumber, input.contactEmail.toLowerCase(),
      JSON.stringify(input.languages?.length ? input.languages : ["Magyar"]),
      input.workingHours ?? null,
      input.lat, input.lng, input.ownerUserId, input.manageToken)
    .run();
}

export async function createOwnerDraftBusiness(input: {
  id: string; name: string; categoryId: string; cantonCode: string; country: string;
  contactEmail: string; lat: number | null; lng: number | null;
  ownerUserId: string; manageToken: string;
}): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO businesses
       (id,name,category_id,country_code,category_label,address,phone,blurb,
        contact_email,source,languages,lat,lng,pin_x,pin_y,rating,reviews,featured,open_now,owner_user_id,manage_token)
       VALUES (?,?,?,?,NULL,NULL,NULL,NULL,?,'owner_draft',?,?,?,50,50,0,0,0,0,?,?)`,
    )
    .bind(input.id, input.name, input.categoryId, input.country, input.contactEmail.toLowerCase(),
      JSON.stringify(["Magyar"]), input.lat, input.lng, input.ownerUserId, input.manageToken)
    .run();
}

export interface SuggestBusinessInput {
  name: string;
  categoryId: string;
  categoryLabel: string | null;
  address: string | null;
  country: string;
  phone: string | null;
  blurb: string | null;
  lat: number | null;
  lng: number | null;
}

/**
 * Közösségi „Ajánlj egy vállalkozást" — egy felhasználó által ismert, valódi
 * magyar vállalkozás beküldése. moderation_status=0 (admin jóváhagyásra vár),
 * claimed=0 (nem megerősített → a tulaj később átveheti). Nincs owner/token/email.
 */
export async function createSuggestedBusiness(input: SuggestBusinessInput): Promise<string> {
  const id = `sug-${crypto.randomUUID().slice(0, 16)}`;
  await getDB()
    .prepare(
      `INSERT INTO businesses
       (id,name,category_id,country_code,category_label,address,phone,blurb,
        source,languages,lat,lng,pin_x,pin_y,rating,reviews,featured,open_now,
        moderation_status,claimed)
       VALUES (?,?,?,?,?,?,?,?,'community-suggestion',?,?,?,50,50,0,0,0,0,0,0)`,
    )
    .bind(
      id, input.name, input.categoryId, input.country, input.categoryLabel, input.address,
      input.phone, input.blurb, JSON.stringify(["Magyar"]), input.lat, input.lng,
    )
    .run();
  return id;
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
  moderationStatus: number; // 0=függőben, 1=jóváhagyva, 2=elutasítva
  rating: number; reviews: number; source: string | null; createdAt: string; manageToken: string | null;
}

export const ADMIN_BUSINESS_PAGE_SIZE = 100;

export async function listBusinessesForAdmin(
  country?: string | null,
  page = 1,
): Promise<{ rows: AdminBusinessRow[]; total: number; page: number; pages: number }> {
  // A függőben lévőket (moderation_status=0) előre rendezzük, hogy az admin
  // azonnal lássa, mi vár jóváhagyásra. Opcionális ország-szűrő (admin tab) +
  // lapozás (100/oldal) — eddig a 100 fölötti sorok elérhetetlenek voltak.
  const filter = !!country && country !== "all";
  const db = getDB();

  const countStmt = db.prepare(`SELECT COUNT(*) AS n FROM businesses ${filter ? "WHERE country_code = ?" : ""}`);
  const total = (await (filter ? countStmt.bind(country) : countStmt).first<{ n: number }>())?.n ?? 0;
  const pages = Math.max(1, Math.ceil(total / ADMIN_BUSINESS_PAGE_SIZE));
  const p = Math.min(Math.max(1, Math.floor(page) || 1), pages);
  const offset = (p - 1) * ADMIN_BUSINESS_PAGE_SIZE;

  const sql = `SELECT id,name,category_label,verified,moderation_status,rating,reviews,source,created_at,manage_token FROM businesses ${filter ? "WHERE country_code = ?" : ""} ORDER BY moderation_status ASC, created_at DESC LIMIT ? OFFSET ?`;
  const stmt = db.prepare(sql);
  const { results } = await (filter ? stmt.bind(country, ADMIN_BUSINESS_PAGE_SIZE, offset) : stmt.bind(ADMIN_BUSINESS_PAGE_SIZE, offset))
    .all<{ id: string; name: string; category_label: string | null; verified: number; moderation_status: number | null; rating: number; reviews: number; source: string | null; created_at: string; manage_token: string | null }>();
  const rows = results.map((r) => ({
    id: r.id, name: r.name, categoryLabel: r.category_label, verified: r.verified === 1,
    moderationStatus: r.moderation_status ?? 0,
    rating: r.rating, reviews: r.reviews, source: r.source, createdAt: r.created_at, manageToken: r.manage_token,
  }));
  return { rows, total, page: p, pages };
}

export async function deleteBusinessAsAdmin(id: string): Promise<boolean> {
  const db = getDB();
  await db.prepare("DELETE FROM reviews WHERE business_id = ?").bind(id).run();
  const res = await db.prepare("DELETE FROM businesses WHERE id = ?").bind(id).run();
  return (res.meta.changes ?? 0) > 0;
}
