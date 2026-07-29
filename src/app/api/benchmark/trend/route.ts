import { NextResponse, type NextRequest } from "next/server";
import { getSalaryTrend } from "@/lib/benchmark";
import { isValidCountry, DEFAULT_COUNTRY } from "@/lib/countries";

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
  // ⚠️ isValidCountry, NEM kézi whitelist: a korábbi 4-elemű lista miatt a GB
  // és az ES a svájci ágra esett (svájci kantonok + CHF az angol/spanyol
  // felhasználónál), pedig az Iránytű mindkét országban engedélyezett.
  const country = isValidCountry(cGet) ? cGet : DEFAULT_COUNTRY;

  if (!industry) {
    return NextResponse.json({ error: "Az 'industry' paraméter kötelező." }, { status: 400 });
  }

  const trend = await getSalaryTrend(country, industry, canton);
  return NextResponse.json({ trend }, { headers: { "cache-control": "no-store" } });
}
