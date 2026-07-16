/**
 * repo-housing.ts — „Szoba- és albérlet-börze" hirdetések (0133 migráció).
 *
 * ⚠️ ANTI-LEAK SZABÁLY: a publikus lista-vetület (HousingListing) SZÁNDÉKOSAN
 * nem tartalmazza a contact_info-t — az kizárólag a PRO-gated
 * getHousingContactInfo()-n keresztül olvasható (kapuőr-modell). Új mező
 * felvételekor ezt a határt tartsd meg.
 */
import { getDB } from "./cloudflare";
import { HOUSING_TTL_DAYS } from "./housing";
import type { HousingInput, HousingType } from "./housing";

export interface HousingListing {
  id: string;
  type: HousingType;
  country: string;
  city: string;
  /** Kanton/tartomány-kód (0135) — null a régió nélküli hirdetésnél. */
  regionCode: string | null;
  price: number;
  currency: string;
  description: string;
  createdAt: number; // unixepoch (mp)
  /** A néző saját hirdetése-e (a lista-API tölti ki, kontakt nélkül is hasznos). */
  own?: boolean;
  /** Jóváhagyásra vár — CSAK a feladó látja a sajátját így (0134 moderáció). */
  pending?: boolean;
  /** Elutasított — CSAK a feladó látja a sajátját (DSA-átláthatóság: tudja,
   *  hogy a hirdetése NEM jelenik meg, és le tudja venni / újat adhat fel). */
  rejected?: boolean;
  /** Lejárt (60 napnál régebbi) — CSAK a feladó látja a sajátját, megújítás-
   *  gombbal; másnak nem jelenik meg. */
  expired?: boolean;
}

interface Row {
  id: string; user_id: string; type: string; country: string; city: string;
  region_code: string | null;
  price: number; currency: string; description: string; created_at: number;
  moderation_status: number;
}

const PUBLIC_COLS =
  "id, user_id, type, country, city, region_code, price, currency, description, created_at, moderation_status";

function toListing(r: Row, viewerUserId?: string | null): HousingListing {
  return {
    id: r.id, type: r.type as HousingType, country: r.country, city: r.city,
    regionCode: r.region_code, price: r.price, currency: r.currency, description: r.description,
    createdAt: r.created_at, own: viewerUserId != null && r.user_id === viewerUserId,
    pending: r.moderation_status === 0,
    rejected: r.moderation_status === 2,
    expired: r.created_at <= Math.floor(Date.now() / 1000) - HOUSING_TTL_DAYS * 86_400,
  };
}

/**
 * Hirdetések (kontakt NÉLKÜL), legfrissebb elöl. Publikusan CSAK a jóváhagyott
 * (moderation_status=1) látszik; a néző a SAJÁT függőben lévő hirdetését is
 * látja („jóváhagyásra vár" jelöléssel — így nem adja fel duplán). A 60 napnál
 * régebbi hirdetés nem jelenik meg (a lakhatási hirdetés gyorsan avul; az adat
 * marad, csak a lista szűri — nincs törlés/lejárat-infra a v1-ben).
 */
export async function getHousingListings(
  country?: string | null,
  viewerUserId?: string | null,
): Promise<HousingListing[]> {
  const binds: unknown[] = [];
  let visibility = "moderation_status = 1";
  let freshness = `created_at > unixepoch('now', '-${HOUSING_TTL_DAYS} days')`;
  if (viewerUserId) {
    // A feladó a saját FÜGGŐ és ELUTASÍTOTT hirdetését is látja (badge-dzsel) —
    // DSA-átláthatóság: tudja, mi történt vele, és le tudja venni.
    visibility = "(moderation_status = 1 OR (moderation_status IN (0, 2) AND user_id = ?))";
    binds.push(viewerUserId);
    // A LEJÁRT saját hirdetés is látszik a feladónak („Lejárt" badge +
    // megújítás-gomb) — másnak nem; így a hirdetés nem tűnik el némán.
    freshness = `(${freshness} OR user_id = ?)`;
    binds.push(viewerUserId);
  }
  let where = `is_active = 1 AND ${visibility} AND ${freshness}`;
  if (country) { where += " AND country = ?"; binds.push(country); }
  const { results } = await getDB()
    .prepare(`SELECT ${PUBLIC_COLS} FROM kinti_housing_listings WHERE ${where} ORDER BY created_at DESC LIMIT 100`)
    .bind(...binds)
    .all<Row>();
  return (results ?? []).map((r) => toListing(r, viewerUserId));
}

/** Új hirdetés — PENDING (moderation_status=0, 0134): admin-jóváhagyás után jelenik meg. */
export async function createHousingListing(input: HousingInput & { userId: string }): Promise<string> {
  const id = crypto.randomUUID();
  await getDB()
    .prepare(
      `INSERT INTO kinti_housing_listings
         (id, user_id, type, country, city, region_code, price, currency, description, contact_info, is_active, moderation_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)`,
    )
    .bind(
      id, input.userId, input.type, input.country, input.city, input.regionCode,
      input.price, input.currency, input.description, input.contact,
    )
    .run();
  return id;
}

/** A kontakt — KIZÁRÓLAG a PRO-gated /api/housing/contact hívja (szerver-kapu).
 *  Csak jóváhagyott ÉS le nem járt hirdetésé adható ki (pending/elutasított/
 *  lejárt → null — lejárt hirdetés kontaktja azonosító birtokában se szivárogjon). */
export async function getHousingContactInfo(id: string): Promise<string | null> {
  const row = await getDB()
    .prepare(
      `SELECT contact_info FROM kinti_housing_listings
       WHERE id = ? AND is_active = 1 AND moderation_status = 1
         AND created_at > unixepoch('now', '-${HOUSING_TTL_DAYS} days')`,
    )
    .bind(id)
    .first<{ contact_info: string }>();
  return row?.contact_info ?? null;
}

/**
 * Saját hirdetés megújítása: a created_at MOST-ra áll (új 60 napos ciklus).
 * Csak a feladó, csak jóváhagyott+aktív hirdetésre, és csak a lejárat-ablakban
 * (≤7 nap hátralévő vagy már lejárt) — a tartalom nem változik, ezért NEM megy
 * újra moderációba. A friss hirdetés megújítása tiltott (lista-élre ugrálás ellen).
 */
export async function renewOwnHousingListing(id: string, userId: string): Promise<boolean> {
  const res = await getDB()
    .prepare(
      `UPDATE kinti_housing_listings SET created_at = unixepoch('now'), expiry_warned_at = NULL
       WHERE id = ? AND user_id = ? AND is_active = 1 AND moderation_status = 1
         AND created_at <= unixepoch('now', '-${HOUSING_TTL_DAYS - 7} days')`,
    )
    .bind(id, userId)
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

/**
 * Lejárat-előtti (≤3 nap) hirdetések, amik még nem kaptak figyelmeztetőt
 * (0137 expiry_warned_at őr). A kontaktot a NAPI CRON használja az email-
 * küldéshez (szerver-oldal) — a lista-payload anti-leak szabályát nem érinti.
 */
export async function getHousingExpiringSoon(limit = 15): Promise<{
  id: string; city: string; country: string; type: string;
  price: number; currency: string; contact: string; createdAt: number;
}[]> {
  const { results } = await getDB()
    .prepare(
      `SELECT id, city, country, type, price, currency, contact_info, created_at
       FROM kinti_housing_listings
       WHERE is_active = 1 AND moderation_status = 1 AND expiry_warned_at IS NULL
         AND created_at <= unixepoch('now', '-${HOUSING_TTL_DAYS - 3} days')
         AND created_at > unixepoch('now', '-${HOUSING_TTL_DAYS} days')
       ORDER BY created_at ASC LIMIT ?`,
    )
    .bind(limit)
    .all<{ id: string; city: string; country: string; type: string; price: number; currency: string; contact_info: string; created_at: number }>();
  return (results ?? []).map((r) => ({
    id: r.id, city: r.city, country: r.country, type: r.type,
    price: r.price, currency: r.currency, contact: r.contact_info, createdAt: r.created_at,
  }));
}

/** Egyszeri-küldés bélyeg — kudarcnál is hívjuk (a napi újra-spam ellen). */
export async function markHousingExpiryWarned(id: string): Promise<void> {
  await getDB()
    .prepare("UPDATE kinti_housing_listings SET expiry_warned_at = datetime('now') WHERE id = ?")
    .bind(id)
    .run();
}

/**
 * GDPR tárolás-korlátozás (napi cron): a lejárat után 30 nappal meg nem újított
 * hirdetés VÉGLEGESEN törlődik (a feladónak 30 nap türelmi ideje van a
 * megújításra); az elutasított hirdetés 30 nap után törlődik (addig a feladó
 * látja a DSA-indoklást). Az adatvédelmi 2.28 tárolási-idő pontja ezt közli.
 */
export async function purgeExpiredHousing(): Promise<number> {
  const res = await getDB()
    .prepare(
      `DELETE FROM kinti_housing_listings
       WHERE created_at <= unixepoch('now', '-${HOUSING_TTL_DAYS + 30} days')
          OR (moderation_status = 2 AND created_at <= unixepoch('now', '-30 days'))`,
    )
    .run();
  return res.meta?.changes ?? 0;
}

/** Push-értesítéshez szükséges mezők (kontakt NÉLKÜL) — a moderációs
 *  jóváhagyás-hook hívja. */
export async function getHousingListingForNotify(id: string): Promise<{
  type: string; country: string; city: string; regionCode: string | null;
  price: number; currency: string;
} | null> {
  const row = await getDB()
    .prepare("SELECT type, country, city, region_code, price, currency FROM kinti_housing_listings WHERE id = ? AND is_active = 1")
    .bind(id)
    .first<{ type: string; country: string; city: string; region_code: string | null; price: number; currency: string }>();
  if (!row) return null;
  return {
    type: row.type, country: row.country, city: row.city,
    regionCode: row.region_code, price: row.price, currency: row.currency,
  };
}

/** Mai (24h) feladások egy felhasználótól — napi rate-limit. */
export async function countRecentHousingByUser(userId: string): Promise<number> {
  const row = await getDB()
    .prepare(
      "SELECT COUNT(*) AS n FROM kinti_housing_listings WHERE user_id = ? AND created_at > unixepoch('now', '-1 day')",
    )
    .bind(userId)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

/** Alap-adatok a DSA-bejelentéshez (létezés-ellenőrzés + email-kivonat). */
export async function getHousingListingBasic(
  id: string,
): Promise<{ id: string; city: string; description: string } | null> {
  const row = await getDB()
    .prepare("SELECT id, city, description FROM kinti_housing_listings WHERE id = ?")
    .bind(id)
    .first<{ id: string; city: string; description: string }>();
  return row ?? null;
}

/** DSA notice-and-action: jelentéskor azonnal lekerül; admin „keep" visszaállítja. */
export async function setHousingListingVisibility(id: string, visible: boolean): Promise<void> {
  await getDB()
    .prepare("UPDATE kinti_housing_listings SET is_active = ? WHERE id = ?")
    .bind(visible ? 1 : 0, id)
    .run();
}

/** Végleges törlés (DSA remove / saját hirdetés levétele). */
export async function deleteHousingListingById(id: string): Promise<void> {
  await getDB().prepare("DELETE FROM kinti_housing_listings WHERE id = ?").bind(id).run();
}

/** Saját hirdetés levétele — csak a feladó törölheti (user_id-egyezés). */
export async function deleteOwnHousingListing(id: string, userId: string): Promise<boolean> {
  const res = await getDB()
    .prepare("DELETE FROM kinti_housing_listings WHERE id = ? AND user_id = ?")
    .bind(id, userId)
    .run();
  return (res.meta?.changes ?? 0) > 0;
}
