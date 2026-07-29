/**
 * Spanyol régió-pontok (az autonóm közösség SZÉKHELYÉNEK koordinátája).
 * A kódok a regions.ts ES-kódjaival egyeznek (ISO 3166-2:ES).
 *
 * ⚠️ A Kanári-szigeteknek KÉT társ-székhelye van (Las Palmas de Gran Canaria és
 * Santa Cruz de Tenerife, négyévente váltják egymást). Itt Las Palmas szerepel,
 * mert az a nagyobb város — a `nearestEsRegion` szempontjából amúgy is mindegy:
 * a két sziget közti ~1,5° távolság eltörpül a szárazföldig tartó ~10°-hoz képest,
 * bármelyik pont ugyanúgy a CN-t adja vissza.
 *
 * ⚠️ A `nearestEsRegion` DURVA deriváció — Spanyolországban a nagy, ritkán lakott
 * közösségek (Castilla y León, Castilla-La Mancha, Aragón) székhelye messze esik
 * a közösség szélétől, így egy határ menti pont a szomszéd székhelyéhez kerülhet
 * közelebb. Ezért ez CSAK javaslat: a felhasználó a listából felülírhatja.
 */
import type { RegionPoint } from "./at-points";

export const ES_REGION_POINTS: Record<string, RegionPoint> = {
  MD: { code: "MD", city: "Madrid",                       lat: 40.4168, lng: -3.7038 },
  CT: { code: "CT", city: "Barcelona",                    lat: 41.3874, lng: 2.1686 },
  AN: { code: "AN", city: "Sevilla",                      lat: 37.3891, lng: -5.9845 },
  VC: { code: "VC", city: "València",                     lat: 39.4699, lng: -0.3763 },
  IB: { code: "IB", city: "Palma",                        lat: 39.5696, lng: 2.6502 },
  CN: { code: "CN", city: "Las Palmas de Gran Canaria",   lat: 28.1235, lng: -15.4363 },
  PV: { code: "PV", city: "Vitoria-Gasteiz",              lat: 42.8467, lng: -2.6716 },
  GA: { code: "GA", city: "Santiago de Compostela",       lat: 42.8782, lng: -8.5448 },
  CL: { code: "CL", city: "Valladolid",                   lat: 41.6523, lng: -4.7245 },
  CM: { code: "CM", city: "Toledo",                       lat: 39.8628, lng: -4.0273 },
  AR: { code: "AR", city: "Zaragoza",                     lat: 41.6488, lng: -0.8891 },
  MC: { code: "MC", city: "Murcia",                       lat: 37.9922, lng: -1.1307 },
  AS: { code: "AS", city: "Oviedo",                       lat: 43.3619, lng: -5.8494 },
  EX: { code: "EX", city: "Mérida",                       lat: 38.9169, lng: -6.3437 },
  NC: { code: "NC", city: "Pamplona",                     lat: 42.8125, lng: -1.6458 },
  CB: { code: "CB", city: "Santander",                    lat: 43.4623, lng: -3.8100 },
  RI: { code: "RI", city: "Logroño",                      lat: 42.4650, lng: -2.4456 },
  CE: { code: "CE", city: "Ceuta",                        lat: 35.8894, lng: -5.3213 },
  ML: { code: "ML", city: "Melilla",                      lat: 35.2923, lng: -2.9381 },
};

/** Régió-kód (vagy null) → koordináta-pont. Alapértelmezés: Madrid. */
export function esPoint(code: string | null | undefined): RegionPoint {
  if (code && ES_REGION_POINTS[code]) return ES_REGION_POINTS[code];
  return ES_REGION_POINTS.MD;
}

/** A koordinátához legközelebbi közösség-székhely (durva derivációhoz). */
export function nearestEsRegion(lat: number, lng: number): RegionPoint {
  let best = ES_REGION_POINTS.MD;
  let bestD = Infinity;
  for (const p of Object.values(ES_REGION_POINTS)) {
    const d = (p.lat - lat) ** 2 + (p.lng - lng) ** 2;
    if (d < bestD) { bestD = d; best = p; }
  }
  return best;
}
