/**
 * Svájci vám-limitek (BAZG / Swiss Customs) — utazókra vonatkozó vámmentes
 * mennyiségek. Forrás: bazg.admin.ch (2024).
 *
 * FONTOS: tájékoztató jelleggel, NEM jogi tanács. A limitek időnként
 * változnak — döntés előtt mindig ellenőrizd a bazg.admin.ch oldalt.
 */

export interface CustomsCategory {
  id: string;
  label: string;
  emoji: string;
  /** Vámmentes mennyiség FŐPÉR. */
  limitPerPerson: number;
  /** Mértékegység (kg / liter / db). */
  unit: "kg" | "liter" | "db";
  /** Vám-kulcs egységenként, ha túl van a limiten (CHF). */
  dutyPerUnit: number;
  /** Egyéb megjegyzés (pl. életkor-korlátozás). */
  note?: string;
}

/** Általános érték-küszöb fő/nap — afölött MwSt-köteles. */
export const VALUE_THRESHOLD_CHF = 300;

/** A személyenkénti vám-kategóriák. */
export const CUSTOMS_CATEGORIES: CustomsCategory[] = [
  {
    id: "meat",
    label: "Hús / hústermék",
    emoji: "🥩",
    limitPerPerson: 1,
    unit: "kg",
    dutyPerUnit: 17,
    note: "Friss, hűtött, fagyasztott hús + kolbász, sonka, szárított.",
  },
  {
    id: "butter",
    label: "Vaj / margarin / étkezési olaj",
    emoji: "🧈",
    limitPerPerson: 5,
    unit: "kg",
    dutyPerUnit: 16,
  },
  {
    id: "wine",
    label: "Bor / pezsgő (<18% alkohol)",
    emoji: "🍷",
    limitPerPerson: 5,
    unit: "liter",
    dutyPerUnit: 0.6,
    note: "17 éves kortól.",
  },
  {
    id: "beer",
    label: "Sör",
    emoji: "🍺",
    limitPerPerson: 5,
    unit: "liter",
    dutyPerUnit: 0.25,
    note: "17 éves kortól.",
  },
  {
    id: "spirits",
    label: "Tömény (>18% alkohol)",
    emoji: "🥃",
    limitPerPerson: 1,
    unit: "liter",
    dutyPerUnit: 29,
    note: "18 éves kortól. Pálinka, whisky, vodka, gin.",
  },
  {
    id: "cigarettes",
    label: "Cigaretta",
    emoji: "🚬",
    limitPerPerson: 250,
    unit: "db",
    dutyPerUnit: 0.27,
    note: "17 éves kortól. VAGY 250g dohány VAGY 50 szivar.",
  },
];

export interface CalcInput {
  persons: number;
  amounts: Record<string, number>;
}

export interface CategoryResult {
  category: CustomsCategory;
  amount: number;
  totalLimit: number;
  overage: number;
  estimatedDuty: number;
  status: "ok" | "warning" | "over";
  /** % a limitnek (>100 = túl). */
  pct: number;
}

/** Egy kategória eredménye. */
export function calculateCategory(
  category: CustomsCategory,
  persons: number,
  amount: number,
): CategoryResult {
  const totalLimit = category.limitPerPerson * persons;
  const overage = Math.max(0, amount - totalLimit);
  const estimatedDuty = overage * category.dutyPerUnit;
  const pct = totalLimit > 0 ? (amount / totalLimit) * 100 : 0;

  let status: "ok" | "warning" | "over" = "ok";
  if (overage > 0) status = "over";
  else if (pct >= 80) status = "warning";

  return { category, amount, totalLimit, overage, estimatedDuty, status, pct };
}

/** Az összes kategória eredménye + összegzés. */
export interface CalcResult {
  results: CategoryResult[];
  totalDuty: number;
  /** Hány kategóriában van túllépés. */
  overCount: number;
  /** Bármi alkohol túllépett? — más rendszerben adózik. */
  anyAlcoholOver: boolean;
}

export function calculateAll(input: CalcInput): CalcResult {
  const results = CUSTOMS_CATEGORIES.map((c) =>
    calculateCategory(c, input.persons, input.amounts[c.id] ?? 0),
  );
  const totalDuty = results.reduce((s, r) => s + r.estimatedDuty, 0);
  const overCount = results.filter((r) => r.status === "over").length;
  const anyAlcoholOver = results.some(
    (r) => (r.category.id === "wine" || r.category.id === "beer" || r.category.id === "spirits") && r.status === "over",
  );
  return { results, totalDuty, overCount, anyAlcoholOver };
}
