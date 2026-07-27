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
  // ⚠️ Anglia zászló-emojija a Szent György-kereszt (tag-sequence), NEM a
  // 🇬🇧 Union Jack — az az EGYESÜLT KIRÁLYSÁGÉ, mi pedig szándékosan csak
  // Angliát kezeljük országként. (Ahol platform-független megjelenés kell,
  // ott a CountryFlag SVG-komponens fut, nem ez az emoji.)
  // ⚠️ Anglia zászló-emojija SZÁNDÉKOSAN ÜRES. A 🇬🇧 az EGYESÜLT KIRÁLYSÁGÉ
  // (rossz ország), az angol 🏴 pedig tag-sequence emoji, amit a Windows NEM
  // renderel — sima fekete lobogó lesz belőle. Üresen a szöveges helyeken
  // (<option>, chip) csak az „Anglia" név jelenik meg, ami tiszta és pontos.
  // Ahol grafikus zászló kell, ott a CountryFlag SVG-komponens fut (az rajzolja
  // a Szent György-keresztet), a landingen pedig a .fl-eng CSS-zászló.
  { code: "GB", name: "Anglia", flag: "", enabled: true },
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
    case "GB": return "Angliában";
    default: return "Svájcban";
  }
}

/** Az ország „-on/-en/-ön" (felszíni) alakja. Pl. „Svájcon kívül", „Németországon". */
export function countrySuperessive(code: string | null | undefined): string {
  switch (code) {
    case "AT": return "Ausztrián";
    case "DE": return "Németországon";
    case "NL": return "Hollandián";
    case "GB": return "Anglián";
    default: return "Svájcon";
  }
}

/** Az ország melléknévi alakja. Pl. „svájci", „német", „osztrák". */
export function countryAdjective(code: string | null | undefined): string {
  switch (code) {
    case "AT": return "osztrák";
    case "DE": return "német";
    case "NL": return "holland";
    case "GB": return "angol";
    default: return "svájci";
  }
}

/**
 * „Ott lakó" melléknév — az ORSZÁGBAN élőkre utal, nem a nemzetiségre.
 * Pl. „ausztriai magyarok" (= Ausztriában élő magyarok), szemben az
 * „osztrák magyarok"-kal, ami mást jelent. Ezért NEM a countryAdjective.
 */
export function countryResidentialAdjective(code: string | null | undefined): string {
  switch (code) {
    case "AT": return "ausztriai";
    case "DE": return "németországi";
    case "NL": return "hollandiai";
    case "GB": return "angliai";
    default: return "svájci";
  }
}

/**
 * A nyelvlecke-kurzus nyelvének magyar neve (menü/csempe-címkéhez).
 *
 * ⚠️ Ez KORÁBBAN láncolt elágazás volt a menüben, aminek az UTOLSÓ ága az
 * osztrák volt — így az angliai felhasználó „Nyelvlecke — osztrák német"
 * feliratot látott (user jelezte 2026-07-28). Új ország felvételekor IDE
 * kell írni, és a `default` szándékosan a svájci: az a DEFAULT_COUNTRY.
 */
export function courseLanguageName(code: string | null | undefined): string {
  switch (code) {
    case "AT": return "osztrák német";
    case "DE": return "német";
    case "NL": return "holland";
    case "GB": return "brit angol";
    default: return "svájci német";
  }
}

/** A közigazgatási régió-egység neve. CH: kanton; AT/DE/NL: tartomány. */
export function regionWord(code: string | null | undefined): string {
  if (code === "GB") return "régió";
  return code && code !== "CH" ? "tartomány" : "kanton";
}

/** Az ország „-ba/-be" (irányultság) alakja. Pl. „Svájcba", „Németországba". */
export function countryIllative(code: string | null | undefined): string {
  switch (code) {
    case "AT": return "Ausztriába";
    case "DE": return "Németországba";
    case "NL": return "Hollandiába";
    case "GB": return "Angliába";
    default: return "Svájcba";
  }
}
