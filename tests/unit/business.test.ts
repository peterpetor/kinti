import { describe, it, expect } from "vitest";
import {
  validateBusinessInput,
  isLicensedCategory,
  slugifyBusinessName,
  type BusinessFormInput,
} from "@/lib/business";

const validBase: BusinessFormInput = {
  name: "Teszt Szolgáltató",
  categoryId: "fodrasz", // nem engedélyköteles
  cantonCode: "ZH",
  acceptTerms: true,
  ageConfirmed: true,
};

describe("isLicensedCategory", () => {
  it("engedélyköteles (orvos) → true", () => {
    expect(isLicensedCategory("orvos")).toBe(true);
  });
  it("nem engedélyköteles (fodrász) → false", () => {
    expect(isLicensedCategory("fodrasz")).toBe(false);
  });
});

describe("validateBusinessInput", () => {
  it("érvényes minimális input → ok", () => {
    const res = validateBusinessInput(validBase);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.name).toBe("Teszt Szolgáltató");
      expect(res.value.cantonCode).toBe("ZH");
      expect(res.value.licenseNumber).toBeNull();
    }
  });

  it("honeypot kitöltve → azonnali elutasítás", () => {
    const res = validateBusinessInput({ ...validBase, website: "spam" });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors[0].field).toBe("website");
  });

  it("hiányzó ÁSZF-elfogadás → acceptTerms hiba", () => {
    const res = validateBusinessInput({ ...validBase, acceptTerms: false });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors.some((e) => e.field === "acceptTerms")).toBe(true);
  });

  it("ismeretlen kanton → cantonCode hiba", () => {
    const res = validateBusinessInput({ ...validBase, cantonCode: "XX" });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors.some((e) => e.field === "cantonCode")).toBe(true);
  });

  it("engedélyköteles kategória licenc nélkül → licenseNumber hiba", () => {
    const res = validateBusinessInput({ ...validBase, categoryId: "orvos" });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors.some((e) => e.field === "licenseNumber")).toBe(true);
  });
});

describe("slugifyBusinessName", () => {
  it("ékezet-mentes, kötőjeles slug", () => {
    expect(slugifyBusinessName("Kovács Anna Fodrászat")).toBe("kovacs-anna-fodraszat");
  });
  it("csak szimbólum → fallback", () => {
    expect(slugifyBusinessName("!!!")).toBe("vallalkozas");
  });
});
