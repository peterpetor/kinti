/**
 * repo-requests.ts — „Keresek" igény-hirdetések (felhasználói kereslet → szakik
 * jelentkeznek a megadott elérhetőségen). Admin-moderált; az ip_hash csak
 * rate-limit (nem identitás). A `contact` a kérő által választott, moderált, publikus
 * elérhetőség. Lásd 0095 migráció.
 */
import { getDB } from "./cloudflare";

export interface ServiceRequest {
  id: string;
  country: string;
  regionCode: string | null;
  category: string | null;
  title: string;
  description: string | null;
  city: string | null;
  whenText: string | null;
  contact: string;
  createdAt: string;
}

interface Row {
  id: string; country_code: string; region_code: string | null; category: string | null;
  title: string; description: string | null; city: string | null; when_text: string | null;
  contact: string; created_at: string;
}

function toReq(r: Row): ServiceRequest {
  return {
    id: r.id, country: r.country_code, regionCode: r.region_code, category: r.category,
    title: r.title, description: r.description, city: r.city, whenText: r.when_text,
    contact: r.contact, createdAt: r.created_at,
  };
}

/** Jóváhagyott, nem lejárt igények egy országban (opcionális kategória-szűrő). */
export async function getServiceRequests(country: string, category?: string | null): Promise<ServiceRequest[]> {
  const binds: unknown[] = [country];
  let where = "country_code = ? AND moderation_status = 1 AND (expires_at IS NULL OR expires_at > datetime('now'))";
  if (category && category !== "all") { where += " AND category = ?"; binds.push(category); }
  const { results } = await getDB()
    .prepare(`SELECT * FROM service_requests WHERE ${where} ORDER BY created_at DESC LIMIT 100`)
    .bind(...binds)
    .all<Row>();
  return (results ?? []).map(toReq);
}

/** Egy kérés alap-adatai (DSA-bejelentés létezés-ellenőrzés + kivonat). */
export async function getServiceRequestBasic(id: string): Promise<{ id: string; title: string; contact: string | null } | null> {
  const row = await getDB()
    .prepare("SELECT id, title, contact FROM service_requests WHERE id = ?")
    .bind(id)
    .first<{ id: string; title: string; contact: string | null }>();
  return row ?? null;
}

/**
 * DSA notice-and-action: bejelentéskor a hirdetés azonnal eltűnik a tábláról
 * (moderation_status=0 — vissza a moderációs sorba is), keep visszaállítja.
 */
export async function setServiceRequestVisibility(id: string, visible: boolean): Promise<void> {
  await getDB()
    .prepare("UPDATE service_requests SET moderation_status = ? WHERE id = ?")
    .bind(visible ? 1 : 0, id)
    .run();
}

/** Végleges törlés (DSA remove). */
export async function deleteServiceRequestById(id: string): Promise<void> {
  await getDB().prepare("DELETE FROM service_requests WHERE id = ?").bind(id).run();
}

/** Mai (24h) beküldések egy ip_hash-ről — rate-limit. */
export async function countServiceRequestByIp(ipHash: string | null): Promise<number> {
  if (!ipHash) return 0;
  const row = await getDB()
    .prepare(`SELECT COUNT(*) AS n FROM service_requests WHERE ip_hash = ? AND datetime(created_at) > datetime('now', '-1 day')`)
    .bind(ipHash)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

/** Új igény — PENDING (moderation_status=0), 30 nap után lejár. */
export async function createServiceRequest(input: {
  country: string; regionCode: string | null; category: string; title: string;
  description: string | null; city: string | null; whenText: string | null;
  contact: string; ipHash: string;
}): Promise<string> {
  const id = crypto.randomUUID();
  await getDB()
    .prepare(
      `INSERT INTO service_requests
         (id, country_code, region_code, category, title, description, city, when_text, contact,
          ip_hash, moderation_status, status, created_at, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'approved', datetime('now'), datetime('now', '+30 days'))`,
    )
    .bind(
      id, input.country, input.regionCode, input.category, input.title, input.description,
      input.city, input.whenText, input.contact, input.ipHash,
    )
    .run();
  return id;
}
