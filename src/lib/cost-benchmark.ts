/**
 * cost-benchmark.ts — „Mennyit költesz?" megélhetési-benchmark adatréteg.
 * Anonim, közösségi: medián + kvartilisek + a saját érték percentilise, kanton→ország
 * fallbackkel (ha a kantonban kevés az adat). Lásd 0100 migráció, [[benchmark-stats]] minta.
 */
import { getDB } from "./cloudflare";
import { COST_CATEGORIES } from "./cost-categories";

const MIN_REGION = 5; // ennyi adat alatt a kantonról az országra esünk vissza

export interface CostBenchmarkResult {
  category: string;
  count: number;
  scope: "canton" | "country";
  median: number | null;
  p25: number | null;
  p75: number | null;
  /** Hány % költ kevesebbet a usernél (csak ha beadta ezt a kategóriát). */
  percentile: number | null;
  yourAmount: number | null;
}

function quantile(sorted: number[], q: number): number {
  const n = sorted.length;
  if (n === 0) return 0;
  if (n === 1) return sorted[0];
  const pos = (n - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  return Math.round(sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo));
}

/** Egy beküldés mentése (upsert: 1 adat per ip+ország+kategória). */
export async function submitCostBenchmark(input: {
  country: string; cantonCode: string; category: string; amount: number; ipHash: string;
}): Promise<void> {
  const db = getDB();
  await db
    .prepare("DELETE FROM cost_benchmarks WHERE ip_hash = ? AND country_code = ? AND category = ?")
    .bind(input.ipHash, input.country, input.category)
    .run();
  await db
    .prepare(
      "INSERT INTO cost_benchmarks (id, country_code, canton_code, category, amount, ip_hash) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .bind(crypto.randomUUID(), input.country, input.cantonCode, input.category, input.amount, input.ipHash)
    .run();
}

/** A user saját beküldései egy országban: kategória → összeg. */
export async function getUserCostSubmissions(ipHash: string, country: string): Promise<Record<string, number>> {
  const { results } = await getDB()
    .prepare("SELECT category, amount FROM cost_benchmarks WHERE ip_hash = ? AND country_code = ?")
    .bind(ipHash, country)
    .all<{ category: string; amount: number }>();
  const map: Record<string, number> = {};
  for (const r of results ?? []) map[r.category] = r.amount;
  return map;
}

/**
 * Per-kategória statisztika (medián/kvartilisek/percentilis) egy régióra, a user saját
 * adatával. Kanton-szinten számol; ha < MIN_REGION adat van, az egész országra esik vissza.
 */
export async function getCostBenchmarks(
  country: string,
  canton: string,
  userSubs: Record<string, number>,
): Promise<CostBenchmarkResult[]> {
  const db = getDB();
  const [cantonRows, countryRows] = await Promise.all([
    canton && canton !== "all"
      ? db.prepare("SELECT category, amount FROM cost_benchmarks WHERE country_code = ? AND canton_code = ?").bind(country, canton).all<{ category: string; amount: number }>()
      : Promise.resolve({ results: [] as { category: string; amount: number }[] }),
    db.prepare("SELECT category, amount FROM cost_benchmarks WHERE country_code = ?").bind(country).all<{ category: string; amount: number }>(),
  ]);

  const byCat = (rows: { category: string; amount: number }[], cat: string) =>
    rows.filter((r) => r.category === cat).map((r) => r.amount).sort((a, b) => a - b);

  return COST_CATEGORIES.map((c) => {
    let amounts = byCat(cantonRows.results ?? [], c.id);
    let scope: "canton" | "country" = "canton";
    if (amounts.length < MIN_REGION) {
      amounts = byCat(countryRows.results ?? [], c.id);
      scope = "country";
    }
    const yourAmount = userSubs[c.id] ?? null;
    if (amounts.length === 0) {
      return { category: c.id, count: 0, scope, median: null, p25: null, p75: null, percentile: null, yourAmount };
    }
    let percentile: number | null = null;
    if (yourAmount != null) {
      const below = amounts.filter((a) => a < yourAmount).length;
      const equal = amounts.filter((a) => a === yourAmount).length;
      percentile = Math.round(((below + equal / 2) / amounts.length) * 100);
    }
    return {
      category: c.id,
      count: amounts.length,
      scope,
      median: quantile(amounts, 0.5),
      p25: quantile(amounts, 0.25),
      p75: quantile(amounts, 0.75),
      percentile,
      yourAmount,
    };
  });
}
