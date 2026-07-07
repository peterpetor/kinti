import { getBusinessesForList } from "@/lib/repo";
import { cached } from "@/lib/edge-cache";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/businesses/list — a teljes publikus vállalkozás-lista (karcsú
 * ListBusiness vetület) a kliens-oldali kereséshez/szűréshez/térképhez.
 *
 * Miért létezik: a /szaknevsor SSR-je korábban MIND az 1000+ rekordot
 * renderelte és küldte a HTML-ben (~1,2 MB payload + worker CPU-limit / 1102).
 * Most az oldal csak az első képernyőnyi szeletet rendereli szerveren, a
 * teljes listát ez a végpont adja aszinkron — a szerializált JSON-t is az
 * izolátum-cache tartja, így meleg izolátumon se D1, se stringify nincs.
 */
export async function GET() {
  const body = await cached("biz:list-json-v1", 180_000, async () => {
    const businesses = await getBusinessesForList();
    return JSON.stringify({ businesses });
  });
  return new Response(body, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      // Böngésző-cache: 2 percig újrahasznosítható (vissza-navigálás, tab-váltás).
      "cache-control": "public, max-age=120",
    },
  });
}
