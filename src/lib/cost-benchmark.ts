/**
 * cost-benchmark.ts — közösségi megélhetési-költség aggregátumok (cost_benchmarks).
 *
 * ⚠️ A „Mennyit költesz?" beküldő-felület 2026-07-11-én KIVEZETVE (user-döntés:
 * a /mennyi-marad tervező váltja ki) — a beküldő-függvények törölve. Az OLVASÓ
 * (getCostBenchmarks) MARAD: a /api/koltsegvetes a meglévő közösségi mediánokkal
 * pontosítja a tervező kurált referencia-szintjeit. A cost_benchmarks tábla és a
 * felgyűlt adat NEM lett eldobva. Lásd 0100 + 0102 migráció.
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

export interface UserCostProfile { amounts: Record<string, number>; householdSize: number | null }

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
