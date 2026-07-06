import { describe, it, expect } from "vitest";
import { searchDestinations, APP_DESTINATIONS } from "@/lib/app-destinations";

/**
 * A globális kereső „command palette" rétege: az app-eszközök/oldalak magyar
 * kulcsszavakra (ékezet-érzéketlen, több-szavas) előkerülnek, ország-tudatosan.
 */

describe("searchDestinations — alap illesztés", () => {
  it("hivatalos névre és köznyelvi szinonimára is talál", () => {
    expect(searchDestinations("engedély", "CH").map((d) => d.href)).toContain("/vizum");
    expect(searchDestinations("vízum", "CH").map((d) => d.href)).toContain("/vizum");
    expect(searchDestinations("tartózkodási", "CH").map((d) => d.href)).toContain("/vizum");
    expect(searchDestinations("hazautalás", "CH").map((d) => d.href)).toContain("/arfolyam");
    expect(searchDestinations("wise", "CH").map((d) => d.href)).toContain("/arfolyam");
  });

  it("ékezet-érzéketlen (accentes és accent-mentes needle is talál)", () => {
    expect(searchDestinations("iranytu", "CH").map((d) => d.href)).toContain("/iranytu");
    expect(searchDestinations("Iránytű", "CH").map((d) => d.href)).toContain("/iranytu");
    expect(searchDestinations("berkalkulator", "CH").map((d) => d.href)).toContain("/berkalkulator");
  });

  it("több-szavas AND: minden szónak illeszkednie kell", () => {
    expect(searchDestinations("magyar vállalkozás", "CH").map((d) => d.href)).toContain("/szaknevsor");
    // olyan szópár, amiből nincs közös cél → üres
    expect(searchDestinations("vízum repülőjegy", "CH")).toEqual([]);
  });

  it("rövid / üres keresés → üres", () => {
    expect(searchDestinations("", "CH")).toEqual([]);
    expect(searchDestinations("a", "CH")).toEqual([]);
  });
});

describe("searchDestinations — rangsor (title-találat > kulcsszó-találat)", () => {
  it("a címben egyező cél megelőzi a csak-kulcsszóban egyezőt", () => {
    const hrefs = searchDestinations("ber", "CH").map((d) => d.href);
    // „ber" a Bérkalkulátor CÍMÉBEN (2 pont), az Iránytűnek csak a kulcsszavában (1 pont)
    expect(hrefs).toContain("/berkalkulator");
    expect(hrefs).toContain("/iranytu");
    expect(hrefs.indexOf("/berkalkulator")).toBeLessThan(hrefs.indexOf("/iranytu"));
  });
});

describe("searchDestinations — ország-tudatos (nincs zsákutca)", () => {
  it("a CH-only vám-kalkulátor csak CH-ban jelenik meg", () => {
    expect(searchDestinations("vám", "CH").map((d) => d.href)).toContain("/vam");
    expect(searchDestinations("vám", "AT")).toEqual([]);
    expect(searchDestinations("vám", "DE")).toEqual([]);
    expect(searchDestinations("vám", "NL")).toEqual([]);
  });

  it("az univerzális eszközök minden országban elérhetők", () => {
    for (const c of ["CH", "AT", "DE", "NL"]) {
      expect(searchDestinations("állás", c).map((d) => d.href)).toContain("/allasok");
      expect(searchDestinations("bérkalkulátor", c).map((d) => d.href)).toContain("/berkalkulator");
    }
  });
});

describe("APP_DESTINATIONS — adat-épség", () => {
  it("minden cél abszolút útvonal, egyedi href, kitöltött mezők", () => {
    const hrefs = new Set<string>();
    for (const d of APP_DESTINATIONS) {
      expect(d.href.startsWith("/")).toBe(true);
      expect(hrefs.has(d.href)).toBe(false);
      hrefs.add(d.href);
      expect(d.title.length).toBeGreaterThan(0);
      expect(d.subtitle.length).toBeGreaterThan(0);
      expect(d.keywords.length).toBeGreaterThan(0);
    }
  });
});
