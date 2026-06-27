/**
 * repo-presence.ts — „Ki költözött melléd?" anonim jelenlét-hőtérkép.
 *
 * Egy névtelen ping = egy magyar jelezte, melyik régióban él. NINCS account/email;
 * az `ip_hash` CSAK rate-limit kulcs (egyirányú, nem identitás). Régió-szinten
 * aggregálunk — a számok „puhák" (ezért a UI „legalább X"-et ír). Lásd 0091 migráció.
 */
import { getDB } from "./cloudflare";

export interface PresenceCount {
  regionCode: string;
  n: number;
  /** Ebből az utolsó 30 napban érkezett (a „nemrég költöztek ide" kártyához). */
  recent: number;
}

export interface PresenceCityCount {
  city: string;
  n: number;
  recent: number;
}

/** Egy anonim ping rögzítése (város-szinten; a region_code a térkép-aggregáláshoz). */
export async function addPresencePing(input: {
  id: string;
  country: string;
  regionCode: string;
  city: string;
  ipHash: string;
}): Promise<void> {
  await getDB()
    .prepare(`INSERT INTO presence_pings (id, country, region_code, city, ip_hash) VALUES (?, ?, ?, ?, ?)`)
    .bind(input.id, input.country, input.regionCode, input.city, input.ipHash)
    .run();
}

/** Városonkénti darabszám (+ utolsó 30 nap) — a top-listához, személyes kártyához, város-buborékokhoz. */
export async function getPresenceCityCounts(country: string): Promise<PresenceCityCount[]> {
  const { results } = await getDB()
    .prepare(`SELECT city, COUNT(*) AS n, SUM(CASE WHEN datetime(created_at) > datetime('now', '-30 days') THEN 1 ELSE 0 END) AS recent FROM presence_pings WHERE country = ? AND city IS NOT NULL GROUP BY city ORDER BY n DESC`)
    .bind(country)
    .all<PresenceCityCount>();
  return results ?? [];
}

/**
 * Régiónkénti darabszám egy országban (a hőtérképhez + összesítéshez), valamint
 * az utolsó 30 napban érkezettek száma (a „nemrég költöztek ide" kártyához).
 */
export async function getPresenceCounts(country: string): Promise<PresenceCount[]> {
  const { results } = await getDB()
    .prepare(`SELECT region_code AS regionCode, COUNT(*) AS n, SUM(CASE WHEN datetime(created_at) > datetime('now', '-30 days') THEN 1 ELSE 0 END) AS recent FROM presence_pings WHERE country = ? GROUP BY region_code ORDER BY n DESC`)
    .bind(country)
    .all<PresenceCount>();
  return results ?? [];
}

/** Mai (24h) pingek száma egy ip_hash-ről — rate-limithez (háztartás-barát plafon). */
export async function countPresenceByIpToday(ipHash: string | null): Promise<number> {
  if (!ipHash) return 0;
  const row = await getDB()
    .prepare(`SELECT COUNT(*) AS n FROM presence_pings WHERE ip_hash = ? AND datetime(created_at) > datetime('now', '-1 day')`)
    .bind(ipHash)
    .first<{ n: number }>();
  return row?.n ?? 0;
}
