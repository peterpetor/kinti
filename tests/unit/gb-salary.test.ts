import { describe, it, expect } from "vitest";
import {
  computeSalaryGB,
  gbPersonalAllowance,
  gbIncomeTax,
  gbNationalInsurance,
  salaryPercentileGB,
  GB_REGIONS_LIST,
} from "@/lib/salary-calc";
import { getRegions } from "@/lib/regions";

const near = (a: number, b: number, tol = 1) => expect(Math.abs(a - b)).toBeLessThanOrEqual(tol);

describe("GB Personal Allowance (a 100k fölötti taper)", () => {
  it("alap 12 570 £ a taper-küszöb alatt", () => {
    expect(gbPersonalAllowance(30000)).toBe(12570);
    expect(gbPersonalAllowance(100000)).toBe(12570);
  });

  it("2 £-onként 1 £-gyel fogy 100 000 fölött", () => {
    expect(gbPersonalAllowance(110000)).toBe(12570 - 5000); // 10k túllépés → −5k
    expect(gbPersonalAllowance(120000)).toBe(12570 - 10000);
  });

  it("125 140 £-nál teljesen elfogy, és nem megy negatívba", () => {
    expect(gbPersonalAllowance(125140)).toBe(0);
    expect(gbPersonalAllowance(200000)).toBe(0);
  });
});

describe("GB jövedelemadó (PAYE) sávok", () => {
  it("a Personal Allowance alatt nincs adó", () => {
    expect(gbIncomeTax(12570)).toBe(0);
    expect(gbIncomeTax(9000)).toBe(0);
  });

  it("20% az alapsávban", () => {
    // 20 000 − 12 570 = 7 430 adóalap × 20% = 1 486
    near(gbIncomeTax(20000), 1486);
  });

  it("a basic sáv teteje pontosan 50 270 £-nál van", () => {
    // 50 270 − 12 570 = 37 700 × 20% = 7 540
    near(gbIncomeTax(50270), 7540);
  });

  it("40% a higher sávban", () => {
    // 7 540 + (60 000 − 50 270) × 40% = 7 540 + 3 892 = 11 432
    near(gbIncomeTax(60000), 11432);
  });

  it("⚠️ 100–125 140 £ között a taper miatt meredekebb", () => {
    // A PA fogyása extra adót jelent — a 110k adója TÖBB, mint a sima 40% adná
    const naive = 7540 + (110000 - 50270) * 0.4;
    expect(gbIncomeTax(110000)).toBeGreaterThan(naive);
  });

  it("a nyugdíj-hozzájárulás csökkenti az adóalapot", () => {
    expect(gbIncomeTax(40000, 2000)).toBeLessThan(gbIncomeTax(40000, 0));
  });
});

describe("GB National Insurance (Class 1)", () => {
  it("a küszöb alatt 0", () => {
    expect(gbNationalInsurance(12570)).toBe(0);
    expect(gbNationalInsurance(10000)).toBe(0);
  });

  it("8% a fő sávban", () => {
    // (30 000 − 12 570) × 8% = 1 394,4
    near(gbNationalInsurance(30000), 1394.4, 0.5);
  });

  it("az Upper Earnings Limit fölött csak 2%", () => {
    // (50 270 − 12 570) × 8% = 3 016 ; + (60 000 − 50 270) × 2% = 194,6
    near(gbNationalInsurance(60000), 3016 + 194.6, 0.5);
  });

  it("magas bérnél sem ugrik vissza 8%-ra (regresszió-őr)", () => {
    const ni200 = gbNationalInsurance(200000);
    const ni100 = gbNationalInsurance(100000);
    // a különbség pontosan 2% a 100k sávra
    near(ni200 - ni100, 100000 * 0.02, 0.5);
  });
});

describe("computeSalaryGB — teljes nettó", () => {
  it("havi és éves megadás ugyanazt adja", () => {
    const m = computeSalaryGB({ gross: 3000, period: "month", pension: false });
    const y = computeSalaryGB({ gross: 36000, period: "year", pension: false });
    near(m.netYearly, y.netYearly, 0.01);
  });

  it("tipikus 3 000 £/hó bér reális nettót ad", () => {
    const r = computeSalaryGB({ gross: 3000, period: "month", pension: false });
    expect(r.grossYearly).toBe(36000);
    // adó: (36 000 − 12 570) × 20% = 4 686 ; NI: (36 000 − 12 570) × 8% = 1 874,4
    near(r.incomeTaxYearly, 4686, 1);
    near(r.niYearly, 1874.4, 1);
    near(r.netYearly, 36000 - 4686 - 1874.4, 1);
    // a nettó a bruttó ~73–82%-a ebben a sávban
    expect(r.effectiveRate).toBeGreaterThan(15);
    expect(r.effectiveRate).toBeLessThan(25);
  });

  it("a nyugdíj csökkenti a nettót, de az adót is", () => {
    const off = computeSalaryGB({ gross: 36000, period: "year", pension: false });
    const on = computeSalaryGB({ gross: 36000, period: "year", pension: true });
    expect(on.pensionYearly).toBeGreaterThan(0);
    expect(on.netYearly).toBeLessThan(off.netYearly);
    expect(on.incomeTaxYearly).toBeLessThan(off.incomeTaxYearly);
  });

  it("a diákhitel csak a küszöb fölött von", () => {
    const under = computeSalaryGB({ gross: 25000, period: "year", studentLoanPlan2: true });
    expect(under.studentLoanYearly).toBe(0);
    const over = computeSalaryGB({ gross: 37295, period: "year", studentLoanPlan2: true });
    near(over.studentLoanYearly, 10000 * 0.09, 0.5); // (37 295 − 27 295) × 9%
  });

  it("⚠️ a 60%-os taper-csapdát jelzi", () => {
    expect(computeSalaryGB({ gross: 110000, period: "year" }).inTaperTrap).toBe(true);
    expect(computeSalaryGB({ gross: 80000, period: "year" }).inTaperTrap).toBe(false);
    expect(computeSalaryGB({ gross: 140000, period: "year" }).inTaperTrap).toBe(false);
  });

  it("0 bérnél nem borul (nincs NaN/negatív)", () => {
    const r = computeSalaryGB({ gross: 0, period: "month" });
    expect(r.netYearly).toBe(0);
    expect(r.effectiveRate).toBe(0);
    expect(Number.isNaN(r.netMonthly)).toBe(false);
  });

  it("a nettó SOHA nem nagyobb a bruttónál, semmilyen bérnél", () => {
    for (const g of [5000, 12570, 30000, 50270, 100000, 125140, 200000]) {
      const r = computeSalaryGB({ gross: g, period: "year", pension: true, studentLoanPlan2: true });
      expect(r.netYearly, `gross=${g}`).toBeLessThanOrEqual(r.grossYearly);
      expect(r.netYearly, `gross=${g}`).toBeGreaterThan(0);
    }
  });
});

describe("GB régió-benchmark", () => {
  it("a kalkulátor régió-kódjai EGYEZNEK a regions.ts GB-kódjaival", () => {
    const geo = getRegions("GB").map((r) => r.code).sort();
    const calc = GB_REGIONS_LIST.map((r) => r.code).sort();
    expect(calc).toEqual(geo);
  });

  it("Londonban ugyanaz a bér alacsonyabb percentilist ad, mint északon", () => {
    const ldn = salaryPercentileGB(3000, "LDN");
    const ne = salaryPercentileGB(3000, "NE");
    expect(ldn.median).toBeGreaterThan(ne.median);
    expect(ldn.percentile).toBeLessThan(ne.percentile);
  });

  it("a percentilis 1–99 közé szorítva", () => {
    expect(salaryPercentileGB(100, "LDN").percentile).toBeGreaterThanOrEqual(1);
    expect(salaryPercentileGB(999999, "LDN").percentile).toBeLessThanOrEqual(99);
  });
});
