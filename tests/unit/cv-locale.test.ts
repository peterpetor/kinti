import { describe, it, expect } from "vitest";
import { isFeatureAvailable, cvBuilderFor } from "@/lib/feature-availability";
import {
  CV_PROFESSION_DE,
  CV_PROFESSION_EN,
  CV_PROFESSION_NL,
  cvProfession,
  cvLanguageLevels,
} from "@/lib/cv-professions";

/**
 * A három önéletrajz-készítő (német / holland / angol) ország-tudatos
 * kiosztása. A regresszió, amit véd: NL-ben a NÉMET CV jelent meg — holland
 * munkáltatóhoz beadva ez érdemi hiba, nem csak nyelvi bosszúság.
 */
describe("CV-készítő ország szerint", () => {
  it("a holland CV KIZÁRÓLAG Hollandiában jelenik meg", () => {
    expect(isFeatureAvailable("holland-oneletrajz", "NL")).toBe(true);
    for (const c of ["CH", "AT", "DE", "GB"]) {
      expect(isFeatureAvailable("holland-oneletrajz", c)).toBe(false);
    }
  });

  it("NL-ben a német CV REJTVE van, a német nyelvterületen viszont él", () => {
    expect(isFeatureAvailable("nemet-oneletrajz", "NL")).toBe(false);
    for (const c of ["CH", "AT", "DE"]) {
      expect(isFeatureAvailable("nemet-oneletrajz", c)).toBe(true);
    }
    // GB: engedélyező-lista → továbbra is rejtett (nincs regresszió)
    expect(isFeatureAvailable("nemet-oneletrajz", "GB")).toBe(false);
  });

  it("cvBuilderFor: országonként pontosan egy készítő, ismeretlenre német", () => {
    expect(cvBuilderFor("NL")).toEqual({ href: "/holland-oneletrajz", adj: "holland" });
    expect(cvBuilderFor("GB")).toEqual({ href: "/angol-oneletrajz", adj: "angol" });
    expect(cvBuilderFor("DE").href).toBe("/nemet-oneletrajz");
    expect(cvBuilderFor(null).href).toBe("/nemet-oneletrajz");
    expect(cvBuilderFor("XX").href).toBe("/nemet-oneletrajz");
  });
});

describe("szakma-szótárak", () => {
  it("mindhárom szótár UGYANAZOKAT a kategória-id-ket fedi le", () => {
    const de = Object.keys(CV_PROFESSION_DE);
    expect(Object.keys(CV_PROFESSION_NL).sort()).toEqual([...de].sort());
    expect(Object.keys(CV_PROFESSION_EN).sort()).toEqual([...de].sort());
  });

  it("a locale dönti el, melyik megnevezés jön", () => {
    expect(cvProfession("targoncas", "nl")).toBe("Heftruckchauffeur");
    expect(cvProfession("targoncas", "de")).toBe("Gabelstaplerfahrer/in");
    expect(cvProfession("targoncas", "en")).toBe("Forklift Driver");
    expect(cvProfession("", "nl")).toBeNull();
    expect(cvProfession("nincs-ilyen-szakma", "nl")).toBeNull();
  });

  it("⚠️ a holland megnevezésekben NINCS német gender-jelölés (/in)", () => {
    const gendered = Object.entries(CV_PROFESSION_NL).filter(([, v]) => /\/in\b|\/-in\b/.test(v));
    expect(gendered).toEqual([]);
  });
});

describe("nyelvi szintek", () => {
  it("a lista a CV nyelvén áll (nem mindig németül)", () => {
    expect(cvLanguageLevels("de")).toContain("Muttersprache");
    expect(cvLanguageLevels("nl")).toContain("Moedertaal");
    expect(cvLanguageLevels("en")).toContain("Native speaker");
    // Regresszió: az angol/holland készítőn korábban német szintek látszottak.
    expect(cvLanguageLevels("nl")).not.toContain("Muttersprache");
    expect(cvLanguageLevels("en")).not.toContain("Muttersprache");
  });
});
