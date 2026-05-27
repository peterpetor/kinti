/**
 * Self-service vállalkozás-beküldés — közös konstansok + validáció.
 * Egy helyen, hogy a kliens-űrlap és a szerver-route ugyanazt érvényesítse
 * (mint a hirdetőfalnál a lib/bulletin.ts).
 */

import { findProfanityInFields } from "./profanity";
import { isSwissAddress, CANTON_COORDS } from "./cantons";

/** A megerősítő link érvényessége (ms). 24 óra — utána a piszkozat törlődik. */
export const BUSINESS_CONFIRM_TTL_MS = 24 * 60 * 60 * 1000;

/** Napi beküldési limit IP/email-enként (vállalkozás ritkább, mint hirdetés). */
export const BUSINESS_DAILY_LIMIT = 10;

export const BUSINESS_LIMITS = {
  nameMin: 2,
  nameMax: 100,
  labelMax: 50,
  addressMax: 200,
  phoneMax: 30,
  blurbMax: 600,
  emailMax: 254,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface BusinessFormInput {
  email?: unknown;
  name?: unknown;
  categoryId?: unknown;
  categoryLabel?: unknown;
  cantonCode?: unknown;
  address?: unknown;
  phone?: unknown;
  blurb?: unknown;
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
  address: string | null;
  phone: string | null;
  blurb: string | null;
  acceptTerms: true;
  ageConfirmed: true;
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

  const email = str(input.email).toLowerCase();
  if (!email) errors.push({ field: "email", message: "Email kötelező." });
  else if (email.length > BUSINESS_LIMITS.emailMax)
    errors.push({ field: "email", message: "Túl hosszú email-cím." });
  else if (!EMAIL_RE.test(email))
    errors.push({ field: "email", message: "Érvénytelen email-cím." });

  const name = str(input.name);
  if (name.length < BUSINESS_LIMITS.nameMin)
    errors.push({ field: "name", message: `Legalább ${BUSINESS_LIMITS.nameMin} karakter.` });
  else if (name.length > BUSINESS_LIMITS.nameMax)
    errors.push({ field: "name", message: `Legfeljebb ${BUSINESS_LIMITS.nameMax} karakter.` });

  const categoryId = str(input.categoryId);
  if (!categoryId) errors.push({ field: "categoryId", message: "Válassz kategóriát." });

  const cantonCode = str(input.cantonCode);
  if (!cantonCode) {
    errors.push({ field: "cantonCode", message: "Kanton kiválasztása kötelező." });
  } else if (!CANTON_COORDS[cantonCode]) {
    errors.push({ field: "cantonCode", message: "Ismeretlen kanton." });
  }

  const categoryLabel = str(input.categoryLabel);
  if (categoryLabel.length > BUSINESS_LIMITS.labelMax)
    errors.push({ field: "categoryLabel", message: `Legfeljebb ${BUSINESS_LIMITS.labelMax} karakter.` });

  // Cím opcionális, DE ha megadták, svájcinak kell lennie.
  const address = str(input.address);
  if (address.length > BUSINESS_LIMITS.addressMax) {
    errors.push({ field: "address", message: `Legfeljebb ${BUSINESS_LIMITS.addressMax} karakter.` });
  } else if (address && !isSwissAddress(address)) {
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
      message: "A Szolgáltatás csak 18. életévét betöltött személyek által vehető igénybe.",
    });
  }

  // Káromkodás-szűrő a publikus szöveg-mezőkre.
  if (!errors.length) {
    const dirty = findProfanityInFields({ name, blurb, categoryLabel });
    if (dirty) {
      errors.push({
        field: dirty.field as keyof BusinessFormInput,
        message: "A szöveg olyan szót tartalmaz, amit nem engedünk. Kérlek, fogalmazd meg másképp.",
      });
    }
  }

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    value: {
      email,
      name,
      categoryId,
      categoryLabel: categoryLabel || null,
      cantonCode,
      address: address || null,
      phone: phone || null,
      blurb: blurb || null,
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
