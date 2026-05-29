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
  manage_token: string | null;
  expiry_warning_sent: number | null;
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
  const where: string[] = ["e.status = 'approved'"];
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
  const res = await getDB()
    .prepare("UPDATE events SET status = ?, token = ? WHERE id = ?")
    .bind(status, nextToken, id)
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
  imageKey: string | null;
  cantonCode: string | null;
  price: number | null;
}

/** Új piszkozat — a kliens-form `submit`-end-pointja használja. */
export async function createBulletinDraft(input: BulletinDraftInput): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO bulletin_drafts
       (id, email, kind_id, title, meta, body, poster,
        confirm_token, manage_token, expires_at,
        terms_version, accepted_terms_at, age_confirmed, ip_hash, image_key, canton_code, price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
       (id, kind_id, title, meta, body, poster, email, manage_token,
        age_text, expires_at, published_at, is_pending, created_at,
        terms_version, accepted_terms_at, age_confirmed, ip_hash, image_key, canton_code, price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'frissen', ?, datetime('now'), ?, datetime('now'),
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

/** Hány telekocsi-hirdetést adott fel ez az IP az elmúlt 24 órában. */
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

/** Telekocsi-beküldést rögzít a rate-limit táblába. */
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
       FROM reviews WHERE business_id = ? AND hidden = 0
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
        confirm_token, expires_at, terms_version, accepted_terms_at, age_confirmed, ip_hash,
        owner_user_id, manage_token)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
       (id, name, category_id, category_label, address, phone, blurb,
        contact_email, source, languages, lat, lng, pin_x, pin_y,
        rating, reviews, featured, open_now, owner_user_id, manage_token)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'self_submitted', '["Magyar"]', ?, ?, 50, 50, 0, 0, 0, 0, ?, ?)`,
    )
    .bind(
      input.id,
      input.name,
      input.categoryId,
      input.categoryLabel,
      input.address,
      input.phone,
      input.blurb,
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
  contentType: "bulletin" | "review" | "sos";
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
  contentType: "bulletin" | "review";
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
    contentType: row.content_type as "bulletin" | "review",
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

// ---------------------------------------------------------------------------
// Telekocsi (ride-sharing)
// ---------------------------------------------------------------------------

interface RideRow {
  id: string;
  departure_city: string;
  destination_city: string;
  departure_time: string;
  lat: number;
  lng: number;
  seats: number;
  price_text: string | null;
  poster_name: string;
  poster_user_id: string | null;
  contact_phone: string;
  notes: string | null;
  waypoints: string | null;
  is_request: number;
  created_at: string;
  expires_at: string;
  manage_token: string | null;
  contact_whatsapp: string | null;
}

export interface RideWaypoint {
  city: string;
  lat: number;
  lng: number;
}

export interface Ride {
  id: string;
  departureCity: string;
  destinationCity: string;
  departureTime: string;
  lat: number;
  lng: number;
  seats: number;
  priceText: string | null;
  posterName: string;
  posterUserId: string | null;
  contactPhone: string;
  /** Opcionális — ha üres, a WhatsApp-gomb a contactPhone-ra megy. */
  contactWhatsapp: string | null;
  notes: string | null;
  waypoints: RideWaypoint[];
  isRequest: boolean;
  createdAt: string;
  expiresAt: string;
  manageToken: string | null;
}

/**
 * PublicRide — a publikus API/oldal-render típusa, manage_token NÉLKÜL.
 * A token brute-force-hatatlan, de SOSE szivároghat ki publikusan rendezett
 * HTML-be vagy JSON API válaszba. A submit endpoint külön visszaadja a
 * feladónak (success oldalon + localStorage-ba), és csak a feladó látja.
 */
export type PublicRide = Omit<Ride, "manageToken"> & {
  /** Gamifikáció: implicit jelvény a hirdetőhöz (pl. "super_driver"). */
  badge: string | null;
  rating?: number | null;
  reviews?: number;
};

/**
 * Lecsupaszítja a manage_token-t a publikus szállításhoz.
 * Ha `rideCounts` adott, kiszámolja a sofőr-jelvényt.
 */
export function toPublicRide(
  r: Ride,
  rideCounts?: Record<string, number>,
  rideRatings?: Record<string, { rating: number; reviews: number }>
): PublicRide {
  const { manageToken: _omit, ...pub } = r;
  void _omit;
  let badge: string | null = null;
  let rating: number | null = null;
  let reviews = 0;

  if (!r.isRequest) {
    if (rideCounts) {
      const count = rideCounts[r.contactPhone] ?? 0;
      if (count >= 10) badge = "legend_driver";     // 🏆 Legenda Sofőr
      else if (count >= 5) badge = "super_driver";  // 🚗 Szuper Sofőr
      else if (count >= 2) badge = "active_driver";  // ✅ Aktív Sofőr
    }
    if (rideRatings && rideRatings[r.contactPhone]) {
      rating = rideRatings[r.contactPhone].rating;
      reviews = rideRatings[r.contactPhone].reviews;
    }
  }
  return { ...pub, badge, rating, reviews };
}

function parseWaypoints(raw: string | null): RideWaypoint[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((w: unknown) => {
      if (!w || typeof w !== "object") return false;
      const o = w as Record<string, unknown>;
      return typeof o.city === "string" && typeof o.lat === "number" && typeof o.lng === "number";
    }) : [];
  } catch { return []; }
}

function toRide(r: RideRow): Ride {
  return {
    id: r.id,
    departureCity: r.departure_city,
    destinationCity: r.destination_city,
    departureTime: r.departure_time,
    lat: r.lat,
    lng: r.lng,
    seats: r.seats,
    priceText: r.price_text,
    posterName: r.poster_name,
    posterUserId: r.poster_user_id,
    contactPhone: r.contact_phone,
    contactWhatsapp: r.contact_whatsapp,
    notes: r.notes,
    waypoints: parseWaypoints(r.waypoints),
    isRequest: r.is_request === 1,
    createdAt: r.created_at,
    expiresAt: r.expires_at,
    manageToken: r.manage_token,
  };
}

export interface CreateRideInput {
  id: string;
  departureCity: string;
  destinationCity: string;
  departureTime: string;
  lat: number;
  lng: number;
  seats: number;
  priceText: string | null;
  posterName: string;
  posterUserId: string | null;
  contactPhone: string;
  contactWhatsapp: string | null;
  notes: string | null;
  waypoints: RideWaypoint[] | null;
  isRequest: boolean;
  expiresAt: string;
  manageToken: string;
}

export async function createRide(input: CreateRideInput): Promise<void> {
  const wpJson = input.waypoints && input.waypoints.length > 0
    ? JSON.stringify(input.waypoints)
    : null;
  await getDB()
    .prepare(
      `INSERT INTO rides
       (id, departure_city, destination_city, departure_time, lat, lng, seats,
        price_text, poster_name, poster_user_id, contact_phone, contact_whatsapp,
        notes, waypoints, is_request, expires_at, manage_token)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.id,
      input.departureCity,
      input.destinationCity,
      input.departureTime,
      input.lat,
      input.lng,
      input.seats,
      input.priceText,
      input.posterName,
      input.posterUserId,
      input.contactPhone,
      input.contactWhatsapp,
      input.notes,
      wpJson,
      input.isRequest ? 1 : 0,
      input.expiresAt,
      input.manageToken,
    )
    .run();
}

export async function getRideByManageToken(token: string): Promise<Ride | null> {
  const row = await getDB()
    .prepare("SELECT * FROM rides WHERE manage_token = ? LIMIT 1")
    .bind(token)
    .first<RideRow>();
  return row ? toRide(row) : null;
}

export interface UpdateRideFields {
  departureTime?: string;
  seats?: number;
  priceText?: string | null;
  contactPhone?: string;
  contactWhatsapp?: string | null;
  notes?: string | null;
}

export async function updateRideByManageToken(
  token: string,
  fields: UpdateRideFields,
): Promise<boolean> {
  const sets: string[] = [];
  const values: unknown[] = [];
  const map: Record<string, string> = {
    departureTime: "departure_time",
    seats: "seats",
    priceText: "price_text",
    contactPhone: "contact_phone",
    contactWhatsapp: "contact_whatsapp",
    notes: "notes",
  };
  for (const [k, col] of Object.entries(map)) {
    const v = fields[k as keyof UpdateRideFields];
    if (v !== undefined) {
      sets.push(`${col} = ?`);
      values.push(v);
    }
  }
  if (sets.length === 0) return true;
  const sql = `UPDATE rides SET ${sets.join(", ")} WHERE manage_token = ?`;
  values.push(token);
  const res = await getDB().prepare(sql).bind(...values).run();
  return (res.meta.changes ?? 0) > 0;
}

export async function deleteRideByManageToken(token: string): Promise<boolean> {
  const res = await getDB()
    .prepare("DELETE FROM rides WHERE manage_token = ?")
    .bind(token)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

export interface RideQuery {
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
}

/** Aktív (nem lejárt) fuvarok, opcionális bounding-box szűréssel. */
export async function getActiveRides(opts: RideQuery = {}): Promise<Ride[]> {
  const where = ["expires_at > datetime('now')"];
  const binds: unknown[] = [];
  if (
    typeof opts.minLat === "number" && typeof opts.maxLat === "number" &&
    typeof opts.minLng === "number" && typeof opts.maxLng === "number"
  ) {
    where.push("lat BETWEEN ? AND ?", "lng BETWEEN ? AND ?");
    binds.push(opts.minLat, opts.maxLat, opts.minLng, opts.maxLng);
  }
  const sql = `SELECT * FROM rides WHERE ${where.join(" AND ")} ORDER BY departure_time ASC`;
  const { results } = await getDB().prepare(sql).bind(...binds).all<RideRow>();
  return results.map(toRide);
}

export async function getRideById(id: string): Promise<Ride | null> {
  const row = await getDB().prepare("SELECT * FROM rides WHERE id = ?").bind(id).first<RideRow>();
  return row ? toRide(row) : null;
}



export async function getRideRatingsByPhone(): Promise<Record<string, { rating: number; reviews: number }>> {
  const db = getDB();
  const { results } = await db.prepare(`
    SELECT target_phone, AVG(rating) as avg_rating, COUNT(*) as c
    FROM ride_ratings
    GROUP BY target_phone
  `).all<{ target_phone: string; avg_rating: number; c: number }>();

  const map: Record<string, { rating: number; reviews: number }> = {};
  for (const row of results) {
    map[row.target_phone] = { rating: row.avg_rating, reviews: row.c };
  }
  return map;
}

export async function addRideRatingDraft(
  targetPhone: string,
  reviewerEmail: string,
  rating: number,
  confirmToken: string,
  expiresAt: string
): Promise<boolean> {
  const res = await getDB().prepare(`
    INSERT INTO ride_rating_drafts (id, target_phone, reviewer_email, rating, confirm_token, expires_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(crypto.randomUUID(), targetPhone, reviewerEmail, rating, confirmToken, expiresAt).run();
  return res.success;
}

export async function getRideRatingDraftByToken(token: string) {
  return await getDB().prepare("SELECT * FROM ride_rating_drafts WHERE confirm_token = ?").bind(token).first<{
    id: string;
    target_phone: string;
    reviewer_email: string;
    rating: number;
    confirm_token: string;
    expires_at: string;
  }>();
}

export async function confirmRideRatingDraft(draftId: string): Promise<boolean> {
  const db = getDB();
  const draft = await db.prepare("SELECT * FROM ride_rating_drafts WHERE id = ?").bind(draftId).first<{
    target_phone: string;
    reviewer_email: string;
    rating: number;
  }>();
  if (!draft) return false;

  const res = await db.batch([
    db.prepare(`
      INSERT INTO ride_ratings (id, target_phone, reviewer_email, rating)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(target_phone, reviewer_email) DO UPDATE SET rating = excluded.rating
    `).bind(crypto.randomUUID(), draft.target_phone, draft.reviewer_email, draft.rating),
    db.prepare("DELETE FROM ride_rating_drafts WHERE id = ?").bind(draftId)
  ]);
  
  return res.length === 2;
}

// ---------------------------------------------------------------------------
// Gamifikáció — implicit jelvények (Szuper Sofőr, stb.)
// ---------------------------------------------------------------------------

/**
 * Visszaadja, hány fuvar-hirdetést adott fel egy-egy telefonszám összesen (is_request=0,
 * tehát csak sofőr-hirdetések). Az utas-kereséseket nem számoljuk — a „Szuper Sofőr"
 * jelvényt a rendszeres sofőrök kapják.
 *
 * Hatékonysági okokból egyszerre lekérjük az összes aktív fuvarban szereplő telefon
 * globális statisztikáját, így egyetlen extra query kell a telekocsi-oldalhoz.
 */
export async function getRideCountsByPhone(): Promise<Record<string, number>> {
  const { results } = await getDB()
    .prepare(
      `SELECT contact_phone, COUNT(*) AS n FROM rides
       WHERE is_request = 0
       GROUP BY contact_phone
       HAVING n >= 2`,
    )
    .all<{ contact_phone: string; n: number }>();
  const map: Record<string, number> = {};
  for (const r of results) map[r.contact_phone] = r.n;
  return map;
}

/** Törlés tulajdonosként (poster_user_id egyezés). Visszaadja, érintett-e sort. */
export async function deleteRideByOwner(id: string, userId: string): Promise<boolean> {
  const res = await getDB()
    .prepare("DELETE FROM rides WHERE id = ? AND poster_user_id = ?")
    .bind(id, userId)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

/** Törlés adminként (tulajdonos-ellenőrzés nélkül). */
export async function deleteRideById(id: string): Promise<boolean> {
  const res = await getDB().prepare("DELETE FROM rides WHERE id = ?").bind(id).run();
  return (res.meta.changes ?? 0) > 0;
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
    if (r.content_type === "bulletin") {
      const row = await db.prepare("SELECT title FROM bulletin_posts WHERE id = ?").bind(r.content_id).first<{ title: string }>();
      excerpt = row?.title ?? null;
    } else if (r.content_type === "review") {
      const row = await db.prepare("SELECT reviewer_name, body FROM reviews WHERE id = ?").bind(r.content_id).first<{ reviewer_name: string; body: string }>();
      excerpt = row ? `${row.reviewer_name}: ${row.body.slice(0, 100)}` : null;
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

export async function listRidesForAdmin(): Promise<AdminContentRow[]> {
  const { results } = await getDB()
    .prepare(
      `SELECT id, departure_city, destination_city, departure_time, poster_name, created_at, manage_token
       FROM rides
       ORDER BY created_at DESC LIMIT 200`,
    )
    .all<{ id: string; departure_city: string; destination_city: string; departure_time: string; poster_name: string | null; created_at: string; manage_token: string | null }>();
  return results.map((r) => ({
    id: r.id,
    title: `${r.departure_city} → ${r.destination_city}`,
    meta: `${r.departure_time}${r.poster_name ? " · " + r.poster_name : ""}`,
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
  ridesActive: number;
  reviews: number;
  digestSubscribersConfirmed: number;
  pushSubscriptions: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const db = getDB();
  const q = (sql: string) => db.prepare(sql).first<{ n: number }>();
  const [
    businesses, verified, bulletins, events, rides, reviews, digest, push,
  ] = await Promise.all([
    q("SELECT COUNT(*) AS n FROM businesses"),
    q("SELECT COUNT(*) AS n FROM businesses WHERE verified = 1"),
    q("SELECT COUNT(*) AS n FROM bulletin_posts WHERE is_pending = 0 AND hidden = 0 AND (expires_at IS NULL OR expires_at > datetime('now'))"),
    q("SELECT COUNT(*) AS n FROM events WHERE status = 'approved'"),
    q("SELECT COUNT(*) AS n FROM rides WHERE expires_at > datetime('now')"),
    q("SELECT COUNT(*) AS n FROM reviews WHERE hidden = 0"),
    q("SELECT COUNT(*) AS n FROM digest_subscribers WHERE confirmed = 1"),
    q("SELECT COUNT(*) AS n FROM push_subscriptions"),
  ]);
  return {
    businesses: businesses?.n ?? 0,
    businessesVerified: verified?.n ?? 0,
    bulletinsActive: bulletins?.n ?? 0,
    eventsApproved: events?.n ?? 0,
    ridesActive: rides?.n ?? 0,
    reviews: reviews?.n ?? 0,
    digestSubscribersConfirmed: digest?.n ?? 0,
    pushSubscriptions: push?.n ?? 0,
  };
}
