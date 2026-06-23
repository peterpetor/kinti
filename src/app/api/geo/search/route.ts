import { NextResponse } from "next/server";

export const runtime = "edge";

/**
 * GET /api/geo/search?q=...&country=CH — ország-tudatos címkereső proxy.
 *
 *   • CH  → hivatalos geo.admin.ch SearchServer (legpontosabb svájci címekre).
 *   • AT (és a többi nem-CH) → Photon (OpenStreetMap, komoot) — kulcs nélkül,
 *     ország-középre súlyozva + ország-kódra szűrve.
 *
 * Válasz egységes: { results: [{ label, lat, lng }] }. WGS84 koordináták.
 */

const CACHE = { "cache-control": "public, max-age=86400, s-maxage=86400" } as const;

/** Photon-súlyozás + ország-kód a nem-CH országokhoz. */
const PHOTON_BIAS: Record<string, { lat: number; lon: number; cc: string }> = {
  AT: { lat: 47.6, lon: 14.1, cc: "at" },
  DE: { lat: 51.2, lon: 10.4, cc: "de" },
  NL: { lat: 52.1, lon: 5.3, cc: "nl" },
  DK: { lat: 56.0, lon: 10.0, cc: "dk" },
  SE: { lat: 62.0, lon: 15.0, cc: "se" },
};

interface GeoHit {
  label: string;
  lat: number;
  lng: number;
}

function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const q = sp.get("q")?.trim() ?? "";
  const country = (sp.get("country") || "CH").toUpperCase();
  if (q.length < 3) {
    return NextResponse.json({ results: [] }, { headers: { "cache-control": "no-store" } });
  }
  return country === "CH" ? geoAdminSearch(q) : photonSearch(q, country);
}

// ── CH: geo.admin.ch ─────────────────────────────────────────────────────────
interface GeoAdminResult {
  attrs?: { label?: string; detail?: string; lat?: number; lon?: number };
}

async function geoAdminSearch(q: string): Promise<Response> {
  const url =
    "https://api3.geo.admin.ch/rest/services/api/SearchServer" +
    `?searchText=${encodeURIComponent(q)}` +
    "&type=locations&origins=address,gg25&limit=8&sr=4326";
  try {
    const res = await fetch(url, {
      headers: { accept: "application/json" },
      cf: { cacheTtl: 86400, cacheEverything: true },
    } as RequestInit);
    if (!res.ok) return NextResponse.json({ results: [] }, { status: 502 });
    const data = (await res.json()) as { results?: GeoAdminResult[] };
    const results = (data.results ?? [])
      .map((r) => {
        const a = r.attrs ?? {};
        const label = stripTags(a.label ?? a.detail ?? "");
        const lat = typeof a.lat === "number" ? a.lat : null;
        const lng = typeof a.lon === "number" ? a.lon : null;
        return label && lat != null && lng != null ? { label, lat, lng } : null;
      })
      .filter((r): r is GeoHit => r !== null);
    return NextResponse.json({ results }, { headers: CACHE });
  } catch {
    return NextResponse.json({ results: [] }, { status: 502 });
  }
}

// ── AT (+ többi): Photon / OpenStreetMap ─────────────────────────────────────
interface PhotonFeature {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    name?: string; street?: string; housenumber?: string;
    postcode?: string; city?: string; district?: string; county?: string;
    countrycode?: string;
  };
}

async function photonSearch(q: string, country: string): Promise<Response> {
  const bias = PHOTON_BIAS[country];
  if (!bias) return NextResponse.json({ results: [] }, { headers: CACHE });
  const url =
    `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}` +
    `&limit=8&lang=de&lat=${bias.lat}&lon=${bias.lon}`;
  try {
    const res = await fetch(url, {
      headers: { accept: "application/json", "user-agent": "kinti.app" },
      cf: { cacheTtl: 86400, cacheEverything: true },
    } as RequestInit);
    if (!res.ok) return NextResponse.json({ results: [] }, { status: 502 });
    const data = (await res.json()) as { features?: PhotonFeature[] };
    const results = (data.features ?? [])
      .filter((f) => (f.properties?.countrycode ?? "").toLowerCase() === bias.cc)
      .map((f) => {
        const p = f.properties ?? {};
        const c = f.geometry?.coordinates;
        if (!Array.isArray(c) || c.length < 2) return null;
        const [lng, lat] = c;
        const streetPart = [p.street ?? p.name, p.housenumber].filter(Boolean).join(" ");
        const cityPart = [p.postcode, p.city ?? p.district ?? p.county].filter(Boolean).join(" ");
        const label = stripTags([streetPart, cityPart].filter(Boolean).join(", "));
        return label && typeof lat === "number" && typeof lng === "number" ? { label, lat, lng } : null;
      })
      .filter((r): r is GeoHit => r !== null)
      .slice(0, 8);
    return NextResponse.json({ results }, { headers: CACHE });
  } catch {
    return NextResponse.json({ results: [] }, { status: 502 });
  }
}
