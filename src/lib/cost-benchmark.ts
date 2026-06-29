/**
 * cost-benchmark.ts — „Mennyit költesz?" megélhetési-benchmark adatréteg.
 * Anonim, közösségi: medián + kvartilisek + a saját érték percentilise. Két dimenzió:
 * RÉGIÓ (kanton→ország fallback) és HÁZTARTÁSMÉRET (azonos méretű háztartásokhoz hasonlít,
 * fallbackkel, ha kevés az adat). Lásd 0100 + 0102 migráció, [[benchmark-stats]] minta.
 */
import { getDB } from "./cloudflare";
import { COST_CATEGORIES } from "./cost-categories";

const MIN_REGION = 5; // ennyi adat alatt esünk vissza a tágabb halmazra

export interface CostBenchmarkResult {
  category: string;
  count: number;
  scope: "canton" | "country";
  /** true = az azonos háztartásméretűekhez hasonlít; false = minden méret (fallback). */
  sizeScoped: boolean;
  median: number | null;
  p25: number | null;
  p75: number | null;
  percentile: number | null;
  yourAmount: number | null;
}

interface Row { category: string; amount: number; household_size: number | null }

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

/** Egy beküldés mentése (upsert: 1 adat per ip+ország+kategória). A háztartásméretet a
 *  user ÖSSZES sorára szinkronizáljuk (konzisztens profil). */
export async function submitCostBenchmark(input: {
  country: string; cantonCode: string; category: string; amount: number; householdSize: number | null; ipHash: string;
}): Promise<void> {
  const db = getDB();
  await db
    .prepare("DELETE FROM cost_benchmarks WHERE ip_hash = ? AND country_code = ? AND category = ?")
    .bind(input.ipHash, input.country, input.category)
    .run();
  await db
    .prepare("INSERT INTO cost_benchmarks (id, country_code, canton_code, category, amount, household_size, ip_hash) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(crypto.randomUUID(), input.country, input.cantonCode, input.category, input.amount, input.householdSize, input.ipHash)
    .run();
  if (input.householdSize != null) {
    await db
      .prepare("UPDATE cost_benchmarks SET household_size = ? WHERE ip_hash = ? AND country_code = ?")
      .bind(input.householdSize, input.ipHash, input.country)
      .run();
  }
}

export interface UserCostProfile { amounts: Record<string, number>; householdSize: number | null }

/** A user saját beküldései + háztartásmérete egy országban. */
export async function getUserCostProfile(ipHash: string, country: string): Promise<UserCostProfile> {
  const { results } = await getDB()
    .prepare("SELECT category, amount, household_size FROM cost_benchmarks WHERE ip_hash = ? AND country_code = ?")
    .bind(ipHash, country)
    .all<Row>();
  const amounts: Record<string, number> = {};
  let householdSize: number | null = null;
  for (const r of results ?? []) {
    amounts[r.category] = r.amount;
    if (r.household_size != null) householdSize = r.household_size;
  }
  return { amounts, householdSize };
}

/**
 * Per-kategória statisztika. 4-szintű fallback a legszűkebb→legtágabb halmazig:
 * (kanton+méret) → (kanton, bármely méret) → (ország+méret) → (ország, bármely méret).
 */
export async function getCostBenchmarks(
  country: string,
  canton: string,
  profile: UserCostProfile,
  householdSize: number | null,
): Promise<CostBenchmarkResult[]> {
  const db = getDB();
  const [cantonRes, countryRes] = await Promise.all([
    canton && canton !== "all"
      ? db.prepare("SELECT category, amount, household_size FROM cost_benchmarks WHERE country_code = ? AND canton_code = ?").bind(country, canton).all<Row>()
      : Promise.resolve({ results: [] as Row[] }),
    db.prepare("SELECT category, amount, household_size FROM cost_benchmarks WHERE country_code = ?").bind(country).all<Row>(),
  ]);
  const cantonRows = cantonRes.results ?? [];
  const countryRows = countryRes.results ?? [];

  const amountsOf = (rows: Row[], cat: string, size: number | null) =>
    rows
      .filter((r) => r.category === cat && (size == null || r.household_size === size))
      .map((r) => r.amount)
      .sort((a, b) => a - b);

  return COST_CATEGORIES.map((c) => {
    // Fallback-lánc: a legszűkebb, de elég adatot tartalmazó halmazt választjuk.
    const tries: { amounts: number[]; scope: "canton" | "country"; sizeScoped: boolean }[] = [
      { amounts: amountsOf(cantonRows, c.id, householdSize), scope: "canton", sizeScoped: householdSize != null },
      { amounts: amountsOf(cantonRows, c.id, null), scope: "canton", sizeScoped: false },
      { amounts: amountsOf(countryRows, c.id, householdSize), scope: "country", sizeScoped: householdSize != null },
      { amounts: amountsOf(countryRows, c.id, null), scope: "country", sizeScoped: false },
    ];
    const chosen = tries.find((t) => t.amounts.length >= MIN_REGION) ?? tries[tries.length - 1];
    const amounts = chosen.amounts;
    const yourAmount = profile.amounts[c.id] ?? null;

    if (amounts.length === 0) {
      return { category: c.id, count: 0, scope: chosen.scope, sizeScoped: chosen.sizeScoped, median: null, p25: null, p75: null, percentile: null, yourAmount };
    }
    let percentile: number | null = null;
    if (yourAmount != null) {
      const below = amounts.filter((a) => a < yourAmount).length;
      const equal = amounts.filter((a) => a === yourAmount).length;
      percentile = Math.round(((below + equal / 2) / amounts.length) * 100);
    }
    return {
      category: c.id, count: amounts.length, scope: chosen.scope, sizeScoped: chosen.sizeScoped,
      median: quantile(amounts, 0.5), p25: quantile(amounts, 0.25), p75: quantile(amounts, 0.75),
      percentile, yourAmount,
    };
  });
}
