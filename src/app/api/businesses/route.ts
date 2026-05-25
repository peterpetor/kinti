import { NextResponse, type NextRequest } from "next/server";
import { getBusinesses } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// GET /api/businesses?category=fodrasz&featured=1
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const businesses = await getBusinesses({
    category: searchParams.get("category"),
    featured: searchParams.get("featured") === "1",
    limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
  });
  return NextResponse.json({ businesses }, { headers: { "cache-control": "no-store" } });
}
