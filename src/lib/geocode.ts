/**
 * Egyszerű geokódolás az Open-Meteo ingyenes (kulcs nélküli) geocoding API-jával
 * — ugyanaz a szolgáltató, mint az időjárásnál. Városnévből koordináta.
 */

export interface GeoResult {
  lat: number;
  lng: number;
  name: string;
}

export async function geocodeCity(name: string): Promise<GeoResult | null> {
  const q = name.trim();
  if (!q) return null;
  try {
    const url =
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}` +
      `&count=1&language=hu&format=json`;
    const res = await fetch(url, {
      cf: { cacheTtl: 86400, cacheEverything: true },
    } as RequestInit);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      results?: { latitude?: number; longitude?: number; name?: string }[];
    };
    const r = data.results?.[0];
    if (!r || typeof r.latitude !== "number" || typeof r.longitude !== "number") return null;
    return { lat: r.latitude, lng: r.longitude, name: r.name ?? q };
  } catch {
    return null;
  }
}
