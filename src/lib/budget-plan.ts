/**
 * budget-plan.ts — „Mennyi marad?" kiköltözési költségvetés-tervező tiszta magja.
 *
 * A bérkalkulátor (salary-calc.ts, nettó) + a költség-adatok (rent_benchmarks,
 * cost_benchmarks) integrációja: bruttó bér + család + város → mennyi marad a
 * hónap végén. KURÁLT-ELŐSZÖR elv: a kategóriánkénti referencia-költség kézzel
 * összeállított becslés (2025-ös szintek, források a mezőknél), amit a közösségi
 * medián FELÜLÍR, ha van elég beküldés (>= COMMUNITY_MIN). Minden összeg HAVI,
 * az ország pénznemében (CH: CHF, egyébként EUR).
 *
 * FÜGGŐSÉG-MENTES tiszta lib (D1/cloudflare import TILOS — vitest-kompatibilis,
 * lásd a quiz-percentile mintát).
 */

export type BudgetCountry = "CH" | "AT" | "DE" | "NL";

export function isBudgetCountry(c: unknown): c is BudgetCountry {
  return c === "CH" || c === "AT" || c === "DE" || c === "NL";
}

export function budgetCurrency(country: BudgetCountry): "CHF" | "EUR" {
  return country === "CH" ? "CHF" : "EUR";
}

/** Ennyi közösségi beküldés felett a közösségi medián írja felül a referenciát. */
export const COMMUNITY_MIN = 5;

// ─── Kurált referencia-költségek ─────────────────────────────────────────────
// Havi becslés kategóriánként: 1. felnőtt + további felnőtt + gyerekenkénti többlet.
// A kategória-id-k a cost-categories.ts-szel EGYEZNEK (a közösségi felülíráshoz).
// Az albérlet NINCS itt — az a rent_benchmarks régió-szintű mediánjából jön.

export interface CostBaselineRule {
  id: string;
  label: string;
  emoji: string;
  firstAdult: number;
  extraAdult: number;
  perChild: number;
}

/**
 * Referencia-szintek forrása (2025): CH — BFS háztartás-statisztika + Comparis/
 * Priminfo átlagprémium; AT — Statistik Austria fogyasztás-felmérés (az egészség-
 * biztosítás az SV része, a családtag mitversichert → 0); DE — Destatis EVS
 * (törvényes KV a bérből levonva, családtag ingyen biztosított → 0); NL — Nibud
 * referencia-büdzsék (zorgverzekering felnőttenként, 18 alatt ingyenes).
 */
export const COST_BASELINE: Record<BudgetCountry, CostBaselineRule[]> = {
  CH: [
    { id: "rezsi", label: "Rezsi / Nebenkosten", emoji: "🔌", firstAdult: 220, extraAdult: 60, perChild: 30 },
    { id: "krankenkasse", label: "Egészségbiztosítás", emoji: "🏥", firstAdult: 390, extraAdult: 390, perChild: 110 },
    { id: "kaja", label: "Élelmiszer", emoji: "🛒", firstAdult: 450, extraAdult: 350, perChild: 220 },
    { id: "kozlekedes", label: "Közlekedés", emoji: "🚆", firstAdult: 100, extraAdult: 80, perChild: 30 },
    { id: "internet_mobil", label: "Internet + mobil", emoji: "📱", firstAdult: 90, extraAdult: 30, perChild: 0 },
    { id: "szabadido", label: "Szabadidő", emoji: "🎭", firstAdult: 250, extraAdult: 200, perChild: 80 },
  ],
  AT: [
    { id: "rezsi", label: "Rezsi / Betriebskosten", emoji: "🔌", firstAdult: 180, extraAdult: 50, perChild: 25 },
    { id: "krankenkasse", label: "Egészségbiztosítás", emoji: "🏥", firstAdult: 0, extraAdult: 0, perChild: 0 },
    { id: "kaja", label: "Élelmiszer", emoji: "🛒", firstAdult: 320, extraAdult: 250, perChild: 160 },
    { id: "kozlekedes", label: "Közlekedés", emoji: "🚆", firstAdult: 55, extraAdult: 45, perChild: 15 },
    { id: "internet_mobil", label: "Internet + mobil", emoji: "📱", firstAdult: 45, extraAdult: 15, perChild: 0 },
    { id: "szabadido", label: "Szabadidő", emoji: "🎭", firstAdult: 180, extraAdult: 140, perChild: 60 },
  ],
  DE: [
    { id: "rezsi", label: "Rezsi / Nebenkosten", emoji: "🔌", firstAdult: 220, extraAdult: 60, perChild: 30 },
    { id: "krankenkasse", label: "Egészségbiztosítás", emoji: "🏥", firstAdult: 0, extraAdult: 0, perChild: 0 },
    { id: "kaja", label: "Élelmiszer", emoji: "🛒", firstAdult: 320, extraAdult: 250, perChild: 160 },
    { id: "kozlekedes", label: "Közlekedés", emoji: "🚆", firstAdult: 58, extraAdult: 58, perChild: 20 },
    { id: "internet_mobil", label: "Internet + mobil", emoji: "📱", firstAdult: 45, extraAdult: 15, perChild: 0 },
    { id: "szabadido", label: "Szabadidő", emoji: "🎭", firstAdult: 180, extraAdult: 140, perChild: 60 },
  ],
  NL: [
    { id: "rezsi", label: "Rezsi / energie & water", emoji: "🔌", firstAdult: 230, extraAdult: 60, perChild: 30 },
    { id: "krankenkasse", label: "Zorgverzekering", emoji: "🏥", firstAdult: 160, extraAdult: 160, perChild: 0 },
    { id: "kaja", label: "Élelmiszer", emoji: "🛒", firstAdult: 340, extraAdult: 260, perChild: 170 },
    { id: "kozlekedes", label: "Közlekedés", emoji: "🚆", firstAdult: 90, extraAdult: 70, perChild: 25 },
    { id: "internet_mobil", label: "Internet + mobil", emoji: "📱", firstAdult: 45, extraAdult: 15, perChild: 0 },
    { id: "szabadido", label: "Szabadidő", emoji: "🎭", firstAdult: 180, extraAdult: 140, perChild: 60 },
  ],
};

// ─── Gyermek utáni juttatás (havi/gyerek, becslés) ───────────────────────────
// DE: Kindergeld 255 € (2025). AT: Familienbeihilfe (korfüggő ~138–172 €) +
// Kinderabsetzbetrag ~71 € → ~220 € átlag. CH: Kinderzulage szövetségi minimum
// (kantononként több lehet) ~215 CHF. NL: kinderbijslag (korfüggő, negyedéves)
// ~110 €/hó átlag (a jövedelemfüggő kindgebonden budget NINCS benne).
export const CHILD_BENEFIT_MONTHLY: Record<BudgetCountry, number> = {
  DE: 255,
  AT: 220,
  CH: 215,
  NL: 110,
};

export function childBenefit(country: BudgetCountry, kids: number): number {
  return Math.max(0, Math.floor(kids)) * CHILD_BENEFIT_MONTHLY[country];
}

// ─── Költség-összeállítás ────────────────────────────────────────────────────

export interface BudgetCostItem {
  id: string;
  label: string;
  emoji: string;
  amount: number;
  /** community = közösségi medián; reference = kurált becslés; rent = lakbér-medián. */
  source: "community" | "reference" | "rent";
}

/** Kurált referencia-költségek a háztartás-összetételre skálázva. */
export function baselineCosts(country: BudgetCountry, adults: number, kids: number): BudgetCostItem[] {
  const a = Math.max(1, Math.floor(adults));
  const k = Math.max(0, Math.floor(kids));
  return COST_BASELINE[country].map((r) => ({
    id: r.id,
    label: r.label,
    emoji: r.emoji,
    amount: Math.round(r.firstAdult + (a - 1) * r.extraAdult + k * r.perChild),
    source: "reference" as const,
  }));
}

/** Közösségi medián-felülírás: ahol van elég beküldés, az győz a referencia felett. */
export function blendCosts(
  baseline: BudgetCostItem[],
  community: Record<string, { median: number | null; count: number }>,
  minCount = COMMUNITY_MIN,
): BudgetCostItem[] {
  return baseline.map((item) => {
    const c = community[item.id];
    if (c && c.median != null && c.count >= minCount) {
      return { ...item, amount: Math.round(c.median), source: "community" as const };
    }
    return item;
  });
}

// ─── Összesítés + verdikt ────────────────────────────────────────────────────

export type BudgetVerdict = "comfortable" | "ok" | "tight" | "deficit";

export interface BudgetSummary {
  incomeTotal: number;   // nettó + gyerek-juttatás
  costTotal: number;     // lakbér + kategóriák
  leftover: number;      // ami a hónap végén marad
  savingsRate: number;   // leftover / incomeTotal (%), 0 ha nincs jövedelem
  verdict: BudgetVerdict;
}

/**
 * A hónap végi maradék és a verdikt. Küszöbök a jövedelem arányában:
 * >=25% kényelmes, >=10% rendben, >=0 feszes, alatta hiány.
 */
export function summarizeBudget(input: {
  netMonthly: number;
  childBenefitMonthly: number;
  rentMonthly: number;
  costs: BudgetCostItem[];
}): BudgetSummary {
  const incomeTotal = Math.round(input.netMonthly + input.childBenefitMonthly);
  const costTotal = Math.round(input.rentMonthly + input.costs.reduce((s, c) => s + c.amount, 0));
  const leftover = incomeTotal - costTotal;
  const savingsRate = incomeTotal > 0 ? Math.round((leftover / incomeTotal) * 100) : 0;
  const verdict: BudgetVerdict =
    savingsRate >= 25 ? "comfortable" : savingsRate >= 10 ? "ok" : leftover >= 0 ? "tight" : "deficit";
  return { incomeTotal, costTotal, leftover, savingsRate, verdict };
}

export const VERDICT_COPY: Record<BudgetVerdict, { emoji: string; title: string; sub: string }> = {
  comfortable: {
    emoji: "🟢",
    title: "Kényelmesen kijössz",
    sub: "A jövedelmed negyede fölött marad meg — van tér megtakarításra és hazautalásra.",
  },
  ok: {
    emoji: "🟡",
    title: "Kijössz belőle",
    sub: "Marad a hónap végén, de nagy kiadásokra (autó, váratlan számla) érdemes tartalékolni.",
  },
  tight: {
    emoji: "🟠",
    title: "Feszes lesz",
    sub: "Épphogy kijön — olcsóbb lakhatással vagy régióváltással jelentősen javítható.",
  },
  deficit: {
    emoji: "🔴",
    title: "Ennyiből ott nem jön ki",
    sub: "A becsült költségek meghaladják a nettót — magasabb bér vagy olcsóbb régió kell.",
  },
};

/** Ajánlott szobaszám a háztartás-mérethez (a lakbér-medián kiindulópontja). */
export function suggestedRooms(adults: number, kids: number): number {
  const size = Math.max(1, Math.floor(adults)) + Math.max(0, Math.floor(kids));
  if (size <= 1) return 2;
  if (size <= 3) return 3;
  return 4;
}
