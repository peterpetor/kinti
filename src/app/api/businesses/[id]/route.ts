import { NextResponse, type NextRequest } from "next/server";
import { getBusinessById } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// GET /api/businesses/:id
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const business = await getBusinessById(params.id);
  if (!business) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ business }, { headers: { "cache-control": "no-store" } });
}
