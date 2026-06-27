/**
 * repo-referral.ts — „Küldj egy magyart" anonim referral.
 *
 * NINCS account/identitás: a `code` a meghívó böngészőjében generált random kód,
 * az `ip_hash` CSAK dedup/rate-limit (egyirányú, nem identitás). A `(code, ip_hash)`
 * UNIQUE index miatt egy hálózat egy kódot csak egyszer növel. Lásd 0093 migráció.
 */
import { getDB } from "./cloudflare";

/** Egy konverzió rögzítése (idempotens a UNIQUE(code, ip_hash) miatt). Visszaadja, hogy ÚJ volt-e. */
export async function addReferralConversion(input: { id: string; code: string; ipHash: string }): Promise<boolean> {
  const res = await getDB()
    .prepare(`INSERT OR IGNORE INTO referral_conversions (id, code, ip_hash) VALUES (?, ?, ?)`)
    .bind(input.id, input.code, input.ipHash)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

/** Egy kód konverziószáma (a meghívó kitűző-állapotához). */
export async function getReferralCount(code: string): Promise<number> {
  const row = await getDB()
    .prepare(`SELECT COUNT(*) AS n FROM referral_conversions WHERE code = ?`)
    .bind(code)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

/** Mai (24h) konverziók száma egy ip_hash-ről — anti-abuse plafon (sok kód felfújása ellen). */
export async function countReferralByIpToday(ipHash: string | null): Promise<number> {
  if (!ipHash) return 0;
  const row = await getDB()
    .prepare(`SELECT COUNT(*) AS n FROM referral_conversions WHERE ip_hash = ? AND datetime(created_at) > datetime('now', '-1 day')`)
    .bind(ipHash)
    .first<{ n: number }>();
  return row?.n ?? 0;
}
