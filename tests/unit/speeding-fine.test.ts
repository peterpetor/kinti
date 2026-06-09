import { describe, it, expect } from "vitest";
import { calculateFine, type FineInput } from "@/lib/speeding-fine";

/** Alap input segéd — havi nettó 6000 CHF → tagessatz = round(6000*12/360) = 200. */
function input(partial: Partial<FineInput>): FineInput {
  return {
    roadType: "city",
    speedLimit: 50,
    actualSpeed: 50,
    monthlyNetIncomeChf: 6000,
    ...partial,
  };
}

describe("calculateFine — tolerancia", () => {
  it("limiten belül: no-fine", () => {
    const r = calculateFine(input({ actualSpeed: 50 }));
    expect(r.severity).toBe("no-fine");
    expect(r.estimatedFineChf).toBe(0);
  });

  it("túllépés a Messtoleranzon belül (5 km/h): no-fine", () => {
    const r = calculateFine(input({ actualSpeed: 55 }));
    expect(r.severity).toBe("no-fine");
    expect(r.effectiveOverage).toBe(0);
  });

  it("levonja az 5 km/h toleranciát", () => {
    // 58 mért → effektív 58-50-5 = 3
    const r = calculateFine(input({ actualSpeed: 58 }));
    expect(r.effectiveOverage).toBe(3);
  });
});

describe("calculateFine — Ordnungsbusse (fix bírság)", () => {
  it("város +6 effektív → 40 CHF sáv", () => {
    // 61 mért → 61-50-5 = 6 → maxOverage 10 sáv = 120 CHF
    const r = calculateFine(input({ actualSpeed: 61 }));
    expect(r.severity).toBe("ordnungsbusse");
    expect(r.estimatedFineChf).toBe(120);
    expect(r.licenseSuspension).toBeNull();
  });

  it("legalsó sáv: 1 km/h effektív → 40 CHF", () => {
    const r = calculateFine(input({ actualSpeed: 56 }));
    expect(r.severity).toBe("ordnungsbusse");
    expect(r.estimatedFineChf).toBe(40);
  });

  it("autópályán olcsóbb a fix bírság", () => {
    // highway limit 120, 126 mért → 1 effektív → 20 CHF
    const r = calculateFine(input({ roadType: "highway", speedLimit: 120, actualSpeed: 126 }));
    expect(r.severity).toBe("ordnungsbusse");
    expect(r.estimatedFineChf).toBe(20);
  });
});

describe("calculateFine — súlyossági küszöbök (városban)", () => {
  it("+16 effektív → mittelschwer, jövedelem-arányos", () => {
    // 71 mért → 71-50-5 = 16 → mittelschwer, 40 napi pénz × 200
    const r = calculateFine(input({ actualSpeed: 71 }));
    expect(r.severity).toBe("mittelschwer");
    expect(r.daysOfFine).toBe(40);
    expect(r.tagessatzChf).toBe(200);
    expect(r.estimatedFineChf).toBe(40 * 200);
    expect(r.licenseSuspension).toMatch(/1 hónap/);
  });

  it("+25 effektív → schwer", () => {
    // 80 mért → 25 effektív
    const r = calculateFine(input({ actualSpeed: 80 }));
    expect(r.severity).toBe("schwer");
    expect(r.estimatedFineChf).toBe(90 * 200);
    expect(r.prisonInfo).not.toBeNull();
  });

  it("+50 effektív → raser, börtön + elkobzás", () => {
    // 105 mért → 50 effektív
    const r = calculateFine(input({ actualSpeed: 105 }));
    expect(r.severity).toBe("raser");
    expect(r.estimatedFineChf).toBe(150 * 200);
    expect(r.prisonInfo).toMatch(/börtön/i);
  });
});

describe("calculateFine — Tagessatz plafon", () => {
  it("a napi pénz max 3000 CHF-re van vágva", () => {
    // havi nettó 200_000 → 200000*12/360 = 6666 → cap 3000
    const r = calculateFine(input({ actualSpeed: 71, monthlyNetIncomeChf: 200_000 }));
    expect(r.tagessatzChf).toBe(3000);
    expect(r.estimatedFineChf).toBe(40 * 3000);
  });
});

describe("calculateFine — úttípus-függő küszöbök", () => {
  it("autópályán +16 még csak Ordnungsbusse, nem mittelschwer", () => {
    // highway mittelschwer küszöb 26; 16 effektív < 20 maxOverage táblavég? táblavég 25 → 180/260
    // 120 limit, 141 mért → 16 effektív → highway tábla maxOverage 20 sáv = 180 CHF
    const r = calculateFine(input({ roadType: "highway", speedLimit: 120, actualSpeed: 141 }));
    expect(r.severity).toBe("ordnungsbusse");
    expect(r.estimatedFineChf).toBe(180);
  });
});
