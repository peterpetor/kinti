import { NextResponse, type NextRequest } from "next/server";
import { getRentToSalaryRatio } from "@/lib/benchmark";
import { isValidCountry, DEFAULT_COUNTRY } from "@/lib/countries";

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
  // ⚠️ isValidCountry, NEM kézi whitelist: a korábbi 4-elemű lista miatt a GB
  // és az ES a svájci ágra esett (svájci kantonok + CHF az angol/spanyol
  // felhasználónál), pedig az Iránytű mindkét országban engedélyezett.
  const country = isValidCountry(cGet) ? cGet : DEFAULT_COUNTRY;

  const data = await getRentToSalaryRatio(country, canton);
  return NextResponse.json(data, { headers: { "cache-control": "no-store" } });
}
