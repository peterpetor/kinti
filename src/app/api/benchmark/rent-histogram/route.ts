import { NextResponse, type NextRequest } from "next/server";
import { getRentHistogram } from "@/lib/benchmark";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/benchmark/rent-histogram?rooms=3.5&canton=ZH
 * Visszaadja a lakbér-sávokat (200 CHF-es bontásban) adott szobaszámra.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomsStr = searchParams.get("rooms");
  const canton = searchParams.get("canton") || "all";
  const country = searchParams.get("country") === "AT" ? "AT" : "CH";
  const rooms = roomsStr ? parseFloat(roomsStr) : NaN;

  if (!Number.isFinite(rooms) || rooms <= 0) {
    return NextResponse.json({ error: "A 'rooms' paraméter kötelező." }, { status: 400 });
  }

  const histogram = await getRentHistogram(country, rooms, canton);
  return NextResponse.json({ histogram }, { headers: { "cache-control": "no-store" } });
}
