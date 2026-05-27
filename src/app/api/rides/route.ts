import { NextResponse } from "next/server";
import { getActiveRides, type RideQuery } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/rides — aktív (nem lejárt) fuvarok a lista- és térképnézethez.
 * Opcionális bounding-box: ?minLat&maxLat&minLng&maxLng
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const num = (k: string) => {
    const v = searchParams.get(k);
    if (v == null || v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  const q: RideQuery = {
    minLat: num("minLat"),
    maxLat: num("maxLat"),
    minLng: num("minLng"),
    maxLng: num("maxLng"),
  };

  const rides = await getActiveRides(q);
  return NextResponse.json({ rides }, { headers: { "cache-control": "no-store" } });
}
