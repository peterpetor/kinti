/**
 * Kinti országok — a multi-ország rendszer egyetlen forrása.
 *
 * CH/AT/DE/NL mind él (van tartalmuk: szaknévsor, hivatalos linkek, közösségi
 * funkciók). Az `enabled:false` jelölné a „Hamarosan" országokat (jelenleg nincs
 * ilyen). A választást a `country-pref.ts` kezeli (kliensoldali, GDPR-tiszta —
 * nem kerül a szerverre); az ország-specifikus funkció-elérhetőséget a
 * `feature-availability.ts` finomítja (pl. CH-only eszközök rejtése).
 */

export interface Country {
  /** ISO-3166 alpha-2 kód (nagybetűs): CH, AT, DE, NL. */
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
  { code: "DE", name: "Németország", flag: "🇩🇪", enabled: true },
  { code: "NL", name: "Hollandia", flag: "🇳🇱", enabled: true },
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

/** Az ország „-ban/-ben" alakja (hol?). Pl. „Svájcban", „Németországban". */
export function countryLocative(code: string | null | undefined): string {
  switch (code) {
    case "AT": return "Ausztriában";
    case "DE": return "Németországban";
    case "NL": return "Hollandiában";
    default: return "Svájcban";
  }
}

/** Az ország „-on/-en/-ön" (felszíni) alakja. Pl. „Svájcon kívül", „Németországon". */
export function countrySuperessive(code: string | null | undefined): string {
  switch (code) {
    case "AT": return "Ausztrián";
    case "DE": return "Németországon";
    case "NL": return "Hollandián";
    default: return "Svájcon";
  }
}

/** Az ország melléknévi alakja. Pl. „svájci", „német", „osztrák". */
export function countryAdjective(code: string | null | undefined): string {
  switch (code) {
    case "AT": return "osztrák";
    case "DE": return "német";
    case "NL": return "holland";
    default: return "svájci";
  }
}

/** A közigazgatási régió-egység neve. CH: kanton; AT/DE/NL: tartomány. */
export function regionWord(code: string | null | undefined): string {
  return code && code !== "CH" ? "tartomány" : "kanton";
}

/** Az ország „-ba/-be" (irányultság) alakja. Pl. „Svájcba", „Németországba". */
export function countryIllative(code: string | null | undefined): string {
  switch (code) {
    case "AT": return "Ausztriába";
    case "DE": return "Németországba";
    case "NL": return "Hollandiába";
    default: return "Svájcba";
  }
}
