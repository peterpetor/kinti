/**
 * Haversine-távolság két földrajzi pont között, kilométerben.
 *
 * A radius-keresőhöz használt egyszerű, fast-path implementáció. Pontossága
 * a Föld gömb-közelítéséből adódóan kb. ±0,5 % — a "5 km-en belüli üzletek"
 * tipusú lekérdezésekhez bőven elegendő.
 */
const EARTH_R_KM = 6371;

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_R_KM * c;
}

/** UI-barát táv-cimke: 0.7 km / 4.2 km / 18 km / 124 km. */
export function formatDistanceKm(km: number): string {
  if (km < 1) return `${(km * 1000).toFixed(0)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}
