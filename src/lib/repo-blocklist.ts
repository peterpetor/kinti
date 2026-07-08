/**
 * repo-blocklist.ts — scrape-védelmi IP-tiltólista adatréteg (0121 migráció).
 *
 * A honeypot-csapdába lépő robotok `ip_hash`-ét jegyezzük, és a védett végpontok
 * (bulk lista, kontakt) ezt nézik. PII-mentes: mindig a hashelt IP tárolódik
 * (lásd hashIp), sose a nyers cím.
 */
import { getDB } from "./cloudflare";

/** Egy ip_hash tiltása (idempotens; a honeypot-trigger hívja). */
export async function blockIpHash(ipHash: string, reason = "honeypot"): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO scrape_blocklist (ip_hash, reason) VALUES (?, ?)
       ON CONFLICT(ip_hash) DO NOTHING`,
    )
    .bind(ipHash, reason)
    .run();
}

/**
 * Tiltva van-e ez az ip_hash? Közvetlen PK-lekérés (azonnali érvényesülés, nincs
 * cache-késleltetés). `null` ipHash (pl. hiányzó IP) → nem tiltjuk (fail-open,
 * hogy egy hiányzó CF-fejléc miatt valódi user ne essen ki).
 */
export async function isIpBlocked(ipHash: string | null): Promise<boolean> {
  if (!ipHash) return false;
  try {
    const row = await getDB()
      .prepare("SELECT 1 AS x FROM scrape_blocklist WHERE ip_hash = ? LIMIT 1")
      .bind(ipHash)
      .first<{ x: number }>();
    return !!row;
  } catch {
    // Ha a tábla még nem létezik (migráció nem futott), NE blokkoljunk.
    return false;
  }
}
