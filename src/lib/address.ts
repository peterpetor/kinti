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

/** A blurb-be ágyazott weboldal-domain felismerése (a seed-pipeline-ok a
 * "leírás · domain.tld" formátumban tárolják, http(s):// nélkül). */
function hasWebsiteInBlurb(blurb: string | null | undefined): boolean {
  if (!blurb) return false;
  return /\b[a-z0-9-]+\.(com|org|net|at|ch|de|nl|hu|eu|info|shop|store|io|nl)\b/i.test(blurb);
}

/**
 * Van-e BÁRMILYEN mód elérni a vállalkozást (utcaszintű cím, telefon, vagy
 * weboldal a blurb-ben) — enélkül a bejegyzés csak névre ismert, semmilyen
 * konkrét akcióhoz (Útvonal, Hívás, Weboldal) nem vezet.
 */
export function hasContactInfo(b: {
  address?: string | null;
  phone?: string | null;
  blurb?: string | null;
}): boolean {
  return hasStreetAddress(b.address) || !!b.phone?.trim() || hasWebsiteInBlurb(b.blurb);
}
