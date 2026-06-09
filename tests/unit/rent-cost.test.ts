import { describe, it, expect } from "vitest";
import {
  calculateRentCost,
  MAX_KAUTION_MONTHS,
  KAUTION_INSURANCE_RATE,
  OPPORTUNITY_COST_RATE,
  type RentCalcInput,
} from "@/lib/rent-cost";

function input(partial: Partial<RentCalcInput> = {}): RentCalcInput {
  return {
    monthlyRentChf: 2000,
    size: "2-room",
    heating: "gas",
    region: "suburb",
    acontoNebenkostenChf: 200,
    yearsToCalculate: 1,
    ...partial,
  };
}

describe("calculateRentCost — kaúció", () => {
  it("kaúció = 3 havi bér (OR 257e)", () => {
    const r = calculateRentCost(input({ monthlyRentChf: 2000 }));
    expect(r.kautionAmount).toBe(2000 * MAX_KAUTION_MONTHS);
  });

  it("opportunity- és biztosítási költség a kaúció arányában", () => {
    const r = calculateRentCost(input({ monthlyRentChf: 2000 }));
    expect(r.kautionOpportunityCostPerYear).toBeCloseTo(6000 * OPPORTUNITY_COST_RATE, 5);
    expect(r.insurancePremiumPerYear).toBeCloseTo(6000 * KAUTION_INSURANCE_RATE, 5);
  });
});

describe("calculateRentCost — Nebenkosten elszámolás", () => {
  it("túl alacsony akontó → underpaid (utánfizetés)", () => {
    // suburb (mod 1.0), gas (mod 1.0), 2-room avgM2=(40+75)/2=57.5 → 57.5*32 = 1840
    // akontó 50*12=600 → diff +1240 > 200 → underpaid
    const r = calculateRentCost(input({ acontoNebenkostenChf: 50 }));
    expect(r.estimatedActualNebenkostenPerYear).toBe(Math.round(57.5 * 32));
    expect(r.settlementDirection).toBe("underpaid");
    expect(r.nebenkostenSettlementPerYear).toBeGreaterThan(200);
  });

  it("túl magas akontó → overpaid (visszatérítés)", () => {
    const r = calculateRentCost(input({ acontoNebenkostenChf: 500 }));
    expect(r.settlementDirection).toBe("overpaid");
    expect(r.nebenkostenSettlementPerYear).toBeLessThan(0);
  });

  it("közel pontos akontó → balanced (±200 sávon belül)", () => {
    // becsült ~1840/12 ≈ 153/hó → 155 akontó → éves 1860, diff -20 → balanced
    const r = calculateRentCost(input({ acontoNebenkostenChf: 155 }));
    expect(r.settlementDirection).toBe("balanced");
  });

  it("fűtés- és régió-szorzó emeli a becslést", () => {
    const base = calculateRentCost(input({ heating: "gas", region: "suburb" }));
    const pricey = calculateRentCost(input({ heating: "oil", region: "city-zh" }));
    expect(pricey.estimatedActualNebenkostenPerYear).toBeGreaterThan(
      base.estimatedActualNebenkostenPerYear,
    );
  });

  it("hőszivattyú olcsóbb a gáznál", () => {
    const gas = calculateRentCost(input({ heating: "gas" }));
    const hp = calculateRentCost(input({ heating: "heatpump" }));
    expect(hp.estimatedActualNebenkostenPerYear).toBeLessThan(
      gas.estimatedActualNebenkostenPerYear,
    );
  });
});

describe("calculateRentCost — időszakos rejtett költség", () => {
  it("a rejtett költség az évek számával skálázódik", () => {
    const oneYear = calculateRentCost(input({ yearsToCalculate: 1 }));
    const fiveYear = calculateRentCost(input({ yearsToCalculate: 5 }));
    expect(fiveYear.totalHiddenCostOverPeriod).toBeCloseTo(
      oneYear.totalHiddenCostOverPeriod * 5,
      5,
    );
  });

  it("overpaid esetben a Nebenkosten nem növeli a rejtett költséget (csak opportunity)", () => {
    // overpaid → diff < 0 → Math.max(0, diff) = 0
    const r = calculateRentCost(input({ acontoNebenkostenChf: 600, yearsToCalculate: 3 }));
    expect(r.totalHiddenCostOverPeriod).toBeCloseTo(
      r.kautionOpportunityCostPerYear * 3,
      5,
    );
  });
});
