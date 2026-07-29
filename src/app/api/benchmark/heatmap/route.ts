import { NextResponse, type NextRequest } from "next/server";
import { getSalaryHeatmap } from "@/lib/benchmark";
import { isValidCountry, DEFAULT_COUNTRY } from "@/lib/countries";

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
  const cGet = searchParams.get("country");
  // ⚠️ isValidCountry, NEM kézi whitelist: a korábbi 4-elemű lista miatt a GB
  // és az ES a svájci ágra esett (svájci kantonok + CHF az angol/spanyol
  // felhasználónál), pedig az Iránytű mindkét országban engedélyezett.
  const country = isValidCountry(cGet) ? cGet : DEFAULT_COUNTRY;

  const heatmap = await getSalaryHeatmap(country, industry, period);
  return NextResponse.json({ heatmap }, { headers: { "cache-control": "no-store" } });
}
