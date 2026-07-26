/**
 * Angol régió-pontok (a régió legnagyobb városának koordinátája).
 * A kódok a regions.ts GB-kódjaival egyeznek (LDN/SE/SW/EE/WM/EM/NW/YH/NE).
 *
 * ⚠️ SZÁNDÉKOSAN csak ANGLIA 9 hivatalos (ONS) régiója — Skócia, Wales és
 * Észak-Írország kimarad, mert külön jogrend (ld. regions.ts GB-megjegyzés).
 */
import type { RegionPoint } from "./at-points";

export const GB_REGION_POINTS: Record<string, RegionPoint> = {
  LDN: { code: "LDN", city: "London",             lat: 51.5074, lng: -0.1278 },
  SE:  { code: "SE",  city: "Brighton",           lat: 50.8225, lng: -0.1372 },
  SW:  { code: "SW",  city: "Bristol",            lat: 51.4545, lng: -2.5879 },
  EE:  { code: "EE",  city: "Cambridge",          lat: 52.2053, lng:  0.1218 },
  WM:  { code: "WM",  city: "Birmingham",         lat: 52.4862, lng: -1.8904 },
  EM:  { code: "EM",  city: "Nottingham",         lat: 52.9548, lng: -1.1581 },
  NW:  { code: "NW",  city: "Manchester",         lat: 53.4808, lng: -2.2426 },
  YH:  { code: "YH",  city: "Leeds",              lat: 53.8008, lng: -1.5491 },
  NE:  { code: "NE",  city: "Newcastle upon Tyne", lat: 54.9783, lng: -1.6178 },
};

/** Régió-kód (vagy null) → koordináta-pont. Alapértelmezés: London. */
export function gbPoint(code: string | null | undefined): RegionPoint {
  if (code && GB_REGION_POINTS[code]) return GB_REGION_POINTS[code];
  return GB_REGION_POINTS.LDN;
}

/** A koordinátához legközelebbi régió-központ (durva derivációhoz). */
export function nearestGbRegion(lat: number, lng: number): RegionPoint {
  let best = GB_REGION_POINTS.LDN;
  let bestD = Infinity;
  for (const p of Object.values(GB_REGION_POINTS)) {
    const d = (p.lat - lat) ** 2 + (p.lng - lng) ** 2;
    if (d < bestD) { bestD = d; best = p; }
  }
  return best;
}
