/**
 * Heti email-digest — közös konstansok + validáció a feliratkozáshoz.
 * GDPR-tiszta: double opt-in + token-alapú leiratkozás.
 */

import { CANTON_COORDS } from "./cantons";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface DigestSubscribeInput {
  email?: unknown;
  cantonCode?: unknown;
  acceptTerms?: unknown;
  /** Honeypot (bot-csapda). */
  website?: unknown;
}

export interface ValidatedDigestSubscribe {
  email: string;
  cantonCode: string | null;
  acceptTerms: true;
}

export type DigestValidationError = { field: keyof DigestSubscribeInput; message: string };

export function validateDigestSubscribe(
  input: DigestSubscribeInput,
):
  | { ok: true; value: ValidatedDigestSubscribe }
  | { ok: false; errors: DigestValidationError[] } {
  const errors: DigestValidationError[] = [];
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  // Honeypot
  if (str(input.website).length > 0) {
    return { ok: false, errors: [{ field: "website", message: "Hibás kérés." }] };
  }

  const email = str(input.email).toLowerCase();
  if (!email) errors.push({ field: "email", message: "Email kötelező." });
  else if (email.length > 254 || !EMAIL_RE.test(email))
    errors.push({ field: "email", message: "Érvénytelen email-cím." });

  const rawCanton = str(input.cantonCode);
  const cantonCode = rawCanton && rawCanton !== "all" && CANTON_COORDS[rawCanton] ? rawCanton : null;

  if (input.acceptTerms !== true) {
    errors.push({
      field: "acceptTerms",
      message: "Az adatkezelési hozzájárulás kötelező a feliratkozáshoz.",
    });
  }

  if (errors.length) return { ok: false, errors };
  return { ok: true, value: { email, cantonCode, acceptTerms: true } };
}
