/**
 * Account nélküli vélemény-rendszer — közös konstansok + validáció.
 * Egy helyen, hogy a kliens-form és a szerver-route ugyanazt érvényesítse.
 */
import { containsProfanity } from "./profanity";

/** Megerősítő link érvényessége (ms). 24 óra — utána a piszkozat törlődik. */
export const REVIEW_CONFIRM_TTL_MS = 24 * 60 * 60 * 1000;

export const REVIEW_LIMITS = {
  bodyMin: 5,
  bodyMax: 1000,
  reviewerNameMin: 2,
  reviewerNameMax: 40,
  emailMax: 254,
  ratingMin: 1,
  ratingMax: 5,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ReviewFormInput {
  email?: unknown;
  businessId?: unknown;
  rating?: unknown;
  body?: unknown;
  reviewerName?: unknown;
  /** Bot-csapda. */
  website?: unknown;
  acceptTerms?: unknown;
  ageConfirmed?: unknown;
}

export interface ValidatedReviewInput {
  email: string;
  businessId: string;
  rating: number;
  body: string;
  reviewerName: string;
  acceptTerms: true;
  ageConfirmed: true;
}

export type ReviewValidationError = {
  field: keyof ReviewFormInput;
  message: string;
};

export function validateReviewInput(
  input: ReviewFormInput,
):
  | { ok: true; value: ValidatedReviewInput }
  | { ok: false; errors: ReviewValidationError[] } {
  const errors: ReviewValidationError[] = [];
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  // honeypot
  if (str(input.website).length > 0) {
    return { ok: false, errors: [{ field: "website", message: "Hibás kérés." }] };
  }

  // Email OPCIONÁLIS (local-first mód)
  const email = str(input.email).toLowerCase();
  if (email) {
    if (email.length > REVIEW_LIMITS.emailMax)
      errors.push({ field: "email", message: "Túl hosszú email-cím." });
    else if (!EMAIL_RE.test(email))
      errors.push({ field: "email", message: "Érvénytelen email-cím." });
  }

  const businessId = str(input.businessId);
  if (!businessId)
    errors.push({ field: "businessId", message: "Hiányzó vállalkozás-azonosító." });

  const ratingNum =
    typeof input.rating === "number"
      ? input.rating
      : typeof input.rating === "string"
        ? Number(input.rating)
        : NaN;
  if (
    !Number.isInteger(ratingNum) ||
    ratingNum < REVIEW_LIMITS.ratingMin ||
    ratingNum > REVIEW_LIMITS.ratingMax
  ) {
    errors.push({ field: "rating", message: "Adj 1–5 csillagot." });
  }

  // Szöveges vélemény — OPCIONÁLIS (2026-07-03 óta újra). Minden vélemény
  // admin-moderált (kézi ellenőrzés), de a trágárságot már beküldéskor
  // elutasítjuk (lib/profanity — magyar-tudatos prefix-match).
  const body = str(input.body);
  if (body) {
    if (body.length > REVIEW_LIMITS.bodyMax) {
      errors.push({ field: "body", message: `Túl hosszú szöveg (max. ${REVIEW_LIMITS.bodyMax} karakter).` });
    } else if (body.length < REVIEW_LIMITS.bodyMin) {
      errors.push({ field: "body", message: "Túl rövid szöveg — írj legalább pár szót, vagy hagyd üresen." });
    }
    if (containsProfanity(body).hit) {
      errors.push({ field: "body", message: "A szöveg trágár kifejezést tartalmaz — kérjük, fogalmazd át." });
    }
  }

  // Becenév / keresztnév — OPCIONÁLIS (2026-07-03 óta újra kérhető). Üresen
  // hagyva a megjelenítés auto-generált álnevet kap (handleFromId, pl.
  // „GyorsSün_15"). Teljes nevet szándékosan nem kérünk (first-name-only elv).
  const reviewerName = str(input.reviewerName);
  if (reviewerName) {
    if (reviewerName.length > REVIEW_LIMITS.reviewerNameMax) {
      errors.push({ field: "reviewerName", message: `Túl hosszú név (max. ${REVIEW_LIMITS.reviewerNameMax} karakter).` });
    } else if (reviewerName.length < REVIEW_LIMITS.reviewerNameMin) {
      errors.push({ field: "reviewerName", message: "Túl rövid név — vagy hagyd üresen." });
    }
    if (containsProfanity(reviewerName).hit) {
      errors.push({ field: "reviewerName", message: "Ez a név nem megfelelő — kérjük, válassz másikat." });
    }
  }

  if (input.acceptTerms !== true) {
    errors.push({
      field: "acceptTerms",
      message: "Az ÁSZF és az Adatkezelési Tájékoztató elfogadása kötelező.",
    });
  }
  if (input.ageConfirmed !== true) {
    errors.push({
      field: "ageConfirmed",
      message:
        "A Szolgáltatás csak 18. életévét betöltött személyek által vehető igénybe.",
    });
  }

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    value: {
      email,
      businessId,
      rating: ratingNum,
      body,
      reviewerName,
      acceptTerms: true,
      ageConfirmed: true,
    },
  };
}
