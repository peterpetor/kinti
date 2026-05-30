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
  verified: number;
  blurb: string | null;
  license_number: string | null;
  open_now: number;
  open_text: string | null;
  years_here: number | null;
  languages: string | null;
  photo: string | null;
  accent_photo: string | null;
  logo_key: string | null;
  owner_user_id: string | null;
  contact_email: string | null;
  working_hours: string | null;
  social_links: string | null;
  manage_token: string | null;
  gallery_keys: string | null;
  view_count: number | null;
  phone_click_count: number | null;
  ai_review_summary: string | null;
  ai_review_summary_at: string | null;
  ai_review_summary_count: number | null;
  moderation_status: number | null;
  moderation_decision_at: string | null;
  moderation_decided_by: string | null;
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
  description: string | null;
  image_key: string | null;
  email: string | null;
  status: string;
  token: string | null;
  manage_token: string | null;
  /** A JOIN-olt RSVP-darabszám (LEFT JOIN event_rsvps). */
  rsvp_count?: number;
  moderation_status?: number | null;
  moderation_decision_at?: string | null;
  moderation_decided_by?: string | null;
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
  canton_code: string | null;
  price: number | null;
  kind_label: string | null;
  kind_color: string | null;
  kind_sort: number | null;
  // Manage & warning fields
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  manage_token: string | null;
  expiry_warning_sent: number | null;
}

interface BulletinDraftRow {
  id: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
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
  image_key: string | null;
  canton_code: string | null;
  price: number | null;
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
    verified: bool(r.verified),
    blurb: r.blurb,
    licenseNumber: r.license_number,
    openNow: bool(r.open_now),
    openText: r.open_text,
    yearsHere: r.years_here,
    languages: jsonArray(r.languages),
    photo: r.photo,
    accentPhoto: r.accent_photo,
    logoKey: r.logo_key,
    ownerUserId: r.owner_user_id,
    contactEmail: r.contact_email,
    workingHours: r.working_hours,
    socialLinks: r.social_links,
    manageToken: r.manage_token,
    galleryKeys: jsonArray(r.gallery_keys),
    viewCount: r.view_count ?? 0,
    phoneClickCount: r.phone_click_count ?? 0,
    aiReviewSummary: r.ai_review_summary,
    aiReviewSummaryAt: r.ai_review_summary_at,
    aiReviewSummaryCount: r.ai_review_summary_count ?? 0,
    moderationStatus: r.moderation_status ?? 0,
    moderationDecisionAt: r.moderation_decision_at,
    moderationDecidedBy: r.moderation_decided_by,
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
    // A megjelenített „fő megy" = seedelt base + tényleges RSVP-k.
    going: r.going + (r.rsvp_count ?? 0),
    tag: r.tag,
    color: r.color,
    description: r.description,
    imageKey: r.image_key,
    email: r.email,
    status: r.status,
    token: r.token,
    manageToken: r.manage_token,
    moderationStatus: r.moderation_status ?? 0,
    moderationDecisionAt: r.moderation_decision_at,
    moderationDecidedBy: r.moderation_decided_by,
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
    cantonCode: r.canton_code,
    price: r.price,
    email: r.email,
    phone: r.phone,
    whatsapp: r.whatsapp,
    manageToken: r.manage_token,
    expiryWarningSent: bool(r.expiry_warning_sent),
    kind: r.kind_label
      ? { id: r.kind_id, label: r.kind_label, color: r.kind_color, sortOrder: r.kind_sort ?? 0 }
      : undefined,
  };
}

function toBulletinDraft(r: BulletinDraftRow): BulletinDraft {
  return {
    id: r.id,
    email: r.email,
    phone: r.phone,
    whatsapp: r.whatsapp,
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
    imageKey: r.image_key,
    cantonCode: r.canton_code,
    price: r.price,
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
  const where: string[] = ["COALESCE(hidden, 0) = 0"];
  const binds: unknown[] = [];

  // Publikus lista: csak admin által jóváhagyott vállalkozások.
  where.push("moderation_status = 1");

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
    .prepare("SELECT * FROM businesses WHERE id = ? AND COALESCE(hidden, 0) = 0")
    .bind(id)
    .first<BusinessRow>();
  return row ? toBusiness(row) : null;
}

/** A bejelentkezett tulajdonos vállalkozása (Clerk user_id → owner_user_id). */
export async function getBusinessByOwner(ownerUserId: string): Promise<Business | null> {
  const row = await getDB()
    .prepare("SELECT * FROM businesses WHERE owner_user_id = ? AND COALESCE(hidden, 0) = 0 LIMIT 1")
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

/** Biztonsági okokból azonnal elrejti a vállalkozást a publikum elől (DSA notice & takedown). */
export async function setBusinessHidden(id: string, hidden: boolean): Promise<void> {
  await getDB()
    .prepare("UPDATE businesses SET hidden = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(hidden ? 1 : 0, id)
    .run();
}

/** Véglegesen töröl egy vállalkozást (DSA remove action). */
export async function deleteBusinessById(id: string): Promise<void> {
  await getDB().prepare("DELETE FROM businesses WHERE id = ?").bind(id).run();
}

/**
 * R2 logó-kulcs mentése a vállalkozáshoz — CSAK a tulajdonosa hívhatja
 * sikeresen. A `WHERE id = ? AND owner_user_id = ?` szűrő miatt idegen
 * user_id-vel a sor nem érhető el, így az `UPDATE` 0 sort érint.
 */
/** Manage-token alapú logo update (email-only flow, Clerk nélkül). */
export async function setBusinessLogoByManageToken(
  manageToken: string,
  logoKey: string,
): Promise<boolean> {
  const res = await getDB()
    .prepare(
      "UPDATE businesses SET logo_key = ?, updated_at = datetime('now') WHERE manage_token = ?",
    )
    .bind(logoKey, manageToken)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

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

export interface UpdateBusinessProfileInput {
  name: string;
  phone: string | null;
  blurb: string | null;
  address: string | null;
  categoryLabel: string | null;
  openText: string | null;
  workingHours?: string | null;
  socialLinks?: string | null;
  yearsHere?: number | null;
  languages?: string[] | null;
}

export async function updateBusinessProfile(
  businessId: string,
  ownerUserId: string,
  input: UpdateBusinessProfileInput,
): Promise<boolean> {
  const res = await getDB()
    .prepare(
      `UPDATE businesses
       SET name = ?,
           phone = ?,
           blurb = ?,
           address = ?,
           category_label = ?,
           open_text = ?,
           working_hours = ?,
           social_links = ?,
           years_here = ?,
           languages = ?,
           updated_at = datetime('now')
       WHERE id = ? AND owner_user_id = ?`,
    )
    .bind(
      input.name,
      input.phone,
      input.blurb,
      input.address,
      input.categoryLabel,
      input.openText,
      input.workingHours ?? null,
      input.socialLinks ?? null,
      input.yearsHere ?? null,
      input.languages ? JSON.stringify(input.languages) : null,
      businessId,
      ownerUserId,
    )
    .run();
  return (res.meta.changes ?? 0) > 0;
}

export interface EventQuery {
  upcoming?: boolean;
  limit?: number;
}

export async function getEvents(opts: EventQuery = {}): Promise<KintiEvent[]> {
  const binds: unknown[] = [];
  const where: string[] = ["e.status = 'approved'", "e.moderation_status = 1"];
  if (opts.upcoming) {
    where.push("e.event_date >= date('now')");
  }

  let sql = `
    SELECT e.*, COALESCE(r.cnt, 0) AS rsvp_count
    FROM events e
    LEFT JOIN (
      SELECT event_id, COUNT(*) AS cnt FROM event_rsvps GROUP BY event_id
    ) r ON r.event_id = e.id`;
  if (where.length > 0) {
    sql += " WHERE " + where.join(" AND ");
  }
  sql += " ORDER BY e.event_date ASC";
  if (opts.limit) {
    sql += " LIMIT ?";
    binds.push(opts.limit);
  }
  const { results } = await getDB().prepare(sql).bind(...binds).all<EventRow>();
  return results.map(toEvent);
}

export async function createEvent(input: KintiEvent): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO events
       (id, title, event_date, date_day, date_month, date_weekday,
        start_time, venue, going, tag, color, description, image_key, email, status, token, manage_token)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.id,
      input.title,
      input.eventDate,
      input.dateDay,
      input.dateMonth,
      input.dateWeekday,
      input.startTime,
      input.venue,
      input.going,
      input.tag,
      input.color,
      input.description ?? null,
      input.imageKey ?? null,
      input.email ? input.email.toLowerCase() : null,
      input.status ?? "draft",
      input.token ?? null,
      input.manageToken ?? null,
    )
    .run();
}

export async function getEventByToken(token: string): Promise<KintiEvent | null> {
  const row = await getDB()
    .prepare("SELECT * FROM events WHERE token = ? LIMIT 1")
    .bind(token)
    .first<EventRow>();
  return row ? toEvent(row) : null;
}

export async function getEventById(id: string): Promise<KintiEvent | null> {
  const row = await getDB()
    .prepare("SELECT * FROM events WHERE id = ? LIMIT 1")
    .bind(id)
    .first<EventRow>();
  return row ? toEvent(row) : null;
}

export async function updateEventStatus(
  id: string,
  status: string,
  nextToken: string | null,
): Promise<boolean> {
  // Az új admin-moderation réteg miatt: az "approved" status automatikusan
  // moderation_status=1-et is jelent (régi email-link admin-flow kompatibilis).
  const modStatus = status === "approved" ? 1 : 0;
  const res = await getDB()
    .prepare(
      "UPDATE events SET status = ?, token = ?, moderation_status = ?, moderation_decision_at = datetime('now'), moderation_decided_by = COALESCE(moderation_decided_by, 'email-moderate-token') WHERE id = ?",
    )
    .bind(status, nextToken, modStatus, id)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const res = await getDB()
    .prepare("DELETE FROM events WHERE id = ?")
    .bind(id)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

// --- Email-only event management ------------------------------------------

export async function getEventByManageToken(token: string): Promise<KintiEvent | null> {
  const row = await getDB()
    .prepare("SELECT * FROM events WHERE manage_token = ? LIMIT 1")
    .bind(token)
    .first<EventRow>();
  return row ? toEvent(row) : null;
}

export interface UpdateEventFields {
  title?: string;
  venue?: string | null;
  description?: string | null;
  startTime?: string | null;
}

export async function updateEventByManageToken(
  token: string,
  fields: UpdateEventFields,
): Promise<boolean> {
  const sets: string[] = [];
  const values: unknown[] = [];
  const map: Record<string, string> = {
    title: "title",
    venue: "venue",
    description: "description",
    startTime: "start_time",
  };
  for (const [k, col] of Object.entries(map)) {
    const v = fields[k as keyof UpdateEventFields];
    if (v !== undefined) {
      sets.push(`${col} = ?`);
      values.push(v);
    }
  }
  if (sets.length === 0) return true;
  const sql = `UPDATE events SET ${sets.join(", ")} WHERE manage_token = ?`;
  values.push(token);
  const res = await getDB().prepare(sql).bind(...values).run();
  return (res.meta.changes ?? 0) > 0;
}

export async function deleteEventByManageToken(token: string): Promise<boolean> {
  const res = await getDB()
    .prepare("DELETE FROM events WHERE manage_token = ?")
    .bind(token)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

/**
 * „Megyek" RSVP rögzítése egy eseményre. 1 ip_hash = 1 RSVP / esemény
 * (összetett PK + INSERT OR IGNORE). Visszaadja, hogy most került-e be (added),
 * és a frissített összesített létszámot (base going + RSVP-k).
 */
export async function addEventRsvp(
  eventId: string,
  ipHash: string,
): Promise<{ ok: boolean; added: boolean; total: number }> {
  const db = getDB();
  const event = await db
    .prepare("SELECT going FROM events WHERE id = ?")
    .bind(eventId)
    .first<{ going: number }>();
  if (!event) return { ok: false, added: false, total: 0 };

  const res = await db
    .prepare(
      "INSERT OR IGNORE INTO event_rsvps (event_id, ip_hash) VALUES (?, ?)",
    )
    .bind(eventId, ipHash)
    .run();
  const added = (res.meta.changes ?? 0) > 0;

  const cntRow = await db
    .prepare("SELECT COUNT(*) AS cnt FROM event_rsvps WHERE event_id = ?")
    .bind(eventId)
    .first<{ cnt: number }>();

  return {
    ok: true,
    added,
    total: event.going + (cntRow?.cnt ?? 0),
  };
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
      AND p.hidden = 0
      AND p.moderation_status = 1
      AND (p.expires_at IS NULL OR p.expires_at > datetime('now'))`;
  if (kind && kind !== "all") {
    sql += " AND p.kind_id = ?";
    binds.push(kind);
  }
  sql += " ORDER BY COALESCE(p.published_at, p.created_at) DESC, p.id ASC";
  const { results } = await getDB().prepare(sql).bind(...binds).all<BulletinPostRow>();
  return results.map(toBulletinPost);
}

export async function listPendingBulletins(): Promise<BulletinPost[]> {
  const sql = `
    SELECT p.*, k.label AS kind_label, k.color AS kind_color, k.sort_order AS kind_sort
    FROM bulletin_posts p
    JOIN bulletin_kinds k ON k.id = p.kind_id
    WHERE p.is_pending = 1
      AND p.hidden = 0
    ORDER BY p.created_at ASC
  `;
  const { results } = await getDB().prepare(sql).all<BulletinPostRow>();
  return results.map(toBulletinPost);
}

export async function approveBulletinPost(id: string): Promise<boolean> {
  const res = await getDB()
    .prepare("UPDATE bulletin_posts SET is_pending = 0, published_at = datetime('now') WHERE id = ?")
    .bind(id)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

// ---------------------------------------------------------------------------
// Hirdetőfal — email-megerősítéses posztolás (account nélküli flow).
// ---------------------------------------------------------------------------

export interface BulletinDraftInput {
  id: string;
  email: string;
  phone: string;
  whatsapp: string;
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
  imageKey: string | null;
  cantonCode: string | null;
  price: number | null;
}

/** Új piszkozat — a kliens-form `submit`-end-pointja használja. */
export async function createBulletinDraft(input: BulletinDraftInput): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO bulletin_drafts
       (id, email, phone, whatsapp, kind_id, title, meta, body, poster,
        confirm_token, manage_token, expires_at,
        terms_version, accepted_terms_at, age_confirmed, ip_hash, image_key, canton_code, price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.id,
      input.email.toLowerCase(),
      input.phone || null,
      input.whatsapp || null,
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
      input.imageKey,
      input.cantonCode,
      input.price,
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
  /** Email opcionális — local-first módban üres string mehet. */
  email: string;
  /** Telefonszám opcionális. */
  phone: string;
  /** WhatsApp szám opcionális (ha üres, a phone-ra megy). */
  whatsapp: string;
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
  imageKey: string | null;
  cantonCode: string | null;
  price: number | null;
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
       (id, kind_id, title, meta, body, poster, email, phone, whatsapp, manage_token,
        age_text, expires_at, published_at, is_pending, created_at,
        terms_version, accepted_terms_at, age_confirmed, ip_hash, image_key, canton_code, price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'frissen', ?, datetime('now'), ?, datetime('now'),
               ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.id,
      input.kindId,
      input.title,
      input.meta,
      input.body,
      input.poster,
      input.email.toLowerCase(),
      input.phone || null,
      input.whatsapp || null,
      input.manageToken,
      input.expiresAt,
      input.isPending,
      input.termsVersion,
      input.acceptedTermsAt,
      input.ageConfirmed,
      input.ipHash,
      input.imageKey,
      input.cantonCode,
      input.price,
    )
    .run();
}

/** Publikus, nem lejárt hirdetés azonosító alapján — a megosztható mély-link oldalhoz. */
export async function getBulletinPostById(id: string): Promise<BulletinPost | null> {
  const row = await getDB()
    .prepare(
      `SELECT p.*, k.label AS kind_label, k.color AS kind_color, k.sort_order AS kind_sort
       FROM bulletin_posts p
       JOIN bulletin_kinds k ON k.id = p.kind_id
       WHERE p.id = ? AND p.is_pending = 0 AND p.hidden = 0
         AND p.moderation_status = 1
         AND (p.expires_at IS NULL OR p.expires_at > datetime('now'))`,
    )
    .bind(id)
    .first<BulletinPostRow>();
  return row ? toBulletinPost(row) : null;
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
 * Hirdetés lejárati idejét meghosszabbítja +30 nappal, és visszaállítja
 * a figyelmeztető email jelzőt (expiry_warning_sent = 0).
 * Csak a manage-token tulajdonosa hívhatja (ő kapta emailben).
 */
export async function renewBulletinPost(manageToken: string): Promise<boolean> {
  const res = await getDB()
    .prepare(
      `UPDATE bulletin_posts
       SET expires_at = datetime(expires_at, '+30 days'),
           expiry_warning_sent = 0
       WHERE manage_token = ?
         AND expires_at IS NOT NULL
         AND expires_at > datetime('now', '-7 days')`, // ne hosszabbítsuk nagyon régi lejártakat
    )
    .bind(manageToken)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

/**
 * Visszaadja azokat a publikus hirdetéseket, amelyek 3 napon belül lejárnak
 * és még nem kaptak figyelmeztetőt (expiry_warning_sent = 0).
 * A cron job használja.
 */
export interface ExpiringBulletinRow {
  id: string;
  title: string;
  email: string;
  poster: string | null;
  manage_token: string;
  expires_at: string;
}

export async function getBulletinPostsExpiringSoon(
  db: D1Database,
): Promise<ExpiringBulletinRow[]> {
  const { results } = await db
    .prepare(
      `SELECT id, title, email, poster, manage_token, expires_at
       FROM bulletin_posts
       WHERE is_pending = 0
         AND expiry_warning_sent = 0
         AND expires_at IS NOT NULL
         AND expires_at > datetime('now')
         AND expires_at <= datetime('now', '+3 days')`,
    )
    .all<ExpiringBulletinRow>();
  return results;
}

/** Megjelöli, hogy a figyelmeztető emailt elküldtük (expiry_warning_sent = 1). */
export async function markBulletinExpiryWarningSent(
  db: D1Database,
  id: string,
): Promise<void> {
  await db
    .prepare("UPDATE bulletin_posts SET expiry_warning_sent = 1 WHERE id = ?")
    .bind(id)
    .run();
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

/** Hány hirdetést (piszkozatot vagy publikáltat) adott fel ez az email vagy IP az elmúlt 24 órában. */
export async function countRecentBulletins(email: string, ipHash: string | null): Promise<number> {
  const db = getDB();
  const lowerEmail = email.toLowerCase();

  const draftsRes = await db
    .prepare(
      `SELECT COUNT(*) AS n FROM bulletin_drafts
       WHERE (lower(email) = ? OR (ip_hash IS NOT NULL AND ip_hash = ?))
         AND created_at >= datetime('now', '-24 hours')`
    )
    .bind(lowerEmail, ipHash)
    .first<{ n: number }>();

  const postsRes = await db
    .prepare(
      `SELECT COUNT(*) AS n FROM bulletin_posts
       WHERE (lower(email) = ? OR (ip_hash IS NOT NULL AND ip_hash = ?))
         AND created_at >= datetime('now', '-24 hours')`
    )
    .bind(lowerEmail, ipHash)
    .first<{ n: number }>();

  const draftsCount = draftsRes?.n ?? 0;
  const postsCount = postsRes?.n ?? 0;

  return draftsCount + postsCount;
}

/**
 * Hány kapcsolatfelvételi üzenetet küldött ez az IP az elmúlt 1 órában.
 * Limit: 5 / IP / óra — véd a spam-ágyú botok ellen.
 */
export async function countRecentContacts(ipHash: string | null): Promise<number> {
  if (!ipHash) return 0; // localhost / ismeretlen IP → átengedünk
  const res = await getDB()
    .prepare(
      `SELECT COUNT(*) AS n FROM bulletin_contact_log
       WHERE ip_hash = ? AND created_at >= datetime('now', '-1 hours')`,
    )
    .bind(ipHash)
    .first<{ n: number }>();
  return res?.n ?? 0;
}

/** Kontakt-eseményt rögzít a rate-limit táblába. */
export async function logContactAttempt(
  id: string,
  postId: string,
  ipHash: string | null,
): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO bulletin_contact_log (id, post_id, ip_hash) VALUES (?, ?, ?)`,
    )
    .bind(id, postId, ipHash)
    .run();
}

/**
 * Hány eseményt küldött be ez az IP az elmúlt 24 órában.
 * Limit: 3 / IP / 24 óra — véd a spam-beküldők ellen.
 */
export async function countRecentEventSubmits(ipHash: string | null): Promise<number> {
  if (!ipHash) return 0; // localhost / ismeretlen IP → átengedünk
  const res = await getDB()
    .prepare(
      `SELECT COUNT(*) AS n FROM event_submit_log
       WHERE ip_hash = ? AND created_at >= datetime('now', '-24 hours')`,
    )
    .bind(ipHash)
    .first<{ n: number }>();
  return res?.n ?? 0;
}

/** Esemény-beküldést rögzít a rate-limit táblába. */
export async function logEventSubmit(
  id: string,
  ipHash: string | null,
): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO event_submit_log (id, ip_hash) VALUES (?, ?)`,
    )
    .bind(id, ipHash)
    .run();
}

/** Hány beküldést adott fel ez az IP az elmúlt 24 órában (rate-limit). */
export async function countRecentRideSubmits(ipHash: string | null): Promise<number> {
  if (!ipHash) return 0;
  const res = await getDB()
    .prepare(
      `SELECT COUNT(*) AS n FROM ride_submit_log
       WHERE ip_hash = ? AND created_at >= datetime('now', '-24 hours')`,
    )
    .bind(ipHash)
    .first<{ n: number }>();
  return res?.n ?? 0;
}

/** Beküldést rögzít a rate-limit táblába. */
export async function logRideSubmit(id: string, ipHash: string | null): Promise<void> {
  await getDB()
    .prepare(`INSERT INTO ride_submit_log (id, ip_hash) VALUES (?, ?)`)
    .bind(id, ipHash)
    .run();
}

/**
 * Generikus spam-log countolás IP-hash-re az utolsó N percből.
 * @param kind  pl. 'quote' | 'rating' | 'digest'
 * @param ipHash a kérés SHA-256(IP)-je
 * @param windowMinutes default 60
 */
export async function countRecentSpamLog(
  kind: string,
  ipHash: string | null,
  windowMinutes: number = 60,
): Promise<number> {
  if (!ipHash) return 0;
  const res = await getDB()
    .prepare(
      `SELECT COUNT(*) AS n FROM spam_log
       WHERE kind = ? AND ip_hash = ?
         AND created_at >= datetime('now', ? )`,
    )
    .bind(kind, ipHash, `-${Math.max(1, windowMinutes)} minutes`)
    .first<{ n: number }>();
  return res?.n ?? 0;
}

/** Generikus spam-log insert — fire-and-forget. */
export async function logSpamSubmit(kind: string, ipHash: string | null): Promise<void> {
  await getDB()
    .prepare(`INSERT INTO spam_log (id, kind, ip_hash) VALUES (?, ?, ?)`)
    .bind(crypto.randomUUID(), kind, ipHash)
    .run();
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
  owner_response: string | null;
  owner_responded_at: string | null;
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
    ownerResponse: r.owner_response ?? null,
    ownerRespondedAt: r.owner_responded_at ?? null,
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
              manage_token, email, owner_response, owner_responded_at
       FROM reviews WHERE business_id = ? AND hidden = 0 AND moderation_status = 1
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
       FROM reviews WHERE business_id = ? AND hidden = 0`,
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

// ---------------------------------------------------------------------------
// Self-service vállalkozás-beküldés (account nélkül, email-megerősítéssel).
// ---------------------------------------------------------------------------

interface BusinessSubmissionRow {
  id: string;
  name: string;
  category_id: string;
  category_label: string | null;
  address: string | null;
  canton_code: string;
  phone: string | null;
  email: string;
  blurb: string | null;
  license_number: string | null;
  confirm_token: string;
  expires_at: string;
  created_at: string;
  terms_version: string | null;
  accepted_terms_at: string | null;
  age_confirmed: number;
  owner_user_id: string | null;
  manage_token: string | null;
  ip_hash: string | null;
}

export interface BusinessSubmission {
  id: string;
  name: string;
  categoryId: string;
  categoryLabel: string | null;
  address: string | null;
  cantonCode: string;
  phone: string | null;
  email: string;
  blurb: string | null;
  licenseNumber: string | null;
  ownerUserId: string | null;
  manageToken: string | null;
  confirmToken: string;
  expiresAt: string;
}

function toBusinessSubmission(r: BusinessSubmissionRow): BusinessSubmission {
  return {
    id: r.id,
    name: r.name,
    categoryId: r.category_id,
    categoryLabel: r.category_label,
    address: r.address,
    cantonCode: r.canton_code,
    phone: r.phone,
    email: r.email,
    blurb: r.blurb,
    licenseNumber: r.license_number,
    ownerUserId: r.owner_user_id,
    manageToken: r.manage_token,
    confirmToken: r.confirm_token,
    expiresAt: r.expires_at,
  };
}

export interface BusinessSubmissionInput {
  id: string;
  name: string;
  categoryId: string;
  categoryLabel: string | null;
  address: string | null;
  cantonCode: string;
  phone: string | null;
  email: string;
  blurb: string | null;
  licenseNumber: string | null;
  confirmToken: string;
  expiresAt: string;
  termsVersion: string;
  acceptedTermsAt: string;
  ageConfirmed: number;
  ipHash: string | null;
  ownerUserId: string | null;
  manageToken: string;
}

export async function createBusinessSubmission(input: BusinessSubmissionInput): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO business_submissions
       (id, name, category_id, category_label, address, canton_code, phone, email, blurb,
        license_number, confirm_token, expires_at, terms_version, accepted_terms_at, age_confirmed, ip_hash,
        owner_user_id, manage_token)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.id,
      input.name,
      input.categoryId,
      input.categoryLabel,
      input.address,
      input.cantonCode,
      input.phone,
      input.email.toLowerCase(),
      input.blurb,
      input.licenseNumber,
      input.confirmToken,
      input.expiresAt,
      input.termsVersion,
      input.acceptedTermsAt,
      input.ageConfirmed,
      input.ipHash,
      input.ownerUserId,
      input.manageToken,
    )
    .run();
}

/** Confirm-token alapján — csak ha még nem járt le. */
export async function getBusinessSubmissionByConfirmToken(
  confirmToken: string,
): Promise<BusinessSubmission | null> {
  const row = await getDB()
    .prepare(
      `SELECT * FROM business_submissions
       WHERE confirm_token = ? AND expires_at > datetime('now')`,
    )
    .bind(confirmToken)
    .first<BusinessSubmissionRow>();
  return row ? toBusinessSubmission(row) : null;
}

/**
 * Manage-token alapján — a confirm ELŐTTI piszkozat. Akkor jön kapóra, ha a
 * feladó a confirm-link helyett (vagy mellette) először a kezelő-linkre kattint,
 * mielőtt megerősítette volna az e-mailt → tudjuk magyarázni, hogy "először
 * confirmálj".
 */
export async function getBusinessSubmissionByManageToken(
  manageToken: string,
): Promise<BusinessSubmission | null> {
  const row = await getDB()
    .prepare(
      `SELECT * FROM business_submissions
       WHERE manage_token = ? AND expires_at > datetime('now')`,
    )
    .bind(manageToken)
    .first<BusinessSubmissionRow>();
  return row ? toBusinessSubmission(row) : null;
}

export async function deleteBusinessSubmission(id: string): Promise<void> {
  await getDB().prepare("DELETE FROM business_submissions WHERE id = ?").bind(id).run();
}

/** Lejárt (nem megerősített) beküldések takarítása (cron / lazy). */
export async function purgeExpiredBusinessSubmissions(): Promise<number> {
  const res = await getDB()
    .prepare("DELETE FROM business_submissions WHERE expires_at <= datetime('now')")
    .run();
  return res.meta.changes ?? 0;
}

/** Hány vállalkozást küldött be ez az email vagy IP az elmúlt 24 órában. */
export async function countRecentBusinessSubmissions(
  email: string,
  ipHash: string | null,
): Promise<number> {
  const res = await getDB()
    .prepare(
      `SELECT COUNT(*) AS n FROM business_submissions
       WHERE (lower(email) = ? OR (ip_hash IS NOT NULL AND ip_hash = ?))
         AND created_at >= datetime('now', '-24 hours')`,
    )
    .bind(email.toLowerCase(), ipHash)
    .first<{ n: number }>();
  return res?.n ?? 0;
}

export interface CreateBusinessFromSubmissionInput {
  id: string;
  name: string;
  categoryId: string;
  categoryLabel: string | null;
  address: string | null;
  phone: string | null;
  blurb: string | null;
  licenseNumber: string | null;
  contactEmail: string;
  lat: number | null;
  lng: number | null;
  ownerUserId: string | null;
  manageToken: string;
}

/**
 * A megerősített beküldésből publikus businesses-rekord. Azonnal él (nincs
 * kézi jóváhagyás). A `source='self_submitted'` jelöli az eredetét, a
 * `contact_email` NEM publikus (admin/jövőbeni claimhez tartjuk).
 * Ha `ownerUserId` adott (a beküldést belépett vállalkozó indította), egyből
 * a Clerk userhez kötjük a vállalkozást — nincs külön igénylési lépés.
 */
export async function createBusinessFromSubmission(
  input: CreateBusinessFromSubmissionInput,
): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO businesses
       (id, name, category_id, category_label, address, phone, blurb, license_number,
        contact_email, source, languages, lat, lng, pin_x, pin_y,
        rating, reviews, featured, open_now, owner_user_id, manage_token)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'self_submitted', '["Magyar"]', ?, ?, 50, 50, 0, 0, 0, 0, ?, ?)`,
    )
    .bind(
      input.id,
      input.name,
      input.categoryId,
      input.categoryLabel,
      input.address,
      input.phone,
      input.blurb,
      input.licenseNumber,
      input.contactEmail.toLowerCase(),
      input.lat,
      input.lng,
      input.ownerUserId,
      input.manageToken,
    )
    .run();
}

/**
 * Inline draft: a /profil onboarding form közvetlenül létrehoz egy publikus
 * businesses-rekordot a belépett Clerk userhez (email-megerősítés NÉLKÜL, mert
 * a Clerk már verifikálta). A részleteket utána a ProfileEditor-rel állítja be.
 * Ha a usernek már van vállalkozása, a meglévőt adjuk vissza.
 */
export async function createOwnerDraftBusiness(input: {
  id: string;
  name: string;
  categoryId: string;
  cantonCode: string;
  contactEmail: string;
  lat: number | null;
  lng: number | null;
  ownerUserId: string;
  manageToken: string;
}): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO businesses
       (id, name, category_id, category_label, address, phone, blurb,
        contact_email, source, languages, lat, lng, pin_x, pin_y,
        rating, reviews, featured, open_now, owner_user_id, manage_token)
       VALUES (?, ?, ?, NULL, NULL, NULL, NULL,
        ?, 'owner_draft', '["Magyar"]', ?, ?, 50, 50, 0, 0, 0, 0, ?, ?)`,
    )
    .bind(
      input.id,
      input.name,
      input.categoryId,
      input.contactEmail.toLowerCase(),
      input.lat,
      input.lng,
      input.ownerUserId,
      input.manageToken,
    )
    .run();
}

/**
 * Email-only business management: a feladó a manage_token-nel azonosítja magát.
 * GET → adatok visszaolvasása; PATCH-szerű mezőnként.
 */
export async function getBusinessByManageToken(token: string): Promise<Business | null> {
  const row = await getDB()
    .prepare("SELECT * FROM businesses WHERE manage_token = ? LIMIT 1")
    .bind(token)
    .first<BusinessRow>();
  return row ? toBusiness(row) : null;
}

export interface UpdateBusinessFields {
  name?: string;
  categoryLabel?: string | null;
  address?: string | null;
  phone?: string | null;
  blurb?: string | null;
  openText?: string | null;
  workingHours?: string | null;
  socialLinks?: string | null;
  languages?: string[] | null;
}

export async function updateBusinessByManageToken(
  token: string,
  fields: UpdateBusinessFields,
): Promise<boolean> {
  const sets: string[] = [];
  const values: unknown[] = [];
  const map: Record<string, string> = {
    name: "name",
    categoryLabel: "category_label",
    address: "address",
    phone: "phone",
    blurb: "blurb",
    openText: "open_text",
    workingHours: "working_hours",
    socialLinks: "social_links",
  };
  for (const [k, col] of Object.entries(map)) {
    const v = fields[k as keyof UpdateBusinessFields];
    if (v !== undefined) {
      sets.push(`${col} = ?`);
      values.push(v as string | null);
    }
  }
  if (fields.languages !== undefined) {
    sets.push("languages = ?");
    values.push(fields.languages ? JSON.stringify(fields.languages) : null);
  }
  if (sets.length === 0) return true;

  // Tartalom-érzékeny mezők frissítésekor (név, leírás, kategória, cím) a
  // korábbi admin-hitelesítést revoke-oljuk — az admin-nak újra kell ellenőriznie
  // a változott profilt. Ezzel megakadályozzuk hogy egy hiteles vállalkozó
  // profil-frissítés ürügyén beillesszen tisztességtelen tartalmat.
  const contentSensitive: (keyof UpdateBusinessFields)[] = [
    "name",
    "blurb",
    "categoryLabel",
    "address",
  ];
  if (contentSensitive.some((k) => fields[k] !== undefined)) {
    sets.push("verified = 0");
  }

  sets.push("updated_at = datetime('now')");
  const sql = `UPDATE businesses SET ${sets.join(", ")} WHERE manage_token = ?`;
  values.push(token);
  const res = await getDB().prepare(sql).bind(...values).run();
  return (res.meta.changes ?? 0) > 0;
}

export async function deleteBusinessByManageToken(token: string): Promise<boolean> {
  const db = getDB();
  const biz = await db
    .prepare("SELECT id FROM businesses WHERE manage_token = ?")
    .bind(token)
    .first<{ id: string }>();
  if (!biz) return false;
  await db.prepare("DELETE FROM reviews WHERE business_id = ?").bind(biz.id).run();
  const res = await db.prepare("DELETE FROM businesses WHERE id = ?").bind(biz.id).run();
  return (res.meta.changes ?? 0) > 0;
}

// ---------------------------------------------------------------------------
// Web Push feliratkozások
// ---------------------------------------------------------------------------

export interface PushSubscriptionRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  canton_code: string | null;
}

export interface SavePushSubscriptionInput {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  cantonCode: string | null;
}

/** Feliratkozás mentése — endpoint UNIQUE, ismétléskor frissítjük a kantont/kulcsokat. */
export async function savePushSubscription(input: SavePushSubscriptionInput): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO push_subscriptions (id, endpoint, p256dh, auth, canton_code)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(endpoint) DO UPDATE SET
         p256dh = excluded.p256dh,
         auth = excluded.auth,
         canton_code = excluded.canton_code`,
    )
    .bind(input.id, input.endpoint, input.p256dh, input.auth, input.cantonCode)
    .run();
}

export async function deletePushSubscription(endpoint: string): Promise<void> {
  await getDB()
    .prepare("DELETE FROM push_subscriptions WHERE endpoint = ?")
    .bind(endpoint)
    .run();
}

/**
 * Célzott feliratkozók. Ha `cantonCode` adott: az adott kanton + a „minden
 * Svájc" (NULL) feliratkozói. Ha nincs (broadcast): mindenki.
 */
export async function listPushSubscriptions(
  cantonCode?: string | null,
): Promise<PushSubscriptionRow[]> {
  if (cantonCode) {
    const { results } = await getDB()
      .prepare(
        "SELECT * FROM push_subscriptions WHERE canton_code = ? OR canton_code IS NULL",
      )
      .bind(cantonCode)
      .all<PushSubscriptionRow>();
    return results;
  }
  const { results } = await getDB()
    .prepare("SELECT * FROM push_subscriptions")
    .all<PushSubscriptionRow>();
  return results;
}

// ---------------------------------------------------------------------------
// Jelentés (Notice & Takedown) — hirdetések + vélemények elrejtése/törlése
// ---------------------------------------------------------------------------

/** Hirdetés elrejtése/visszaállítása. Visszaadja, érintett-e sort. */
export async function setBulletinHidden(id: string, hidden: boolean): Promise<boolean> {
  const res = await getDB()
    .prepare("UPDATE bulletin_posts SET hidden = ? WHERE id = ?")
    .bind(hidden ? 1 : 0, id)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

/** Vélemény elrejtése/visszaállítása. Visszaadja a business_id-t (rating újraszámoláshoz). */
export async function setReviewHidden(id: string, hidden: boolean): Promise<string | null> {
  const row = await getDB()
    .prepare("SELECT business_id FROM reviews WHERE id = ?")
    .bind(id)
    .first<{ business_id: string }>();
  if (!row) return null;
  await getDB()
    .prepare("UPDATE reviews SET hidden = ? WHERE id = ?")
    .bind(hidden ? 1 : 0, id)
    .run();
  return row.business_id;
}

export async function deleteBulletinPostById(id: string): Promise<boolean> {
  const res = await getDB()
    .prepare("DELETE FROM bulletin_posts WHERE id = ?")
    .bind(id)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

/** Vélemény törlése id alapján. Visszaadja a business_id-t (rating újraszámoláshoz). */
export async function deleteReviewById(id: string): Promise<string | null> {
  const row = await getDB()
    .prepare("SELECT business_id FROM reviews WHERE id = ?")
    .bind(id)
    .first<{ business_id: string }>();
  if (!row) return null;
  await getDB().prepare("DELETE FROM reviews WHERE id = ?").bind(id).run();
  return row.business_id;
}

/** Rövid összegző egy véleményről (a jelentő-emailhez + létezés-ellenőrzéshez). */
export async function getReviewSummaryById(
  id: string,
): Promise<{ id: string; businessId: string; reviewerName: string; body: string } | null> {
  const row = await getDB()
    .prepare("SELECT id, business_id, reviewer_name, body FROM reviews WHERE id = ? AND hidden = 0")
    .bind(id)
    .first<{ id: string; business_id: string; reviewer_name: string; body: string }>();
  if (!row) return null;
  return { id: row.id, businessId: row.business_id, reviewerName: row.reviewer_name, body: row.body };
}

export interface ContentReportInput {
  id: string;
  contentType: "business" | "bulletin" | "review" | "sos";
  contentId: string;
  reason: string | null;
  reporterIpHash: string | null;
  moderateToken: string;
}

export async function createContentReport(input: ContentReportInput): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO content_reports
       (id, content_type, content_id, reason, reporter_ip_hash, moderate_token)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.id,
      input.contentType,
      input.contentId,
      input.reason,
      input.reporterIpHash,
      input.moderateToken,
    )
    .run();
}

export interface ContentReport {
  id: string;
  contentType: "business" | "bulletin" | "review" | "sos";
  contentId: string;
  status: string;
}

export async function getContentReportByToken(token: string): Promise<ContentReport | null> {
  const row = await getDB()
    .prepare("SELECT id, content_type, content_id, status FROM content_reports WHERE moderate_token = ?")
    .bind(token)
    .first<{ id: string; content_type: string; content_id: string; status: string }>();
  if (!row) return null;
  return {
    id: row.id,
    contentType: row.content_type as "business" | "bulletin" | "review" | "sos",
    contentId: row.content_id,
    status: row.status,
  };
}

export async function updateContentReportStatus(token: string, status: string): Promise<void> {
  await getDB()
    .prepare("UPDATE content_reports SET status = ? WHERE moderate_token = ?")
    .bind(status, token)
    .run();
}

/**
 * A vállalkozó (tulajdonos) válasza egy véleményre. Csak akkor ír, ha a megadott
 * userId tényleg a kérdéses vélemény vállalkozásának tulajdonosa. Visszaadja,
 * hogy érintett-e sort.
 */
export async function setReviewOwnerResponse(
  reviewId: string,
  ownerUserId: string,
  response: string | null,
): Promise<boolean> {
  // SQL-szintű tulajdonos-ellenőrzés: csak akkor ír, ha létezik a businesses
  // sor a review business_id-jával és a megadott owner_user_id-vel.
  const res = await getDB()
    .prepare(
      `UPDATE reviews
       SET owner_response = ?, owner_responded_at = CASE WHEN ? IS NULL THEN NULL ELSE datetime('now') END
       WHERE id = ? AND business_id IN (
         SELECT id FROM businesses WHERE owner_user_id = ?
       )`,
    )
    .bind(response, response, reviewId, ownerUserId)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

/** Hány jelentés érkezett erről az IP-ről az elmúlt 1 órában (abuse-szűrés). */
export async function countRecentReports(ipHash: string | null): Promise<number> {
  if (!ipHash) return 0;
  const res = await getDB()
    .prepare(
      `SELECT COUNT(*) AS n FROM content_reports
       WHERE reporter_ip_hash = ? AND created_at >= datetime('now', '-1 hours')`,
    )
    .bind(ipHash)
    .first<{ n: number }>();
  return res?.n ?? 0;
}



export async function updateBusinessLogo(id: string, key: string): Promise<boolean> {
  const res = await getDB().prepare("UPDATE businesses SET logo_key = ? WHERE id = ?").bind(key, id).run();
  return res.success;
}

export async function addBusinessGalleryKey(id: string, key: string): Promise<boolean> {
  const db = getDB();
  const business = await db.prepare("SELECT gallery_keys FROM businesses WHERE id = ?").bind(id).first<{ gallery_keys: string | null }>();
  if (!business) return false;
  
  const currentKeys = jsonArray(business.gallery_keys);
  currentKeys.push(key);
  
  const res = await db.prepare("UPDATE businesses SET gallery_keys = ? WHERE id = ?").bind(JSON.stringify(currentKeys), id).run();
  return res.success;
}

export async function removeBusinessGalleryKey(id: string, key: string): Promise<boolean> {
  const db = getDB();
  const business = await db.prepare("SELECT gallery_keys FROM businesses WHERE id = ?").bind(id).first<{ gallery_keys: string | null }>();
  if (!business) return false;
  
  const currentKeys = jsonArray(business.gallery_keys);
  const newKeys = currentKeys.filter(k => k !== key);
  
  const res = await db.prepare("UPDATE businesses SET gallery_keys = ? WHERE id = ?").bind(JSON.stringify(newKeys), id).run();
  return res.success;
}

// ---------------------------------------------------------------------------
// Heti email-digest feliratkozók
// ---------------------------------------------------------------------------

export interface DigestSubscriberRow {
  id: string;
  email: string;
  canton_code: string | null;
  confirmed: number;
  confirm_token: string | null;
  unsubscribe_token: string;
  terms_version: string | null;
  accepted_terms_at: string | null;
  ip_hash: string | null;
  created_at: string;
  last_sent_at: string | null;
}

export interface CreateDigestSubscriberInput {
  id: string;
  email: string;
  cantonCode: string | null;
  confirmToken: string;
  unsubscribeToken: string;
  termsVersion: string;
  acceptedTermsAt: string;
  ipHash: string | null;
}

/** Új feliratkozó (confirmed=0). Ha már létezik az email, az új tokenekkel és kantonnal frissül. */
export async function createDigestSubscriber(input: CreateDigestSubscriberInput): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO digest_subscribers
       (id, email, canton_code, confirm_token, unsubscribe_token,
        terms_version, accepted_terms_at, ip_hash, confirmed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
       ON CONFLICT(email) DO UPDATE SET
         canton_code = excluded.canton_code,
         confirm_token = excluded.confirm_token,
         unsubscribe_token = excluded.unsubscribe_token,
         terms_version = excluded.terms_version,
         accepted_terms_at = excluded.accepted_terms_at,
         ip_hash = excluded.ip_hash,
         confirmed = 0`,
    )
    .bind(
      input.id,
      input.email.toLowerCase(),
      input.cantonCode,
      input.confirmToken,
      input.unsubscribeToken,
      input.termsVersion,
      input.acceptedTermsAt,
      input.ipHash,
    )
    .run();
}

export async function confirmDigestSubscriber(confirmToken: string): Promise<boolean> {
  const res = await getDB()
    .prepare(
      "UPDATE digest_subscribers SET confirmed = 1, confirm_token = NULL WHERE confirm_token = ?",
    )
    .bind(confirmToken)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

export async function deleteDigestSubscriberByUnsubToken(token: string): Promise<boolean> {
  const res = await getDB()
    .prepare("DELETE FROM digest_subscribers WHERE unsubscribe_token = ?")
    .bind(token)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

// ---------------------------------------------------------------------------
// Admin dashboard segédfüggvények
// ---------------------------------------------------------------------------

/** "Verified Hungarian-speaking" jelvény kapcsolása (admin). */
export async function setBusinessVerified(id: string, verified: boolean): Promise<boolean> {
  const res = await getDB()
    .prepare("UPDATE businesses SET verified = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(verified ? 1 : 0, id)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

export interface OpenReport {
  id: string;
  contentType: "bulletin" | "review" | "sos";
  contentId: string;
  reason: string | null;
  moderateToken: string;
  createdAt: string;
  excerpt: string | null;
}

export async function listOpenReports(): Promise<OpenReport[]> {
  const db = getDB();
  const { results } = await db
    .prepare(
      `SELECT id, content_type, content_id, reason, moderate_token, created_at
       FROM content_reports WHERE status = 'open'
       ORDER BY created_at DESC LIMIT 100`,
    )
    .all<{
      id: string; content_type: string; content_id: string;
      reason: string | null; moderate_token: string; created_at: string;
    }>();

  const out: OpenReport[] = [];
  for (const r of results) {
    let excerpt: string | null = null;
    let contentExists = false;
    if (r.content_type === "bulletin") {
      const row = await db.prepare("SELECT title FROM bulletin_posts WHERE id = ?").bind(r.content_id).first<{ title: string }>();
      excerpt = row?.title ?? null;
      contentExists = !!row;
    } else if (r.content_type === "review") {
      const row = await db.prepare("SELECT reviewer_name, body FROM reviews WHERE id = ?").bind(r.content_id).first<{ reviewer_name: string; body: string }>();
      excerpt = row ? `${row.reviewer_name}: ${row.body.slice(0, 100)}` : null;
      contentExists = !!row;
    } else if (r.content_type === "business") {
      const row = await db.prepare("SELECT name FROM businesses WHERE id = ?").bind(r.content_id).first<{ name: string }>();
      excerpt = row?.name ?? null;
      contentExists = !!row;
    } else if (r.content_type === "sos") {
      const row = await db.prepare("SELECT id FROM sos_alerts WHERE id = ?").bind(r.content_id).first<{ id: string }>();
      contentExists = !!row;
    } else {
      // Ismeretlen content_type → kihagyjuk (és lezárjuk a jelentést, lásd lent).
      contentExists = false;
    }

    // Orphan-cleanup: ha a hivatkozott tartalom már nem létezik (admin törölte,
    // vagy a feladó visszavonta), a jelentést automatikusan `dismissed`-re
    // állítjuk és NEM jelenítjük meg az admin-listán.
    if (!contentExists) {
      await db
        .prepare("UPDATE content_reports SET status = 'dismissed' WHERE id = ?")
        .bind(r.id)
        .run();
      continue;
    }

    out.push({
      id: r.id,
      contentType: r.content_type as OpenReport["contentType"],
      contentId: r.content_id,
      reason: r.reason,
      moderateToken: r.moderate_token,
      createdAt: r.created_at,
      excerpt,
    });
  }
  return out;
}

export interface PendingEvent {
  id: string;
  title: string;
  eventDate: string | null;
  startTime: string | null;
  venue: string | null;
  submitterEmail: string | null;
  token: string | null;
  createdAt: string;
}

export async function listPendingEvents(): Promise<PendingEvent[]> {
  const { results } = await getDB()
    .prepare(
      `SELECT id, title, event_date, start_time, venue, email, token, created_at
       FROM events WHERE status = 'pending_admin'
       ORDER BY created_at DESC LIMIT 50`,
    )
    .all<{
      id: string; title: string; event_date: string | null;
      start_time: string | null; venue: string | null;
      email: string | null; token: string | null; created_at: string;
    }>();
  return results.map((r) => ({
    id: r.id, title: r.title, eventDate: r.event_date, startTime: r.start_time,
    venue: r.venue, submitterEmail: r.email, token: r.token, createdAt: r.created_at,
  }));
}

export interface AdminBusinessRow {
  id: string;
  name: string;
  categoryLabel: string | null;
  verified: boolean;
  rating: number;
  reviews: number;
  source: string | null;
  createdAt: string;
  /** Manage URL token-je — az admin "kezelő-link másolása" funkcióhoz. */
  manageToken: string | null;
}

export async function listBusinessesForAdmin(): Promise<AdminBusinessRow[]> {
  const { results } = await getDB()
    .prepare(
      `SELECT id, name, category_label, verified, rating, reviews, source, created_at, manage_token
       FROM businesses
       ORDER BY verified DESC, created_at DESC LIMIT 100`,
    )
    .all<{
      id: string; name: string; category_label: string | null;
      verified: number; rating: number; reviews: number;
      source: string | null; created_at: string; manage_token: string | null;
    }>();
  return results.map((r) => ({
    id: r.id, name: r.name, categoryLabel: r.category_label,
    verified: r.verified === 1, rating: r.rating, reviews: r.reviews,
    source: r.source, createdAt: r.created_at, manageToken: r.manage_token,
  }));
}

// --- Admin: tartalom-listák (törléshez) ------------------------------------

export interface AdminContentRow {
  id: string;
  title: string;
  meta: string | null;
  createdAt: string | null;
  /** Manage URL token-je — az admin "kezelő-link másolása" funkcióhoz. */
  manageToken: string | null;
}

export async function listBulletinsForAdmin(): Promise<AdminContentRow[]> {
  const { results } = await getDB()
    .prepare(
      `SELECT id, title, kind_id, canton_code, created_at, manage_token
       FROM bulletin_posts
       ORDER BY created_at DESC LIMIT 200`,
    )
    .all<{ id: string; title: string; kind_id: string; canton_code: string | null; created_at: string; manage_token: string | null }>();
  return results.map((r) => ({
    id: r.id,
    title: r.title,
    meta: `${r.kind_id}${r.canton_code ? " · " + r.canton_code : ""}`,
    createdAt: r.created_at,
    manageToken: r.manage_token,
  }));
}

export async function listEventsForAdmin(): Promise<AdminContentRow[]> {
  const { results } = await getDB()
    .prepare(
      `SELECT id, title, event_date, venue, status, created_at, manage_token
       FROM events
       ORDER BY created_at DESC LIMIT 200`,
    )
    .all<{ id: string; title: string; event_date: string | null; venue: string | null; status: string | null; created_at: string; manage_token: string | null }>();
  return results.map((r) => ({
    id: r.id,
    title: r.title,
    meta: `${r.status ?? "?"}${r.event_date ? " · " + r.event_date : ""}${r.venue ? " · " + r.venue : ""}`,
    createdAt: r.created_at,
    manageToken: r.manage_token,
  }));
}



/** Admin-törlés: vállalkozás + a hozzá tartozó vélemények cascade. */
export async function deleteBusinessAsAdmin(id: string): Promise<boolean> {
  const db = getDB();
  await db.prepare("DELETE FROM reviews WHERE business_id = ?").bind(id).run();
  const res = await db.prepare("DELETE FROM businesses WHERE id = ?").bind(id).run();
  return (res.meta.changes ?? 0) > 0;
}

export interface AdminStats {
  businesses: number;
  businessesVerified: number;
  bulletinsActive: number;
  eventsApproved: number;
  reviews: number;
  digestSubscribersConfirmed: number;
  pushSubscriptions: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const db = getDB();
  const q = (sql: string) => db.prepare(sql).first<{ n: number }>();
  // A digest_subscribers tábla DROP-pelve (0033) — már nincs lekérdezve.
  const [
    businesses, verified, bulletins, events, reviews, push,
  ] = await Promise.all([
    q("SELECT COUNT(*) AS n FROM businesses"),
    q("SELECT COUNT(*) AS n FROM businesses WHERE verified = 1"),
    q("SELECT COUNT(*) AS n FROM bulletin_posts WHERE is_pending = 0 AND hidden = 0 AND (expires_at IS NULL OR expires_at > datetime('now'))"),
    q("SELECT COUNT(*) AS n FROM events WHERE status = 'approved'"),
    q("SELECT COUNT(*) AS n FROM reviews WHERE hidden = 0"),
    q("SELECT COUNT(*) AS n FROM push_subscriptions"),
  ]);
  return {
    businesses: businesses?.n ?? 0,
    businessesVerified: verified?.n ?? 0,
    bulletinsActive: bulletins?.n ?? 0,
    eventsApproved: events?.n ?? 0,
    reviews: reviews?.n ?? 0,
    digestSubscribersConfirmed: 0,
    pushSubscriptions: push?.n ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Spontán mikro-események (spontaneous_meetups) — 24-48h TTL
// ---------------------------------------------------------------------------

export interface Spontaneous {
  id: string;
  title: string;
  locationName: string;
  cantonCode: string | null;
  lat: number | null;
  lng: number | null;
  meetupTime: string;
  maxPeople: number;
  contactPhone: string;
  contactWhatsapp: string | null;
  poster: string | null;
  notes: string | null;
  manageToken: string | null;
  createdAt: string;
  expiresAt: string;
}

/** Publikus változat — manage_token nélkül. */
export type PublicSpontaneous = Omit<Spontaneous, "manageToken">;

interface SpontaneousRow {
  id: string;
  title: string;
  location_name: string;
  canton_code: string | null;
  lat: number | null;
  lng: number | null;
  meetup_time: string;
  max_people: number;
  contact_phone: string;
  contact_whatsapp: string | null;
  poster: string | null;
  notes: string | null;
  manage_token: string | null;
  created_at: string;
  expires_at: string;
}

function toSpontaneous(r: SpontaneousRow): Spontaneous {
  return {
    id: r.id,
    title: r.title,
    locationName: r.location_name,
    cantonCode: r.canton_code,
    lat: r.lat,
    lng: r.lng,
    meetupTime: r.meetup_time,
    maxPeople: r.max_people,
    contactPhone: r.contact_phone,
    contactWhatsapp: r.contact_whatsapp,
    poster: r.poster,
    notes: r.notes,
    manageToken: r.manage_token,
    createdAt: r.created_at,
    expiresAt: r.expires_at,
  };
}

export function toPublicSpontaneous(s: Spontaneous): PublicSpontaneous {
  const { manageToken: _omit, ...pub } = s;
  void _omit;
  return pub;
}

export interface CreateSpontaneousInput {
  id: string;
  title: string;
  locationName: string;
  cantonCode: string | null;
  lat: number | null;
  lng: number | null;
  meetupTime: string;
  maxPeople: number;
  contactPhone: string;
  contactWhatsapp: string | null;
  poster: string | null;
  notes: string | null;
  manageToken: string;
  expiresAt: string;
  ipHash: string | null;
}

export async function createSpontaneous(input: CreateSpontaneousInput): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO spontaneous_meetups
       (id, title, location_name, canton_code, lat, lng, meetup_time, max_people,
        contact_phone, contact_whatsapp, poster, notes, manage_token, ip_hash, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.id,
      input.title,
      input.locationName,
      input.cantonCode,
      input.lat,
      input.lng,
      input.meetupTime,
      input.maxPeople,
      input.contactPhone,
      input.contactWhatsapp,
      input.poster,
      input.notes,
      input.manageToken,
      input.ipHash,
      input.expiresAt,
    )
    .run();
}

/** Aktív (nem lejárt) spontán meetup-ok, meetup_time szerint emelkedő. */
export async function getActiveSpontaneous(): Promise<PublicSpontaneous[]> {
  const { results } = await getDB()
    .prepare(
      `SELECT * FROM spontaneous_meetups
       WHERE expires_at > datetime('now')
       ORDER BY meetup_time ASC`,
    )
    .all<SpontaneousRow>();
  return results.map(toSpontaneous).map(toPublicSpontaneous);
}

export async function getSpontaneousByManageToken(token: string): Promise<Spontaneous | null> {
  const row = await getDB()
    .prepare("SELECT * FROM spontaneous_meetups WHERE manage_token = ?")
    .bind(token)
    .first<SpontaneousRow>();
  return row ? toSpontaneous(row) : null;
}

export async function deleteSpontaneousByManageToken(token: string): Promise<boolean> {
  const res = await getDB()
    .prepare("DELETE FROM spontaneous_meetups WHERE manage_token = ?")
    .bind(token)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

/** Cron / purge: lejárt spontán meetup-ok takarítása. */
export async function purgeExpiredSpontaneous(): Promise<number> {
  const res = await getDB()
    .prepare("DELETE FROM spontaneous_meetups WHERE expires_at <= datetime('now')")
    .run();
  return res.meta.changes ?? 0;
}

/** Hány spontán-hirdetést adott fel ez az IP az elmúlt 24 órában (anti-spam). */
export async function countRecentSpontaneous(ipHash: string | null): Promise<number> {
  if (!ipHash) return 0;
  const row = await getDB()
    .prepare(
      `SELECT COUNT(*) AS n FROM spontaneous_meetups
       WHERE ip_hash = ? AND created_at > datetime('now', '-1 day')`,
    )
    .bind(ipHash)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

// ---------------------------------------------------------------------------
// Border reports — Waze-szerű határátkelő-jelentések (4h TTL)
// ---------------------------------------------------------------------------

export type BorderStatus = "strict" | "moderate" | "easy" | "closed" | "traffic";

export interface BorderReport {
  id: string;
  crossingId: string;
  status: BorderStatus;
  note: string | null;
  createdAt: string;
  expiresAt: string;
}

interface BorderReportRow {
  id: string;
  crossing_id: string;
  status: string;
  note: string | null;
  created_at: string;
  expires_at: string;
}

function toBorderReport(r: BorderReportRow): BorderReport {
  return {
    id: r.id,
    crossingId: r.crossing_id,
    status: r.status as BorderStatus,
    note: r.note,
    createdAt: r.created_at,
    expiresAt: r.expires_at,
  };
}

export async function createBorderReport(input: {
  id: string;
  crossingId: string;
  status: BorderStatus;
  note: string | null;
  ipHash: string | null;
  expiresAt: string;
}): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO border_reports (id, crossing_id, status, note, ip_hash, expires_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.id,
      input.crossingId,
      input.status,
      input.note,
      input.ipHash,
      input.expiresAt,
    )
    .run();
}

export async function getActiveBorderReports(): Promise<BorderReport[]> {
  const { results } = await getDB()
    .prepare(
      `SELECT * FROM border_reports
       WHERE expires_at > datetime('now')
       ORDER BY created_at DESC`,
    )
    .all<BorderReportRow>();
  return results.map(toBorderReport);
}

export async function countRecentBorderReports(ipHash: string | null): Promise<number> {
  if (!ipHash) return 0;
  const row = await getDB()
    .prepare(
      `SELECT COUNT(*) AS n FROM border_reports
       WHERE ip_hash = ? AND created_at > datetime('now', '-1 hour')`,
    )
    .bind(ipHash)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

export async function purgeExpiredBorderReports(): Promise<number> {
  const res = await getDB()
    .prepare("DELETE FROM border_reports WHERE expires_at <= datetime('now')")
    .run();
  return res.meta.changes ?? 0;
}

// ---------------------------------------------------------------------------
// Deal reports — Svájci akció-térkép (Migros/Coop leárazások)
// ---------------------------------------------------------------------------

export interface DealReport {
  id: string;
  storeId: string;
  categoryId: string;
  discountPct: number;
  lat: number;
  lng: number;
  locationName: string | null;
  cantonCode: string | null;
  note: string | null;
  createdAt: string;
  expiresAt: string;
}

interface DealReportRow {
  id: string;
  store_id: string;
  category_id: string;
  discount_pct: number;
  lat: number;
  lng: number;
  location_name: string | null;
  canton_code: string | null;
  note: string | null;
  created_at: string;
  expires_at: string;
}

function toDealReport(r: DealReportRow): DealReport {
  return {
    id: r.id,
    storeId: r.store_id,
    categoryId: r.category_id,
    discountPct: r.discount_pct,
    lat: r.lat,
    lng: r.lng,
    locationName: r.location_name,
    cantonCode: r.canton_code,
    note: r.note,
    createdAt: r.created_at,
    expiresAt: r.expires_at,
  };
}

export async function createDealReport(input: {
  id: string;
  storeId: string;
  categoryId: string;
  discountPct: number;
  lat: number;
  lng: number;
  locationName: string | null;
  cantonCode: string | null;
  note: string | null;
  ipHash: string | null;
  expiresAt: string;
}): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO deal_reports
       (id, store_id, category_id, discount_pct, lat, lng, location_name, canton_code, note, ip_hash, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.id,
      input.storeId,
      input.categoryId,
      input.discountPct,
      input.lat,
      input.lng,
      input.locationName,
      input.cantonCode,
      input.note,
      input.ipHash,
      input.expiresAt,
    )
    .run();
}

export async function getActiveDealReports(): Promise<DealReport[]> {
  const { results } = await getDB()
    .prepare(
      `SELECT * FROM deal_reports
       WHERE expires_at > datetime('now')
       ORDER BY discount_pct DESC, created_at DESC`,
    )
    .all<DealReportRow>();
  return results.map(toDealReport);
}

export async function countRecentDealReports(ipHash: string | null): Promise<number> {
  if (!ipHash) return 0;
  const row = await getDB()
    .prepare(
      `SELECT COUNT(*) AS n FROM deal_reports
       WHERE ip_hash = ? AND created_at > datetime('now', '-1 hour')`,
    )
    .bind(ipHash)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

export async function purgeExpiredDealReports(): Promise<number> {
  const res = await getDB()
    .prepare("DELETE FROM deal_reports WHERE expires_at <= datetime('now')")
    .run();
  return res.meta.changes ?? 0;
}

// ---------------------------------------------------------------------------
// Hofladen spots — Helyi termelői pontok térképe
// ---------------------------------------------------------------------------

export interface HofladenSpot {
  id: string;
  name: string;
  locationName: string | null;
  lat: number;
  lng: number;
  cantonCode: string | null;
  categories: string[];
  paymentMethods: string[];
  open24h: boolean;
  openText: string | null;
  note: string | null;
  manageToken: string | null;
  reportsCount: number;
  createdAt: string;
}

interface HofladenSpotRow {
  id: string;
  name: string;
  location_name: string | null;
  lat: number;
  lng: number;
  canton_code: string | null;
  categories: string;
  payment_methods: string;
  open_24h: number;
  open_text: string | null;
  note: string | null;
  manage_token: string | null;
  reports_count: number;
  created_at: string;
}

function toHofladenSpot(r: HofladenSpotRow): HofladenSpot {
  let categories: string[] = [];
  let paymentMethods: string[] = [];
  try {
    const c = JSON.parse(r.categories);
    if (Array.isArray(c)) categories = c.filter((v): v is string => typeof v === "string");
  } catch { /* ignore */ }
  try {
    const p = JSON.parse(r.payment_methods);
    if (Array.isArray(p)) paymentMethods = p.filter((v): v is string => typeof v === "string");
  } catch { /* ignore */ }

  return {
    id: r.id,
    name: r.name,
    locationName: r.location_name,
    lat: r.lat,
    lng: r.lng,
    cantonCode: r.canton_code,
    categories,
    paymentMethods,
    open24h: r.open_24h === 1,
    openText: r.open_text,
    note: r.note,
    manageToken: r.manage_token,
    reportsCount: r.reports_count,
    createdAt: r.created_at,
  };
}

export type PublicHofladenSpot = Omit<HofladenSpot, "manageToken">;

export function toPublicHofladenSpot(s: HofladenSpot): PublicHofladenSpot {
  const { manageToken: _omit, ...pub } = s;
  void _omit;
  return pub;
}

export async function createHofladenSpot(input: {
  id: string;
  name: string;
  locationName: string | null;
  lat: number;
  lng: number;
  cantonCode: string | null;
  categories: string[];
  paymentMethods: string[];
  open24h: boolean;
  openText: string | null;
  note: string | null;
  manageToken: string;
  ipHash: string | null;
}): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO hofladen_spots
       (id, name, location_name, lat, lng, canton_code, categories, payment_methods,
        open_24h, open_text, note, manage_token, ip_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.id,
      input.name,
      input.locationName,
      input.lat,
      input.lng,
      input.cantonCode,
      JSON.stringify(input.categories),
      JSON.stringify(input.paymentMethods),
      input.open24h ? 1 : 0,
      input.openText,
      input.note,
      input.manageToken,
      input.ipHash,
    )
    .run();
}

export async function getActiveHofladenSpots(): Promise<HofladenSpot[]> {
  const { results } = await getDB()
    .prepare(
      `SELECT * FROM hofladen_spots
       WHERE hidden = 0
       ORDER BY created_at DESC`,
    )
    .all<HofladenSpotRow>();
  return results.map(toHofladenSpot);
}

export async function deleteHofladenSpotByManageToken(token: string): Promise<boolean> {
  const res = await getDB()
    .prepare("DELETE FROM hofladen_spots WHERE manage_token = ?")
    .bind(token)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

export async function countRecentHofladenSubmissions(ipHash: string | null): Promise<number> {
  if (!ipHash) return 0;
  const row = await getDB()
    .prepare(
      `SELECT COUNT(*) AS n FROM hofladen_spots
       WHERE ip_hash = ? AND created_at > datetime('now', '-1 day')`,
    )
    .bind(ipHash)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

// ============================================================================
//  Vállalkozói analitika (profil-view + telefon-kattintás)
// ============================================================================

export type BusinessAnalyticsKind = "view" | "phone";

export interface BusinessAnalyticsSummary {
  total: number;          // összes idejű
  last7Days: number;      // utolsó 7 nap
  last30Days: number;     // utolsó 30 nap
}

export interface BusinessAnalytics {
  views: BusinessAnalyticsSummary;
  phoneClicks: BusinessAnalyticsSummary;
  /** Napi bontás csökkenő sorrendben (legfrissebb előbb), max 30 nap. */
  daily: Array<{ day: string; views: number; phoneClicks: number }>;
}

/**
 * Best-effort számláló-növelő. IP-hash-szel dedupe-olunk órás bontásban,
 * hogy ne lehessen ugyanaz a látogató futtatva pumpálni a számot.
 *
 * Csendben hibázik (üres válasz), hogy a tracking-fail soha ne törje a UX-ot.
 */
export async function incrementBusinessAnalytic(
  businessId: string,
  kind: BusinessAnalyticsKind,
  ipHash: string | null,
): Promise<void> {
  if (!businessId) return;
  const db = getDB();
  const now = new Date();
  const day = now.toISOString().slice(0, 10);          // YYYY-MM-DD
  const hourBucket = now.toISOString().slice(0, 13);    // YYYY-MM-DDTHH

  // 1) Dedupe — csak akkor megyünk tovább, ha ez egy új (ip,bucket) pár.
  //    IP-hash nélkül (pl. localhost dev) sose dedupe-olunk, csak mindig számolunk.
  if (ipHash) {
    const dedupe = await db
      .prepare(
        `INSERT OR IGNORE INTO business_analytics_dedupe
          (business_id, kind, ip_hash, hour_bucket)
         VALUES (?, ?, ?, ?)`,
      )
      .bind(businessId, kind, ipHash, hourBucket)
      .run();
    if ((dedupe.meta.changes ?? 0) === 0) return;
  }

  // 2) Daily aggregate — upsert (kind-tól függően melyik oszlopot növeljük)
  const dailyCol = kind === "view" ? "view_count" : "phone_click_count";
  await db
    .prepare(
      `INSERT INTO business_analytics_daily (business_id, day, ${dailyCol})
       VALUES (?, ?, 1)
       ON CONFLICT(business_id, day) DO UPDATE SET ${dailyCol} = ${dailyCol} + 1`,
    )
    .bind(businessId, day)
    .run();

  // 3) Összesített számláló a businesses táblán
  const totalCol = kind === "view" ? "view_count" : "phone_click_count";
  await db
    .prepare(`UPDATE businesses SET ${totalCol} = ${totalCol} + 1 WHERE id = ?`)
    .bind(businessId)
    .run();
}

/** A vállalkozó számára: összes / 7 nap / 30 nap + napi bontás. */
export async function getBusinessAnalytics(businessId: string): Promise<BusinessAnalytics> {
  const db = getDB();

  // Védő try/catch: ha a 0040 migration még nem futott a remote D1-en, a
  // hiányzó oszlop/tábla "no such column" hibát dob. A manage-page-et NEM
  // törjük ezért — 0-s értékekkel térünk vissza.
  let totals: { view_count: number | null; phone_click_count: number | null } | null = null;
  try {
    totals = await db
      .prepare("SELECT view_count, phone_click_count FROM businesses WHERE id = ?")
      .bind(businessId)
      .first<{ view_count: number | null; phone_click_count: number | null }>();
  } catch {
    totals = null;
  }

  let dailyRows: { day: string; views: number; phoneClicks: number }[] = [];
  try {
    const res = await db
      .prepare(
        `SELECT day, view_count AS views, phone_click_count AS phoneClicks
         FROM business_analytics_daily
         WHERE business_id = ? AND day >= date('now', '-30 days')
         ORDER BY day DESC`,
      )
      .bind(businessId)
      .all<{ day: string; views: number; phoneClicks: number }>();
    dailyRows = res.results;
  } catch {
    dailyRows = [];
  }

  const today = new Date();
  const dateMinusDays = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };
  const sevenDaysAgo = dateMinusDays(7);
  const thirtyDaysAgo = dateMinusDays(30);

  let viewsLast7 = 0;
  let viewsLast30 = 0;
  let phoneLast7 = 0;
  let phoneLast30 = 0;
  for (const r of dailyRows) {
    if (r.day >= thirtyDaysAgo) {
      viewsLast30 += r.views ?? 0;
      phoneLast30 += r.phoneClicks ?? 0;
    }
    if (r.day >= sevenDaysAgo) {
      viewsLast7 += r.views ?? 0;
      phoneLast7 += r.phoneClicks ?? 0;
    }
  }

  return {
    views: {
      total: totals?.view_count ?? 0,
      last7Days: viewsLast7,
      last30Days: viewsLast30,
    },
    phoneClicks: {
      total: totals?.phone_click_count ?? 0,
      last7Days: phoneLast7,
      last30Days: phoneLast30,
    },
    daily: dailyRows.map((r) => ({
      day: r.day,
      views: r.views ?? 0,
      phoneClicks: r.phoneClicks ?? 0,
    })),
  };
}

/** Cron-takarítás: a >7 napos dedupe-rekordok kitörlése. */
export async function purgeBusinessAnalyticsDedupe(): Promise<number> {
  const res = await getDB()
    .prepare(
      `DELETE FROM business_analytics_dedupe
       WHERE created_at < datetime('now', '-7 days')`,
    )
    .run();
  return res.meta.changes ?? 0;
}

// ============================================================================
//  CHF/HUF árfolyam-riasztó (push)
// ============================================================================

export type ExchangeRateDirection = "above" | "below";

export interface ExchangeRateAlert {
  id: string;
  pushEndpoint: string;
  thresholdHuf: number;
  direction: ExchangeRateDirection;
  active: boolean;
  createdAt: string;
  lastFiredAt: string | null;
}

interface ExchangeRateAlertRow {
  id: string;
  push_endpoint: string;
  threshold_huf: number;
  direction: string;
  active: number;
  created_at: string;
  last_fired_at: string | null;
}

function toExchangeRateAlert(r: ExchangeRateAlertRow): ExchangeRateAlert {
  return {
    id: r.id,
    pushEndpoint: r.push_endpoint,
    thresholdHuf: r.threshold_huf,
    direction: r.direction === "below" ? "below" : "above",
    active: !!r.active,
    createdAt: r.created_at,
    lastFiredAt: r.last_fired_at,
  };
}

export async function saveExchangeRateAlert(params: {
  id: string;
  pushEndpoint: string;
  thresholdHuf: number;
  direction: ExchangeRateDirection;
}): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO exchange_rate_alerts (id, push_endpoint, threshold_huf, direction, active)
       VALUES (?, ?, ?, ?, 1)`,
    )
    .bind(
      params.id,
      params.pushEndpoint,
      params.thresholdHuf,
      params.direction,
    )
    .run();
}

export async function listExchangeRateAlertsByEndpoint(
  pushEndpoint: string,
): Promise<ExchangeRateAlert[]> {
  const { results } = await getDB()
    .prepare(
      `SELECT * FROM exchange_rate_alerts
       WHERE push_endpoint = ? AND active = 1
       ORDER BY created_at DESC`,
    )
    .bind(pushEndpoint)
    .all<ExchangeRateAlertRow>();
  return results.map(toExchangeRateAlert);
}

/**
 * A megadott alert csak akkor törlődik, ha a hívó a saját pushEndpoint-jával
 * authentikálódott — így idegen alert-et nem lehet törölni.
 */
export async function deleteExchangeRateAlert(
  id: string,
  pushEndpoint: string,
): Promise<boolean> {
  const res = await getDB()
    .prepare(
      `DELETE FROM exchange_rate_alerts WHERE id = ? AND push_endpoint = ?`,
    )
    .bind(id, pushEndpoint)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

// ===========================================================================
// KINTI RADARS (Push Notifications)
// ===========================================================================

export interface KintiRadar {
  id: string;
  pushEndpoint: string;
  radarType: 'alberlet' | 'exchange_rate';
  parameters: string; // JSON string
  active: number;
  createdAt: string;
}

export async function saveRadar(data: {
  id: string;
  pushEndpoint: string;
  radarType: string;
  parameters: string;
}) {
  await getDB()
    .prepare(
      'INSERT INTO kinti_radars (id, push_endpoint, radar_type, parameters) VALUES (?, ?, ?, ?)'
    )
    .bind(data.id, data.pushEndpoint, data.radarType, data.parameters)
    .run();
}

export async function listRadarsByEndpoint(endpoint: string): Promise<KintiRadar[]> {
  const { results } = await getDB()
    .prepare('SELECT * FROM kinti_radars WHERE push_endpoint = ? ORDER BY created_at DESC')
    .bind(endpoint)
    .all();
  return (results ?? []).map((r) => ({
    id: String(r.id),
    pushEndpoint: String(r.push_endpoint),
    radarType: String(r.radar_type) as any,
    parameters: String(r.parameters),
    active: Number(r.active),
    createdAt: String(r.created_at),
  }));
}

export async function deleteRadar(id: string, endpoint: string): Promise<boolean> {
  const res = await getDB()
    .prepare('DELETE FROM kinti_radars WHERE id = ? AND push_endpoint = ?')
    .bind(id, endpoint)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

export async function getActiveRadarsByType(radarType: string): Promise<{id: string, pushEndpoint: string, parameters: string}[]> {
  const { results } = await getDB()
    .prepare('SELECT id, push_endpoint, parameters FROM kinti_radars WHERE radar_type = ? AND active = 1')
    .bind(radarType)
    .all();
  return (results ?? []).map(r => ({
    id: String(r.id),
    pushEndpoint: String(r.push_endpoint),
    parameters: String(r.parameters)
  }));
}

// ============================================================================
//  AI vélemény-összegzés (cache-eléshez)
// ============================================================================

export async function setBusinessAiReviewSummary(params: {
  businessId: string;
  summary: string;
  reviewCount: number;
}): Promise<void> {
  await getDB()
    .prepare(
      `UPDATE businesses
       SET ai_review_summary = ?,
           ai_review_summary_at = datetime('now'),
           ai_review_summary_count = ?
       WHERE id = ?`,
    )
    .bind(params.summary, params.reviewCount, params.businessId)
    .run();
}

// ============================================================================
//  Admin kézi tartalom-moderáció
// ============================================================================

export type ModerationTable =
  | "bulletin_posts"
  | "reviews"
  | "businesses"
  | "events";

export type ModerationDecision = "approved" | "rejected" | "pending";

const MODERATION_TABLE_WHITELIST: Set<ModerationTable> = new Set([
  "bulletin_posts",
  "reviews",
  "businesses",
  "events",
]);

/** SQL-injection védelem — csak az engedélyezett táblanevek. */
function assertModerationTable(t: ModerationTable): void {
  if (!MODERATION_TABLE_WHITELIST.has(t)) {
    throw new Error(`Ismeretlen moderation-tábla: ${t}`);
  }
}

export interface ModerationQueueItem {
  table: ModerationTable;
  id: string;
  title: string;
  preview: string;
  createdAt: string | null;
  /** Email — csak admin lát, audit-célra. */
  submitterEmail: string | null;
  /** IP-hash — szintén audit-célra. */
  submitterIpHash: string | null;
  /** Kép-kulcs (R2) ha van. */
  imageKey: string | null;
  moderationStatus: number;
  moderationDecisionAt: string | null;
  moderationDecidedBy: string | null;
}

/**
 * Egy admin-queue-item listája az adott táblából. A `status` argumentum
 * szűri: 0=pending, 1=approved, 2=rejected.
 */
export async function listModerationQueue(
  table: ModerationTable,
  status: 0 | 1 | 2,
  limit = 50,
): Promise<ModerationQueueItem[]> {
  assertModerationTable(table);
  const db = getDB();

  // Tábla-specifikus mező-mappelés
  const fields: Record<
    ModerationTable,
    { title: string; preview: string; createdAt: string; email: string; ip: string; image: string }
  > = {
    bulletin_posts: {
      title: "title",
      preview: "COALESCE(body, meta, '')",
      createdAt: "COALESCE(published_at, created_at)",
      email: "email",
      ip: "ip_hash",
      image: "image_key",
    },
    reviews: {
      title: "reviewer_name",
      preview: "body",
      createdAt: "published_at",
      email: "email",
      ip: "ip_hash",
      image: "''",
    },
    businesses: {
      title: "name",
      preview: "COALESCE(blurb, address, '')",
      createdAt: "COALESCE(updated_at, '')",
      email: "COALESCE(contact_email, '')",
      ip: "''",
      image: "logo_key",
    },
    events: {
      title: "title",
      preview: "COALESCE(description, venue, '')",
      createdAt: "COALESCE(event_date, '')",
      email: "email",
      ip: "''",
      image: "image_key",
    },
  };
  const f = fields[table];

  const sql = `SELECT id,
                      ${f.title} AS title,
                      ${f.preview} AS preview,
                      ${f.createdAt} AS createdAt,
                      ${f.email} AS submitterEmail,
                      ${f.ip} AS submitterIpHash,
                      ${f.image} AS imageKey,
                      moderation_status AS moderationStatus,
                      moderation_decision_at AS moderationDecisionAt,
                      moderation_decided_by AS moderationDecidedBy
               FROM ${table}
               WHERE moderation_status = ?
               ORDER BY createdAt DESC
               LIMIT ?`;

  const { results } = await db
    .prepare(sql)
    .bind(status, limit)
    .all<{
      id: string;
      title: string;
      preview: string;
      createdAt: string | null;
      submitterEmail: string | null;
      submitterIpHash: string | null;
      imageKey: string | null;
      moderationStatus: number;
      moderationDecisionAt: string | null;
      moderationDecidedBy: string | null;
    }>();

  return results.map((r) => ({
    table,
    id: r.id,
    title: r.title ?? "",
    preview: (r.preview ?? "").slice(0, 200),
    createdAt: r.createdAt,
    submitterEmail: r.submitterEmail || null,
    submitterIpHash: r.submitterIpHash || null,
    imageKey: r.imageKey || null,
    moderationStatus: r.moderationStatus,
    moderationDecisionAt: r.moderationDecisionAt,
    moderationDecidedBy: r.moderationDecidedBy,
  }));
}

export async function moderationCount(
  table: ModerationTable,
  status: 0 | 1 | 2,
): Promise<number> {
  assertModerationTable(table);
  const row = await getDB()
    .prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE moderation_status = ?`)
    .bind(status)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

/**
 * Admin-döntés rögzítése: 1=approved, 2=rejected.
 *
 * Visszaadja az érintett sorok számát (1 = sikeres). 0 = nincs ilyen id
 * vagy nincs jogosultság.
 */
export async function setModerationStatus(
  table: ModerationTable,
  id: string,
  status: 0 | 1 | 2,
  adminUserId: string,
): Promise<boolean> {
  assertModerationTable(table);
  const res = await getDB()
    .prepare(
      `UPDATE ${table}
       SET moderation_status = ?,
           moderation_decision_at = datetime('now'),
           moderation_decided_by = ?
       WHERE id = ?`,
    )
    .bind(status, adminUserId, id)
    .run();
  return (res.meta.changes ?? 0) > 0;
}
