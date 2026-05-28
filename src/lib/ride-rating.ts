/**
 * Telekocsi-rating validációs library — a többi flow (lib/business.ts,
 * lib/digest.ts, lib/rides.ts, lib/events-validation.ts) mintájára.
 *
 * Az új /api/ride/rating/submit ezen kívül NEM zsmölt zod-on. Egységes
 * minta: minden public POST endpoint a saját lib-jéből exportált
 * validateXXX függvényt használ.
 */

export interface RideRatingInput {
  targetPhone?: unknown;
  email?: unknown;
  rating?: unknown;
}

export interface ValidatedRideRatingInput {
  targetPhone: string;
  email: string;
  rating: number;
}

export interface RideRatingValidationError {
  field: keyof RideRatingInput;
  message: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_MIN = 3;
const PHONE_MAX = 30;
const EMAIL_MAX = 254;

function str(v: unknown): string {
  if (typeof v !== "string") return "";
  return v.trim();
}

export function validateRideRating(input: RideRatingInput):
  | { ok: true; value: ValidatedRideRatingInput }
  | { ok: false; errors: RideRatingValidationError[] } {
  const errors: RideRatingValidationError[] = [];

  const targetPhone = str(input.targetPhone);
  if (!targetPhone || targetPhone.length < PHONE_MIN || targetPhone.length > PHONE_MAX) {
    errors.push({ field: "targetPhone", message: "Adj meg érvényes telefonszámot." });
  }

  const email = str(input.email).toLowerCase();
  if (!email || email.length > EMAIL_MAX || !EMAIL_RE.test(email)) {
    errors.push({ field: "email", message: "Érvénytelen e-mail formátum." });
  }

  let rating = 0;
  if (typeof input.rating === "number") rating = Math.round(input.rating);
  else if (typeof input.rating === "string" && input.rating.trim() !== "") rating = Math.round(Number(input.rating));
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.push({ field: "rating", message: "Az értékelés 1 és 5 közötti egész szám lehet." });
  }

  if (errors.length) return { ok: false, errors };
  return { ok: true, value: { targetPhone, email, rating } };
}
