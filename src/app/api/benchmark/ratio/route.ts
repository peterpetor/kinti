import { NextResponse, type NextRequest } from "next/server";
import { getRentToSalaryRatio } from "@/lib/benchmark";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/benchmark/ratio?canton=ZH
 * Visszaadja a közösségi "lakbér/fizetés" százalékos arányát.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const canton = searchParams.get("canton") || "all";
  const cGet = searchParams.get("country");
  const country = cGet === "AT" || cGet === "DE" ? cGet : "CH";

  const data = await getRentToSalaryRatio(country, canton);
  return NextResponse.json(data, { headers: { "cache-control": "no-store" } });
}
