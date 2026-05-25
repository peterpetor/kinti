import { NextResponse } from "next/server";
import { getCategories } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// GET /api/categories
export async function GET() {
  const categories = await getCategories();
  return NextResponse.json({ categories }, { headers: { "cache-control": "no-store" } });
}
