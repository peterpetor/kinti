/**
 * address.ts — cím-segédfüggvények.
 *
 * `hasStreetAddress`: utcaszintű-e a cím (van házszám), vagy csak város/„Mobil"/
 * „Online"/kerület. Ez dönti el, megjelenjen-e az „Útvonal" gomb: városközpontra
 * navigálni értelmetlen (nem vezet a tényleges helyre). Ugyanaz a heurisztika,
 * mint a geokódolásban (scripts/geocode-imported.mjs::isGeocodable).
 */
export function hasStreetAddress(address: string | null | undefined): boolean {
  if (!address) return false;
  const cleaned = address
    .replace(/\(\s*\d+\.?\s*ker\.?\s*\)/gi, "")     // (18. ker)
    .replace(/,?\s*\d+\.\s*ker(ület)?\.?/gi, "")     // , 14. ker / 5. kerület
    .replace(/\bpartnerklinika\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (!/\d/.test(cleaned)) return false;               // nincs házszám → nem utcaszintű
  if (/^(mobil|online)$/i.test(cleaned)) return false; // „Mobil" / „Online"
  return cleaned.length > 4;
}
