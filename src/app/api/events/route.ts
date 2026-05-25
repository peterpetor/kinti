import { NextResponse, type NextRequest } from "next/server";
import { getEvents } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// GET /api/events?upcoming=1&limit=10
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const events = await getEvents({
    upcoming: searchParams.get("upcoming") === "1",
    limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
  });
  return NextResponse.json({ events }, { headers: { "cache-control": "no-store" } });
}
