import { NextResponse } from "next/server";

export const runtime = "edge";

/**
 * GET /api/geo/search?q=... — svájci címkereső proxy a hivatalos geo.admin.ch
 * SearchServer fölé. Nincs API-kulcs; CORS és rate-limit elkerülése végett
 * szerveroldalon hívjuk és cache-eljük. WGS84 (sr=4326) koordinátákat ad vissza.
 *
 * Válasz: { results: [{ label, lat, lng }] }
 */
interface GeoAdminAttrs {
  label?: string;
  detail?: string;
  lat?: number;
  lon?: number;
}
interface GeoAdminResult {
  attrs?: GeoAdminAttrs;
}

function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 3) {
    return NextResponse.json({ results: [] }, { headers: { "cache-control": "no-store" } });
  }

  const url =
    "https://api3.geo.admin.ch/rest/services/api/SearchServer" +
    `?searchText=${encodeURIComponent(q)}` +
    "&type=locations&origins=address,gg25&limit=8&sr=4326";

  try {
    const res = await fetch(url, {
      headers: { accept: "application/json" },
      // 24h CF edge cache azonos lekérdezésre
      cf: { cacheTtl: 86400, cacheEverything: true },
    } as RequestInit);
    if (!res.ok) {
      return NextResponse.json({ results: [] }, { status: 502 });
    }
    const data = (await res.json()) as { results?: GeoAdminResult[] };
    const results = (data.results ?? [])
      .map((r) => {
        const a = r.attrs ?? {};
        const label = stripTags(a.label ?? a.detail ?? "");
        const lat = typeof a.lat === "number" ? a.lat : null;
        const lng = typeof a.lon === "number" ? a.lon : null;
        return label && lat != null && lng != null ? { label, lat, lng } : null;
      })
      .filter((r): r is { label: string; lat: number; lng: number } => r !== null);

    return NextResponse.json(
      { results },
      { headers: { "cache-control": "public, max-age=86400, s-maxage=86400" } },
    );
  } catch {
    return NextResponse.json({ results: [] }, { status: 502 });
  }
}
