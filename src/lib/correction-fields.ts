/**
 * A „Javíts rajta" javaslat mezőkészlete — EGY helyen.
 *
 * ⚠️ MIÉRT KÜLÖN, TISZTA MODUL (nincs benne D1/Cloudflare import):
 *  1. a KLIENS űrlap is ebből építkezik — egy D1-et behúzó modult nem lehet
 *     kliens-komponensbe importálni;
 *  2. az admin-felület ugyanezeket a címkéket mutatja;
 *  3. a teszt is importálhatja anélkül, hogy a teljes Cloudflare-környezetet
 *     be kellene húznia (ebbe már beleszaladtam egyszer).
 *
 * ⚠️ A KÉSZLET ZÁRT: szabad szöveges mezőnév nyílt rongálási felület lenne
 * (pl. „hidden" vagy „rating" javaslat).
 */
export const CORRECTION_FIELDS = [
  "phone",
  "address",
  "website",
  "email",
  "hours",
  "closed",
  "other",
] as const;

export type CorrectionField = (typeof CORRECTION_FIELDS)[number];

export function isCorrectionField(v: unknown): v is CorrectionField {
  return typeof v === "string" && (CORRECTION_FIELDS as readonly string[]).includes(v);
}

/** Magyar címkék — a felhasználói űrlap és az admin-felület is ezt mutatja. */
export const CORRECTION_FIELD_LABELS: Record<CorrectionField, string> = {
  phone: "Telefonszám",
  address: "Cím",
  website: "Weboldal",
  email: "E-mail",
  hours: "Nyitvatartás",
  closed: "Már nem működik",
  other: "Egyéb",
};

/** A „már nem működik" jelzésnél nincs javasolt érték — ott a jelzés maga az adat. */
export function needsSuggestion(field: CorrectionField): boolean {
  return field !== "closed";
}
