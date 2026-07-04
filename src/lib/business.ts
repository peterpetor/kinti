/**
 * Self-service vállalkozás-beküldés — közös konstansok + validáció.
 * Egy helyen, hogy a kliens-űrlap és a szerver-route ugyanazt érvényesítse.
 */

import { findProfanityInFields } from "./profanity";
import { isSwissAddress, CANTON_COORDS } from "./cantons";
import { getRegion } from "./regions";
import { getCountry } from "./countries";
import { AT_BUNDESLAND_POINTS } from "./at-points";

/** A megerősítő link érvényessége (ms). 24 óra — utána a piszkozat törlődik. */
export const BUSINESS_CONFIRM_TTL_MS = 24 * 60 * 60 * 1000;

/** Napi beküldési limit IP/email-enként. */
export const BUSINESS_DAILY_LIMIT = 10;

export const BUSINESS_LIMITS = {
  nameMin: 2,
  nameMax: 100,
  labelMax: 50,
  addressMax: 200,
  phoneMax: 30,
  blurbMax: 600,
  emailMax: 254,
  licenseNumberMax: 120,
} as const;

/**
 * Engedélyköteles kategóriák (SZF 3.1) — ha valaki ilyen kategóriát választ,
 * az UI automatikusan kéri az engedélyszámot és kötelező megadnia.
 */
export const LICENSED_CATEGORY_IDS = new Set([
  // Egészségügy
  "orvos", "fogorvos", "gyogyszeresz", "pszichologus", "fizioterapia",
  "nogyogyasz", "gyermekorvos", "borgyogyasz", "ortopedus", "pszichiater",
  "urologus", "belgyogyasz", "kardiologus", "sebesz", "szemesz", "ful-orr-gege",
  "radiologus", "neurologist",
  // Jog és pénz
  "ugyvéd", "kozjegyzo", "adotanacsado", "befektetési-tanácsadó",
  "biztositaskozveto", "vagyonkezelo",
  // Építészet
  "epitesz", "statikus", "energetikai-tanusite",
  // Gyermek és gondozás
  "gyermekgondozo", "idosgondozo", "oktatas", "magantanar",
]);

export function isLicensedCategory(categoryId: string): boolean {
  return LICENSED_CATEGORY_IDS.has(categoryId.toLowerCase());
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface BusinessFormInput {
  email?: unknown;
  name?: unknown;
  categoryId?: unknown;
  categoryLabel?: unknown;
  cantonCode?: unknown;
  /** Ország-kód (CH/AT…); a régió + cím + koordináta ehhez validálódik. */
  country?: unknown;
  address?: unknown;
  phone?: unknown;
  blurb?: unknown;
  licenseNumber?: unknown;
  licenseAccepted?: unknown;
  /** Beszélt nyelvek (Magyar mindig kötelező). */
  languages?: unknown;
  /** Strukturált heti nyitvatartás JSON (lib/hours WorkingHours). */
  workingHours?: unknown;
  /** Pontos koordináta a térképes címkeresőből (geo.admin.ch). */
  lat?: unknown;
  lng?: unknown;
  /** Bot-csapda — ha van értéke, eldobjuk. */
  website?: unknown;
  acceptTerms?: unknown;
  ageConfirmed?: unknown;
}

export interface ValidatedBusinessInput {
  email: string;
  name: string;
  categoryId: string;
  categoryLabel: string | null;
  cantonCode: string;
  country: string;
  address: string | null;
  phone: string | null;
  blurb: string | null;
  licenseNumber: string | null;
  languages: string[];
  workingHours: string | null;
  lat: number | null;
  lng: number | null;
  acceptTerms: true;
  ageConfirmed: true;
}

/** Engedélyezett nyelvek (egységes a kliens LanguagePicker-rel). */
export const ALLOWED_LANGUAGES = ["Magyar", "Deutsch", "Français", "Italiano", "English"];

/** Svájc nagyjábóli bounding boxa — koordináta-épelméjűségi ellenőrzéshez. */
export function isSwissCoord(lat: number, lng: number): boolean {
  return lat >= 45.7 && lat <= 47.95 && lng >= 5.8 && lng <= 10.7;
}

/** Osztrák bounding box. */
function isAustrianCoord(lat: number, lng: number): boolean {
  return lat >= 46.3 && lat <= 49.1 && lng >= 9.5 && lng <= 17.2;
}

/** Német bounding box. */
function isGermanCoord(lat: number, lng: number): boolean {
  return lat >= 47.2 && lat <= 55.1 && lng >= 5.8 && lng <= 15.1;
}

/** Holland bounding box (európai szárazföld). */
function isDutchCoord(lat: number, lng: number): boolean {
  return lat >= 50.7 && lat <= 53.7 && lng >= 3.2 && lng <= 7.3;
}

/** Ország-tudatos koordináta-épelméjűség (CH/AT/DE/NL). */
export function isInCountryCoord(country: string, lat: number, lng: number): boolean {
  if (country === "AT") return isAustrianCoord(lat, lng);
  if (country === "DE") return isGermanCoord(lat, lng);
  if (country === "NL") return isDutchCoord(lat, lng);
  return isSwissCoord(lat, lng);
}

export type BusinessValidationError = { field: keyof BusinessFormInput; message: string };

export function validateBusinessInput(
  input: BusinessFormInput,
):
  | { ok: true; value: ValidatedBusinessInput }
  | { ok: false; errors: BusinessValidationError[] } {
  const errors: BusinessValidationError[] = [];
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  // honeypot
  if (str(input.website).length > 0) {
    return { ok: false, errors: [{ field: "website", message: "Hibás kérés." }] };
  }

  // Email OPCIONÁLIS (local-first mód)
  const email = str(input.email).toLowerCase();
  if (email) {
    if (email.length > BUSINESS_LIMITS.emailMax)
      errors.push({ field: "email", message: "Túl hosszú email-cím." });
    else if (!EMAIL_RE.test(email))
      errors.push({ field: "email", message: "Érvénytelen email-cím." });
  }

  const name = str(input.name);
  if (name.length < BUSINESS_LIMITS.nameMin)
    errors.push({ field: "name", message: `Legalább ${BUSINESS_LIMITS.nameMin} karakter.` });
  else if (name.length > BUSINESS_LIMITS.nameMax)
    errors.push({ field: "name", message: `Legfeljebb ${BUSINESS_LIMITS.nameMax} karakter.` });

  const categoryId = str(input.categoryId);
  if (!categoryId) errors.push({ field: "categoryId", message: "Válassz kategóriát." });

  // Ország: csak élő ország (CH/AT); a régiót/koordinátát ehhez validáljuk.
  const country = str(input.country) && getCountry(str(input.country))?.enabled ? str(input.country) : "CH";
  const cantonCode = str(input.cantonCode);
  if (!cantonCode) {
    errors.push({ field: "cantonCode", message: "Régió kiválasztása kötelező." });
  } else if (!getRegion(country, cantonCode)) {
    errors.push({ field: "cantonCode", message: "Ismeretlen régió." });
  }

  const categoryLabel = str(input.categoryLabel);
  if (categoryLabel.length > BUSINESS_LIMITS.labelMax)
    errors.push({ field: "categoryLabel", message: `Legfeljebb ${BUSINESS_LIMITS.labelMax} karakter.` });

  // Cím opcionális, DE ha megadták, svájcinak kell lennie. Kivéve, ha térképről
  // választott (érvényes svájci koordináta van) — akkor a geokódernek hiszünk.
  const address = str(input.address);
  const hasCountryCoord =
    Number.isFinite(Number(input.lat)) &&
    Number.isFinite(Number(input.lng)) &&
    isInCountryCoord(country, Number(input.lat), Number(input.lng));
  if (address.length > BUSINESS_LIMITS.addressMax) {
    errors.push({ field: "address", message: `Legfeljebb ${BUSINESS_LIMITS.addressMax} karakter.` });
  } else if (country === "CH" && address && !hasCountryCoord && !isSwissAddress(address)) {
    // CH-ban szigorú formátum-ellenőrzés; más országban a régió + geokóder (Photon) fedi le.
    errors.push({
      field: "address",
      message:
        "Csak svájci cím adható meg. Tüntesd fel a svájci várost és irányítószámot (pl. Bahnhofstrasse 10, 8001 Zürich).",
    });
  }

  const phone = str(input.phone);
  if (phone.length > BUSINESS_LIMITS.phoneMax)
    errors.push({ field: "phone", message: `Legfeljebb ${BUSINESS_LIMITS.phoneMax} karakter.` });

  const blurb = str(input.blurb);
  if (blurb.length > BUSINESS_LIMITS.blurbMax)
    errors.push({ field: "blurb", message: `Legfeljebb ${BUSINESS_LIMITS.blurbMax} karakter.` });

  if (input.acceptTerms !== true) {
    errors.push({
      field: "acceptTerms",
      message: "Az ÁSZF és az Adatkezelési Tájékoztató elfogadása kötelező.",
    });
  }
  if (input.ageConfirmed !== true) {
    errors.push({
      field: "ageConfirmed",
      message: "A Szolgáltatást csak 18. életévüket betöltött személyek vehetik igénybe.",
    });
  }

  const licenseNumber = str(input.licenseNumber);
  if (isLicensedCategory(categoryId)) {
    if (!licenseNumber) {
      errors.push({
        field: "licenseNumber",
        message: "Engedélyköteles tevékenység esetén a hatósági/kamarai engedélyszám megadása kötelező.",
      });
    } else if (licenseNumber.length > BUSINESS_LIMITS.licenseNumberMax) {
      errors.push({
        field: "licenseNumber",
        message: `Legfeljebb ${BUSINESS_LIMITS.licenseNumberMax} karakter.`,
      });
    }
    if (input.licenseAccepted !== true) {
      errors.push({
        field: "licenseAccepted",
        message: "Az engedélyre vonatkozó nyilatkozat elfogadása kötelező.",
      });
    }
  } else {
    // Ha nem engedélyköteles, akkor nullázzuk a biztonság kedvéért.
  }

  // Káromkodás-szűrő a publikus szöveg-mezőkre.
  if (!errors.length) {
    const dirty = findProfanityInFields({ name, blurb, categoryLabel });
    if (dirty) {
      errors.push({
        field: dirty.field as keyof BusinessFormInput,
        message: "A szöveg olyan szót tartalmaz, amit nem engedélyezünk. Kérlek, fogalmazd meg másképp.",
      });
    }
  }

  // Nyelvek: csak az engedélyezett listából, Magyar mindig benne, max 5.
  let languages = ["Magyar"];
  if (Array.isArray(input.languages)) {
    const picked = input.languages
      .filter((l): l is string => typeof l === "string")
      .filter((l) => ALLOWED_LANGUAGES.includes(l));
    languages = ["Magyar", ...picked.filter((l) => l !== "Magyar")].slice(0, ALLOWED_LANGUAGES.length);
  }

  // Strukturált nyitvatartás: JSON-string, ésszerű hosszkorláttal. A formátumot
  // a megjelenítő réteg (lib/hours) toleráns parse-olja; rossz JSON → default.
  let workingHours: string | null = null;
  const whRaw = str(input.workingHours);
  if (whRaw && whRaw.length <= 2000) {
    try {
      JSON.parse(whRaw);
      workingHours = whRaw;
    } catch {
      workingHours = null;
    }
  }

  // Pontos koordináta a térképes keresőből (csak ha Svájcon belül van).
  let lat: number | null = null;
  let lng: number | null = null;
  const latN = typeof input.lat === "number" ? input.lat : Number(input.lat);
  const lngN = typeof input.lng === "number" ? input.lng : Number(input.lng);
  if (Number.isFinite(latN) && Number.isFinite(lngN) && isInCountryCoord(country, latN, lngN)) {
    lat = +latN.toFixed(6);
    lng = +lngN.toFixed(6);
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      email,
      name,
      categoryId,
      categoryLabel: categoryLabel || null,
      cantonCode,
      country,
      address: address || null,
      phone: phone || null,
      blurb: blurb || null,
      licenseNumber: isLicensedCategory(categoryId) ? licenseNumber : null,
      languages,
      workingHours,
      lat,
      lng,
      acceptTerms: true,
      ageConfirmed: true,
    },
  };
}

/**
 * Vállalkozás-slug a névből: ékezet-mentes, kisbetűs, kötőjeles. A hívó egy
 * rövid random utótagot fűz hozzá az egyediségért (PRIMARY KEY ütközés ellen).
 */
export function slugifyBusinessName(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return base || "vallalkozas";
}

/**
 * Kanton székhelyének koordinátája + kis véletlen szórás (~±2 km), hogy a
 * frissen beküldött vállalkozások ne pontosan egymásra essenek a térképen.
 * (Pontos cím-geokódolás nélkül ez egy tisztességes közelítés.)
 */
export function approxCoordsForCanton(cantonCode: string): { lat: number; lng: number } | null {
  const p = CANTON_COORDS[cantonCode];
  if (!p) return null;
  const jitter = () => (Math.random() - 0.5) * 0.04; // ~±0.02° ≈ ±2 km
  return { lat: +(p.lat + jitter()).toFixed(5), lng: +(p.lng + jitter()).toFixed(5) };
}

/** Ország-tudatos régió-közelítés (CH: kanton-székhely, AT: Bundesland-székhely). */
export function approxCoordsForRegion(country: string, code: string): { lat: number; lng: number } | null {
  const jitter = () => (Math.random() - 0.5) * 0.04;
  if (country === "AT") {
    const p = AT_BUNDESLAND_POINTS[code];
    if (!p) return null;
    return { lat: +(p.lat + jitter()).toFixed(5), lng: +(p.lng + jitter()).toFixed(5) };
  }
  return approxCoordsForCanton(code);
}
