import { describe, it, expect } from "vitest";
import {
  normalizeText,
  tokenize,
  tokenMatch,
  detectCanton,
  detectCategory,
  scoreBusiness,
  rankBusinesses,
} from "@/lib/global-search";
import type { Business, Category } from "@/lib/types";

// --- Teszt-segédek ----------------------------------------------------------

function mkBiz(partial: Partial<Business> & { name: string }): Business {
  return {
    id: partial.id ?? partial.name,
    name: partial.name,
    categoryId: partial.categoryId ?? "auto",
    categoryLabel: partial.categoryLabel ?? null,
    rating: partial.rating ?? 0,
    reviews: 0,
    distText: null,
    distMeters: null,
    address: partial.address ?? null,
    phone: null,
    pinX: 0,
    pinY: 0,
    lat: null,
    lng: null,
    featured: partial.featured ?? false,
    verified: partial.verified ?? false,
    blurb: partial.blurb ?? null,
    licenseNumber: null,
    openNow: false,
    openText: partial.openText ?? null,
    yearsHere: null,
    languages: partial.languages ?? [],
    photo: null,
    accentPhoto: null,
    logoKey: null,
    galleryKeys: [],
    ownerUserId: null,
  };
}

const CATS: Category[] = [
  { id: "all", label: "Összes", glyph: null, sortOrder: 0 },
  { id: "auto", label: "Autószerelő", glyph: null, sortOrder: 1 },
  { id: "fodrasz", label: "Fodrász", glyph: null, sortOrder: 2 },
  { id: "ugyved", label: "Ügyvéd", glyph: null, sortOrder: 3 },
];

// --- Tesztek ----------------------------------------------------------------

describe("normalizeText", () => {
  it("ékezet-mentes, kisbetűs", () => {
    expect(normalizeText("Fodrászt")).toBe("fodraszt");
    expect(normalizeText("Zürich")).toBe("zurich");
  });
});

describe("tokenize", () => {
  it("kihagyja a stopszavakat és a túl rövid tokeneket", () => {
    expect(tokenize("autószerelőt keresek Aargau-ban")).toEqual(["autoszerelot", "aargau"]);
  });
  it("null/üres → üres tömb", () => {
    expect(tokenize(null)).toEqual([]);
    expect(tokenize("")).toEqual([]);
  });
});

describe("tokenMatch (toldalék-tolerancia)", () => {
  it("ragozott alak illeszkedik a tőre", () => {
    expect(tokenMatch("fodraszt", "fodrasz")).toBe(true);
    expect(tokenMatch("autoszerelot", "autoszerelo")).toBe(true);
  });
  it("rövid prefix nem illeszkedik (false positive védelem)", () => {
    expect(tokenMatch("kor", "korhaz")).toBe(false);
  });
  it("eltérő szavak nem illeszkednek", () => {
    expect(tokenMatch("fodrasz", "ugyved")).toBe(false);
  });
});

describe("detectCanton", () => {
  it("nagybetűs ISO-kód", () => {
    expect(detectCanton("villanyszerelő ZH környékén")?.code).toBe("ZH");
  });
  it("kanton-név ékezet/kisbetű ellenére", () => {
    expect(detectCanton("ügyvéd Zürichben")?.code).toBe("ZH");
    expect(detectCanton("valami Aargau-ban")?.code).toBe("AG");
  });
  it("székhely-városból", () => {
    expect(detectCanton("fodrász Aarau közelében")?.code).toBe("AG");
  });
  it("kisbetűs 2-betűs töltelékszó NEM ad téves kantont", () => {
    // "ne" (nem) ne illeszkedjen a NE (Neuchâtel) kódra
    expect(detectCanton("ne keress semmit")).toBeNull();
  });
});

describe("detectCategory", () => {
  it("ragozott kategória-szó", () => {
    expect(detectCategory("fodrászt keresek", CATS)).toBe("fodrasz");
    expect(detectCategory("kell egy autószerelő", CATS)).toBe("auto");
  });
  it("nincs egyezés → null", () => {
    expect(detectCategory("hol egyek jót", CATS)).toBeNull();
  });
});

describe("scoreBusiness", () => {
  it("a névbeli egyezés többet ér a leírásbelinél", () => {
    const nameHit = mkBiz({ name: "Kovács Autószerviz" });
    const blurbHit = mkBiz({ name: "Általános Kft", blurb: "autószerviz és gumizás" });
    const tokens = tokenize("autószerviz");
    expect(scoreBusiness(nameHit, tokens)).toBeGreaterThan(scoreBusiness(blurbHit, tokens));
  });
  it("nincs token → 0", () => {
    expect(scoreBusiness(mkBiz({ name: "Bármi" }), [])).toBe(0);
  });
});

describe("rankBusinesses", () => {
  it("kanton szerint szűr (cím PLZ-ből)", () => {
    const zh = mkBiz({ name: "ZH cég", address: "Bahnhofstr. 1, 8001 Zürich" });
    const be = mkBiz({ name: "BE cég", address: "Marktgasse 1, 3011 Bern" });
    const out = rankBusinesses([zh, be], { cantonCode: "ZH", queryTokens: [] });
    expect(out.map((b) => b.name)).toEqual(["ZH cég"]);
  });

  it("relevancia szerint rangsorol, a nem-egyezőket kiszűri", () => {
    const hit = mkBiz({ name: "Fodrász Szalon" });
    const miss = mkBiz({ name: "Autószerviz" });
    const out = rankBusinesses([miss, hit], { queryTokens: tokenize("fodrász") });
    expect(out.map((b) => b.name)).toEqual(["Fodrász Szalon"]);
  });

  it("token-egyezés híján verified/featured/értékelés dönt", () => {
    const a = mkBiz({ name: "A", rating: 3 });
    const b = mkBiz({ name: "B", rating: 5 });
    const c = mkBiz({ name: "C", verified: true, rating: 1 });
    const out = rankBusinesses([a, b, c], { queryTokens: [] });
    expect(out.map((x) => x.name)).toEqual(["C", "B", "A"]);
  });
});
