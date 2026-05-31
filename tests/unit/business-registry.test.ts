import { describe, it, expect } from "vitest";
import { registryForCategory } from "@/lib/business-registry";

describe("registryForCategory", () => {
  it("orvosi kategória → MedReg", () => {
    expect(registryForCategory("orvos").label).toContain("MedReg");
  });
  it("pszichológus → PsyReg", () => {
    expect(registryForCategory("pszichologus").label).toContain("PsyReg");
  });
  it("ügyvéd → SAV/FSA kereső", () => {
    expect(registryForCategory("ugyved").url).toContain("sav-fsa");
  });
  it("építész → REG", () => {
    expect(registryForCategory("epitesz").url).toContain("reg.ch");
  });
  it("általános kategória → Zefix (névre szűrve)", () => {
    const r = registryForCategory("fodrasz", "Teszt Bolt");
    expect(r.url).toContain("zefix");
    expect(r.url).toContain("Teszt");
  });
});
