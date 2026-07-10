import { describe, it, expect } from "vitest";
import {
  baselineCosts, blendCosts, childBenefit, summarizeBudget, suggestedRooms,
  isBudgetCountry, budgetCurrency,
} from "@/lib/budget-plan";

describe("budget-plan", () => {
  it("baselineCosts a háztartás-összetételre skáláz", () => {
    const single = baselineCosts("DE", 1, 0);
    const family = baselineCosts("DE", 2, 2);
    const kaja1 = single.find((c) => c.id === "kaja")!.amount;
    const kaja4 = family.find((c) => c.id === "kaja")!.amount;
    expect(kaja4).toBeGreaterThan(kaja1);
    // DE: a törvényes egészségbiztosítás a bérből megy (családtag ingyen) → 0
    expect(family.find((c) => c.id === "krankenkasse")!.amount).toBe(0);
    // CH: a Krankenkasse KÜLÖN költség, felnőttenként + gyerekenként
    const chFamily = baselineCosts("CH", 2, 1);
    expect(chFamily.find((c) => c.id === "krankenkasse")!.amount).toBe(390 + 390 + 110);
    expect(single.every((c) => c.source === "reference")).toBe(true);
  });

  it("blendCosts: a közösségi medián csak elég beküldésnél ír felül", () => {
    const base = baselineCosts("AT", 1, 0);
    const blended = blendCosts(base, {
      kaja: { median: 410, count: 12 },     // elég adat → felülír
      rezsi: { median: 999, count: 3 },     // kevés adat → marad a referencia
      ismeretlen: { median: 5, count: 50 }, // nem létező kategória → nem hat
    });
    const kaja = blended.find((c) => c.id === "kaja")!;
    expect(kaja.amount).toBe(410);
    expect(kaja.source).toBe("community");
    const rezsi = blended.find((c) => c.id === "rezsi")!;
    expect(rezsi.source).toBe("reference");
    expect(rezsi.amount).toBe(base.find((c) => c.id === "rezsi")!.amount);
  });

  it("summarizeBudget: maradék + verdikt-küszöbök", () => {
    const costs = baselineCosts("DE", 1, 0);
    const costSum = costs.reduce((s, c) => s + c.amount, 0);
    // Bő jövedelem → comfortable
    const rich = summarizeBudget({ netMonthly: (costSum + 1000) * 2, childBenefitMonthly: 0, rentMonthly: 1000, costs });
    expect(rich.verdict).toBe("comfortable");
    expect(rich.leftover).toBe(rich.incomeTotal - rich.costTotal);
    // Költség > jövedelem → deficit, negatív maradék
    const poor = summarizeBudget({ netMonthly: 800, childBenefitMonthly: 0, rentMonthly: 900, costs });
    expect(poor.verdict).toBe("deficit");
    expect(poor.leftover).toBeLessThan(0);
    // Nulla jövedelem: nincs osztás-hiba
    const zero = summarizeBudget({ netMonthly: 0, childBenefitMonthly: 0, rentMonthly: 0, costs: [] });
    expect(zero.savingsRate).toBe(0);
  });

  it("childBenefit országonként, gyerekszámmal szorozva", () => {
    expect(childBenefit("DE", 2)).toBe(510);
    expect(childBenefit("AT", 0)).toBe(0);
    expect(childBenefit("CH", 1)).toBe(215);
    expect(childBenefit("NL", -1)).toBe(0); // negatív input nem ad negatív juttatást
  });

  it("suggestedRooms + ország-helper-ek", () => {
    expect(suggestedRooms(1, 0)).toBe(2);
    expect(suggestedRooms(2, 1)).toBe(3);
    expect(suggestedRooms(2, 3)).toBe(4);
    expect(isBudgetCountry("DE")).toBe(true);
    expect(isBudgetCountry("HU")).toBe(false);
    expect(budgetCurrency("CH")).toBe("CHF");
    expect(budgetCurrency("AT")).toBe("EUR");
  });
});
