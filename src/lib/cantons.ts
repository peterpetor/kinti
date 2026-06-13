/**
 * Svájci kantonok — keresési segédmodul.
 *
 * Két irányba dolgozik:
 *   1) `cantonFromAddress(addr)` — egy svájci címből (PLZ alapján) megpróbálja
 *      megmondani, melyik kantonban van.
 *   2) `matchCantonByName(query)` — a kereső-szóra ránéz, hogy egy kanton
 *      nevére/aliasára/kódjára utal-e.
 *
 * A PLZ → kanton hozzárendelés közelítő (a Svájci Posta körzetei nem fedik 1:1
 * a kantonokat, főleg BE / FR / VS határán), de a tipikus városokra pontos. Ez
 * a kompromisszum egy MVP-keresőhöz bőven elég.
 */

export interface Canton {
  code: string; // 2-betűs ISO-kód
  name: string; // elsődleges (német) név
  aliases: string[]; // alt nevek (EN/FR/IT/HU)
}

export const CANTONS: Canton[] = [
  { code: "ZH", name: "Zürich", aliases: ["zurich", "cürih"] },
  { code: "BE", name: "Bern", aliases: ["berne"] },
  { code: "LU", name: "Luzern", aliases: ["lucerne", "lucern"] },
  { code: "UR", name: "Uri", aliases: [] },
  { code: "SZ", name: "Schwyz", aliases: [] },
  { code: "OW", name: "Obwalden", aliases: [] },
  { code: "NW", name: "Nidwalden", aliases: [] },
  { code: "GL", name: "Glarus", aliases: ["glaris"] },
  { code: "ZG", name: "Zug", aliases: ["zoug"] },
  { code: "FR", name: "Fribourg", aliases: ["freiburg"] },
  { code: "SO", name: "Solothurn", aliases: ["soleure"] },
  { code: "BS", name: "Basel-Stadt", aliases: ["basel", "bale", "bázel"] },
  { code: "BL", name: "Basel-Landschaft", aliases: ["baselland"] },
  { code: "SH", name: "Schaffhausen", aliases: ["schaffhouse"] },
  { code: "AR", name: "Appenzell Ausserrhoden", aliases: ["appenzell ar"] },
  { code: "AI", name: "Appenzell Innerrhoden", aliases: ["appenzell ai"] },
  { code: "SG", name: "St. Gallen", aliases: ["sankt gallen", "st gallen", "saint gall"] },
  { code: "GR", name: "Graubünden", aliases: ["graubunden", "grisons", "grigioni"] },
  { code: "AG", name: "Aargau", aliases: ["argovie"] },
  { code: "TG", name: "Thurgau", aliases: ["thurgovie"] },
  { code: "TI", name: "Ticino", aliases: ["tessin"] },
  { code: "VD", name: "Vaud", aliases: ["waadt"] },
  { code: "VS", name: "Valais", aliases: ["wallis"] },
  { code: "NE", name: "Neuchâtel", aliases: ["neuchatel", "neuenburg"] },
  { code: "GE", name: "Genève", aliases: ["geneva", "geneve", "genf", "genova"] },
  { code: "JU", name: "Jura", aliases: [] },
];

const BY_CODE = new Map(CANTONS.map((c) => [c.code, c]));

/** Érvényes 2-betűs kanton-kód? */
export function isValidCantonCode(code: unknown): code is string {
  return typeof code === "string" && BY_CODE.has(code);
}

/** Megjelenítendő kanton-név egy kódhoz (ismeretlen → null). */
export function cantonName(code: string | null | undefined): string | null {
  if (!code) return null;
  return BY_CODE.get(code)?.name ?? null;
}

/**
 * Kanton-székhelyek koordinátái — az időjárás-widget ezeket használja
 * (a kiválasztott kanton székhelyének aktuális időjárását mutatja).
 */
export interface CantonPoint {
  code: string;
  city: string; // a székhely neve, ahogy a UI-ban megjelenik
  lat: number;
  lng: number;
}

export const CANTON_COORDS: Record<string, CantonPoint> = {
  ZH: { code: "ZH", city: "Zürich", lat: 47.3769, lng: 8.5417 },
  BE: { code: "BE", city: "Bern", lat: 46.948, lng: 7.4474 },
  LU: { code: "LU", city: "Luzern", lat: 47.0502, lng: 8.3093 },
  UR: { code: "UR", city: "Altdorf", lat: 46.8803, lng: 8.6444 },
  SZ: { code: "SZ", city: "Schwyz", lat: 47.0207, lng: 8.653 },
  OW: { code: "OW", city: "Sarnen", lat: 46.8959, lng: 8.2456 },
  NW: { code: "NW", city: "Stans", lat: 46.958, lng: 8.366 },
  GL: { code: "GL", city: "Glarus", lat: 47.0404, lng: 9.068 },
  ZG: { code: "ZG", city: "Zug", lat: 47.1662, lng: 8.5155 },
  FR: { code: "FR", city: "Fribourg", lat: 46.8065, lng: 7.1619 },
  SO: { code: "SO", city: "Solothurn", lat: 47.2088, lng: 7.5323 },
  BS: { code: "BS", city: "Basel", lat: 47.5596, lng: 7.5886 },
  BL: { code: "BL", city: "Liestal", lat: 47.484, lng: 7.734 },
  SH: { code: "SH", city: "Schaffhausen", lat: 47.697, lng: 8.6349 },
  AR: { code: "AR", city: "Herisau", lat: 47.3858, lng: 9.2792 },
  AI: { code: "AI", city: "Appenzell", lat: 47.33, lng: 9.409 },
  SG: { code: "SG", city: "St. Gallen", lat: 47.4245, lng: 9.3767 },
  GR: { code: "GR", city: "Chur", lat: 46.8499, lng: 9.5329 },
  AG: { code: "AG", city: "Aarau", lat: 47.3925, lng: 8.0442 },
  TG: { code: "TG", city: "Frauenfeld", lat: 47.5536, lng: 8.8987 },
  TI: { code: "TI", city: "Bellinzona", lat: 46.1944, lng: 9.0244 },
  VD: { code: "VD", city: "Lausanne", lat: 46.5197, lng: 6.6323 },
  VS: { code: "VS", city: "Sion", lat: 46.2294, lng: 7.3589 },
  NE: { code: "NE", city: "Neuchâtel", lat: 46.992, lng: 6.931 },
  GE: { code: "GE", city: "Genève", lat: 46.2044, lng: 6.1432 },
  JU: { code: "JU", city: "Delémont", lat: 47.3667, lng: 7.35 },
};

/** Kanton-kód (vagy "all") → koordináta-pont. Alapértelmezés: Zürich. */
export function cantonPoint(code: string | null | undefined): CantonPoint {
  if (code && code !== "all" && CANTON_COORDS[code]) return CANTON_COORDS[code];
  return CANTON_COORDS.ZH;
}

/**
 * GPS-koordinátához a legközelebbi kanton (a kanton-fővárosok pontjai alapján).
 *
 * Kliensoldali közelítés az onboarding „Helyzetem használata" gombhoz: a
 * felhasználó GPS-pontjához legközelebbi kanton-fővárost választja. Nem küld
 * semmit a szerverre (nincs PII), és a felhasználó a dropdownban felülírhatja.
 * A fővárosi pont közelítés a legtöbb esetben a tényleges kantont adja; a
 * határszéli pontoknál a szomszéd kantont — ezt az ember egy kattintással javítja.
 */
export function nearestCantonCode(lat: number, lng: number): CantonPoint {
  let best: CantonPoint = CANTON_COORDS.ZH;
  let bestD = Infinity;
  for (const p of Object.values(CANTON_COORDS)) {
    // Olcsó négyzetes euklideszi táv (rangsoroláshoz elég, nincs sqrt/trig).
    const d = (p.lat - lat) ** 2 + (p.lng - lng) ** 2;
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return best;
}

/** Canton-név → URL-barát slug (ékezet-mentes, kisbetűs, kötőjeles). */
export function cantonToSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** URL-slug → Canton objektum, vagy null. Felfedezi a "zurich" → ZH, "st-gallen" → SG. */
export function cantonFromSlug(slug: string): Canton | null {
  const s = slug.toLowerCase();
  for (const c of CANTONS) {
    if (cantonToSlug(c.name) === s) return c;
    if (c.aliases.some((a) => cantonToSlug(a) === s)) return c;
    if (c.code.toLowerCase() === s) return c;
  }
  return null;
}

/** Diakritika-mentes, kisbetűs forma (Zürich → zurich, Genève → geneve). */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

/**
 * PLZ → kanton. Konkrét 2-számjegy tartományok először (pontosabb),
 * fallback 1-számjegyes körzet.
 */
function plzToCanton(plz: string): Canton | null {
  if (!/^[1-9]\d{3}$/.test(plz)) return null;
  const d2 = parseInt(plz.slice(0, 2), 10);
  // pontosabb 2-számjegyes tartományok
  if (d2 === 12) return BY_CODE.get("GE") ?? null; // 1200-1299
  if (d2 === 13) return BY_CODE.get("VD") ?? null; // 1300-1399 Morges/etc.
  if (d2 === 16) return BY_CODE.get("VD") ?? null;
  if (d2 === 17) return BY_CODE.get("FR") ?? null;
  if (d2 === 18) return BY_CODE.get("FR") ?? null;
  if (d2 === 19) return BY_CODE.get("VS") ?? null; // 1900-1999 Martigny/Sion
  if (d2 === 20) return BY_CODE.get("NE") ?? null;
  if (d2 === 23 || d2 === 24) return BY_CODE.get("JU") ?? null;
  if (d2 === 25 || d2 === 26) return BY_CODE.get("BE") ?? null; // Biel/Bienne
  if (d2 === 41 || d2 === 42 || d2 === 43) return BY_CODE.get("BS") ?? null;
  if (d2 === 44) return BY_CODE.get("BL") ?? null;
  if (d2 === 47 || d2 === 48 || d2 === 49) return BY_CODE.get("SO") ?? null;
  if (d2 >= 65 && d2 <= 69) return BY_CODE.get("TI") ?? null; // 6500-6999
  if (d2 === 82) return BY_CODE.get("SH") ?? null; // 8200-8299
  if (d2 === 84 || d2 === 85) return BY_CODE.get("TG") ?? null; // 8400-8599
  if (d2 === 88 || d2 === 89) return BY_CODE.get("SG") ?? null; // 8800-8999
  if (d2 >= 90 && d2 <= 91) return BY_CODE.get("SG") ?? null; // 9000-9199
  if (d2 === 92 || d2 === 93) return BY_CODE.get("AR") ?? null;
  if (d2 === 94) return BY_CODE.get("AI") ?? null;
  // 1-számjegyes fallback
  switch (plz[0]) {
    case "1":
      return BY_CODE.get("VD") ?? null;
    case "2":
      return BY_CODE.get("NE") ?? null;
    case "3":
      return BY_CODE.get("BE") ?? null;
    case "4":
      return BY_CODE.get("BS") ?? null;
    case "5":
      return BY_CODE.get("AG") ?? null;
    case "6":
      return BY_CODE.get("LU") ?? null;
    case "7":
      return BY_CODE.get("GR") ?? null;
    case "8":
      return BY_CODE.get("ZH") ?? null;
    case "9":
      return BY_CODE.get("SG") ?? null;
    default:
      return null;
  }
}

/**
 * Címből (PLZ alapján) megpróbálja kinyerni a kantont.
 * Pl. "Birmensdorferstr. 142, 8003 Zürich" → ZH.
 */
export function cantonFromAddress(address: string | null | undefined): Canton | null {
  if (!address) return null;
  const m = address.match(/\b([1-9]\d{3})\b/);
  if (!m) return null;
  return plzToCanton(m[1]);
}

// ===========================================================================
// Svájci cím-ellenőrzés (vállalkozói profilhoz)
//
// FONTOS: a svájci ÉS a magyar irányítószám is 4-jegyű (1000–9999), ezért a PLZ
// önmagában NEM elég a megkülönböztetéshez. Pozitív svájci jelet követelünk meg
// (svájci város / kanton / ország-szó), és az egyértelmű külföldi országokat
// külön elutasítjuk — így nem csúszik át pl. egy „1051 Budapest" cím.
// ===========================================================================

/** „Schweiz" és társai — ha a címben szerepel, biztosan svájci. */
const SWISS_COUNTRY_WORDS = [
  "schweiz", "suisse", "svizzera", "svizra", "switzerland", "swiss",
  "svajc", "helvetia", "ch",
];

/** Egyértelmű NEM-svájci országok (jobb hibaüzenethez + biztos elutasításhoz). */
const FOREIGN_COUNTRY_WORDS = [
  "magyarorszag", "hungary", "ungarn", "hongrie",
  "deutschland", "germany", "nemetorszag", "allemagne",
  "osterreich", "austria", "ausztria", "autriche",
  "france", "frankreich", "franciaorszag",
  "italia", "italy", "italien", "olaszorszag",
  "romania", "slovensko", "slovakia", "szlovakia", "slowakei",
  "liechtenstein", "espana", "spain", "portugal", "polska", "poland",
  "united states", "united kingdom", "england",
];

/** Nagyobb svájci városok (pozitív jel a PLZ mellé / helyett). */
const SWISS_CITIES = [
  "zurich", "geneve", "genf", "basel", "bern", "berne", "lausanne", "winterthur",
  "luzern", "lucerne", "st. gallen", "st.gallen", "sankt gallen", "gallen",
  "lugano", "biel", "bienne", "thun", "koniz", "la chaux-de-fonds", "fribourg",
  "freiburg", "schaffhausen", "chur", "vernier", "neuchatel", "uster", "sion",
  "sitten", "emmen", "lancy", "yverdon", "zug", "kriens", "rapperswil",
  "dubendorf", "dietikon", "montreux", "frauenfeld", "wetzikon", "baar",
  "aarau", "wadenswil", "allschwil", "renens", "kreuzlingen", "kloten",
  "bulle", "horgen", "nyon", "bellinzona", "locarno", "carouge", "wettingen",
  "baden", "riehen", "olten", "gossau", "muttenz", "meyrin", "onex", "liestal",
  "delemont", "glarus", "herisau", "altdorf", "stans", "schwyz", "wil", "morges",
  "martigny", "solothurn", "burgdorf", "spiez", "interlaken", "davos", "arosa",
  "zermatt", "vevey", "pully", "wohlen", "buchs", "amriswil", "romanshorn",
];

/** Külön szóként illeszkedik-e a tű a szövegben (ne „ch" → „chur" belsejében). */
function hasWord(haystack: string, needle: string): boolean {
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(haystack);
}

/**
 * Svájci cím-e? A vállalkozói profilnál ezzel zárjuk ki a külföldi címeket.
 *
 * Logika (sorrendben):
 *   1) Egyértelmű külföldi ország a címben  → false
 *   2) Svájci ország-szó (Schweiz/Suisse/CH) → true
 *   3) Ismert svájci város                   → true
 *   4) Kanton név/alias a címben             → true
 * Egyébként (pl. csak utca + 4-jegyű PLZ, város nélkül) → false, mert a PLZ
 * önmagában megtévesztő lehet (magyar irányítószám is 4-jegyű).
 */
export function isSwissAddress(address: string | null | undefined): boolean {
  if (!address || !address.trim()) return false;
  const norm = normalize(address);

  if (FOREIGN_COUNTRY_WORDS.some((w) => hasWord(norm, w))) return false;
  if (SWISS_COUNTRY_WORDS.some((w) => hasWord(norm, w))) return true;
  if (SWISS_CITIES.some((c) => hasWord(norm, normalize(c)))) return true;
  if (
    CANTONS.some(
      (c) =>
        hasWord(norm, normalize(c.name)) ||
        c.aliases.some((a) => hasWord(norm, normalize(a))),
    )
  ) {
    return true;
  }
  return false;
}

/**
 * A keresőszó utal-e konkrét kantonra (kód / név / alias)?
 * Min. 2 karakter, hogy a véletlen rövid karakter-sor ne illeszkedjen.
 */
export function matchCantonByName(query: string): Canton | null {
  const q = normalize(query);
  if (q.length < 2) return null;
  for (const c of CANTONS) {
    if (c.code.toLowerCase() === q) return c;
    if (normalize(c.name).includes(q)) return c;
    if (c.aliases.some((a) => normalize(a).includes(q))) return c;
  }
  return null;
}

/** A query egy kantonra utal, ÉS a vállalkozás abban van? */
export function matchesCanton(
  business: { address: string | null },
  query: string,
): boolean {
  const target = matchCantonByName(query);
  if (!target) return false;
  const own = cantonFromAddress(business.address);
  return own?.code === target.code;
}
