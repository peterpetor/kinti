import { describe, it, expect } from "vitest";
import { isOutsideCountryScope, regionCodeFromLocation } from "@/lib/region-resolve";
import { getRegions } from "@/lib/regions";

/**
 * ⚠️ AZ ADZUNA `gb` PIACA A TELJES EGYESÜLT KIRÁLYSÁG — A KINTI „GB”-JE ANGLIA.
 *
 * Élesben megfigyelt (2026-07-30, az első GB-szinkron után): 255 „angliai”
 * hirdetésből 30 valójában ÉSZAK-ÍRORSZÁGI vagy SKÓCIAI volt („County Antrim”,
 * „Omagh, Northern Ireland”, „Newry”, „Bathgate”). Ezek nem hiányos, hanem
 * TÉVES adatok: olyan országhoz sorolva, ahol nincsenek — és a Kinti-nek nincs
 * is régiója rájuk.
 */
describe("GB = Anglia, nem az egész Egyesült Királyság", () => {
  it("⚠️ kizárja a skót / walesi / észak-írországi helyeket", () => {
    const outside = [
      "Newtownabbey, County Antrim",
      "Antrim, County Antrim",
      "Omagh, Northern Ireland",
      "Newry, Newry & Mourne",
      "Blackburn, Bathgate",
      "Glasgow",
      "Edinburgh, Scotland",
      "Cardiff, Wales",
      "Swansea",
      "Wrexham",
      "Belfast",
    ];
    for (const loc of outside) {
      expect(isOutsideCountryScope("GB", loc), `${loc}: bent maradt`).toBe(true);
    }
  });

  it("⚠️ NEM zár ki valódi angliai helyeket", () => {
    const inside = [
      "London",
      "Basildon, Essex",
      "Manchester, Greater Manchester",
      "Birmingham, West Midlands",
      "Leeds, West Yorkshire",
      "Newcastle upon Tyne, Tyne and Wear",
      "Bristol",
      "Brighton, East Sussex",
      "Northampton, Northamptonshire",
      "Bath, Somerset",
      // ⚠️ Kétértelmű helynevek, amiket SZÁNDÉKOSAN nem szűrünk: Newport
      // létezik Walesben, DE Shropshire-ben és a Wight-szigeten is.
      "Newport, Shropshire",
      "Newport, Isle of Wight",
      // Csak az ország neve — nem tudjuk, de nem is zárjuk ki.
      "United Kingdom",
    ];
    for (const loc of inside) {
      expect(isOutsideCountryScope("GB", loc), `${loc}: tévesen kizárva`).toBe(false);
    }
  });

  it("a szűrő CSAK a GB-re lép (a többi piac egy az egyben fedi az országot)", () => {
    for (const cc of ["AT", "DE", "NL", "ES", "CH"]) {
      expect(isOutsideCountryScope(cc, "Glasgow, Scotland"), cc).toBe(false);
    }
  });

  it("az Adzuna strukturált `area` tömbjéből is felismeri", () => {
    expect(isOutsideCountryScope("GB", "Antrim", ["UK", "Northern Ireland", "County Antrim"])).toBe(true);
    expect(isOutsideCountryScope("GB", "Guildford", ["UK", "South East England", "Surrey"])).toBe(false);
  });
});

/**
 * ⚠️ A MEGYE-ALIASOK a külső állás-aggregátor miatt kellenek: az Adzuna az angol
 * hirdetésekhez többnyire VÁROS + MEGYE alakot ad (például Basildon, Essex), nem
 * régiót. Megye-alias nélkül ezek régió nélkül maradnak, és a /allasok
 * régió-szűrője ELDOBJA őket.
 */
describe("angol megye → régió feloldás", () => {
  const CASES: [string, string][] = [
    ["Basildon, Essex", "EE"],
    ["Guildford, Surrey", "SE"],
    ["Maidstone, Kent", "SE"],
    ["Truro, Cornwall", "SW"],
    ["Taunton, Somerset", "SW"],
    ["Shrewsbury, Shropshire", "WM"],
    ["Mansfield, Nottinghamshire", "EM"],
    ["Boston, Lincolnshire", "EM"],
    ["Rotherham, South Yorkshire", "YH"],
    ["Carlisle, Cumbria", "NW"],
    ["Crewe, Cheshire", "NW"],
    ["Alnwick, Northumberland", "NE"],
    ["Stockton-on-Tees, Teesside", "NE"],
    ["Harrow, Middlesex", "LDN"],
    // Az aggregátor „…England” alakja is illeszkedjen a régió-névre.
    ["South East England", "SE"],
    ["North West England", "NW"],
  ];

  it.each(CASES)("%s → %s", (loc, expected) => {
    expect(regionCodeFromLocation("GB", loc)).toBe(expected);
  });

  /**
   * ⚠️ A NÉV-ILLESZTÉS TOKEN-HATÁROS, és ez itt KRITIKUS: a Hampshire (SE) és a
   * Northamptonshire (EM) KÉT KÜLÖNBÖZŐ régió. Naiv substring-illesztéssel a
   * Northamptonshire a Hampshire-re is illeszkedne, és Northampton hirdetései a
   * délkeleti régióba kerülnének.
   */
  it("⚠️ a Northamptonshire NEM esik a Hampshire-re (token-határ)", () => {
    expect(regionCodeFromLocation("GB", "Northampton, Northamptonshire")).toBe("EM");
    expect(regionCodeFromLocation("GB", "Basingstoke, Hampshire")).toBe("SE");
  });

  it("egyetlen alias sem szerepel két GB-régiónál (ütköző feloldás)", () => {
    const seen = new Map<string, string>();
    for (const r of getRegions("GB")) {
      for (const a of r.aliases ?? []) {
        const prev = seen.get(a);
        expect(prev, `${a}: két régiónál is szerepel (${prev} és ${r.code})`).toBeUndefined();
        seen.set(a, r.code);
      }
    }
  });
});
