/**
 * region-point.ts — régió-kód → térkép-koordináta, MIND A HAT országra.
 *
 * ⚠️ EZ AZÉRT EGY HELYEN VAN. A logika korábban KÉT helyen élt, és a kettő
 * elcsúszott: az `/api/szaknevsor/ajanlas` mind a hat országot kezelte, a
 * Szaknévsor TÉRKÉP-nézete viszont csak CH/AT/DE-t. Emiatt Spanyolországban,
 * Angliában és Hollandiában a régió-választás NEM mozgatta a térképet — a
 * felhasználó Galiciát választott, és a térkép Madridra zoomolt rá (a
 * `mapZoom` ilyenkor 10-re megy, tehát a rossz helyre KÖZELÍT is).
 *
 * A `es/gb/nl-points.ts` modulok végig LÉTEZTEK — csak a nézet nem hívta őket.
 * Ne írd vissza elágazásra: ide vedd fel az új országot, és mindkét felület
 * egyszerre kapja meg.
 *
 * ⚠️⚠️ SZÁNDÉKOSAN A NYERS TÁBLÁKAT olvassuk, NEM a `*Point()` függvényeket.
 * Azok ismeretlen kódra a FŐVÁROSRA esnek vissza (`esPoint` → Madrid,
 * `gbPoint` → London, `cantonPoint` → Zürich) — ami pont a hibát reprodukálná:
 * egy elavult vagy másik országbeli kód némán egy létező, de HAMIS helyre
 * vinné a térképet. Itt az ismeretlen kód `null`, és a hívó az ORSZÁG közepén
 * marad, országos zoommal.
 */

import { CANTON_COORDS } from "./cantons";
import { AT_BUNDESLAND_POINTS } from "./at-points";
import { DE_BUNDESLAND_POINTS } from "./de-points";
import { NL_PROVINCE_POINTS } from "./nl-points";
import { GB_REGION_POINTS } from "./gb-points";
import { ES_REGION_POINTS } from "./es-points";

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * ⚠️ ORSZÁGONKÉNTI TÁBLA, nem elágazás. A holland provincia-kódok
 * (ZH/FR/GR/GE) ÜTKÖZNEK a svájci kantonkódokkal, ezért mindig a saját ország
 * táblájában keresünk — soha nem „valamelyikben".
 */
const PONTOK: Record<string, Record<string, { lat: number; lng: number }>> = {
  CH: CANTON_COORDS,
  AT: AT_BUNDESLAND_POINTS,
  DE: DE_BUNDESLAND_POINTS,
  NL: NL_PROVINCE_POINTS,
  GB: GB_REGION_POINTS,
  ES: ES_REGION_POINTS,
};

/**
 * Egy régió-kód középpontja az adott országban.
 * `null`, ha a kód ismeretlen ott — a hívó ilyenkor az ORSZÁG közepére essen.
 */
export function regionPoint(country: string, code: string | null | undefined): LatLng | null {
  if (!code || code === "all") return null;
  const p = PONTOK[country]?.[code];
  return p ? { lat: p.lat, lng: p.lng } : null;
}
