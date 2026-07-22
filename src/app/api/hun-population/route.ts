import { NextResponse } from "next/server";
import { getHungarianPopulationSummary } from "@/lib/repo";
import { cached, clearEdgeCache } from "@/lib/edge-cache";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// A kulcs verziója: minden bump egyszeri, azonnali gyógyír egy konkrét
// beragadt/elavult cache-bejegyzésre (a cache POP-onként TÚLÉLI a deployt is).
//   v1→v2 (2026-07-22): adat-feltöltés ELŐTTI teszt-hívás lefagyasztotta a
//     `null` választ 24 órára — a null-ág azóta ÖNGYÓGYÍTÓ (ld. lent), ez a
//     konkrét eset többé nem ismétlődhet meg.
//   v2→v3 (2026-07-22): a NL gemeente-nevek utólagos kozmetikai javítása
//     (pl. "Utrecht (gemeente)" → "Utrecht") már bent volt a D1-ben, de a
//     RÉGI (helyes adatú, csak elavult nevű) válasz még érvényes cache-ként
//     élt — ez NEM null, tehát az öngyógyító ág nem érintette; egyszeri bump.
const CACHE_KEY_PREFIX = "hun-pop:v3:";

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
