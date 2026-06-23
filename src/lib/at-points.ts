/**
 * Osztrák Bundesland-pontok az időjáráshoz (a tartomány székhelyének koordinátája).
 * A kódok a regions.ts AT-kódjaival egyeznek (W/NOE/OOE/STM/TIR/KTN/SBG/VBG/BGL).
 */
export interface RegionPoint {
  code: string;
  city: string;
  lat: number;
  lng: number;
}

export const AT_BUNDESLAND_POINTS: Record<string, RegionPoint> = {
  W:   { code: "W",   city: "Wien",        lat: 48.2082, lng: 16.3738 },
  NOE: { code: "NOE", city: "St. Pölten",  lat: 48.2047, lng: 15.6256 },
  OOE: { code: "OOE", city: "Linz",        lat: 48.3069, lng: 14.2858 },
  STM: { code: "STM", city: "Graz",        lat: 47.0707, lng: 15.4395 },
  TIR: { code: "TIR", city: "Innsbruck",   lat: 47.2692, lng: 11.4041 },
  KTN: { code: "KTN", city: "Klagenfurt",  lat: 46.6247, lng: 14.3050 },
  SBG: { code: "SBG", city: "Salzburg",    lat: 47.8095, lng: 13.0550 },
  VBG: { code: "VBG", city: "Bregenz",     lat: 47.5031, lng: 9.7471 },
  BGL: { code: "BGL", city: "Eisenstadt",  lat: 47.8457, lng: 16.5278 },
};

/** Bundesland-kód (vagy null) → koordináta-pont. Alapértelmezés: Bécs. */
export function atPoint(code: string | null | undefined): RegionPoint {
  if (code && AT_BUNDESLAND_POINTS[code]) return AT_BUNDESLAND_POINTS[code];
  return AT_BUNDESLAND_POINTS.W;
}
