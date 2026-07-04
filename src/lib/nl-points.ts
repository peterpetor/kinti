/**
 * Holland provincia-pontok (a provincia-székhely koordinátája).
 * A kódok a regions.ts NL-kódjaival egyeznek (NH/ZH/UT/NB/GE/OV/LI/FR/GR/DR/FL/ZE).
 * Figyelem: az NL "ZH" (Zuid-Holland) kód ütközik a CH "ZH"-val (Zürich) —
 * ez a modul KIZÁRÓLAG NL-kontextusban használható (lásd regions.ts fejkomment).
 */
import type { RegionPoint } from "./at-points";

export const NL_PROVINCE_POINTS: Record<string, RegionPoint> = {
  NH: { code: "NH", city: "Haarlem",          lat: 52.3874, lng: 4.6462 },
  ZH: { code: "ZH", city: "Den Haag",         lat: 52.0705, lng: 4.3007 },
  UT: { code: "UT", city: "Utrecht",          lat: 52.0907, lng: 5.1214 },
  NB: { code: "NB", city: "'s-Hertogenbosch", lat: 51.6978, lng: 5.3037 },
  GE: { code: "GE", city: "Arnhem",           lat: 51.9851, lng: 5.8987 },
  OV: { code: "OV", city: "Zwolle",           lat: 52.5168, lng: 6.0830 },
  LI: { code: "LI", city: "Maastricht",       lat: 50.8514, lng: 5.6910 },
  FR: { code: "FR", city: "Leeuwarden",       lat: 53.2012, lng: 5.7999 },
  GR: { code: "GR", city: "Groningen",        lat: 53.2194, lng: 6.5665 },
  DR: { code: "DR", city: "Assen",            lat: 52.9925, lng: 6.5649 },
  FL: { code: "FL", city: "Lelystad",         lat: 52.5185, lng: 5.4714 },
  ZE: { code: "ZE", city: "Middelburg",       lat: 51.4988, lng: 3.6136 },
};

/** Provincia-kód (vagy null) → koordináta-pont. Alapértelmezés: Noord-Holland. */
export function nlPoint(code: string | null | undefined): RegionPoint {
  if (code && NL_PROVINCE_POINTS[code]) return NL_PROVINCE_POINTS[code];
  return NL_PROVINCE_POINTS.NH;
}

/** A koordinátához legközelebbi provincia-székhely (durva derivációhoz). */
export function nearestNlProvince(lat: number, lng: number): RegionPoint {
  let best = NL_PROVINCE_POINTS.NH;
  let bestD = Infinity;
  for (const p of Object.values(NL_PROVINCE_POINTS)) {
    const d = (p.lat - lat) ** 2 + (p.lng - lng) ** 2;
    if (d < bestD) { bestD = d; best = p; }
  }
  return best;
}
