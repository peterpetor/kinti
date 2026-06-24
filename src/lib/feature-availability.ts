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
  // "repulojegy" — már ország-tudatos (CH + AT + DE, lib/flights.ts); a komponens a
  // konfig nélküli országokat (NL) „hamarosan" üzenettel kezeli.
]);

/**
 * Megvannak CH-ban ÉS AT-ban, de DE/NL-ben még NEM (hiányzik a kvíz-kérdésbank /
 * a benchmark-seed). Ezeket DE/NL-ben rejtjük, amíg el nem készül a tartalmuk.
 */
export const CH_AT_ONLY_FEATURES: ReadonlySet<string> = new Set([
  "kviz",          // napi kvíz — nincs DE/NL kérdésbank
  "iranytu",       // Bér- és Lakbér Iránytű — nincs DE/NL benchmark-seed
  "ugyintezes",    // ügyintézés-csekklisták — CH/AT-specifikus (DE-bürokrácia: tudásbázis)
  "allampolgarsag",// állampolgárság/Einbürgerung — CH/AT-specifikus (DE: /vizum + guide)
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
  return true;
}
