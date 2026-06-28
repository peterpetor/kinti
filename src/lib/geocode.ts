/**
 * Egyszerű geokódolás az Open-Meteo ingyenes (kulcs nélküli) geocoding API-jával
 * — ugyanaz a szolgáltató, mint az időjárásnál. Városnévből koordináta.
 */

export interface GeoResult {
  lat: number;
  lng: number;
  name: string;
  /** ISO országkód (pl. "AT") — ország-szűréshez/ellenőrzéshez. */
  countryCode?: string;
  /** Régió (Bundesland/kanton/provincie) neve a geokódolóból. */
  admin1?: string;
}

/**
 * Településnévből koordináta. `opts.countryCode` esetén az adott országban lévő
 * első találatot adja (kis falvaknál is, pl. Grossarl), különben a legjobb találatot.
 */
export async function geocodeCity(name: string, opts?: { countryCode?: string }): Promise<GeoResult | null> {
  const q = name.trim();
  if (!q) return null;
  try {
    const url =
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}` +
      `&count=5&language=hu&format=json`;
    const res = await fetch(url, {
      cf: { cacheTtl: 86400, cacheEverything: true },
    } as RequestInit);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      results?: { latitude?: number; longitude?: number; name?: string; country_code?: string; admin1?: string }[];
    };
    const list = data.results ?? [];
    const wantCc = opts?.countryCode?.toUpperCase();
    const r =
      (wantCc ? list.find((x) => (x.country_code ?? "").toUpperCase() === wantCc) : undefined) ?? list[0];
    if (!r || typeof r.latitude !== "number" || typeof r.longitude !== "number") return null;
    return { lat: r.latitude, lng: r.longitude, name: r.name ?? q, countryCode: r.country_code, admin1: r.admin1 };
  } catch {
    return null;
  }
}
