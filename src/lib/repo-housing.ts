/**
 * repo-housing.ts — „Szoba- és albérlet-börze" hirdetések (0133 migráció).
 *
 * ⚠️ ANTI-LEAK SZABÁLY: a publikus lista-vetület (HousingListing) SZÁNDÉKOSAN
 * nem tartalmazza a contact_info-t — az kizárólag a PRO-gated
 * getHousingContactInfo()-n keresztül olvasható (kapuőr-modell). Új mező
 * felvételekor ezt a határt tartsd meg.
 */
import { getDB } from "./cloudflare";
import type { HousingInput, HousingType } from "./housing";

export interface HousingListing {
  id: string;
  type: HousingType;
  country: string;
  city: string;
  price: number;
  currency: string;
  description: string;
  createdAt: number; // unixepoch (mp)
  /** A néző saját hirdetése-e (a lista-API tölti ki, kontakt nélkül is hasznos). */
  own?: boolean;
  /** Jóváhagyásra vár — CSAK a feladó látja a sajátját így (0134 moderáció). */
  pending?: boolean;
}

interface Row {
  id: string; user_id: string; type: string; country: string; city: string;
  price: number; currency: string; description: string; created_at: number;
  moderation_status: number;
}

const PUBLIC_COLS =
  "id, user_id, type, country, city, price, currency, description, created_at, moderation_status";

function toListing(r: Row, viewerUserId?: string | null): HousingListing {
  return {
    id: r.id, type: r.type as HousingType, country: r.country, city: r.city,
    price: r.price, currency: r.currency, description: r.description,
    createdAt: r.created_at, own: viewerUserId != null && r.user_id === viewerUserId,
    pending: r.moderation_status === 0,
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
  if (viewerUserId) {
    visibility = "(moderation_status = 1 OR (moderation_status = 0 AND user_id = ?))";
    binds.push(viewerUserId);
  }
  let where = `is_active = 1 AND ${visibility} AND created_at > unixepoch('now', '-60 days')`;
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
         (id, user_id, type, country, city, price, currency, description, contact_info, is_active, moderation_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)`,
    )
    .bind(
      id, input.userId, input.type, input.country, input.city,
      input.price, input.currency, input.description, input.contact,
    )
    .run();
  return id;
}

/** A kontakt — KIZÁRÓLAG a PRO-gated /api/housing/contact hívja (szerver-kapu).
 *  Csak jóváhagyott hirdetésé adható ki (pending/elutasított → null). */
export async function getHousingContactInfo(id: string): Promise<string | null> {
  const row = await getDB()
    .prepare("SELECT contact_info FROM kinti_housing_listings WHERE id = ? AND is_active = 1 AND moderation_status = 1")
    .bind(id)
    .first<{ contact_info: string }>();
  return row?.contact_info ?? null;
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
