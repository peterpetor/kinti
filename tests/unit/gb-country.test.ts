import { describe, it, expect } from "vitest";
import { isFeatureAvailable, GB_ALLOWED_FEATURES } from "@/lib/feature-availability";
import {
  calculateAll,
  getCustomsConfig,
  CUSTOMS_CONFIG,
} from "@/lib/customs";
import {
  COUNTRIES,
  countryLocative,
  countryAdjective,
  countryIllative,
  countrySuperessive,
  regionWord,
  isValidCountry,
} from "@/lib/countries";
import { getRegions, regionLabel } from "@/lib/regions";

describe("GB (Anglia) mint ország", () => {
  it("szerepel a COUNTRIES listában és érvényes", () => {
    expect(COUNTRIES.some((c) => c.code === "GB")).toBe(true);
    expect(isValidCountry("GB")).toBe(true);
  });

  it("MINDEN grammatikai helper explicit GB-ágat ad (nem esik a svájci default-ra)", () => {
    expect(countryLocative("GB")).toBe("Angliában");
    expect(countrySuperessive("GB")).toBe("Anglián");
    expect(countryAdjective("GB")).toBe("angol");
    expect(countryIllative("GB")).toBe("Angliába");
    expect(regionWord("GB")).toBe("régió");
    // regresszió-őr: egyik sem szivároghat át svájcira
    for (const fn of [countryLocative, countrySuperessive, countryAdjective, countryIllative]) {
      expect(fn("GB").toLowerCase()).not.toContain("svájc");
    }
  });

  it("9 angol régiót ad, ONS-kódokkal", () => {
    const regions = getRegions("GB");
    expect(regions).toHaveLength(9);
    expect(regions.map((r) => r.code)).toContain("LDN");
    expect(regions.map((r) => r.code)).toContain("YH");
    expect(regionLabel("GB")).toBe("régió");
  });

  it("a régió-aliasok feloldják a nagyvárosokat", () => {
    const all = getRegions("GB").flatMap((r) => r.aliases ?? []);
    for (const city of ["manchester", "birmingham", "leeds", "liverpool", "bristol"]) {
      expect(all).toContain(city);
    }
  });
});

describe("GB feature-gating (engedélyező-lista)", () => {
  it("engedi a listán szereplő, ország-független funkciókat", () => {
    for (const f of ["szaknevsor", "allasok", "piacter", "utalas", "vam"]) {
      expect(isFeatureAvailable(f, "GB")).toBe(true);
    }
  });

  it("⚠️ REJTI a CH/EU-specifikus eszközöket, amikhez NINCS angol tartalom", () => {
    // Ezek svájci/EU-s adatot mutatnának hitelesnek tűnő módon — tilos.
    for (const f of [
      "berkalkulator",
      "allampolgarsag",
      "iskolarendszer",
      "ugyintezes",
      "tudasbazis",
      "bussen",
      "kozlekedes",
      "lakberles",
      "szolgaltato-valto",
      "vizum",
      "nyelvlecke",
      "nemet-oneletrajz",
    ]) {
      expect(isFeatureAvailable(f, "GB")).toBe(false);
    }
  });

  it("ismeretlen kulcs GB-ben alapból REJTETT (fail-closed)", () => {
    expect(isFeatureAvailable("valami-uj-modul", "GB")).toBe(false);
    // …miközben a többi országban a modell megengedő marad
    expect(isFeatureAvailable("valami-uj-modul", "DE")).toBe(true);
  });

  it("a többi ország viselkedése változatlan (nincs regresszió)", () => {
    expect(isFeatureAvailable("berkalkulator", "CH")).toBe(true);
    expect(isFeatureAvailable("berkalkulator", "DE")).toBe(true);
    expect(isFeatureAvailable("vam", "CH")).toBe(true);
    expect(isFeatureAvailable("vam", "DE")).toBe(false); // EU-n belül nincs vámhatár
    expect(isFeatureAvailable("vam", "NL")).toBe(false);
  });

  it("a vám benne van a GB engedélyező-listában", () => {
    expect(GB_ALLOWED_FEATURES.has("vam")).toBe(true);
  });
});

describe("GB vám-kalkulátor (gov.uk, Brexit utáni keretek)", () => {
  it("a GB configot adja vissza GB-re, CH-t minden másra", () => {
    expect(getCustomsConfig("GB").country).toBe("GB");
    expect(getCustomsConfig("CH").country).toBe("CH");
    expect(getCustomsConfig(null).country).toBe("CH"); // régi viselkedés
  });

  it("GB pénzneme GBP, értékkerete 390", () => {
    expect(CUSTOMS_CONFIG.GB.currency).toBe("GBP");
    expect(CUSTOMS_CONFIG.GB.valueThreshold).toBe(390);
  });

  it("az alkohol-keretek a gov.uk értékeket követik", () => {
    const byId = Object.fromEntries(CUSTOMS_CONFIG.GB.categories.map((c) => [c.id, c]));
    expect(byId.beer.limitPerPerson).toBe(42);
    expect(byId.wine.limitPerPerson).toBe(18);
    expect(byId.spirits.limitPerPerson).toBe(4);
    expect(byId.sparkling.limitPerPerson).toBe(9);
    expect(byId.cigarettes.limitPerPerson).toBe(200);
    // a tömény és a pezsgő VAGYLAGOS — közös csoportban
    expect(byId.spirits.eitherOrGroup).toBe(byId.sparkling.eitherOrGroup);
  });

  it("⚠️ a hús és a tejtermék TILTOTT GB-ben, nem csak limitált", () => {
    const byId = Object.fromEntries(CUSTOMS_CONFIG.GB.categories.map((c) => [c.id, c]));
    expect(byId.meat.prohibited).toBe(true);
    expect(byId.dairy.prohibited).toBe(true);
  });

  it("tiltott tétel megadásakor 'prohibited' státuszt és jelzőt ad", () => {
    const res = calculateAll({ persons: 2, amounts: { meat: 1.5 }, country: "GB" });
    const meat = res.results.find((r) => r.category.id === "meat")!;
    expect(meat.status).toBe("prohibited");
    expect(meat.estimatedDuty).toBe(0); // nem vám-köteles, hanem TILOS
    expect(res.anyProhibited).toBe(true);
    expect(res.overCount).toBeGreaterThan(0);
  });

  it("tiltott kategória 0 mennyiséggel nem riaszt", () => {
    const res = calculateAll({ persons: 1, amounts: {}, country: "GB" });
    expect(res.anyProhibited).toBe(false);
    expect(res.overCount).toBe(0);
  });

  it("a limit személyenként szorzódik GB-ben is", () => {
    const res = calculateAll({ persons: 3, amounts: { beer: 100 }, country: "GB" });
    const beer = res.results.find((r) => r.category.id === "beer")!;
    expect(beer.totalLimit).toBe(126); // 42 × 3
    expect(beer.status).toBe("ok");
  });

  it("GB túllépésnél nincs tételes vám-összeg (deklarálás-kötelezettség)", () => {
    const res = calculateAll({ persons: 1, amounts: { beer: 60 }, country: "GB" });
    const beer = res.results.find((r) => r.category.id === "beer")!;
    expect(beer.status).toBe("over");
    expect(beer.overage).toBe(18);
    expect(res.totalDuty).toBe(0); // GB-ben nem tételes kulcs
  });

  it("a svájci számítás VÁLTOZATLAN (nincs regresszió)", () => {
    const res = calculateAll({ persons: 2, amounts: { meat: 3 }, country: "CH" });
    const meat = res.results.find((r) => r.category.id === "meat")!;
    expect(meat.totalLimit).toBe(2); // 1 kg/fő × 2
    expect(meat.overage).toBe(1);
    expect(meat.estimatedDuty).toBe(17); // 1 kg × 17 CHF
    expect(meat.status).toBe("over");
    expect(res.anyProhibited).toBe(false); // CH-ban a hús nem tiltott, csak vámköteles
  });

  it("alkohol-túllépés jelzése mindkét országban működik", () => {
    expect(calculateAll({ persons: 1, amounts: { wine: 99 }, country: "CH" }).anyAlcoholOver).toBe(true);
    expect(calculateAll({ persons: 1, amounts: { sparkling: 99 }, country: "GB" }).anyAlcoholOver).toBe(true);
  });
});
