import { NextResponse } from "next/server";
import { getHungarianPopulationSummary } from "@/lib/repo";
import { cached } from "@/lib/edge-cache";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/hun-population?country=CH — hivatalos népességstatisztika (magyar
 * állampolgárok/nemzetiség régiónként), a "Merre élnek a legtöbben?" oldal
 * adatforrása. Az alapadat (hungarian_population_stats) csak KÉZI harvest-
 * futtatáskor változik (évente egyszer-kétszer) — hosszú (napi) cache-TTL
 * bőven elég, és a legtöbb D1-olvasást megspórolja.
 */
export async function GET(req: Request) {
  try {
    const country = new URL(req.url).searchParams.get("country")?.toUpperCase() ?? "CH";
    const summary = await cached(`hun-pop:${country}`, 86_400_000, () => getHungarianPopulationSummary(country));
    return NextResponse.json(
      { summary },
      { headers: { "cache-control": "public, max-age=3600, stale-while-revalidate=86400" } },
    );
  } catch (err) {
    safeLogError("api/hun-population GET", err);
    return NextResponse.json({ summary: null }, { status: 500 });
  }
}
