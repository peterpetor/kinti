/**
 * Hirdetőfal közös konstansok és validációk. Egy helyen, hogy a kliens-űrlap
 * és a szerver-route ugyanazt érvényesítse.
 */

/** Megerősítő link érvényessége (ms). 24 óra — utána a piszkozat törlődik. */
export const CONFIRM_TTL_MS = 24 * 60 * 60 * 1000;

/** Publikált hirdetés élettartama (ms). 30 nap — utána eltűnik a listáról. */
export const POST_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Admin-moderáció kapcsoló. Most: false → email-megerősítés UTÁN azonnal publikus
 * (gyors visszacsatolás MVP-ben). Az /admin felület készítésekor true-ra
 * állítjuk, és az első posztot kézzel jóváhagyjuk.
 */
export const REQUIRE_ADMIN_APPROVAL = false;

/** Limit-konstansok — kliens és szerver egyazonnal kötve hozzájuk. */
export const LIMITS = {
  titleMin: 5,
  titleMax: 100,
  metaMax: 100,
  bodyMax: 1000,
  posterMax: 40,
  emailMax: 254,
} as const;

/** Egyszerű email-formátum (nem RFC5322-szigorúság, de praktikus). */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface BulletinFormInput {
  email?: unknown;
  kindId?: unknown;
  title?: unknown;
  meta?: unknown;
  body?: unknown;
  poster?: unknown;
  /** Bot-csapda — ha bármi értéke van, eldobjuk. */
  website?: unknown;
}

export interface ValidatedBulletinInput {
  email: string;
  kindId: string;
  title: string;
  meta: string | null;
  body: string | null;
  poster: string | null;
}

export type ValidationError = { field: keyof BulletinFormInput; message: string };

/**
 * Bemenetek normalizálása + validáció. Hiba → tömb, siker → tisztított adat.
 * A kindId-t a hívó ellenőrzi a bulletin_kinds-szal szemben (DB-kérés szükséges).
 */
export function validateBulletinInput(
  input: BulletinFormInput,
): { ok: true; value: ValidatedBulletinInput } | { ok: false; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  // honeypot
  if (str(input.website).length > 0) {
    return { ok: false, errors: [{ field: "website", message: "Hibás kérés." }] };
  }

  const email = str(input.email).toLowerCase();
  if (!email) errors.push({ field: "email", message: "Email kötelező." });
  else if (email.length > LIMITS.emailMax)
    errors.push({ field: "email", message: "Túl hosszú email-cím." });
  else if (!EMAIL_RE.test(email))
    errors.push({ field: "email", message: "Érvénytelen email-cím." });

  const kindId = str(input.kindId);
  if (!kindId) errors.push({ field: "kindId", message: "Válassz kategóriát." });

  const title = str(input.title);
  if (title.length < LIMITS.titleMin)
    errors.push({ field: "title", message: `Legalább ${LIMITS.titleMin} karakter.` });
  else if (title.length > LIMITS.titleMax)
    errors.push({ field: "title", message: `Legfeljebb ${LIMITS.titleMax} karakter.` });

  const meta = str(input.meta);
  if (meta.length > LIMITS.metaMax)
    errors.push({ field: "meta", message: `Legfeljebb ${LIMITS.metaMax} karakter.` });

  const body = str(input.body);
  if (body.length > LIMITS.bodyMax)
    errors.push({ field: "body", message: `Legfeljebb ${LIMITS.bodyMax} karakter.` });

  const poster = str(input.poster);
  if (poster.length > LIMITS.posterMax)
    errors.push({ field: "poster", message: `Legfeljebb ${LIMITS.posterMax} karakter.` });

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    value: {
      email,
      kindId,
      title,
      meta: meta || null,
      body: body || null,
      poster: poster || null,
    },
  };
}
