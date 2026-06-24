/**
 * Német Bundesland-pontok (a tartomány székhelyének koordinátája) — a cím-alapú
 * durva régió-derivációhoz és időjáráshoz. A kódok a regions.ts DE-kódjaival
 * egyeznek (BW/BY/BE/BB/HB/HH/HE/MV/NI/NW/RP/SL/SN/ST/SH/TH).
 */
import type { RegionPoint } from "./at-points";

export const DE_BUNDESLAND_POINTS: Record<string, RegionPoint> = {
  BW: { code: "BW", city: "Stuttgart",    lat: 48.7758, lng: 9.1829 },
  BY: { code: "BY", city: "München",      lat: 48.1351, lng: 11.5820 },
  BE: { code: "BE", city: "Berlin",       lat: 52.5200, lng: 13.4050 },
  BB: { code: "BB", city: "Potsdam",      lat: 52.3906, lng: 13.0645 },
  HB: { code: "HB", city: "Bremen",       lat: 53.0793, lng: 8.8017 },
  HH: { code: "HH", city: "Hamburg",      lat: 53.5511, lng: 9.9937 },
  HE: { code: "HE", city: "Wiesbaden",    lat: 50.0782, lng: 8.2398 },
  MV: { code: "MV", city: "Schwerin",     lat: 53.6355, lng: 11.4012 },
  NI: { code: "NI", city: "Hannover",     lat: 52.3759, lng: 9.7320 },
  NW: { code: "NW", city: "Düsseldorf",   lat: 51.2277, lng: 6.7735 },
  RP: { code: "RP", city: "Mainz",        lat: 49.9929, lng: 8.2473 },
  SL: { code: "SL", city: "Saarbrücken",  lat: 49.2402, lng: 6.9969 },
  SN: { code: "SN", city: "Dresden",      lat: 51.0504, lng: 13.7373 },
  ST: { code: "ST", city: "Magdeburg",    lat: 52.1205, lng: 11.6276 },
  SH: { code: "SH", city: "Kiel",         lat: 54.3233, lng: 10.1228 },
  TH: { code: "TH", city: "Erfurt",       lat: 50.9848, lng: 11.0299 },
};

/** Bundesland-kód (vagy null) → koordináta-pont. Alapértelmezés: Berlin. */
export function dePoint(code: string | null | undefined): RegionPoint {
  if (code && DE_BUNDESLAND_POINTS[code]) return DE_BUNDESLAND_POINTS[code];
  return DE_BUNDESLAND_POINTS.BE;
}

/** A koordinátához legközelebbi Bundesland-székhely (durva derivációhoz). */
export function nearestDeBundesland(lat: number, lng: number): RegionPoint {
  let best = DE_BUNDESLAND_POINTS.BE;
  let bestD = Infinity;
  for (const p of Object.values(DE_BUNDESLAND_POINTS)) {
    const d = (p.lat - lat) ** 2 + (p.lng - lng) ** 2;
    if (d < bestD) { bestD = d; best = p; }
  }
  return best;
}
