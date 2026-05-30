import { NextResponse, type NextRequest } from "next/server";
import { getSalaryHeatmap } from "@/lib/benchmark";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/benchmark/heatmap?industry=all&period=12m
 * Visszaadja a kantononkénti átlagbér statisztikákat.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const industry = searchParams.get("industry") || "all";
  const period = searchParams.get("period") || "12m";

  const heatmap = await getSalaryHeatmap(industry, period);
  return NextResponse.json({ heatmap }, { headers: { "cache-control": "no-store" } });
}
