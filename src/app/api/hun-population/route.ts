import { NextResponse } from "next/server";
import { getHungarianPopulationSummary } from "@/lib/repo";
import { cached, clearEdgeCache } from "@/lib/edge-cache";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// A kulcs verziója (v2): 2026-07-22-én egy ország adatának feltöltés ELŐTTI
// tesztlekérdezése 24 órára lecache-elte a `null` választ (a cache POP-onként
// túléli a deployt is) — a v1→v2 bump egyszeri, azonnali gyógyír volt. A lenti
// null-ág immár ÖNGYÓGYÍTÓ (ld. kommentje), így ez TÖBBÉ NEM ismétlődhet meg —
// nincs szükség további verzió-bumpra.
const CACHE_KEY_PREFIX = "hun-pop:v2:";

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
    const key = `${CACHE_KEY_PREFIX}${country}`;
    const summary = await cached(key, 86_400_000, () => getHungarianPopulationSummary(country));
    // ⚠️ Egy ÜRES (még nem harvestelt) ország eredménye NE ragadjon be 24 órára:
    // ha valaki (akár a saját tesztünk) egy adat-feltöltés ELŐTT hívja meg ezt
    // a végpontot, a `null` a hosszú TTL-lel egész napra "befagyna" — a
    // KÖVETKEZŐ, sikeres harvest utáni kérés is még a régi null-t kapná vissza.
    // A null-t ezért AZONNAL kitöröljük a cache-ből, hogy a rákövetkező kérés
    // frissen próbálja újra (ha még mindig nincs adat, megint null jön, de nem
    // ragad be — ha időközben lett adat, azt kapja).
    if (summary === null) clearEdgeCache(key);
    return NextResponse.json(
      { summary },
      { headers: { "cache-control": "public, max-age=3600, stale-while-revalidate=86400" } },
    );
  } catch (err) {
    safeLogError("api/hun-population GET", err);
    return NextResponse.json({ summary: null }, { status: 500 });
  }
}
