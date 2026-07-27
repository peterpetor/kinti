import { describe, it, expect } from "vitest";
import { baseCurrencyFor } from "@/lib/exchange-providers";
import { COUNTRIES } from "@/lib/countries";

/**
 * ⚠️ Valós hiba volt (user jelezte 2026-07-28: „Itt vagyok az angolon aztán
 * eurót ír font helyett"): a kalkulátor `isEuro = country !== "CH"` BINÁRIS
 * elágazással minden nem-svájci országot eurózónának vett, így Anglián az
 * EUR→HUF kurzust mutatta a GBP→HUF helyett — a tényleges kurzusokkal ez
 * ~17% eltérés minden utalás-becslésen (359,79 Ft vs 420,68 Ft).
 */
describe("hazautalás bázisvaluta", () => {
  it("Svájc CHF, az eurózóna EUR", () => {
    expect(baseCurrencyFor("CH")).toBe("CHF");
    for (const c of ["AT", "DE", "NL"]) {
      expect(baseCurrencyFor(c, 0.92), c).toBe("EUR");
    }
  });

  it("⚠️ Anglia GBP — nem EUR", () => {
    expect(baseCurrencyFor("GB", 0.9212)).toBe("GBP");
  });

  it("GBP-kurzus nélkül Anglia EUR-ra esik vissza (nincs nullával osztás)", () => {
    expect(baseCurrencyFor("GB")).toBe("EUR");
    expect(baseCurrencyFor("GB", 0)).toBe("EUR");
  });

  it("minden élő ország kap valutát, és egyik sem kap CHF-et Svájcon kívül", () => {
    for (const c of COUNTRIES) {
      const base = baseCurrencyFor(c.code, 0.92);
      expect(["CHF", "EUR", "GBP"]).toContain(base);
      if (c.code !== "CH") expect(base, `${c.code} nem lehet CHF`).not.toBe("CHF");
    }
  });
});
