/**
 * Spontán mikro-események modul — közös konstansok + validáció.
 *
 * A felhasználók 24-48 órás találkozókat dobhatnak fel (pl. túratárs,
 * sörözés, sportpartner). Zéró-relay: a kapcsolat a feladó telefonján /
 * WhatsApp-ján megy.
 */

import { findProfanityInFields } from "./profanity";

export const SPONTANEOUS_LIMITS = {
  titleMin: 5,
  titleMax: 80,
  locationMin: 3,
  locationMax: 80,
  notesMax: 500,
  phoneMax: 24,
  posterMax: 40,
  peopleMin: 1,
  peopleMax: 10,
} as const;

/** Max 48 óra TTL (ms). */
export const SPONTANEOUS_MAX_TTL_MS = 48 * 60 * 60 * 1000;
/** Default 24 óra TTL (ms). */
export const SPONTANEOUS_DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

const PHONE_RE = /^\+?[0-9][0-9 ()\-/]{5,23}$/;

export interface SpontaneousFormInput {
  title?: unknown;
  locationName?: unknown;
  cantonCode?: unknown;
  meetupTime?: unknown;
  maxPeople?: unknown;
  contactPhone?: unknown;
  contactWhatsapp?: unknown;
  poster?: unknown;
  notes?: unknown;
  /** Bot-csapda — ha bármi értéke van, eldobjuk. */
  website?: unknown;
}

export interface ValidatedSpontaneousInput {
  title: string;
  locationName: string;
  cantonCode: string | null;
  meetupTime: string; // ISO datetime
  maxPeople: number;
  contactPhone: string;
  contactWhatsapp: string | null;
  poster: string | null;
  notes: string | null;
}

export type SpontaneousValidationError = {
  field: keyof SpontaneousFormInput;
  message: string;
};

export function validateSpontaneousInput(
  input: SpontaneousFormInput,
): { ok: true; value: ValidatedSpontaneousInput } | { ok: false; errors: SpontaneousValidationError[] } {
  const errors: SpontaneousValidationError[] = [];
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  // honeypot
  if (str(input.website).length > 0) {
    return { ok: false, errors: [{ field: "website", message: "Hibás kérés." }] };
  }

  const title = str(input.title);
  if (title.length < SPONTANEOUS_LIMITS.titleMin || title.length > SPONTANEOUS_LIMITS.titleMax) {
    errors.push({
      field: "title",
      message: `A cím ${SPONTANEOUS_LIMITS.titleMin}–${SPONTANEOUS_LIMITS.titleMax} karakter.`,
    });
  }

  const locationName = str(input.locationName);
  if (
    locationName.length < SPONTANEOUS_LIMITS.locationMin ||
    locationName.length > SPONTANEOUS_LIMITS.locationMax
  ) {
    errors.push({
      field: "locationName",
      message: `A helyszín ${SPONTANEOUS_LIMITS.locationMin}–${SPONTANEOUS_LIMITS.locationMax} karakter.`,
    });
  }

  const cantonCode = str(input.cantonCode);
  // Kanton OPCIONÁLIS — ha üres, null lesz

  const meetupTime = str(input.meetupTime);
  const mt = Date.parse(meetupTime);
  if (!meetupTime || Number.isNaN(mt)) {
    errors.push({ field: "meetupTime", message: "Add meg, mikor lesz a találkozó." });
  } else if (mt < Date.now() - 60 * 60 * 1000) {
    errors.push({ field: "meetupTime", message: "A találkozó időpontja a múltban van." });
  } else if (mt > Date.now() + SPONTANEOUS_MAX_TTL_MS) {
    errors.push({
      field: "meetupTime",
      message: "Spontán találkozó max 48 órával előre lehet. Hosszabbra a normál Események közé tedd.",
    });
  }

  let maxPeople = NaN;
  if (typeof input.maxPeople === "number") maxPeople = input.maxPeople;
  else if (typeof input.maxPeople === "string" && input.maxPeople.trim() !== "") {
    maxPeople = Number(input.maxPeople);
  }
  if (
    !Number.isInteger(maxPeople) ||
    maxPeople < SPONTANEOUS_LIMITS.peopleMin ||
    maxPeople > SPONTANEOUS_LIMITS.peopleMax
  ) {
    errors.push({
      field: "maxPeople",
      message: `Hány embert vársz? ${SPONTANEOUS_LIMITS.peopleMin}–${SPONTANEOUS_LIMITS.peopleMax} fő.`,
    });
  }

  const contactPhone = str(input.contactPhone);
  if (!contactPhone) {
    errors.push({ field: "contactPhone", message: "A telefonszám kötelező." });
  } else if (contactPhone.length > SPONTANEOUS_LIMITS.phoneMax || !PHONE_RE.test(contactPhone)) {
    errors.push({
      field: "contactPhone",
      message: "Add meg a telefonszámot nemzetközi formátumban (pl. +41… vagy +36…).",
    });
  }

  const contactWhatsapp = str(input.contactWhatsapp);
  if (
    contactWhatsapp &&
    (contactWhatsapp.length > SPONTANEOUS_LIMITS.phoneMax || !PHONE_RE.test(contactWhatsapp))
  ) {
    errors.push({
      field: "contactWhatsapp",
      message: "Add meg a WhatsApp számot nemzetközi formátumban, vagy hagyd üresen.",
    });
  }

  const poster = str(input.poster);
  if (poster.length > SPONTANEOUS_LIMITS.posterMax) {
    errors.push({
      field: "poster",
      message: `Legfeljebb ${SPONTANEOUS_LIMITS.posterMax} karakter.`,
    });
  }

  const notes = str(input.notes);
  if (notes.length > SPONTANEOUS_LIMITS.notesMax) {
    errors.push({
      field: "notes",
      message: `A megjegyzés legfeljebb ${SPONTANEOUS_LIMITS.notesMax} karakter.`,
    });
  }

  // Profanity-szűrő
  if (!errors.length) {
    const dirty = findProfanityInFields({ title, locationName, notes, poster });
    if (dirty) {
      errors.push({
        field: dirty.field as keyof SpontaneousFormInput,
        message: "A szöveg olyan szót tartalmaz, amit nem engedünk. Fogalmazd meg másképp.",
      });
    }
  }

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    value: {
      title,
      locationName,
      cantonCode: cantonCode || null,
      meetupTime,
      maxPeople,
      contactPhone,
      contactWhatsapp: contactWhatsapp || null,
      poster: poster || null,
      notes: notes || null,
    },
  };
}

/** A meetup_time + 1h = expires_at. Garantáljuk, hogy max 48h a jövőben. */
export function computeSpontaneousExpiry(meetupTime: string): string {
  const t = Date.parse(meetupTime);
  const base = Number.isNaN(t) ? Date.now() : t;
  const expiryMs = base + 60 * 60 * 1000; // +1 óra a meetup után
  const maxAllowed = Date.now() + SPONTANEOUS_MAX_TTL_MS + 60 * 60 * 1000;
  const final = Math.min(expiryMs, maxAllowed);
  return new Date(final).toISOString().slice(0, 19).replace("T", " ");
}
