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
  phoneMax: 24,
} as const;

/** Egyszerű email-formátum (nem RFC5322-szigorúság, de praktikus). */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Lazán E.164-szerű telefonszám (a WhatsApp-linkhez a + és számok kellenek). */
const PHONE_RE = /^\+?[0-9][0-9 ()\-/]{5,23}$/;

export interface BulletinFormInput {
  email?: unknown;
  /** Opcionális telefonszám — tap-to-call link a kártyán. */
  phone?: unknown;
  /** Opcionális WhatsApp szám — ha üres, a phone-ra megy a WA-link is. */
  whatsapp?: unknown;
  kindId?: unknown;
  title?: unknown;
  meta?: unknown;
  body?: unknown;
  poster?: unknown;
  imageKey?: unknown;
  cantonCode?: unknown;
  /** Opcionális strukturált ár (egész CHF). */
  price?: unknown;
  /** Bot-csapda — ha bármi értéke van, eldobjuk. */
  website?: unknown;
  /** Kötelező: az ÁSZF + Adatkezelési Tájékoztató elfogadása. */
  acceptTerms?: unknown;
  /** Kötelező: a feladó nyilatkozata, hogy elmúlt 18 éves (Ptk. 2:10 §). */
  ageConfirmed?: unknown;
}

export interface ValidatedBulletinInput {
  email: string;
  phone: string;
  whatsapp: string;
  kindId: string;
  title: string;
  meta: string;
  body: string | null;
  poster: string | null;
  acceptTerms: true;
  ageConfirmed: true;
  imageKey: string | null;
  cantonCode: string;
  price: number | null;
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

  // Email OPCIONÁLIS (local-first mód) — ha üres, semmilyen hibát nem dobunk.
  // Ha meg van adva, validáljuk a formátumot.
  const email = str(input.email).toLowerCase();
  if (email) {
    if (email.length > LIMITS.emailMax)
      errors.push({ field: "email", message: "Túl hosszú email-cím." });
    else if (!EMAIL_RE.test(email))
      errors.push({ field: "email", message: "Érvénytelen email-cím." });
  }

  // Telefon OPCIONÁLIS — ha megadták, nemzetközi formátum.
  const phone = str(input.phone);
  if (phone) {
    if (phone.length > LIMITS.phoneMax || !PHONE_RE.test(phone))
      errors.push({
        field: "phone",
        message: "Add meg a telefonszámot nemzetközi formátumban (pl. +41… vagy +36…).",
      });
  }

  // WhatsApp OPCIONÁLIS — üresen a phone-ra mutat (vissza-kompat.).
  const whatsapp = str(input.whatsapp);
  if (whatsapp) {
    if (whatsapp.length > LIMITS.phoneMax || !PHONE_RE.test(whatsapp))
      errors.push({
        field: "whatsapp",
        message: "Add meg a WhatsApp számot nemzetközi formátumban, vagy hagyd üresen.",
      });
  }

  // MIN. 1 ELÉRHETŐSÉG kötelező — különben hogyan venné fel valaki a kapcsolatot.
  if (!email && !phone && !whatsapp) {
    errors.push({
      field: "phone",
      message: "Adj meg legalább egy elérhetőséget: email, telefon vagy WhatsApp.",
    });
  }

  const kindId = str(input.kindId);
  if (!kindId) errors.push({ field: "kindId", message: "Válassz kategóriát." });

  const title = str(input.title);
  if (title.length < LIMITS.titleMin)
    errors.push({ field: "title", message: `Legalább ${LIMITS.titleMin} karakter.` });
  else if (title.length > LIMITS.titleMax)
    errors.push({ field: "title", message: `Legfeljebb ${LIMITS.titleMax} karakter.` });

  const meta = str(input.meta);
  // meta mostantól opcionális ("További részletek" — pl. bútorozott, lift)
  if (meta.length > LIMITS.metaMax) {
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
      message: "A Szolgáltatást csak 18. életévüket betöltött személyek vehetik igénybe.",
    });
  }

  // Káromkodás-szűrő (szerver-oldali). Mindegyik publikus szöveg-mezőt vizsgálja.
  if (!errors.length) {
    const dirty = findProfanityInFields({ title, meta, body, poster });
    if (dirty) {
      errors.push({
        field: dirty.field as keyof BulletinFormInput,
        message:
          "A hirdetésed olyan szót tartalmaz, amit nem engedélyezünk. " +
          "Kérlek, fogalmazd meg másképp.",
      });
    }
  }

  const imageKey = str(input.imageKey) || null;
  const cantonCode = str(input.cantonCode);
  if (!cantonCode) {
    errors.push({ field: "cantonCode", message: "Kanton kiválasztása kötelező." });
  }

  // Opcionális ár: ha üres → null; ha megadták, pozitív egész CHF.
  let price: number | null = null;
  const priceRaw = input.price;
  if (priceRaw !== undefined && priceRaw !== null && String(priceRaw).trim() !== "") {
    const n = typeof priceRaw === "number" ? priceRaw : Number(String(priceRaw).replace(/[\s']/g, ""));
    if (!Number.isFinite(n) || n < 0 || n > 100_000_000) {
      errors.push({ field: "price", message: "Az ár egy 0 és 100 millió közötti szám lehet." });
    } else {
      price = Math.round(n);
    }
  }

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    value: {
      email,
      phone,
      whatsapp,
      kindId,
      title,
      meta,
      body: body || null,
      poster: poster || null,
      acceptTerms: true,
      ageConfirmed: true,
      imageKey,
      cantonCode,
      price,
    },
  };
}

/**
 * Web Crypto SHA-256 hex — IP-cím irreverzibilis hash-eléséhez. A GDPR
 * adatminimalizálási elvet teljesíti: a nyers IP-t nem tároljuk, csak a
 * hash-ét; ettől függetlenül duplikáció / abuse-vizsgálatra használható
 * (egy IP-ről indított ismétlődő spamhullám felismerésére).
 *
 * IPv6 esetén csak az ELSŐ 4 hextet-et (= /64 prefix) hash-eljük. Az ISP-k
 * tipikusan /64-et adnak egy ügyfélnek, és a felhasználó tetszőlegesen
 * választhat IP-t ebből — így ha a teljes 128 bit-et hash-elnénk, egy bot
 * "rotation"-nal könnyen kerülne a rate-limitet. /64 prefix biztosítja, hogy
 * ugyanaz a hash jöjjön létre minden IP-re az adott customer-prefixen belül.
 *
 * Edge-runtime kompatibilis — a `crypto.subtle` minden Workers/Pages
 * környezetben elérhető.
 */
export async function hashIp(ip: string | null): Promise<string | null> {
  if (!ip) return null;
  const normalized = normalizeIpForHash(ip);
  const data = new TextEncoder().encode(normalized);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * IPv6 esetén normalizálja a címet a /64 prefix-re. IPv4 esetén változatlanul
 * visszaadja. Nem IP-nek tűnő string-et is változatlanul ad vissza.
 */
function normalizeIpForHash(ip: string): string {
  const trimmed = ip.trim().toLowerCase();
  // IPv4 → változatlan
  if (!trimmed.includes(":")) return trimmed;

  // IPv6 normalizálás: kibontjuk a `::` rövidítést egy üres group-listára,
  // aztán az első 4 hextet-et tartjuk meg, a többit nullázzuk.
  try {
    // IPv4-mapped IPv6 (pl. ::ffff:1.2.3.4) — IPv4-ként kezeljük
    if (trimmed.startsWith("::ffff:") && trimmed.includes(".")) {
      return trimmed.slice(7);
    }

    const parts = trimmed.split("::");
    let groups: string[];
    if (parts.length === 1) {
      groups = trimmed.split(":");
    } else if (parts.length === 2) {
      const left = parts[0] ? parts[0].split(":") : [];
      const right = parts[1] ? parts[1].split(":") : [];
      const fill = 8 - left.length - right.length;
      groups = [...left, ...Array(fill).fill("0"), ...right];
    } else {
      // Több `::` érvénytelen IPv6
      return trimmed;
    }
    if (groups.length !== 8) return trimmed;

    // /64 prefix: első 4 hextet, többi 0
    const prefix = groups.slice(0, 4).map((g) => g || "0").join(":");
    return `${prefix}::/64`;
  } catch {
    return trimmed;
  }
}
