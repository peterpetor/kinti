/**
 * Megosztott biztonsági segédek — IP/email hash (GDPR adatminimalizálás) és a
 * jogi szövegek verziója. Több account nélküli beküldő-flow (vélemény,
 * vállalkozás, esemény, SOS stb.) használja.
 */

/**
 * A jogi szövegek (ÁSZF + Adatkezelési Tájékoztató) jelenlegi verziója.
 * Akkor frissítsd, amikor érdemi változtatás történik a /aszf vagy a
 * /adatvedelem oldalon — a beküldések ezt az értéket rögzítik az
 * `accepted_terms_at` mellé, így jogvitában bizonyítható, MELYIK verziót
 * fogadta el a felhasználó.
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
/**
 * A kliens IP-címe a request-fejlécekből, fallback-lánccal:
 *   `cf-connecting-ip` (Cloudflare élesben MINDIG kitölti)
 *   → `x-forwarded-for` (első tag, proxy-lánc esetén)
 *   → `x-real-ip`.
 *
 * Miért kell: ha csak a `cf-connecting-ip`-re támaszkodunk, akkor lokál
 * `next dev`-en (és bizonyos proxy-k mögött) hiányzik a fejléc, és az account
 * nélküli flow-k (pl. esemény-RSVP „Megyek") váratlan 400-at dobnának. Élesben
 * a CF-fejléc mindig jelen van, így a fallback oda sosem jut el.
 *
 * Ha egyik fejléc sincs, fejlesztésben stabil loopback-címet adunk vissza
 * (hogy a funkció működjön), élesben pedig `null`-t (a hívó dönt a hibáról).
 */
export function getClientIp(req: Request): string | null {
  const cf = req.headers.get("cf-connecting-ip");
  if (cf?.trim()) return cf.trim();

  const xff = req.headers.get("x-forwarded-for");
  const first = xff?.split(",")[0]?.trim();
  if (first) return first;

  const real = req.headers.get("x-real-ip");
  if (real?.trim()) return real.trim();

  // Lokál fejlesztés: nincs proxy/CF-fejléc → stabil dev-IP, hogy ne 400-azzon.
  if (process.env.NODE_ENV !== "production") return "127.0.0.1";
  return null;
}

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
