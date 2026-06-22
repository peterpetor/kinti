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
  "ugyintezes",        // ügyintézés-varázsló (svájci hivatalok)
  "allampolgarsag",    // állampolgárság / Einbürgerung (svájci)
  "vam",               // vám-kalkulátor (svájci határ)
  "bussen",            // bírság-info (svájci)
  "kozlekedes",        // közlekedés (svájci)
  "szolgaltato-valto", // szolgáltató-váltás (svájci szolgáltatók)
  "lakberles",         // lakbér-kalkulátor (svájci)
  "tudasbazis",        // tudásbázis (svájci hivatalos források)
  "kviz",              // kvíz (svájci tartalom)
  "berkalkulator",     // bérkalkulátor (svájci adó/CHF)
  "iranytu",           // béradat-radar (svájci bérbenchmark)
  "repulojegy",        // CH↔BUD járatfigyelő (más országban más reptér/útvonal; pl. VIE↔BUD vonatos)
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
  return !CH_ONLY_FEATURES.has(feature);
}
