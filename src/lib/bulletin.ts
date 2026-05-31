/**
 * Közös, GDPR-megfelelőséget biztosító titkosítási és jogi konstansok.
 * A hirdetőtábla kivezetése után is megmaradt, mert az egész alkalmazás
 * ezt használja a rate-limit és GDPR-biztos IP-hasheléshez.
 */

/**
 * A jogi szövegek (ÁSZF + Adatkezelési Tájékoztató) jelenlegi verziója.
 */
export const TERMS_VERSION = "2026-05-25";

/**
 * Web Crypto SHA-256 hex — IP-cím irreverzibilis hash-eléséhez. A GDPR
 * adatminimalizálási elvet teljesíti: a nyers IP-t nem tároljuk, csak a
 * hash-ét; ettől függetlenül duplikáció / abuse-vizsgálatra használható
 * (egy IP-ről indított ismétlődő spamhullám felismerésére).
 *
 * IPv6 esetén csak az ELSŐ 4 hextet-et (= /64 prefix) hash-eljük. Az ISP-k
 * tipikusan /64-et adnak egy ügyfélnek, és a felhasználó tetszőlegesen
 * választhat IP-t ebből — így ha a teljes 128 bit-et hash-elnénk, egy bot
 * "rotation"-nal könnyen kerülne a rate-limitet. /64 prefix biztosítja, hogy
 * ugyanaz a hash jöjjön létre minden IP-re az adott customer-prefixen belül.
 *
 * Edge-runtime kompatibilis — a `crypto.subtle` minden Workers/Pages
 * környezetben elérhető.
 */
export async function hashIp(ip: string | null): Promise<string | null> {
  if (!ip) return null;
  const normalized = normalizeIpForHash(ip);
  const data = new TextEncoder().encode(normalized);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * IPv6 esetén normalizálja a címet a /64 prefix-re. IPv4 esetén változatlanul
 * visszaadja. Nem IP-nek tűnő string-et is változatlanul ad vissza.
 */
function normalizeIpForHash(ip: string): string {
  const trimmed = ip.trim().toLowerCase();
  // IPv4 → változatlan
  if (!trimmed.includes(":")) return trimmed;

  // IPv6 normalizálás: kibontjuk a `::` rövidítést egy üres group-listára,
  // aztán az első 4 hextet-et tartjuk meg, a többit nullázzuk.
  try {
    // IPv4-mapped IPv6 (pl. ::ffff:1.2.3.4) — IPv4-ként kezeljük
    if (trimmed.startsWith("::ffff:") && trimmed.includes(".")) {
      return trimmed.slice(7);
    }

    const parts = trimmed.split("::");
    let groups: string[];
    if (parts.length === 1) {
      groups = trimmed.split(":");
    } else if (parts.length === 2) {
      const left = parts[0] ? parts[0].split(":") : [];
      const right = parts[1] ? parts[1].split(":") : [];
      const fill = 8 - left.length - right.length;
      groups = [...left, ...Array(fill).fill("0"), ...right];
    } else {
      // Több `::` érvénytelen IPv6
      return trimmed;
    }
    if (groups.length !== 8) return trimmed;

    // /64 prefix: első 4 hextet, többi 0
    const prefix = groups.slice(0, 4).map((g) => g || "0").join(":");
    return `${prefix}::/64`;
  } catch {
    return trimmed;
  }
}

/**
 * Email-cim SHA-256 hex hash, normalizalas utan (trim + lowercase). A tilto-
 * listara kerulo emaileket is igy hash-eljuk, hogy ne nyers email legyen DB-ben.
 */
export async function hashEmail(email: string | null): Promise<string | null> {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  const data = new TextEncoder().encode(normalized);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
