import { describe, it, expect } from "vitest";
import {
  computeSalary,
  salaryPercentile,
  CANTON_MEDIAN_GROSS,
  type SalaryCalcInput,
} from "@/lib/salary-calc";

const base: SalaryCalcInput = {
  gross: 6000, period: "month", canton: "ZH", age: "25-34",
  civil: "A", kids: 0, churchTax: false, months: 12,
};

describe("computeSalary", () => {
  it("alap eset (6000 ZH egyedülálló) — ismert levonások", () => {
    const r = computeSalary(base);
    expect(r.grossMonthly).toBe(6000);
    expect(r.valAhv).toBeCloseTo(318, 1); // 5.3%
    expect(r.socialNonPension).toBeCloseTo(504, 1); // AHV+ALV+NBU+KTG
    expect(r.valBvg).toBeCloseTo(135, 0); // (6000-2143)*3.5%
    expect(r.valQst).toBeCloseTo(510, 1); // ZH A 8.5%
    expect(r.netMonthly).toBeCloseTo(4851, 0);
    expect(r.netMonthly).toBeLessThan(r.grossMonthly);
  });

  it("éves bruttó ugyanazt adja, mint a havi", () => {
    const monthly = computeSalary(base);
    const yearly = computeSalary({ ...base, gross: 72000, period: "year" });
    expect(yearly.netMonthly).toBeCloseTo(monthly.netMonthly, 6);
  });

  it("gyerekek csökkentik a forrásadót", () => {
    const noKids = computeSalary(base);
    const twoKids = computeSalary({ ...base, kids: 2 });
    expect(twoKids.valQst).toBeLessThan(noKids.valQst);
    expect(twoKids.netMonthly).toBeGreaterThan(noKids.netMonthly);
  });

  it("egyházi adó növeli a levonást", () => {
    const withChurch = computeSalary({ ...base, churchTax: true });
    expect(withChurch.valQst).toBeGreaterThan(computeSalary(base).valQst);
  });

  it("Zug adózásilag kedvezőbb, mint Bern (ugyanaz a bruttó)", () => {
    const zg = computeSalary({ ...base, canton: "ZG" });
    const be = computeSalary({ ...base, canton: "BE" });
    expect(zg.netMonthly).toBeGreaterThan(be.netMonthly);
  });

  it("13. havi: az éves nettó magasabb", () => {
    const m12 = computeSalary(base);
    const m13 = computeSalary({ ...base, months: 13 });
    expect(m13.netYearly).toBeGreaterThan(m12.netYearly);
  });
});

describe("salaryPercentile", () => {
  it("medián bér → ~50 percentilis", () => {
    const p = salaryPercentile(CANTON_MEDIAN_GROSS.ZH, "ZH");
    expect(p.median).toBe(CANTON_MEDIAN_GROSS.ZH);
    expect(p.percentile).toBeGreaterThanOrEqual(45);
    expect(p.percentile).toBeLessThanOrEqual(55);
  });

  it("medián alatt → alacsony, medián felett → magas", () => {
    expect(salaryPercentile(3500, "ZH").percentile).toBeLessThan(25);
    expect(salaryPercentile(13000, "ZH").percentile).toBeGreaterThan(85);
  });

  it("a percentilis mindig 1–99 közé esik", () => {
    expect(salaryPercentile(1, "ZH").percentile).toBeGreaterThanOrEqual(1);
    expect(salaryPercentile(999999, "ZH").percentile).toBeLessThanOrEqual(99);
  });

  it("ismeretlen kanton → országos mediánra esik vissza", () => {
    const p = salaryPercentile(6800, "XX");
    expect(p.median).toBe(6800);
  });
});
