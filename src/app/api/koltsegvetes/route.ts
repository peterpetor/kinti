import { NextResponse, type NextRequest } from "next/server";
import { getRentStats } from "@/lib/benchmark";
import { getCostBenchmarks } from "@/lib/cost-benchmark";
import { getRegions } from "@/lib/regions";
import { isBudgetCountry } from "@/lib/budget-plan";
import { cached } from "@/lib/edge-cache";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/koltsegvetes?country=DE&canton=BY&household=4 — a „Mennyi marad?"
 * költségvetés-tervező adat-oldala: régió-szintű lakbér-medián szobaszámonként
 * (rent_benchmarks, seedelt + közösségi) és kategóriánkénti közösségi
 * költség-medián (cost_benchmarks, 4-szintű fallback). Csak aggregátumok,
 * PII nincs. A kliens ezt kurált referencia-szintekkel egészíti ki (budget-plan).
 */
export async function GET(req: NextRequest) {
  const country = req.nextUrl.searchParams.get("country");
  if (!isBudgetCountry(country)) {
    return NextResponse.json({ error: "Hibás ország." }, { status: 400 });
  }
  const rawCanton = req.nextUrl.searchParams.get("canton") ?? "all";
  const canton =
    rawCanton !== "all" && getRegions(country).some((r) => r.code === rawCanton) ? rawCanton : "all";
  const rawHousehold = Number(req.nextUrl.searchParams.get("household"));
  const household =
    Number.isFinite(rawHousehold) && rawHousehold >= 1 && rawHousehold <= 8
      ? Math.floor(rawHousehold)
      : null;

  const data = await cached(`budget:${country}:${canton}:${household ?? 0}`, 10 * 60_000, async () => {
    const [rents, rentsAll, costRows] = await Promise.all([
      getRentStats(country, canton),
      // Országos lakbér-fallback: ha a régióban nincs adott szobaszámú adat.
      canton !== "all" ? getRentStats(country, "all") : Promise.resolve(null),
      getCostBenchmarks(country, canton, { amounts: {}, householdSize: null }, household),
    ]);
    const costs: Record<string, { median: number | null; count: number }> = {};
    for (const c of costRows) costs[c.category] = { median: c.median, count: c.count };
    const rentRow = (r: { rooms: number; median_rent: number; entry_count: number }) => ({
      rooms: r.rooms, median: r.median_rent, count: r.entry_count,
    });
    return {
      rents: rents.map(rentRow),
      rentsCountry: (rentsAll ?? rents).map(rentRow),
      costs,
    };
  });

  return NextResponse.json(data, {
    headers: { "cache-control": "public, max-age=300, s-maxage=600, stale-while-revalidate=1800" },
  });
}
