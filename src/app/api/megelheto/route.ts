import { NextResponse, type NextRequest } from "next/server";
import { getRentStats, type RentStatsRow } from "@/lib/benchmark";
import { getRegions } from "@/lib/regions";
import {
  computeSalary, computeSalaryAT, computeSalaryDE, computeSalaryNL,
  type CivilStatus,
} from "@/lib/salary-calc";
import {
  isBudgetCountry, baselineCosts, blendCosts, childBenefit, summarizeBudget,
  budgetCurrency, type BudgetCountry,
} from "@/lib/budget-plan";
import { cached } from "@/lib/edge-cache";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/megelheto?country=DE&gross=3200&adults=1&kids=0&rooms=2
 *
 * A „Hova költözzek?" megélhetési térkép adat-oldala: RÉGIÓNKÉNT kiszámolja,
 * mennyi marad a hónap végén (nettó bér + családi pótlék − lakbér − megélhetés).
 * A régiós különbséget a lakbér-medián (rent_benchmarks, régiónként) — CH-nál
 * ráadásul a kantonális adó (computeSalary) — adja; a megélhetési baseline
 * országos (budget-plan COST_BASELINE). Ugyanaz a nettó+költség motor, mint a
 * bérkalkulátor (/berkalkulator), csak minden régióra végigfuttatva.
 *
 * Csak aggregátumok, PII nincs. Napi-szintnél sűrűbben nem változik → cache-elt.
 */
export async function GET(req: NextRequest) {
  const country = req.nextUrl.searchParams.get("country");
  if (!isBudgetCountry(country)) {
    return NextResponse.json({ error: "Hibás ország." }, { status: 400 });
  }
  const grossNum = clampInt(req.nextUrl.searchParams.get("gross"), 0, 100000, 0);
  if (grossNum <= 0) {
    return NextResponse.json({ error: "Hiányzó bruttó bér." }, { status: 400 });
  }
  const adults = clampInt(req.nextUrl.searchParams.get("adults"), 1, 2, 1);
  const kids = clampInt(req.nextUrl.searchParams.get("kids"), 0, 6, 0);
  const rooms = clampInt(req.nextUrl.searchParams.get("rooms"), 1, 6, 2);
  // Saját lakbér (opcionális): >0 → MINDEN régióban ezzel számol (személyes mód);
  // 0/hiányzó → a régiós medián (összehasonlító mód). A 0-t szándékosan NEM
  // fogadjuk el „ingyen lakás"-ként itt (az a bérkalkulátoré) — 0 = nincs megadva.
  const manualRent = clampInt(req.nextUrl.searchParams.get("rent"), 0, 100000, 0);

  const key = `megelheto:v2:${country}:${grossNum}:${adults}:${kids}:${rooms}:${manualRent}`;
  const payload = await cached(key, 30 * 60_000, () =>
    computeAll(country as BudgetCountry, grossNum, adults, kids, rooms, manualRent),
  );

  return NextResponse.json(payload, {
    headers: { "cache-control": "public, max-age=600, s-maxage=1800, stale-while-revalidate=3600" },
  });
}

async function computeAll(country: BudgetCountry, gross: number, adults: number, kids: number, rooms: number, manualRent: number) {
  const regions = getRegions(country);
  const benefit = childBenefit(country, kids);
  // A megélhetési baseline országos (cost_benchmarks üres → csak a kurált baseline).
  const costs = blendCosts(baselineCosts(country, adults, kids), {});
  const costTotal = costs.reduce((s, c) => s + c.amount, 0);
  const currency = budgetCurrency(country);
  const useManual = manualRent > 0;

  // Nem-CH: a nettó bér országos (nincs régiós adó-eltérés) → egyszer számoljuk.
  const nationalNet = country !== "CH" ? netFor(country, gross, adults, kids) : 0;

  // Régiós lakbér csak akkor kell, ha NINCS saját összeg (különben MINDEN régió a sajátoddal számol).
  const [regionalRents, nationalRents] = useManual
    ? [[], []]
    : await Promise.all([
        Promise.all(regions.map((r) => getRentStats(country, r.code))),
        getRentStats(country, "all"),
      ]);
  const nationalRent = useManual ? null : pickRentFor(nationalRents, rooms);

  const out = regions.map((r, i) => {
    const rent = useManual ? manualRent : (pickRentFor(regionalRents[i], rooms) ?? nationalRent);
    if (rent == null) return null; // se régiós, se országos lakbér → kihagyva
    const net = country === "CH" ? netFor("CH", gross, adults, kids, r.code) : nationalNet;
    const summary = summarizeBudget({
      netMonthly: net,
      childBenefitMonthly: benefit,
      rentMonthly: rent,
      costs,
    });
    return {
      code: r.code,
      name: r.name,
      net: Math.round(net),
      rent: Math.round(rent),
      cost: Math.round(costTotal),
      leftover: Math.round(summary.leftover),
      verdict: summary.verdict,
    };
  }).filter((x): x is NonNullable<typeof x> => x != null);

  out.sort((a, b) => b.leftover - a.leftover);
  // „uniform": ha saját (fix) lakbérrel számolunk és a nettó országos (nem-CH),
  // minden régió ugyanannyit hoz → a kliens jelzi, hogy a térkép ilyenkor nem
  // hasonlít (a régiós különbséghez üresen kell hagyni a lakbért).
  const uniform = useManual && country !== "CH";
  const netMonthly = out.length ? out[0].net : 0;
  return {
    country, currency, gross, adults, kids, rooms,
    rentMode: useManual ? "manual" : "median",
    manualRent: useManual ? manualRent : null,
    uniform,
    net: Math.round(netMonthly),          // nem-CH: országos nettó; CH: a legjobb régióé (tájékoztató)
    childBenefit: Math.round(benefit),
    costTotal: Math.round(costTotal),
    costs: costs.map((c) => ({ label: c.label, amount: Math.round(c.amount) })),
    regions: out,
  };
}

/** Havi nettó (a 13./14. havit szétosztva) — a budget-planner logikáját tükrözi. */
function netFor(country: BudgetCountry, gross: number, adults: number, kids: number, canton?: string): number {
  if (country === "CH") {
    const civil: CivilStatus = adults === 2 ? "B" : "A"; // egy kereső / egyedülálló (a térkép EGY fizetésből számol)
    const r = computeSalary({
      gross, period: "month", canton: canton ?? "ZH", age: "25-34", civil, kids, churchTax: false, months: 13,
    });
    return r.netYearly / 12;
  }
  if (country === "AT") {
    const soleEarner = adults === 2 && kids >= 1;
    return computeSalaryAT({ gross, period: "month", months: 14, kids, soleEarner }).netYearly / 12;
  }
  if (country === "DE") {
    // Steuerklasse: párnál III (fő kereső), egyedül I — a térkép egy fizetésből számol.
    return computeSalaryDE({ gross, period: "month", steuerklasse: adults === 2 ? 3 : 1, kids, churchTax: false }).netMonthly;
  }
  return computeSalaryNL({ gross, period: "month", holidayAllowance: true, ruling30: false }).netMonthly;
}

/** A kért szobaszámhoz tartozó lakbér-medián: pontos → legközelebbi. */
function pickRentFor(rows: RentStatsRow[], rooms: number): number | null {
  const usable = rows.filter((r) => r.entry_count > 0 && r.median_rent > 0);
  if (usable.length === 0) return null;
  const exact = usable.find((r) => r.rooms === rooms);
  if (exact) return exact.median_rent;
  return usable.reduce((a, b) => (Math.abs(b.rooms - rooms) < Math.abs(a.rooms - rooms) ? b : a)).median_rent;
}

function clampInt(raw: string | null, min: number, max: number, dflt: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return dflt;
  return Math.min(max, Math.max(min, Math.floor(n)));
}
