/**
 * repo-hun-population.ts — hivatalos népességstatisztika (magyar állampolgárok/
 * nemzetiség régiónként), a "Merre élnek a legtöbben?" funkció adatforrása.
 *
 * ⚠️ MINDIG hivatalos statisztikai hivataltól (BFS/Statistik Austria/CBS/
 * Destatis) — NEM az app saját (vékony) használati adatából, ellentétben a
 * korábban kivezetett presence-heatmap-pel (ld. [[presence-heatmap]] memória:
 * az ürességet reklámozta). A szám akkor is valós, ha egy régióban kevés.
 *
 * A tábla ORSZÁGONKÉNT MÁS közigazgatási szintet tartalmaz, és ezek a szintek
 * EGYMÁST ÁTFEDIK (pl. NL-nél egy gemeente a saját provincie-jén belül van) —
 * ezért SOSE összegezz `region_level` szűrés nélkül, mert háromszoros
 * számolást adna. Country-nkénti "legfinomabb, még mutatós" szint:
 *   CH → canton (26)      AT → bundesland (9)      NL → gemeente (~340, a
 *   legtöbb lakossal rendelkező városokat mutatjuk, nem a teljes listát).
 */
import { getDB } from "./cloudflare";

export interface RegionPopulationRow {
  regionCode: string;
  regionName: string;
  regionLevel: string;
  count: number;
  year: number;
}

export interface HungarianPopulationSummary {
  /** A megjelenítendő (legfinomabb, átfedés-mentes) szint ebben az országban. */
  level: string;
  /** Hivatalos összlétszám az adott évre — a szint-összes sorból számolva. */
  total: number;
  year: number;
  source: string;
  sourceUrl: string | null;
  top: RegionPopulationRow[];
}

/** Országonként a leginkább informatív, ÁTFEDÉS-MENTES szint a leaderboardhoz. */
const DISPLAY_LEVEL: Record<string, string> = {
  CH: "canton",
  AT: "bundesland",
  DE: "bundesland",
  NL: "gemeente",
};

/**
 * A `limit` legnépesebb régió az adott országban (a DISPLAY_LEVEL szerinti,
 * átfedés-mentes szinten), csökkenő sorrendben. Üres tömb, ha nincs adat
 * (pl. DE, amíg nincs feltöltve).
 */
export async function getHungarianPopulationSummary(
  country: string,
  limit = 10,
): Promise<HungarianPopulationSummary | null> {
  const level = DISPLAY_LEVEL[country];
  if (!level) return null;

  const { results } = await getDB()
    .prepare(
      `SELECT region_code, region_name, region_level, hungarian_count, year, source, source_url
         FROM hungarian_population_stats
        WHERE country_code = ? AND region_level = ?
        ORDER BY hungarian_count DESC`,
    )
    .bind(country, level)
    .all<{
      region_code: string;
      region_name: string;
      region_level: string;
      hungarian_count: number;
      year: number;
      source: string;
      source_url: string | null;
    }>();

  if (results.length === 0) return null;

  const total = results.reduce((sum, r) => sum + r.hungarian_count, 0);
  const top = results.slice(0, limit).map((r) => ({
    regionCode: r.region_code,
    regionName: r.region_name,
    regionLevel: r.region_level,
    count: r.hungarian_count,
    year: r.year,
  }));

  return {
    level,
    total,
    year: results[0].year,
    source: results[0].source,
    sourceUrl: results[0].source_url,
    top,
  };
}
