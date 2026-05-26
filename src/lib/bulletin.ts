/**
 * Hirdetőfal közös konstansok és validációk. Egy helyen, hogy a kliens-űrlap
 * és a szerver-route ugyanazt érvényesítse.
 */

import { findProfanityInFields } from "./profanity";

/**
 * A jogi szövegek (ÁSZF + Adatkezelési Tájékoztató) jelenlegi verziója.
 * Akkor frissítsd, amikor érdemi változtatás történik a /aszf vagy a
 * /adatvedelem oldalon — a piszkozat-INSERT ezt az értéket rögzíti az
 * `accepted_terms_at` mellé, így jogvitában bizonyítható, MELYIK verziót
 * fogadta el a felhasználó.
 */
export const TERMS_VERSION = "2026-05-25";

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
  imageKey?: unknown;
  cantonCode?: unknown;
  /** Bot-csapda — ha bármi értéke van, eldobjuk. */
  website?: unknown;
  /** Kötelező: az ÁSZF + Adatkezelési Tájékoztató elfogadása. */
  acceptTerms?: unknown;
  /** Kötelező: a feladó nyilatkozata, hogy elmúlt 18 éves (Ptk. 2:10 §). */
  ageConfirmed?: unknown;
}

export interface ValidatedBulletinInput {
  email: string;
  kindId: string;
  title: string;
  meta: string;
  body: string | null;
  poster: string | null;
  acceptTerms: true;
  ageConfirmed: true;
  imageKey: string | null;
  cantonCode: string;
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
  if (!meta) {
    errors.push({ field: "meta", message: "Ár és részletek megadása kötelező." });
  } else if (meta.length > LIMITS.metaMax) {
    errors.push({ field: "meta", message: `Legfeljebb ${LIMITS.metaMax} karakter.` });
  }

  const body = str(input.body);
  if (body.length > LIMITS.bodyMax)
    errors.push({ field: "body", message: `Legfeljebb ${LIMITS.bodyMax} karakter.` });

  const poster = str(input.poster);
  if (poster.length > LIMITS.posterMax)
    errors.push({ field: "poster", message: `Legfeljebb ${LIMITS.posterMax} karakter.` });

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

  // Káromkodás-szűrő (szerver-oldali). Mindegyik publikus szöveg-mezőt vizsgálja.
  if (!errors.length) {
    const dirty = findProfanityInFields({ title, meta, body, poster });
    if (dirty) {
      errors.push({
        field: dirty.field as keyof BulletinFormInput,
        message:
          "A hirdetésed olyan szót tartalmaz, amit nem engedünk. " +
          "Kérlek, fogalmazd meg másképp.",
      });
    }
  }

  const imageKey = str(input.imageKey) || null;
  const cantonCode = str(input.cantonCode);
  if (!cantonCode) {
    errors.push({ field: "cantonCode", message: "Kanton kiválasztása kötelező." });
  }

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    value: {
      email,
      kindId,
      title,
      meta,
      body: body || null,
      poster: poster || null,
      acceptTerms: true,
      ageConfirmed: true,
      imageKey,
      cantonCode,
    },
  };
}

/**
 * Web Crypto SHA-256 hex — IP-cím irreverzibilis hash-eléséhez. A GDPR
 * adatminimalizálási elvet teljesíti: a nyers IP-t nem tároljuk, csak a
 * hash-ét; ettől függetlenül duplikáció / abuse-vizsgálatra használható
 * (egy IP-ről indított ismétlődő spamhullám felismerésére).
 *
 * Edge-runtime kompatibilis — a `crypto.subtle` minden Workers/Pages
 * környezetben elérhető.
 */
export async function hashIp(ip: string | null): Promise<string | null> {
  if (!ip) return null;
  const data = new TextEncoder().encode(ip);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
