import { NextResponse, type NextRequest } from "next/server";
import { getSalaryHistogram } from "@/lib/benchmark";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/benchmark/histogram?industry=Informatika%20(IT)&canton=ZH
 * Visszaadja a bérsávokat (10k-s bontásban).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const industry = searchParams.get("industry");
  const canton = searchParams.get("canton") || "all";
  const cGet = searchParams.get("country");
  const country = cGet === "AT" || cGet === "DE" ? cGet : "CH";

  if (!industry) {
    return NextResponse.json({ error: "Az 'industry' paraméter kötelező." }, { status: 400 });
  }

  const histogram = await getSalaryHistogram(country, industry, canton);
  return NextResponse.json({ histogram }, { headers: { "cache-control": "no-store" } });
}
