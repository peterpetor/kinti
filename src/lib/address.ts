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
  /** A bulk lista-vetület (ListBusiness) a nyers szám helyett CSAK ezt adja
   *  (scrape-védelem) — a telefon meglétét így is figyelembe vesszük. */
  hasPhone?: boolean;
  blurb?: string | null;
}): boolean {
  const phonePresent = !!b.phone?.trim() || b.hasPhone === true;
  return hasStreetAddress(b.address) || phonePresent || hasWebsiteInBlurb(b.blurb);
}

/**
 * A cím VÁROS-részének kiemelése a lista-kártyához.
 *
 * ⚠️ MIÉRT KELL: a szaknévsor országos lista (Németországra 973 találat), a
 * kártyán viszont eddig se város, se régió nem szerepelt — a felhasználó nem
 * tudta eldönteni, elérhető közelségben van-e a találat. A teljes cím
 * széttörné a kártyát, ezért CSAK a várost mutatjuk.
 *
 * ⚠️⚠️ AZ ELSŐ VÁLTOZATOM „TISZTA" MINTÁKON HIBÁTLAN VOLT, VALÓS ADATON NEM.
 * A 2224 élő címen 59 hibás kimenet jött ki, és mind NÉMÁN rossz lett volna
 * (nem hibaüzenet, csak egy fura sztring a kártyán). A valóság:
 *   „Utca 7, 70178 Stuttgart"        — irányítószám a város ELŐTT (DE/AT/CH/ES)
 *   „Middenweg 116, 1097 BT Amsterdam" — szám + két betű (NL)
 *   „62 Little Ealing Lane, London W5 4EA" — a kód a város UTÁN (GB)
 *   „85457 Wörth, Osterfeldweg 3"    — FORDÍTOTT sorrend: város elöl, utca hátul
 *   „Domplatz 5 93047 Regensburg"    — nincs vessző, minden egy szegmensben
 *   „Ötisheim 75443"                 — város, mögötte az irányítószám
 *   „London NW2"                     — CSAK a brit külső kód
 *   „Keizersgracht 132"              — CSAK utca: a várost NEM tudjuk
 *   „Országos, telefonos tanácsadás" — nem cím, hanem szolgáltatási terület
 *
 * Ezért NEM szegmens-pozícióra építünk, hanem az IRÁNYÍTÓSZÁMOT keressük meg
 * bárhol, és a mellette álló szövegből választunk. Ha nem megy biztonsággal,
 * `null` — inkább ne írjunk ki várost, mint rosszat.
 */

/** Utcanév-e (házszám vagy utca-utótag) — ilyet sosem mutatunk városként. */
function utcaSzeru(s: string): boolean {
  if (/\d/.test(s)) return true;
  return /(stra(ss|ß)e|str\.?|gasse|weg|platz|allee|ring|passage|street|road|lane|avenue|straat|calle|plaça|plaza)$/i.test(s.trim());
}

/**
 * Szabad szöveg (szolgáltatási terület), nem cím.
 *
 * ⚠️ NEM `\b` SZÓHATÁR. A JS-ben a `\w` csak [A-Za-z0-9_], tehát az „és” első
 * betűje (é) NEM szó-karakter — a `\bés\b` SOSEM illeszkedik. Emiatt csúszott át
 * a „Frankfurt am Main és környéke” városnévként. Szóköz/sor-határra megyünk.
 */
function szabadSzoveg(s: string): boolean {
  // 34: a leghosszabb valós városnév az adatbázisban 31 karakter
  // („Bruck an der Großglocknerstraße”); a szabad szövegek ennél hosszabbak.
  if (s.length > 34) return true;
  if (/[—–·]/.test(s)) return true;
  return /(^|\s)(és|online|országos|telefonon|környéke)(\s|$)/i.test(s);
}

/** Körbevágás: szóköz, pont, vessző, kötőjel a széleken. */
function vag(s: string): string {
  return s.replace(/^[\s.,-]+|[\s.,-]+$/g, "");
}

function tisztit(s: string): string {
  return s
    .replace(/\(\s*\d+\.?\s*ker\.?\s*\)/gi, "")   // „(18. ker)"
    .replace(/,?\s*\d+\.\s*ker(ület)?\.?/gi, "")   // „, 14. ker"
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function varosNev(address: string | null | undefined): string | null {
  if (!address) return null;
  const teljes = tisztit(address);
  if (!teljes) return null;

  // 1) Kontinentális irányítószám bárhol: 4–5 jegy, NL-nél + két betű.
  const iranyito = teljes.match(/\b(\d{4,5})(?:\s+[A-Z]{2}\b)?/u);
  if (iranyito) {
    const utana = teljes.slice(iranyito.index! + iranyito[0].length).split(",")[0];
    const elotte = teljes.slice(0, iranyito.index!).split(",").pop() ?? "";

    // ⚠️ A KÉT SLOT NEM EGYFORMA SZIGORÚ.
    // Az irányítószám UTÁNI szöveg szinte mindig a város, ezért ott CSAK a
    // házszámot (számjegyet) tekintjük kizáró jelnek — az utca-utótagot NEM.
    // Különben a valódi „5671 Bruck an der Großglocknerstraße” város kiesne
    // pusztán azért, mert a nevében benne van a „straße”.
    const utanaTiszta = vag(utana);
    if (utanaTiszta && !/\d/.test(utanaTiszta) && !szabadSzoveg(utanaTiszta)) return utanaTiszta;

    // Fordított sorrendű címnél („85457 Wörth, Osterfeldweg 3”) az irányítószám
    // ELŐTTI szegmens a város — itt viszont KELL az utca-szűrés, mert ez a slot
    // gyakran tényleg utca.
    const elotteTiszta = vag(elotte);
    if (elotteTiszta && !utcaSzeru(elotteTiszta) && !szabadSzoveg(elotteTiszta)) return elotteTiszta;
    return null;
  }

  // 2) Brit irányítószám (teljes vagy csak külső kód) — a város ELŐTTE áll.
  const brit = teljes.match(/\s+[A-Z]{1,2}\d[A-Z\d]?(\s*\d[A-Z]{2})?$/u);
  if (brit) {
    const v = teljes.slice(0, brit.index!).split(",").pop()?.trim() ?? "";
    if (v && !utcaSzeru(v) && !szabadSzoveg(v)) return v;
    return null;
  }

  // 3) Nincs irányítószám: csak akkor város, ha az utolsó szegmens tiszta névnek
  //    látszik (nincs szám, nem utca-utótag, nem szabad szöveg).
  const utolso = teljes.split(",").pop()?.trim() ?? "";
  if (!utolso) return null;
  if (/^(mobil|online)$/i.test(utolso)) return null;
  if (utcaSzeru(utolso) || szabadSzoveg(utolso)) return null;
  return utolso;
}
