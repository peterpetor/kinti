/**
 * Kinti országok — a multi-ország rendszer egyetlen forrása.
 *
 * Svájc (CH) és Ausztria (AT) él (van tartalmuk); a többi ország `enabled:false`
 * („Hamarosan"), de már kiválasztható és localStorage-ban eltárolódik, hogy a
 * rendszer kész legyen a tartalom-bővítésre. A választást a `country-pref.ts`
 * kezeli (kliensoldali, GDPR-tiszta — nem kerül a szerverre).
 */

export interface Country {
  /** ISO-3166 alpha-2 kód (nagybetűs): CH, AT, DE, NL, DK, SE. */
  code: string;
  /** Magyar országnév. */
  name: string;
  /** Zászló emoji. */
  flag: string;
  /** Van-e már tartalom az országhoz (CH = igen; a többi „Hamarosan"). */
  enabled: boolean;
}

export const COUNTRIES: Country[] = [
  { code: "CH", name: "Svájc", flag: "🇨🇭", enabled: true },
  { code: "AT", name: "Ausztria", flag: "🇦🇹", enabled: true },
  { code: "DE", name: "Németország", flag: "🇩🇪", enabled: false },
  { code: "NL", name: "Hollandia", flag: "🇳🇱", enabled: false },
  { code: "DK", name: "Dánia", flag: "🇩🇰", enabled: false },
  { code: "SE", name: "Svédország", flag: "🇸🇪", enabled: false },
];

/** Alapértelmezett ország, ha a felhasználó még nem választott (vagy érvénytelen). */
export const DEFAULT_COUNTRY = "CH";

export function getCountry(code: string | null | undefined): Country | undefined {
  if (!code) return undefined;
  return COUNTRIES.find((c) => c.code === code);
}

export function isValidCountry(code: string | null | undefined): code is string {
  return !!code && COUNTRIES.some((c) => c.code === code);
}
