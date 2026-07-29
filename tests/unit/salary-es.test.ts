import { describe, it, expect } from "vitest";
import {
  computeSalaryES,
  esWorkIncomeReduction,
  esChildMinimum,
  salaryPercentileES,
  ES_REGIONS_LIST,
  ES_REGION_MEDIAN_GROSS,
  ES_SMI_YEARLY,
} from "@/lib/salary-calc-es";
import { getRegions } from "@/lib/regions";

/**
 * Spanyol bérkalkulátor. A tesztek nem „a helyes euró-összeget" ellenőrzik
 * (az évente változik), hanem a MODELL SZERKEZETÉT — azokat az invariánsokat,
 * amiknek minden paraméter-frissítés után is igazaknak kell maradniuk.
 */
describe("spanyol nettó-bér — szerkezeti invariánsok", () => {
  it("a nettó sosem nagyobb a bruttónál, és nem negatív", () => {
    for (const gross of [0, 8000, 16576, 24000, 45000, 90000, 400000]) {
      const r = computeSalaryES({ gross, period: "year" });
      expect(r.netYearly, `${gross}`).toBeLessThanOrEqual(r.grossYearly);
      expect(r.netYearly, `${gross}`).toBeGreaterThanOrEqual(0);
    }
  });

  it("a levonások pontosan kiadják a bruttó és a nettó különbségét", () => {
    const r = computeSalaryES({ gross: 32000, period: "year" });
    expect(r.grossYearly - r.ssYearly - r.irpfYearly).toBeCloseTo(r.netYearly, 6);
  });

  it("magasabb bruttó → magasabb nettó (monotonitás, nincs sáv-szakadék)", () => {
    let prev = -1;
    for (let gross = 10000; gross <= 120000; gross += 2500) {
      const r = computeSalaryES({ gross, period: "year" });
      expect(r.netYearly, `${gross}`).toBeGreaterThan(prev);
      prev = r.netYearly;
    }
  });

  it("progresszív: a magasabb bér effektív kulcsa nagyobb", () => {
    const low = computeSalaryES({ gross: 20000, period: "year" });
    const high = computeSalaryES({ gross: 80000, period: "year" });
    expect(high.effectiveRate).toBeGreaterThan(low.effectiveRate);
  });
});

/**
 * ⚠️ EZ A KALKULÁTOR LÉTOKA. Ugyanaz az ÉVES bruttó 12 és 14 pagában
 * ugyanannyi pénz — csak máshogy oszlik el. Ha ez elcsúszna, a felhasználó
 * rossz ajánlatot fogadna el egy összehasonlításban.
 */
describe("12 vs 14 paga", () => {
  it("azonos ÉVES bruttónál a nettó ÉVES összeg azonos", () => {
    const a = computeSalaryES({ gross: 28000, period: "year", pagas: 12 });
    const b = computeSalaryES({ gross: 28000, period: "year", pagas: 14 });
    expect(a.netYearly).toBeCloseTo(b.netYearly, 6);
    expect(a.grossYearly).toBeCloseTo(b.grossYearly, 6);
  });

  it("14 pagánál egy kifizetés KISEBB, de a 12 hónapos átlag azonos", () => {
    const a = computeSalaryES({ gross: 28000, period: "year", pagas: 12 });
    const b = computeSalaryES({ gross: 28000, period: "year", pagas: 14 });
    expect(b.netPerPaga).toBeLessThan(a.netPerPaga);
    expect(b.netMonthlyAverage).toBeCloseTo(a.netMonthlyAverage, 6);
  });

  it('a „/ paga" megadás a pagák számával szorzódik fel éves bruttóvá', () => {
    const r = computeSalaryES({ gross: 2000, period: "month", pagas: 14 });
    expect(r.grossYearly).toBe(28000);
    const r12 = computeSalaryES({ gross: 2000, period: "month", pagas: 12 });
    expect(r12.grossYearly).toBe(24000);
  });

  it("12 pagánál a kifizetés és a havi átlag ugyanaz", () => {
    const r = computeSalaryES({ gross: 30000, period: "year", pagas: 12 });
    expect(r.netPerPaga).toBeCloseTo(r.netMonthlyAverage, 6);
  });
});

describe("Seguridad Social", () => {
  it("határozott idejű szerződésnél MAGASABB a járulék (desempleo 1,60% vs 1,55%)", () => {
    const indef = computeSalaryES({ gross: 30000, period: "year", contract: "indefinido" });
    const temp = computeSalaryES({ gross: 30000, period: "year", contract: "temporal" });
    expect(temp.ssYearly).toBeGreaterThan(indef.ssYearly);
    expect(temp.netYearly).toBeLessThan(indef.netYearly);
  });

  it("⚠️ a járulék PLAFONOS — a plafon fölött már nem nő", () => {
    const at = computeSalaryES({ gross: 58914, period: "year" });
    const above = computeSalaryES({ gross: 120000, period: "year" });
    expect(above.ssYearly).toBeCloseTo(at.ssYearly, 6);
  });
});

describe("IRPF-kedvezmények", () => {
  it("alacsony bérnél teljes munkajövedelem-kedvezmény jár, magasnál semmi", () => {
    expect(esWorkIncomeReduction(10000)).toBe(7302);
    expect(esWorkIncomeReduction(14852)).toBe(7302);
    expect(esWorkIncomeReduction(40000)).toBe(0);
  });

  it("a kedvezmény a sávban FOKOZATOSAN fut ki (nincs szakadék)", () => {
    const mid = esWorkIncomeReduction(17000);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(7302);
    expect(esWorkIncomeReduction(18000)).toBeLessThan(mid);
  });

  it("a gyerekek utáni minimum növekvő, és a 4. fölött ismétlődik", () => {
    expect(esChildMinimum(0)).toBe(0);
    expect(esChildMinimum(1)).toBe(2400);
    expect(esChildMinimum(2)).toBe(5100);
    expect(esChildMinimum(3)).toBe(9100);
    expect(esChildMinimum(5)).toBe(9100 + 4500 + 4500);
  });

  it("több gyerek → kevesebb adó (de sosem negatív)", () => {
    const none = computeSalaryES({ gross: 30000, period: "year", children: 0 });
    const three = computeSalaryES({ gross: 30000, period: "year", children: 3 });
    expect(three.irpfYearly).toBeLessThan(none.irpfYearly);
    expect(three.irpfYearly).toBeGreaterThanOrEqual(0);
  });

  /**
   * ⚠️ A személyi minimum NEM adóalap-levonás, hanem a legalsó sávban
   * adómentesített összeg. Ha levonásként számolnánk, magas keresetnél a
   * legfelső kulccsal adnánk kedvezményt — vagyis a gazdagnak többet.
   * Ez a teszt azt rögzíti, hogy a minimum értéke NEM függ a bér nagyságától.
   */
  it("⚠️ a személyi minimum kedvezménye NEM nő a bérrel", () => {
    const benefit = (gross: number) => {
      const withKid = computeSalaryES({ gross, period: "year", children: 1 });
      const without = computeSalaryES({ gross, period: "year", children: 0 });
      return without.irpfYearly - withKid.irpfYearly;
    };
    // Egy gyerek minimuma 2400 € × 19% (legalsó kulcs) = 456 € — bármekkora bérnél.
    expect(benefit(30000)).toBeCloseTo(benefit(90000), 6);
    expect(benefit(30000)).toBeCloseTo(2400 * 0.19, 6);
  });
});

describe("minimálbér-figyelmeztetés", () => {
  /**
   * ⚠️ A küszöb SZÁNDÉKOSAN elavulhat: az SMI évente NŐ, ezért a 2025-ös érték
   * alatti bér a mostani alatt is van. Ez a féloldalas következtetés az, ami
   * miatt egy régi konstans is csak IGAZ riasztást adhat.
   */
  it("a 2025-ös SMI alatti bérre figyelmeztet, fölötte nem", () => {
    expect(computeSalaryES({ gross: 12000, period: "year" }).belowMinimumWage).toBe(true);
    expect(computeSalaryES({ gross: ES_SMI_YEARLY + 1, period: "year" }).belowMinimumWage).toBe(false);
  });

  it("nulla bérre NEM figyelmeztet (üres űrlap nem hiba)", () => {
    expect(computeSalaryES({ gross: 0, period: "year" }).belowMinimumWage).toBe(false);
  });
});

describe("közösség-medián és percentilis", () => {
  /**
   * ⚠️ Ez a fallthrough-védelem: ha a kalkulátor-lista kódja elcsúszna a
   * regions.ts kódjaitól, a felhasználó némán az ORSZÁGOS mediánhoz mérné
   * magát, miközben azt hinné, a saját közösségéhez.
   */
  it("a kalkulátor közösség-kódjai LÉTEZŐ regions.ts-kódok", () => {
    const valid = new Set(getRegions("ES").map((r) => r.code));
    for (const r of ES_REGIONS_LIST) {
      expect(valid.has(r.code), `${r.code} nincs a regions.ts-ben`).toBe(true);
      expect(ES_REGION_MEDIAN_GROSS[r.code], `${r.code}: nincs medián`).toBeGreaterThan(0);
    }
  });

  it("a mediánnál a percentilis ~50, fölötte több, alatta kevesebb", () => {
    const median = ES_REGION_MEDIAN_GROSS.MD;
    expect(salaryPercentileES(median, "MD").percentile).toBeGreaterThanOrEqual(49);
    expect(salaryPercentileES(median, "MD").percentile).toBeLessThanOrEqual(51);
    expect(salaryPercentileES(median * 1.6, "MD").percentile).toBeGreaterThan(70);
    expect(salaryPercentileES(median * 0.6, "MD").percentile).toBeLessThan(30);
  });

  it("ismeretlen közösségnél az ORSZÁGOS mediánhoz mér (nem esik szét)", () => {
    expect(salaryPercentileES(2000, "NINCS-ILYEN").median).toBe(1950);
  });
});
