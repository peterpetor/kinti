/**
 * contact-obfuscate.ts — a kontakt-adat (telefonszám) egyszerű, VISSZAFEJTHETŐ
 * elhomályosítása a hálózaton (megfordítás + Base64).
 *
 * Ez NEM titkosítás és nem is annak szánjuk: a valódi védelem a rate-limit +
 * blocklist + a szám kivétele a tömeges/HTML-válaszokból. Ez a réteg CSAK a
 * legegyszerűbb, forráskódot regexszel fésülő spambotokat akasztja meg (a
 * `+41 79 …` mintát nem találják nyersen a válaszban). PURE + izomorf (böngésző:
 * btoa/atob, edge/Node: ugyanaz; Buffer-fallback a biztonság kedvéért).
 */

// btoa/atob minden cél-futtatókörnyezetben elérhető: böngésző, Cloudflare edge,
// és Node 18+ (a vitest). A telefonszám ASCII (+, számjegy, szóköz, -, /, ()),
// így a Latin1-alapú btoa biztonságosan kezeli.

/** Nyers kontakt → elhomályosított token (megfordítás + Base64). */
export function encodeContact(raw: string): string {
  const reversed = raw.split("").reverse().join("");
  return btoa(reversed);
}

/** Elhomályosított token → nyers kontakt. Hibás bemenetnél üres string. */
export function decodeContact(token: string): string {
  try {
    const reversed = atob(token);
    return reversed.split("").reverse().join("");
  } catch {
    return "";
  }
}
