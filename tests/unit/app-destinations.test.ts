import { describe, it, expect } from "vitest";
import { searchDestinations, APP_DESTINATIONS, quickActions, highlightTitle } from "@/lib/app-destinations";

/**
 * A globális kereső „command palette" rétege: az app-eszközök/oldalak magyar
 * kulcsszavakra (ékezet-érzéketlen, több-szavas) előkerülnek, ország-tudatosan.
 */

describe("searchDestinations — alap illesztés", () => {
  it("hivatalos névre és köznyelvi szinonimára is talál", () => {
    expect(searchDestinations("engedély", "CH").map((d) => d.href)).toContain("/tudasbazis/vizum");
    expect(searchDestinations("vízum", "CH").map((d) => d.href)).toContain("/tudasbazis/vizum");
    expect(searchDestinations("tartózkodási", "CH").map((d) => d.href)).toContain("/tudasbazis/vizum");
    // 2026-07-16: az árfolyam az /utalas-ba olvadt (összevonás).
    expect(searchDestinations("hazautalás", "CH").map((d) => d.href)).toContain("/utalas");
    expect(searchDestinations("wise", "CH").map((d) => d.href)).toContain("/utalas");
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
    expect(searchDestinations("vám", "CH").map((d) => d.href)).toContain("/tudasbazis/vam");
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

describe("searchDestinations — 2026-07 bővítés (mindenkereső)", () => {
  it("az újonnan felvett célok kereshetők", () => {
    expect(searchDestinations("gyorshajtás", "DE").map((d) => d.href)).toContain("/tudasbazis/bussen");
    expect(searchDestinations("trafipax", "AT").map((d) => d.href)).toContain("/tudasbazis/bussen");
    expect(searchDestinations("gyik", "CH").map((d) => d.href)).toContain("/segitseg");
    expect(searchDestinations("szakmai szótár", "DE").map((d) => d.href)).toContain("/allasok/szakmai-szotar");
    expect(searchDestinations("ranglista", "CH").map((d) => d.href)).toContain("/ranglista");
    expect(searchDestinations("értesítés", "NL").map((d) => d.href)).toContain("/ertesitesek");
    // 2026-07-16: a Sajátjaim a Piactér füle (piactér-összevonás).
    expect(searchDestinations("saját posztjaim", "CH").map((d) => d.href)).toContain("/sajatjaim");
  });
});

describe("quickActions — üres állapot gyorsműveletei", () => {
  it("kurált, nem üres lista, létező célokra mutat", () => {
    const qa = quickActions("CH");
    expect(qa.length).toBeGreaterThanOrEqual(4);
    const all = new Set(APP_DESTINATIONS.map((d) => d.href));
    for (const d of qa) expect(all.has(d.href)).toBe(true);
  });

  it("mind a 4 országban működik (feature-gate nem hagy zsákutcát)", () => {
    for (const c of ["CH", "AT", "DE", "NL"]) {
      const qa = quickActions(c);
      expect(qa.length).toBeGreaterThanOrEqual(4);
      expect(qa.map((d) => d.href)).toContain("/szaknevsor");
    }
  });
});

describe("highlightTitle — találat-kiemelés (ékezet-tudatos)", () => {
  it("accent-mentes token kiemeli az accentes cím-szakaszt", () => {
    const seg = highlightTitle("Bérkalkulátor", ["berkalk"]);
    expect(seg).toEqual([
      { text: "Bérkalk", hit: true },
      { text: "ulátor", hit: false },
    ]);
  });

  it("több token, átfedő sávok összeolvadnak", () => {
    const seg = highlightTitle("Iránytű", ["irany", "anytu"]);
    expect(seg).toEqual([{ text: "Iránytű", hit: true }]);
  });

  it("token nélkül / nincs találat → egyetlen kiemelés-mentes szakasz", () => {
    expect(highlightTitle("Szaknévsor", [])).toEqual([{ text: "Szaknévsor", hit: false }]);
    expect(highlightTitle("Szaknévsor", ["xyz"])).toEqual([{ text: "Szaknévsor", hit: false }]);
  });

  it("ß-expanzió (Straße) mellett sem csúszik el az index-térkép", () => {
    const seg = highlightTitle("Straße teszt", ["strasse"]);
    expect(seg[0]).toEqual({ text: "Straße", hit: true });
    expect(seg.map((s) => s.text).join("")).toBe("Straße teszt");
  });

  it("a szakaszok visszaolvasva mindig a teljes címet adják", () => {
    for (const [title, toks] of [
      ["Gyorshajtás-bírság becslő", ["birsag"]],
      ["Hazautalás / Árfolyam", ["arfolyam", "haza"]],
      ["Szakmai szótár", ["szotar"]],
    ] as const) {
      const seg = highlightTitle(title, [...toks]);
      expect(seg.map((s) => s.text).join("")).toBe(title);
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
