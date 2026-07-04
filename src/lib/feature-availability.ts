/**
 * feature-availability.ts — mely funkciók érhetők el mely országban.
 *
 * Az app sok eszköze KIFEJEZETTEN svájci tudás (Einbürgerung, Serafe/bírság,
 * svájci vám, svájci iskolarendszer, svájci bérkalkuláció stb.). Egy nem-CH
 * országban ezek hibásak/irrelevánsak lennének, ezért a belépési pontoknál
 * (kezdőlap-csempék, menü) ország szerint rejtjük őket.
 *
 * Modell: ami NEM CH-specifikus, az univerzális (minden országban megy). A
 * CH-specifikus kulcsok halmaza alább. Új ország bekapcsolásakor, ahogy elkészül
 * egy adott ország verziója egy eszközből, kivesszük a CH-only halmazból (vagy
 * finomítjuk per-ország listára).
 */
import { DEFAULT_COUNTRY } from "./countries";

/**
 * CH-specifikus funkció-kulcsok (a route első szegmense / logikai név). Ezek
 * csak Svájcban jelennek meg, amíg nincs ország-specifikus változatuk.
 */
export const CH_ONLY_FEATURES: ReadonlySet<string> = new Set([
  "vam",               // vám-kalkulátor (svájci határ)
  "szolgaltato-valto", // szolgáltató-váltás (svájci szolgáltatók)
  // "szakmai-szotar" — KIVÉVE (2026-07-04): mind a 4 országra van szótár-bank
  //   (data.ts INDUSTRY_LESSONS + _AT/_DE/_NL, ország-tudatos TTS-nyelvvel).
  // "repulojegy" — már ország-tudatos (CH + AT + DE, lib/flights.ts); a komponens a
  // konfig nélküli országokat (NL) „hamarosan" üzenettel kezeli.
]);

/**
 * Megvannak CH-ban ÉS AT-ban, de DE/NL-ben még NEM (hiányzik a kvíz-kérdésbank /
 * a benchmark-seed). Ezeket DE/NL-ben rejtjük, amíg el nem készül a tartalmuk.
 */
export const CH_AT_ONLY_FEATURES: ReadonlySet<string> = new Set([
  // „allampolgarsag" KIVÉVE: mind a 4 országra van kérdésbank (CH Einbürgerung,
  // AT Staatsbürgerschaft, DE Einbürgerungstest, NL inburgering/KNM) → minden országban él.
  // „lakberles" KIVÉVE (2026-07-04): mind a 4 országra van rent-konfig (RENT_CONFIG
  //   CH/AT/DE/NL — kaució-szabály, rezsi-alapráta, tippek, hivatalos források).
  // "iranytu" — KIVÉVE: az Iránytű közösségi benchmark (a userek töltik), DE-tudatos
  // (region-util DE-ág), és fő nav-fül → ne tűnjön el DE-ben; üresen indul, mint AT.
]);

/**
 * Megvannak CH+AT+DE-ben, de NL-ben még NEM (nincs holland csekklista-tartalom).
 * Az ügyintézés-csekklisták mindhárom országra megírva (admin-checklists.ts).
 */
export const CH_AT_DE_ONLY_FEATURES: ReadonlySet<string> = new Set([
  // NL-en (egyelőre) rejtett: a tartalom CH/AT/DE-specifikus, nincs holland verzió.
  // Amint elkészül egy holland változat, vedd ki innen (vagy tedd per-ország listára).
  "iskolarendszer",// iskolarendszer — CH/AT/DE oktatási rendszer (NL nincs)
  "tudasbazis",    // tudásbázis — CH/AT/DE hivatalos források (NL-hez a /hivatalos van)
  "kozlekedes",    // tömegközlekedés — CH/AT/DE adat (NL nincs)
  "bussen",        // bírság-becslő (Bussen) — CH/AT/DE szabálysértés (NL nincs)
  "akciok",        // akció-térkép — CH/AT/DE boltláncok (NL holland láncok kellenek)
  "repulojegy",    // repülőjegy-figyelő — CH/AT/DE konfig (NL nincs; ne mutasson „hamarosan"-t)
  "vizum",         // engedély-varázsló — CH/AT/DE lépéssorok; NL-nek svájci tartalmat adott volna
  // "berkalkulator" — KIVÉVE (2026-07-04): VAN holland verzió (computeSalaryNL,
  // 2025 Box 1 + heffingskortingen, c8bb005 óta él) — a 07-04-i vissza-gate-elés
  // tévedés volt („NL nincs" feltételezéssel).
]);

/**
 * Univerzális funkciók (minden országban): szaknévsor, állások, közösség,
 * vállalkozás-felvétel, árfolyam, repülőjegy, hírlevél, értesítések, ranglista,
 * akció-térkép — ezek nincsenek a CH-only halmazban, így automatikusan mennek.
 */
export function isFeatureAvailable(
  feature: string,
  country: string | null | undefined,
): boolean {
  const c = country || DEFAULT_COUNTRY;
  if (c === "CH") return true; // Svájcban minden elérhető (a teljes meglévő app)
  if (CH_ONLY_FEATURES.has(feature)) return false;
  // DE/NL: a csak-CH+AT funkciók még nem elérhetők (AT-ban igen).
  if (c !== "AT" && CH_AT_ONLY_FEATURES.has(feature)) return false;
  // NL: a CH+AT+DE funkciók még nem elérhetők (CH/AT/DE-ben igen).
  if (c !== "AT" && c !== "DE" && CH_AT_DE_ONLY_FEATURES.has(feature)) return false;
  return true;
}
