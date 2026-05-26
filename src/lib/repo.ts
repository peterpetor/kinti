import { getDB } from "./cloudflare";
import type {
  Business,
  BulletinDraft,
  BulletinKind,
  BulletinPost,
  Category,
  DashboardStats,
  EventFeed,
  KintiEvent,
  Review,
  ReviewDraft,
} from "./types";

/**
 * Adatréteg (repository) — minden D1 SQL itt fut, és itt képződik a sor →
 * domén leképezés (snake_case → camelCase, 0/1 → boolean, languages JSON →
 * string[]). Az API route-ok és a szerver-komponensek EZT hívják, nem egymást.
 */

// --- segédek ----------------------------------------------------------------
function bool(v: unknown): boolean {
  return v === 1 || v === true || v === "1";
}

function jsonArray(v: unknown): string[] {
  if (typeof v !== "string" || v.length === 0) return [];
  try {
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

// --- sortípusok (D1 oszlopnevek) --------------------------------------------
interface CategoryRow {
  id: string;
  label: string;
  glyph: string | null;
  sort_order: number;
}

interface BusinessRow {
  id: string;
  name: string;
  category_id: string;
  category_label: string | null;
  rating: number;
  reviews: number;
  dist_text: string | null;
  dist_meters: number | null;
  address: string | null;
  phone: string | null;
  pin_x: number;
  pin_y: number;
  lat: number | null;
  lng: number | null;
  featured: number;
  blurb: string | null;
  open_now: number;
  open_text: string | null;
  years_here: number | null;
  languages: string | null;
  photo: string | null;
  accent_photo: string | null;
  logo_key: string | null;
  owner_user_id: string | null;
}

interface EventRow {
  id: string;
  title: string;
  event_date: string | null;
  date_day: string | null;
  date_month: string | null;
  date_weekday: string | null;
  start_time: string | null;
  venue: string | null;
  going: number;
  tag: string | null;
  color: string | null;
}

interface BulletinKindRow {
  id: string;
  label: string;
  color: string | null;
  sort_order: number;
}

interface BulletinPostRow {
  id: string;
  kind_id: string;
  title: string;
  meta: string | null;
  age_text: string | null;
  poster: string | null;
  poster_user_id: string | null;
  image_key: string | null;
  body: string | null;
  expires_at: string | null;
  published_at: string | null;
  kind_label: string | null;
  kind_color: string | null;
  kind_sort: number | null;
}

interface BulletinDraftRow {
  id: string;
  email: string;
  kind_id: string;
  title: string;
  meta: string | null;
  body: string | null;
  poster: string | null;
  confirm_token: string;
  manage_token: string;
  expires_at: string;
  created_at: string;
  terms_version: string | null;
  accepted_terms_at: string | null;
  age_confirmed: number | null;
  ip_hash: string | null;
}

// --- mapperek ---------------------------------------------------------------
function toCategory(r: CategoryRow): Category {
  return { id: r.id, label: r.label, glyph: r.glyph, sortOrder: r.sort_order };
}

function toBusiness(r: BusinessRow): Business {
  return {
    id: r.id,
    name: r.name,
    categoryId: r.category_id,
    categoryLabel: r.category_label,
    rating: r.rating,
    reviews: r.reviews,
    distText: r.dist_text,
    distMeters: r.dist_meters,
    address: r.address,
    phone: r.phone,
    pinX: r.pin_x,
    pinY: r.pin_y,
    lat: r.lat,
    lng: r.lng,
    featured: bool(r.featured),
    blurb: r.blurb,
    openNow: bool(r.open_now),
    openText: r.open_text,
    yearsHere: r.years_here,
    languages: jsonArray(r.languages),
    photo: r.photo,
    accentPhoto: r.accent_photo,
    logoKey: r.logo_key,
    ownerUserId: r.owner_user_id,
  };
}

function toEvent(r: EventRow): KintiEvent {
  return {
    id: r.id,
    title: r.title,
    eventDate: r.event_date,
    dateDay: r.date_day,
    dateMonth: r.date_month,
    dateWeekday: r.date_weekday,
    startTime: r.start_time,
    venue: r.venue,
    going: r.going,
    tag: r.tag,
    color: r.color,
  };
}

function toBulletinKind(r: BulletinKindRow): BulletinKind {
  return { id: r.id, label: r.label, color: r.color, sortOrder: r.sort_order };
}

function toBulletinPost(r: BulletinPostRow): BulletinPost {
  return {
    id: r.id,
    kindId: r.kind_id,
    title: r.title,
    meta: r.meta,
    ageText: r.age_text,
    poster: r.poster,
    posterUserId: r.poster_user_id,
    imageKey: r.image_key,
    body: r.body,
    expiresAt: r.expires_at,
    publishedAt: r.published_at,
    kind: r.kind_label
      ? { id: r.kind_id, label: r.kind_label, color: r.kind_color, sortOrder: r.kind_sort ?? 0 }
      : undefined,
  };
}

function toBulletinDraft(r: BulletinDraftRow): BulletinDraft {
  return {
    id: r.id,
    email: r.email,
    kindId: r.kind_id,
    title: r.title,
    meta: r.meta,
    body: r.body,
    poster: r.poster,
    confirmToken: r.confirm_token,
    manageToken: r.manage_token,
    expiresAt: r.expires_at,
    createdAt: r.created_at,
    termsVersion: r.terms_version,
    acceptedTermsAt: r.accepted_terms_at,
    ageConfirmed: r.age_confirmed === 1,
    ipHash: r.ip_hash,
  };
}

// --- lekérdezések -----------------------------------------------------------
export async function getCategories(): Promise<Category[]> {
  const { results } = await getDB()
    .prepare("SELECT * FROM categories ORDER BY sort_order ASC")
    .all<CategoryRow>();
  return results.map(toCategory);
}

export interface BusinessQuery {
  category?: string | null;
  featured?: boolean;
  limit?: number;
}

export async function getBusinesses(opts: BusinessQuery = {}): Promise<Business[]> {
  const where: string[] = [];
  const binds: unknown[] = [];

  if (opts.category && opts.category !== "all") {
    where.push("category_id = ?");
    binds.push(opts.category);
  }
  if (opts.featured) where.push("featured = 1");

  let sql = "SELECT * FROM businesses";
  if (where.length) sql += " WHERE " + where.join(" AND ");
  sql += " ORDER BY featured DESC, dist_meters ASC";
  if (opts.limit) {
    sql += " LIMIT ?";
    binds.push(opts.limit);
  }

  const { results } = await getDB().prepare(sql).bind(...binds).all<BusinessRow>();
  return results.map(toBusiness);
}

export async function getBusinessById(id: string): Promise<Business | null> {
  const row = await getDB()
    .prepare("SELECT * FROM businesses WHERE id = ?")
    .bind(id)
    .first<BusinessRow>();
  return row ? toBusiness(row) : null;
}

/** A bejelentkezett tulajdonos vállalkozása (Clerk user_id → owner_user_id). */
export async function getBusinessByOwner(ownerUserId: string): Promise<Business | null> {
  const row = await getDB()
    .prepare("SELECT * FROM businesses WHERE owner_user_id = ? LIMIT 1")
    .bind(ownerUserId)
    .first<BusinessRow>();
  return row ? toBusiness(row) : null;
}

/**
 * Vállalkozás igénylése: a Clerk user_id-t köti a rekordhoz, de CSAK ha az még
 * gazdátlan (owner_user_id IS NULL). Visszaadja, sikerült-e (átírt sorok > 0).
 */
export async function claimBusiness(businessId: string, ownerUserId: string): Promise<boolean> {
  const res = await getDB()
    .prepare(
      "UPDATE businesses SET owner_user_id = ?, updated_at = datetime('now') WHERE id = ? AND owner_user_id IS NULL",
    )
    .bind(ownerUserId, businessId)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

/**
 * R2 logó-kulcs mentése a vállalkozáshoz — CSAK a tulajdonosa hívhatja
 * sikeresen. A `WHERE id = ? AND owner_user_id = ?` szűrő miatt idegen
 * user_id-vel a sor nem érhető el, így az `UPDATE` 0 sort érint.
 */
export async function setBusinessLogo(
  businessId: string,
  ownerUserId: string,
  logoKey: string,
): Promise<boolean> {
  const res = await getDB()
    .prepare(
      "UPDATE businesses SET logo_key = ?, updated_at = datetime('now') WHERE id = ? AND owner_user_id = ?",
    )
    .bind(logoKey, businessId, ownerUserId)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

export interface EventQuery {
  upcoming?: boolean;
  limit?: number;
}

export async function getEvents(opts: EventQuery = {}): Promise<KintiEvent[]> {
  const binds: unknown[] = [];
  let sql = "SELECT * FROM events";
  if (opts.upcoming) sql += " WHERE event_date >= date('now')";
  sql += " ORDER BY event_date ASC";
  if (opts.limit) {
    sql += " LIMIT ?";
    binds.push(opts.limit);
  }
  const { results } = await getDB().prepare(sql).bind(...binds).all<EventRow>();
  return results.map(toEvent);
}

export async function getBulletinKinds(): Promise<BulletinKind[]> {
  const { results } = await getDB()
    .prepare("SELECT * FROM bulletin_kinds ORDER BY sort_order ASC")
    .all<BulletinKindRow>();
  return results.map(toBulletinKind);
}

export async function getBulletinPosts(kind?: string | null): Promise<BulletinPost[]> {
  const binds: unknown[] = [];
  // A publikus listára kizárólag a jóváhagyott (is_pending=0) ÉS nem lejárt
  // (expires_at IS NULL OR > now) posztok kerülnek. A régi seed-rekordoknak
  // nincs expires_at-juk → "soha nem jár le", ami szándékos.
  let sql = `
    SELECT p.*, k.label AS kind_label, k.color AS kind_color, k.sort_order AS kind_sort
    FROM bulletin_posts p
    JOIN bulletin_kinds k ON k.id = p.kind_id
    WHERE p.is_pending = 0
      AND (p.expires_at IS NULL OR p.expires_at > datetime('now'))`;
  if (kind && kind !== "all") {
    sql += " AND p.kind_id = ?";
    binds.push(kind);
  }
  sql += " ORDER BY COALESCE(p.published_at, p.created_at) DESC, p.id ASC";
  const { results } = await getDB().prepare(sql).bind(...binds).all<BulletinPostRow>();
  return results.map(toBulletinPost);
}

// ---------------------------------------------------------------------------
// Hirdetőfal — email-megerősítéses posztolás (account nélküli flow).
// ---------------------------------------------------------------------------

export interface BulletinDraftInput {
  id: string;
  email: string;
  kindId: string;
  title: string;
  meta: string | null;
  body: string | null;
  poster: string | null;
  confirmToken: string;
  manageToken: string;
  expiresAt: string; // ISO
  /** Az elfogadott jogi szövegek verziója (TERMS_VERSION). */
  termsVersion: string;
  /** Az elfogadás időbélyege (ISO datetime). */
  acceptedTermsAt: string;
  /** 1 = a feladó nyilatkozta, hogy elmúlt 18 (Ptk. 2:10 §). */
  ageConfirmed: number;
  /** SHA-256(IP) — null, ha nincs IP a kérésben (pl. localhost dev). */
  ipHash: string | null;
}

/** Új piszkozat — a kliens-form `submit`-end-pointja használja. */
export async function createBulletinDraft(input: BulletinDraftInput): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO bulletin_drafts
       (id, email, kind_id, title, meta, body, poster,
        confirm_token, manage_token, expires_at,
        terms_version, accepted_terms_at, age_confirmed, ip_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.id,
      input.email.toLowerCase(),
      input.kindId,
      input.title,
      input.meta,
      input.body,
      input.poster,
      input.confirmToken,
      input.manageToken,
      input.expiresAt,
      input.termsVersion,
      input.acceptedTermsAt,
      input.ageConfirmed,
      input.ipHash,
    )
    .run();
}

/** Confirm-token alapján visszaadja a piszkozatot — csak ha nem lejárt. */
export async function getBulletinDraftByConfirmToken(
  confirmToken: string,
): Promise<BulletinDraft | null> {
  const row = await getDB()
    .prepare(
      `SELECT * FROM bulletin_drafts
       WHERE confirm_token = ? AND expires_at > datetime('now')`,
    )
    .bind(confirmToken)
    .first<BulletinDraftRow>();
  return row ? toBulletinDraft(row) : null;
}

/** Piszkozat törlése (megerősítés után átmozgatás → törlés). */
export async function deleteBulletinDraft(id: string): Promise<void> {
  await getDB().prepare("DELETE FROM bulletin_drafts WHERE id = ?").bind(id).run();
}

/** Lejárt piszkozatok takarítása (cron / manual hívás). */
export async function purgeExpiredBulletinDrafts(): Promise<number> {
  const res = await getDB()
    .prepare("DELETE FROM bulletin_drafts WHERE expires_at <= datetime('now')")
    .run();
  return res.meta.changes ?? 0;
}

export interface PublishBulletinInput {
  id: string;
  kindId: string;
  title: string;
  meta: string | null;
  body: string | null;
  poster: string | null;
  email: string;
  manageToken: string;
  /** ISO datetime — 30 nap múlva. */
  expiresAt: string;
  /** 1 = admin moderációra vár; 0 = azonnal publikus. */
  isPending: number;
  /** Audit-trail átvezetése a draft-ról. */
  termsVersion: string | null;
  acceptedTermsAt: string | null;
  ageConfirmed: number;
  ipHash: string | null;
}

/**
 * Megerősített hirdetés publikálása. Az `ageText` a poszt korára utaló kis
 * címke ("2 órája", "tegnap") — most "frissen" felirattal kerül be, és a
 * lekérdezésnél nem kötelező felülírni.
 */
export async function publishBulletinPost(input: PublishBulletinInput): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO bulletin_posts
       (id, kind_id, title, meta, body, poster, email, manage_token,
        age_text, expires_at, published_at, is_pending, created_at,
        terms_version, accepted_terms_at, age_confirmed, ip_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'frissen', ?, datetime('now'), ?, datetime('now'),
               ?, ?, ?, ?)`,
    )
    .bind(
      input.id,
      input.kindId,
      input.title,
      input.meta,
      input.body,
      input.poster,
      input.email.toLowerCase(),
      input.manageToken,
      input.expiresAt,
      input.isPending,
      input.termsVersion,
      input.acceptedTermsAt,
      input.ageConfirmed,
      input.ipHash,
    )
    .run();
}

/** Manage-token alapján visszaadja a posztot (a kezelő oldal használja). */
export async function getBulletinPostByManageToken(
  manageToken: string,
): Promise<BulletinPost | null> {
  const row = await getDB()
    .prepare(
      `SELECT p.*, k.label AS kind_label, k.color AS kind_color, k.sort_order AS kind_sort
       FROM bulletin_posts p
       JOIN bulletin_kinds k ON k.id = p.kind_id
       WHERE p.manage_token = ?`,
    )
    .bind(manageToken)
    .first<BulletinPostRow>();
  return row ? toBulletinPost(row) : null;
}

/** Hirdetés törlése — csak manage-tokennel (a feladó email-jén át kapta). */
export async function deleteBulletinPostByManageToken(manageToken: string): Promise<boolean> {
  const res = await getDB()
    .prepare("DELETE FROM bulletin_posts WHERE manage_token = ?")
    .bind(manageToken)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

/**
 * "Bizalmi" mutató: hány korábban publikált, lejáratlan és nem moderált
 * hirdetése van már ennek az emailnek. >0 → új poszt mehet azonnal publikusra.
 */
export async function countTrustedBulletinPosts(email: string): Promise<number> {
  const row = await getDB()
    .prepare(
      `SELECT COUNT(*) AS n FROM bulletin_posts
       WHERE email = ? AND is_pending = 0`,
    )
    .bind(email.toLowerCase())
    .first<{ n: number }>();
  return row?.n ?? 0;
}

// ---------------------------------------------------------------------------
// Vélemények — email-megerősítéses, account nélküli flow.
// ---------------------------------------------------------------------------

interface ReviewDraftRow {
  id: string;
  business_id: string;
  email: string;
  rating: number;
  body: string;
  reviewer_name: string;
  confirm_token: string;
  manage_token: string;
  expires_at: string;
  created_at: string;
  terms_version: string | null;
  accepted_terms_at: string | null;
  age_confirmed: number | null;
  ip_hash: string | null;
}

interface ReviewRow {
  id: string;
  business_id: string;
  rating: number;
  body: string;
  reviewer_name: string;
  published_at: string;
  manage_token: string;
  email: string;
}

function toReviewDraft(r: ReviewDraftRow): ReviewDraft {
  return {
    id: r.id,
    businessId: r.business_id,
    email: r.email,
    rating: r.rating,
    body: r.body,
    reviewerName: r.reviewer_name,
    confirmToken: r.confirm_token,
    manageToken: r.manage_token,
    expiresAt: r.expires_at,
    createdAt: r.created_at,
    termsVersion: r.terms_version,
    acceptedTermsAt: r.accepted_terms_at,
    ageConfirmed: r.age_confirmed === 1,
    ipHash: r.ip_hash,
  };
}

function toReview(r: ReviewRow): Review {
  return {
    id: r.id,
    businessId: r.business_id,
    rating: r.rating,
    body: r.body,
    reviewerName: r.reviewer_name,
    publishedAt: r.published_at,
  };
}

export interface ReviewDraftInput {
  id: string;
  businessId: string;
  email: string;
  rating: number;
  body: string;
  reviewerName: string;
  confirmToken: string;
  manageToken: string;
  expiresAt: string;
  termsVersion: string;
  acceptedTermsAt: string;
  ageConfirmed: number;
  ipHash: string | null;
}

export async function createReviewDraft(input: ReviewDraftInput): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO review_drafts
       (id, business_id, email, rating, body, reviewer_name,
        confirm_token, manage_token, expires_at,
        terms_version, accepted_terms_at, age_confirmed, ip_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.id,
      input.businessId,
      input.email.toLowerCase(),
      input.rating,
      input.body,
      input.reviewerName,
      input.confirmToken,
      input.manageToken,
      input.expiresAt,
      input.termsVersion,
      input.acceptedTermsAt,
      input.ageConfirmed,
      input.ipHash,
    )
    .run();
}

export async function getReviewDraftByConfirmToken(
  confirmToken: string,
): Promise<ReviewDraft | null> {
  const row = await getDB()
    .prepare(
      `SELECT * FROM review_drafts
       WHERE confirm_token = ? AND expires_at > datetime('now')`,
    )
    .bind(confirmToken)
    .first<ReviewDraftRow>();
  return row ? toReviewDraft(row) : null;
}

export async function deleteReviewDraft(id: string): Promise<void> {
  await getDB().prepare("DELETE FROM review_drafts WHERE id = ?").bind(id).run();
}

/**
 * Van-e már publikált vélemény ettől az emailtől erre a vállalkozásra?
 * Üzleti szabály: 1 email = 1 vélemény / vállalkozás.
 */
export async function hasReviewByEmail(
  businessId: string,
  email: string,
): Promise<boolean> {
  const row = await getDB()
    .prepare(
      `SELECT 1 AS one FROM reviews
       WHERE business_id = ? AND lower(email) = lower(?) LIMIT 1`,
    )
    .bind(businessId, email)
    .first<{ one: number }>();
  return !!row;
}

export interface PublishReviewInput {
  id: string;
  businessId: string;
  email: string;
  rating: number;
  body: string;
  reviewerName: string;
  manageToken: string;
  termsVersion: string | null;
  acceptedTermsAt: string | null;
  ageConfirmed: number;
  ipHash: string | null;
}

export async function publishReview(input: PublishReviewInput): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO reviews
       (id, business_id, email, rating, body, reviewer_name, manage_token,
        published_at, terms_version, accepted_terms_at, age_confirmed, ip_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, ?)`,
    )
    .bind(
      input.id,
      input.businessId,
      input.email.toLowerCase(),
      input.rating,
      input.body,
      input.reviewerName,
      input.manageToken,
      input.termsVersion,
      input.acceptedTermsAt,
      input.ageConfirmed,
      input.ipHash,
    )
    .run();
}

/** A vállalkozás publikus véleményei — friss elöl. */
export async function getReviewsByBusiness(businessId: string): Promise<Review[]> {
  const { results } = await getDB()
    .prepare(
      `SELECT id, business_id, rating, body, reviewer_name, published_at,
              manage_token, email
       FROM reviews WHERE business_id = ?
       ORDER BY published_at DESC`,
    )
    .bind(businessId)
    .all<ReviewRow>();
  return results.map(toReview);
}

/**
 * Vélemény-törlés a manage-token alapján. Visszaadja, melyik business-hez
 * tartozott (a hívó újraszámolja a businesses.rating-et).
 */
export async function deleteReviewByManageToken(
  manageToken: string,
): Promise<string | null> {
  const row = await getDB()
    .prepare("SELECT business_id FROM reviews WHERE manage_token = ?")
    .bind(manageToken)
    .first<{ business_id: string }>();
  if (!row) return null;
  await getDB()
    .prepare("DELETE FROM reviews WHERE manage_token = ?")
    .bind(manageToken)
    .run();
  return row.business_id;
}

/**
 * Vélemény visszaadása manage-tokennel — a kezelő oldal használja.
 * Csak a publikus mezőket adjuk vissza (név, csillag, szöveg).
 */
export async function getReviewByManageToken(
  manageToken: string,
): Promise<(Review & { businessName: string | null }) | null> {
  const row = await getDB()
    .prepare(
      `SELECT r.id, r.business_id, r.rating, r.body, r.reviewer_name,
              r.published_at, r.manage_token, r.email, b.name AS business_name
       FROM reviews r
       LEFT JOIN businesses b ON b.id = r.business_id
       WHERE r.manage_token = ?`,
    )
    .bind(manageToken)
    .first<ReviewRow & { business_name: string | null }>();
  if (!row) return null;
  return { ...toReview(row), businessName: row.business_name };
}

/**
 * Vállalkozás `rating` (átlag) és `reviews` (db) mezőjének újraszámolása a
 * `reviews` táblából. Akkor hívandó, ha véleményt publikáltunk vagy töröltünk.
 * Üres → rating = 0, reviews = 0.
 */
export async function recomputeBusinessRating(businessId: string): Promise<void> {
  const row = await getDB()
    .prepare(
      `SELECT COUNT(*) AS cnt, COALESCE(AVG(rating), 0) AS avg
       FROM reviews WHERE business_id = ?`,
    )
    .bind(businessId)
    .first<{ cnt: number; avg: number }>();

  const cnt = row?.cnt ?? 0;
  const avg = Math.round((row?.avg ?? 0) * 10) / 10; // 1 tizedesre

  await getDB()
    .prepare(
      "UPDATE businesses SET rating = ?, reviews = ?, updated_at = datetime('now') WHERE id = ?",
    )
    .bind(avg, cnt, businessId)
    .run();
}

// ---------------------------------------------------------------------------
// Event feed admin — iCal források listája az /admin/feeds UI-hoz.
// ---------------------------------------------------------------------------

interface EventFeedRow {
  id: string;
  url: string;
  label: string | null;
  enabled: number;
  source_id: string;
  last_synced_at: string | null;
  last_error: string | null;
  events_count: number;
  created_at: string;
}

function toEventFeed(r: EventFeedRow): EventFeed {
  return {
    id: r.id,
    url: r.url,
    label: r.label,
    enabled: r.enabled === 1,
    sourceId: r.source_id,
    lastSyncedAt: r.last_synced_at,
    lastError: r.last_error,
    eventsCount: r.events_count,
    createdAt: r.created_at,
  };
}

/** SHA-256(url) első 16 hex karaktere → stabil source_id (Edge-kompatibilis). */
async function feedSourceId(url: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(url));
  const hex = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `ical:${hex.slice(0, 16)}`;
}

export async function listEventFeeds(): Promise<EventFeed[]> {
  const { results } = await getDB()
    .prepare("SELECT * FROM event_feeds ORDER BY created_at DESC")
    .all<EventFeedRow>();
  return results.map(toEventFeed);
}

export async function createEventFeed(input: {
  url: string;
  label: string | null;
}): Promise<EventFeed | { error: string }> {
  const url = input.url.trim();
  if (!/^https?:\/\//i.test(url)) {
    return { error: "Az URL http(s):// kezdetű legyen." };
  }
  const sourceId = await feedSourceId(url);
  const id = crypto.randomUUID();
  try {
    await getDB()
      .prepare(
        `INSERT INTO event_feeds (id, url, label, enabled, source_id)
         VALUES (?, ?, ?, 1, ?)`,
      )
      .bind(id, url, input.label ?? null, sourceId)
      .run();
  } catch (err) {
    const m = err instanceof Error ? err.message : String(err);
    if (/UNIQUE/.test(m)) return { error: "Ez az URL már fel van véve." };
    return { error: m };
  }
  const row = await getDB()
    .prepare("SELECT * FROM event_feeds WHERE id = ?")
    .bind(id)
    .first<EventFeedRow>();
  return row ? toEventFeed(row) : { error: "Mentés után nem volt visszaolvasható." };
}

export async function updateEventFeed(
  id: string,
  patch: { enabled?: boolean; label?: string | null },
): Promise<boolean> {
  const sets: string[] = [];
  const binds: unknown[] = [];
  if (typeof patch.enabled === "boolean") {
    sets.push("enabled = ?");
    binds.push(patch.enabled ? 1 : 0);
  }
  if (patch.label !== undefined) {
    sets.push("label = ?");
    binds.push(patch.label);
  }
  if (!sets.length) return false;
  binds.push(id);
  const res = await getDB()
    .prepare(`UPDATE event_feeds SET ${sets.join(", ")} WHERE id = ?`)
    .bind(...binds)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

/** Feed törlése + az ÖSSZES hozzá tartozó esemény-sor takarítása. */
export async function deleteEventFeed(id: string): Promise<boolean> {
  const row = await getDB()
    .prepare("SELECT source_id FROM event_feeds WHERE id = ?")
    .bind(id)
    .first<{ source_id: string }>();
  if (!row) return false;
  await getDB()
    .prepare("DELETE FROM events WHERE source = ?")
    .bind(row.source_id)
    .run();
  const res = await getDB()
    .prepare("DELETE FROM event_feeds WHERE id = ?")
    .bind(id)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

export interface DashboardResult {
  business: Business;
  stats: DashboardStats;
}

export async function getDashboard(businessId: string): Promise<DashboardResult | null> {
  const business = await getBusinessById(businessId);
  if (!business) return null;

  const db = getDB();
  const statsRow = await db
    .prepare("SELECT * FROM business_stats WHERE business_id = ?")
    .bind(businessId)
    .first<{
      week_views: number;
      week_views_delta: string | null;
      week_clicks: number;
      week_clicks_delta: string | null;
      week_calls: number;
      week_calls_delta: string | null;
    }>();

  const { results: trendRows } = await db
    .prepare(
      "SELECT stat_date, views FROM business_daily_views WHERE business_id = ? ORDER BY stat_date ASC",
    )
    .bind(businessId)
    .all<{ stat_date: string; views: number }>();

  const stats: DashboardStats = {
    weekViews: statsRow?.week_views ?? 0,
    weekViewsDelta: statsRow?.week_views_delta ?? null,
    weekClicks: statsRow?.week_clicks ?? 0,
    weekClicksDelta: statsRow?.week_clicks_delta ?? null,
    weekCalls: statsRow?.week_calls ?? 0,
    weekCallsDelta: statsRow?.week_calls_delta ?? null,
    trend: trendRows.map((r) => ({ date: r.stat_date, views: r.views })),
  };

  return { business, stats };
}
