import { describe, it, expect } from "vitest";
import {
  CUSTOMS_CATEGORIES,
  calculateCategory,
  calculateAll,
  type CustomsCategory,
} from "@/lib/customs";

const meat = CUSTOMS_CATEGORIES.find((c) => c.id === "meat")!;

describe("calculateCategory", () => {
  it("limit alatt: ok, nincs vám", () => {
    const r = calculateCategory(meat, 1, 0.5);
    expect(r.status).toBe("ok");
    expect(r.overage).toBe(0);
    expect(r.estimatedDuty).toBe(0);
    expect(r.pct).toBe(50);
  });

  it("pontosan a limiten: nincs túllépés, de 100% → warning", () => {
    const r = calculateCategory(meat, 1, 1);
    // pct=100 ≥ 80 → warning, miközben még nincs vámköteles túllépés
    expect(r.status).toBe("warning");
    expect(r.pct).toBe(100);
    expect(r.overage).toBe(0);
    expect(r.estimatedDuty).toBe(0);
  });

  it("80% felett, de limiten belül: warning", () => {
    const r = calculateCategory(meat, 1, 0.9);
    expect(r.status).toBe("warning");
    expect(r.estimatedDuty).toBe(0);
  });

  it("limit felett: over + arányos vám", () => {
    // 2 kg hús, 1 kg/fő limit, 1 fő → 1 kg túllépés × 17 CHF
    const r = calculateCategory(meat, 1, 2);
    expect(r.status).toBe("over");
    expect(r.overage).toBe(1);
    expect(r.estimatedDuty).toBe(17);
  });

  it("a limit fő-szám szerint skálázódik", () => {
    // 1 kg hús 1 főnél a limiten (warning), de 2 főnél (2 kg limit) bőven ok
    expect(calculateCategory(meat, 1, 1).status).toBe("warning");
    const r = calculateCategory(meat, 2, 1);
    expect(r.totalLimit).toBe(2);
    expect(r.pct).toBe(50);
    expect(r.status).toBe("ok");
  });

  it("0 limit nem oszt nullával (pct=0)", () => {
    const zero: CustomsCategory = { ...meat, limitPerPerson: 0 };
    const r = calculateCategory(zero, 1, 5);
    expect(r.pct).toBe(0);
    expect(r.totalLimit).toBe(0);
    expect(r.overage).toBe(5);
  });
});

describe("calculateAll", () => {
  it("üres input: minden ok, nincs vám", () => {
    const r = calculateAll({ persons: 1, amounts: {} });
    expect(r.totalDuty).toBe(0);
    expect(r.overCount).toBe(0);
    expect(r.anyAlcoholOver).toBe(false);
    expect(r.results).toHaveLength(CUSTOMS_CATEGORIES.length);
  });

  it("összegzi több kategória vámját és számolja a túllépéseket", () => {
    // hús 2 kg (limit 1 → 17 CHF) + vaj 7 kg (limit 5 → 2×16=32 CHF)
    const r = calculateAll({ persons: 1, amounts: { meat: 2, butter: 7 } });
    expect(r.overCount).toBe(2);
    expect(r.totalDuty).toBeCloseTo(17 + 32, 5);
    expect(r.anyAlcoholOver).toBe(false);
  });

  it("alkohol-túllépést külön jelzi", () => {
    const r = calculateAll({ persons: 1, amounts: { wine: 6 } });
    expect(r.anyAlcoholOver).toBe(true);
  });

  it("nem-alkohol túllépés nem billenti az anyAlcoholOver flaget", () => {
    const r = calculateAll({ persons: 1, amounts: { cigarettes: 300 } });
    expect(r.overCount).toBe(1);
    expect(r.anyAlcoholOver).toBe(false);
  });
});
