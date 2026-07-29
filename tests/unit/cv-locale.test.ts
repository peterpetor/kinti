import { describe, it, expect } from "vitest";
import { isFeatureAvailable, cvBuilderFor, CV_BUILDER_BY_COUNTRY } from "@/lib/feature-availability";
import { COUNTRIES } from "@/lib/countries";
import {
  CV_PROFESSION_DE,
  CV_PROFESSION_EN,
  CV_PROFESSION_NL,
  CV_PROFESSION_ES,
  cvProfession,
  cvLanguageLevels,
} from "@/lib/cv-professions";

/**
 * A NÉGY önéletrajz-készítő (német / holland / angol / spanyol) ország-tudatos
 * kiosztása. A regresszió, amit véd: NL-ben a NÉMET CV jelent meg — holland
 * munkáltatóhoz beadva ez érdemi hiba, nem csak nyelvi bosszúság.
 */
const CV_FEATURES = [
  "nemet-oneletrajz",
  "holland-oneletrajz",
  "angol-oneletrajz",
  "spanyol-oneletrajz",
] as const;

describe("CV-készítő ország szerint", () => {
  it("a holland CV KIZÁRÓLAG Hollandiában jelenik meg", () => {
    expect(isFeatureAvailable("holland-oneletrajz", "NL")).toBe(true);
    for (const c of ["CH", "AT", "DE", "GB", "ES"]) {
      expect(isFeatureAvailable("holland-oneletrajz", c)).toBe(false);
    }
  });

  it("a spanyol CV KIZÁRÓLAG Spanyolországban jelenik meg", () => {
    expect(isFeatureAvailable("spanyol-oneletrajz", "ES")).toBe(true);
    for (const c of ["CH", "AT", "DE", "NL", "GB"]) {
      expect(isFeatureAvailable("spanyol-oneletrajz", c)).toBe(false);
    }
  });

  it("NL/ES-ben a német CV REJTVE van, a német nyelvterületen viszont él", () => {
    expect(isFeatureAvailable("nemet-oneletrajz", "NL")).toBe(false);
    expect(isFeatureAvailable("nemet-oneletrajz", "ES")).toBe(false);
    for (const c of ["CH", "AT", "DE"]) {
      expect(isFeatureAvailable("nemet-oneletrajz", c)).toBe(true);
    }
    // GB: engedélyező-lista → továbbra is rejtett (nincs regresszió)
    expect(isFeatureAvailable("nemet-oneletrajz", "GB")).toBe(false);
  });

  /**
   * ⚠️ REGRESSZIÓ-TESZT a 2026-07-29-i hibára: az ANGOL CV-készítőnek SEMMILYEN
   * kapuja nem volt (sem a menüben, sem a keresőben), a `c === "CH"` ág pedig
   * mindent beenged — így a svájci felhasználó „Német CV" és „Angol CV" közül
   * választhatott, értelmetlenül. Ez a teszt MINDEN országra kimondja a
   * szabályt, ezért új ország felvételekor sem lehet elfelejteni az elrejtést.
   */
  it("⚠️ MINDEN országban PONTOSAN EGY CV-készítő látszik", () => {
    for (const country of COUNTRIES) {
      const visible = CV_FEATURES.filter((f) => isFeatureAvailable(f, country.code));
      expect(visible, `${country.code}: ${visible.join(", ") || "egy sem"}`).toHaveLength(1);
    }
  });

  it("a látható készítő MEGEGYEZIK azzal, amit a szöveges ajánlók linkelnek", () => {
    for (const country of COUNTRIES) {
      const visible = CV_FEATURES.find((f) => isFeatureAvailable(f, country.code));
      expect(cvBuilderFor(country.code).href, country.code).toBe(`/${visible}`);
    }
  });

  it("cvBuilderFor: országonként pontosan egy készítő, ismeretlenre német", () => {
    expect(cvBuilderFor("NL")).toEqual({ href: "/holland-oneletrajz", adj: "holland" });
    expect(cvBuilderFor("GB")).toEqual({ href: "/angol-oneletrajz", adj: "angol" });
    expect(cvBuilderFor("ES")).toEqual({ href: "/spanyol-oneletrajz", adj: "spanyol" });
    expect(cvBuilderFor("DE").href).toBe("/nemet-oneletrajz");
    expect(cvBuilderFor(null).href).toBe("/nemet-oneletrajz");
    expect(cvBuilderFor("XX").href).toBe("/nemet-oneletrajz");
  });

  it("MINDEN app-országhoz tartozik CV-készítő (egy sem marad ki)", () => {
    for (const country of COUNTRIES) {
      expect(CV_BUILDER_BY_COUNTRY[country.code], country.code).toBeDefined();
    }
  });
});

describe("szakma-szótárak", () => {
  it("mind a NÉGY szótár UGYANAZOKAT a kategória-id-ket fedi le", () => {
    const de = Object.keys(CV_PROFESSION_DE);
    expect(Object.keys(CV_PROFESSION_NL).sort()).toEqual([...de].sort());
    expect(Object.keys(CV_PROFESSION_EN).sort()).toEqual([...de].sort());
    expect(Object.keys(CV_PROFESSION_ES).sort()).toEqual([...de].sort());
  });

  it("a locale dönti el, melyik megnevezés jön", () => {
    expect(cvProfession("targoncas", "nl")).toBe("Heftruckchauffeur");
    expect(cvProfession("targoncas", "de")).toBe("Gabelstaplerfahrer/in");
    expect(cvProfession("targoncas", "en")).toBe("Forklift Driver");
    expect(cvProfession("targoncas", "es")).toBe("Carretillero (operador de carretilla elevadora)");
    expect(cvProfession("", "nl")).toBeNull();
    expect(cvProfession("nincs-ilyen-szakma", "nl")).toBeNull();
  });

  it("⚠️ a holland/angol/spanyol megnevezésekben NINCS német gender-jelölés (/in)", () => {
    for (const [name, map] of [
      ["NL", CV_PROFESSION_NL],
      ["EN", CV_PROFESSION_EN],
      ["ES", CV_PROFESSION_ES],
    ] as const) {
      const gendered = Object.entries(map).filter(([, v]) => /\/in\b|\/-in\b/.test(v));
      expect(gendered, name).toEqual([]);
    }
  });

  /**
   * ⚠️ A spanyolban a gender-jelölés a HIRDETŐ nyelve („Camarero/a"), nem a
   * sajátodé: az önéletrajzban a saját nemedben írod ki magad. Ha a szótárba
   * bekerülne egy „/a", a felhasználó azt másolná be a CV-jébe.
   */
  it("⚠️ a spanyol megnevezésekben nincs /a gender-jelölés sem", () => {
    const gendered = Object.entries(CV_PROFESSION_ES).filter(([, v]) => /\/a\b|\(a\)/.test(v));
    expect(gendered).toEqual([]);
  });
});

describe("nyelvi szintek", () => {
  it("a lista a CV nyelvén áll (nem mindig németül)", () => {
    expect(cvLanguageLevels("de")).toContain("Muttersprache");
    expect(cvLanguageLevels("nl")).toContain("Moedertaal");
    expect(cvLanguageLevels("en")).toContain("Native speaker");
    expect(cvLanguageLevels("es")).toContain("Lengua materna");
    // Regresszió: az angol/holland/spanyol készítőn korábban német szintek látszottak.
    for (const l of ["nl", "en", "es"] as const) {
      expect(cvLanguageLevels(l), l).not.toContain("Muttersprache");
    }
  });
});
