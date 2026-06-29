import { NextResponse, type NextRequest } from "next/server";
import { getSalaryTrend } from "@/lib/benchmark";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/benchmark/trend?industry=Informatika%20(IT)&canton=ZH
 * Visszaadja az elmúlt 12 hónap havi átlagbér adatait.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const industry = searchParams.get("industry");
  const canton = searchParams.get("canton") || "all";
  const cGet = searchParams.get("country");
  const country = cGet === "AT" || cGet === "DE" || cGet === "NL" ? cGet : "CH";

  if (!industry) {
    return NextResponse.json({ error: "Az 'industry' paraméter kötelező." }, { status: 400 });
  }

  const trend = await getSalaryTrend(country, industry, canton);
  return NextResponse.json({ trend }, { headers: { "cache-control": "no-store" } });
}
