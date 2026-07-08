import { getBusinessesForList, isBlocked } from "@/lib/repo";
import { cached } from "@/lib/edge-cache";
import { hashIp } from "@/lib/security";
import { checkAiRateLimit, logAiRateLimit } from "@/lib/ai";

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
 *
 * Scrape-védelem (lásd docs/anti-scraping.md): (1) a vetület MÁR nem tartalmaz
 * nyers telefonszámot (csak `hasPhone` boolt — a szám a rate-limitelt kontakt-
 * végpontról jön), (2) honeypot-blocklist → tiltott IP-nek 403, (3) anti-hammer
 * IP/óra limit (a böngésző-cache miatt valós user ritkán üti; NAT-tűrő).
 */
export async function GET(req: Request) {
  const ipHash = await hashIp(req.headers.get("cf-connecting-ip"));

  // 1) Honeypot-csapdába lépett (vagy admin-tiltott) robot → azonnali tiltás.
  if (await isBlocked("ip_hash", ipHash)) {
    return new Response(JSON.stringify({ error: "forbidden" }), {
      status: 403,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  // 2) Anti-hammer rate-limit (a bulk dump ismételt letöltése ellen).
  const rl = await checkAiRateLimit("biz-list", ipHash);
  if (!rl.allowed) {
    return new Response(JSON.stringify({ error: "rate_limited" }), {
      status: 429,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const body = await cached("biz:list-json-v1", 180_000, async () => {
    const businesses = await getBusinessesForList();
    return JSON.stringify({ businesses });
  });
  await logAiRateLimit("biz-list", ipHash);

  return new Response(body, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      // Böngésző-cache: 2 percig újrahasznosítható (vissza-navigálás, tab-váltás).
      "cache-control": "public, max-age=120",
    },
  });
}
