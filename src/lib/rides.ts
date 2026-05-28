/**
 * Telekocsi (ride-sharing) — közös konstansok + validáció. A kliens-űrlap és a
 * szerver-route ugyanezt használja.
 */

import { findProfanityInFields } from "./profanity";

export const RIDE_LIMITS = {
  cityMin: 2,
  cityMax: 80,
  priceMax: 40,
  phoneMax: 24,
  notesMax: 500,
  seatsMin: 1,
  seatsMax: 8,
  posterNameMin: 2,
  posterNameMax: 60,
} as const;

/** Lazán E.164-szerű telefonszám (a WhatsApp-linkhez a + és számok kellenek). */
const PHONE_RE = /^\+?[0-9][0-9 ()\-/]{5,23}$/;

/** Egy geokódolt közbeeső megálló. */
export interface Waypoint {
  city: string;
  lat: number;
  lng: number;
}

export const MAX_WAYPOINTS = 5;

export interface RideFormInput {
  departureCity?: unknown;
  destinationCity?: unknown;
  departureTime?: unknown;
  seats?: unknown;
  priceText?: unknown;
  contactPhone?: unknown;
  /** Opcionális — ha a WhatsApp eltér a telefontól. Üresen a contactPhone-t használjuk. */
  contactWhatsapp?: unknown;
  notes?: unknown;
  /** Feladó megjelenített neve — vendég-beküldésnél kötelező; Clerk-userhez opcionális (Clerk-fiókból jön). */
  posterName?: unknown;
  /** Közbeeső megállók (város-nevek tömbje — a szerver geokódolja). */
  waypoints?: unknown;
  /** Opcionális: ha a kliens már geokódolta az indulást. */
  lat?: unknown;
  lng?: unknown;
}

export interface ValidatedRideInput {
  departureCity: string;
  destinationCity: string;
  departureTime: string;
  seats: number;
  priceText: string | null;
  contactPhone: string;
  contactWhatsapp: string | null;
  notes: string | null;
  posterName: string | null;
  /** Közbeeső megálló város-nevek (még nem geokódolva — a szerver csinálja). */
  waypointCities: string[];
  lat: number | null;
  lng: number | null;
}

export type RideValidationError = { field: keyof RideFormInput; message: string };

export function validateRideInput(
  input: RideFormInput,
): { ok: true; value: ValidatedRideInput } | { ok: false; errors: RideValidationError[] } {
  const errors: RideValidationError[] = [];
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  const departureCity = str(input.departureCity);
  if (departureCity.length < RIDE_LIMITS.cityMin || departureCity.length > RIDE_LIMITS.cityMax) {
    errors.push({ field: "departureCity", message: "Add meg az indulás helyét." });
  }

  const destinationCity = str(input.destinationCity);
  if (destinationCity.length < RIDE_LIMITS.cityMin || destinationCity.length > RIDE_LIMITS.cityMax) {
    errors.push({ field: "destinationCity", message: "Add meg az érkezés helyét." });
  }

  const departureTime = str(input.departureTime);
  const depMs = Date.parse(departureTime);
  if (!departureTime || Number.isNaN(depMs)) {
    errors.push({ field: "departureTime", message: "Adj meg egy érvényes indulási időpontot." });
  } else if (depMs < Date.now() - 60 * 60 * 1000) {
    errors.push({ field: "departureTime", message: "Az indulás időpontja a múltban van." });
  }

  let seats = NaN;
  if (typeof input.seats === "number") seats = input.seats;
  else if (typeof input.seats === "string" && input.seats.trim() !== "") seats = Number(input.seats);
  if (!Number.isInteger(seats) || seats < RIDE_LIMITS.seatsMin || seats > RIDE_LIMITS.seatsMax) {
    errors.push({ field: "seats", message: `A szabad helyek száma 1 és ${RIDE_LIMITS.seatsMax} között lehet.` });
  }

  const priceText = str(input.priceText);
  if (priceText.length > RIDE_LIMITS.priceMax) {
    errors.push({ field: "priceText", message: `Az ár-mező legfeljebb ${RIDE_LIMITS.priceMax} karakter.` });
  }

  const contactPhone = str(input.contactPhone);
  if (!contactPhone) {
    errors.push({ field: "contactPhone", message: "A telefonszám kötelező." });
  } else if (contactPhone.length > RIDE_LIMITS.phoneMax || !PHONE_RE.test(contactPhone)) {
    errors.push({
      field: "contactPhone",
      message: "Add meg a telefonszámot nemzetközi formátumban (pl. +41… vagy +36…).",
    });
  }

  // WhatsApp szám opcionális — ha eltér a Telefontól, külön validáljuk.
  const contactWhatsapp = str(input.contactWhatsapp);
  if (contactWhatsapp && (contactWhatsapp.length > RIDE_LIMITS.phoneMax || !PHONE_RE.test(contactWhatsapp))) {
    errors.push({
      field: "contactWhatsapp",
      message: "Add meg a WhatsApp számot nemzetközi formátumban, vagy hagyd üresen.",
    });
  }

  const notes = str(input.notes);
  if (notes.length > RIDE_LIMITS.notesMax) {
    errors.push({ field: "notes", message: `A megjegyzés legfeljebb ${RIDE_LIMITS.notesMax} karakter.` });
  }

  const posterName = str(input.posterName);
  if (posterName && (posterName.length < RIDE_LIMITS.posterNameMin || posterName.length > RIDE_LIMITS.posterNameMax)) {
    errors.push({
      field: "posterName",
      message: `A megjelenített név ${RIDE_LIMITS.posterNameMin}–${RIDE_LIMITS.posterNameMax} karakter között lehet.`,
    });
  }

  if (!errors.length) {
    const dirty = findProfanityInFields({ departureCity, destinationCity, notes, posterName });
    if (dirty) {
      errors.push({
        field: dirty.field as keyof RideFormInput,
        message: "A szöveg olyan szót tartalmaz, amit nem engedünk. Fogalmazd meg másképp.",
      });
    }
  }

  // Közbeeső megállók (max MAX_WAYPOINTS, mindegyik 2-80 karakter)
  const waypointCities: string[] = [];
  if (Array.isArray(input.waypoints)) {
    for (const w of input.waypoints) {
      const wc = typeof w === "string" ? w.trim() : "";
      if (wc.length > 0) {
        if (wc.length < RIDE_LIMITS.cityMin || wc.length > RIDE_LIMITS.cityMax) {
          errors.push({ field: "waypoints" as keyof RideFormInput, message: `A megálló-név ${RIDE_LIMITS.cityMin}–${RIDE_LIMITS.cityMax} karakter.` });
          break;
        }
        waypointCities.push(wc);
      }
    }
    if (waypointCities.length > MAX_WAYPOINTS) {
      errors.push({ field: "waypoints" as keyof RideFormInput, message: `Legfeljebb ${MAX_WAYPOINTS} közbeeső megálló.` });
    }
  }

  // Opcionális kliens-koordináta
  const lat = typeof input.lat === "number" && Number.isFinite(input.lat) ? input.lat : null;
  const lng = typeof input.lng === "number" && Number.isFinite(input.lng) ? input.lng : null;

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    value: {
      departureCity,
      destinationCity,
      departureTime,
      seats,
      priceText: priceText || null,
      contactPhone,
      contactWhatsapp: contactWhatsapp || null,
      notes: notes || null,
      posterName: posterName || null,
      waypointCities,
      lat,
      lng,
    },
  };
}

/** expires_at = indulás + 24 óra, SQLite-kompatibilis UTC formátumban (YYYY-MM-DD HH:MM:SS). */
export function computeRideExpiry(departureTime: string): string {
  const t = Date.parse(departureTime);
  const base = Number.isNaN(t) ? Date.now() : t;
  return new Date(base + 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace("T", " ");
}

/** Telefonszám → wa.me-kompatibilis (csak számjegyek). */
export function phoneToWhatsapp(phone: string): string {
  return phone.replace(/[^0-9]/g, "");
}
