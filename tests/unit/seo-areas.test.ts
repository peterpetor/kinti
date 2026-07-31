import { describe, it, expect } from "vitest";
import { SEO_AREAS, areaFromSlug, addressMatchesCity, businessInArea, areasForBusiness } from "@/lib/seo-areas";
import { REGIONS } from "@/lib/regions";
import type { Business } from "@/lib/types";

function biz(over: Partial<Business>): Business {
  return {
    id: "t1",
    name: "Teszt",
    categoryId: "fodrasz",
    ...over,
  } as Business;
}

describe("SEO_AREAS konzisztencia", () => {
  it("minden slug egyedi", () => {
    const slugs = SEO_AREAS.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("minden nem-null régió-kód létezik az ország régió-listájában", () => {
    for (const a of SEO_AREAS) {
      if (a.code === null) continue;
      const codes = new Set(REGIONS[a.country].map((r) => r.code));
      expect(codes.has(a.code), `${a.slug}: ismeretlen kód ${a.country}/${a.code}`).toBe(true);
    }
  });

  it("mind a 9 AT + 16 DE + 12 NL + 9 GB (Anglia) régióhoz van terület-oldal", () => {
    // GB = Anglia mind a 9 statisztikai régiója lefedett (2026-07-30).
    for (const country of ["AT", "DE", "NL", "GB"] as const) {
      const covered = new Set(SEO_AREAS.filter((a) => a.country === country && !a.cityMatch).map((a) => a.code));
      for (const r of REGIONS[country]) {
        expect(covered.has(r.code), `${country}/${r.code} lefedetlen`).toBe(true);
      }
    }
  });

  it("ES: a lefedett comunidades + ország-oldal jelen (a szaknévsor-jelenlét szerint)", () => {
    // ⚠️ ES SZÁNDÉKOSAN NEM teljes: csak a szaknévsorban ténylegesen lefedett
    // közösségek + a fő ismertek kapnak oldalt; az üres kombó amúgy is noindex.
    const es = new Set(SEO_AREAS.filter((a) => a.country === "ES" && !a.cityMatch).map((a) => a.code));
    for (const code of ["MD", "CT", "AN", "VC", "CN"]) {
      expect(es.has(code), `ES/${code} lefedetlen`).toBe(true);
    }
    expect(SEO_AREAS.some((a) => a.country === "ES" && a.code === null), "nincs ES ország-oldal").toBe(true);
  });

  it("név és helyhatározó minden területen kitöltött", () => {
    for (const a of SEO_AREAS) {
      expect(a.name.length, a.slug).toBeGreaterThan(1);
      expect(a.locative.length, a.slug).toBeGreaterThan(3);
    }
  });
});

describe("addressMatchesCity — szó-határos illesztés", () => {
  it("város a cím végén / közepén illeszkedik (kis-nagybetű-független)", () => {
    expect(addressMatchesCity("Hauptstr. 5, 50667 Köln", ["Köln"])).toBe(true);
    expect(addressMatchesCity("Hauptstr. 5, 50667 KÖLN, Deutschland", ["Köln"])).toBe(true);
    expect(addressMatchesCity("Laan van Meerdervoort 1, 2517 Den Haag", ["Den Haag", "'s-Gravenhage"])).toBe(true);
  });

  it("szó-részlet NEM illeszkedik (Kölner Straße ≠ Köln)", () => {
    expect(addressMatchesCity("Kölner Str. 12, 53111 Bonn", ["Köln"])).toBe(false);
    expect(addressMatchesCity("Stuttgarter Platz 3, 10627 Berlin", ["Stuttgart"])).toBe(false);
  });

  it("üres / hiányzó cím → false", () => {
    expect(addressMatchesCity(null, ["Köln"])).toBe(false);
    expect(addressMatchesCity("", ["Köln"])).toBe(false);
  });
});

describe("businessInArea — város-szintű terület", () => {
  const koln = areaFromSlug("koln")!;
  const nw = areaFromSlug("eszak-rajna-vesztfalia")!;

  it("NW-cég kölni címmel: köln + NW oldalon is szerepel", () => {
    const b = biz({ country: "DE", canton: "NW", address: "Domstr. 2, 50668 Köln" });
    expect(businessInArea(b, koln)).toBe(true);
    expect(businessInArea(b, nw)).toBe(true);
  });

  it("NW-cég bonni címmel: NW igen, köln nem (Kölner Str. csapda is)", () => {
    const b = biz({ country: "DE", canton: "NW", address: "Kölner Str. 12, 53111 Bonn" });
    expect(businessInArea(b, koln)).toBe(false);
    expect(businessInArea(b, nw)).toBe(true);
  });

  it("rossz régió-kód: hiába kölni a cím, nem illeszkedik", () => {
    const b = biz({ country: "DE", canton: "BY", address: "Domstr. 2, 50668 Köln" });
    expect(businessInArea(b, koln)).toBe(false);
  });

  it("ország-oldal mindenre illik az országban", () => {
    const de = areaFromSlug("nemetorszag")!;
    expect(businessInArea(biz({ country: "DE", canton: "SH" }), de)).toBe(true);
    expect(businessInArea(biz({ country: "AT", canton: "W" }), de)).toBe(false);
  });
});

/**
 * ⚠️ ÉLESBEN MÉRT HIBA regresszió-védelme.
 *
 * Az `areasForBusiness` eredetileg a TELJES `SEO_AREAS` tömböt (107 elem)
 * végigpásztázta MINDEN vállalkozásra. A /magyar index-hubon ez 2353 cég ×
 * 107 terület = 251 771 `businessInArea` hívás volt — a route a Cloudflare
 * CPU-limitjébe futott, és a teljes /magyar SEO-fa (1056 URL) 520/503-at adott.
 *
 * A javítás ország + régió-kód szerint előindexel. Ez a teszt azt köti, hogy az
 * optimalizálás EGZAKT: pontosan ugyanazt adja, mint a naiv végigpásztázás.
 */
describe("areasForBusiness — az előindexelt változat EGZAKT", () => {
  const naive = (b: Parameters<typeof areasForBusiness>[0]) =>
    SEO_AREAS.filter((a) => businessInArea(b, a));

  const samples: Parameters<typeof areasForBusiness>[0][] = [
    // Minden ország, régió-kóddal és anélkül.
    { country: "CH", canton: "ZH", address: "Bahnhofstrasse 1, 8001 Zürich" },
    { country: "CH", canton: null, address: "8001 Zürich" },            // PLZ-ből oldódik fel
    { country: "CH", canton: null, address: "Genf" },
    { country: "CH", canton: "BE", address: "Spitalgasse 18, 3011 Bern" },
    { country: "AT", canton: "W", address: "Schottenring 19, 1010 Wien" },
    { country: "AT", canton: "ST", address: "Graz" },
    { country: "AT", canton: null, address: "Bécs" },
    { country: "DE", canton: "BY", address: "Marienplatz 1, 80331 München" },
    { country: "DE", canton: "NW", address: "Köln" },
    { country: "DE", canton: "NW", address: "Kölner Straße 5, 40211 Düsseldorf" }, // szó-határos csapda
    { country: "NL", canton: "NH", address: "Amsterdam" },
    { country: "NL", canton: null, address: "Rotterdam" },
    { country: "GB", canton: "LDN", address: "London" },
    { country: "GB", canton: null, address: "Manchester" },
    { country: "ES", canton: "MD", address: "Madrid" },
    { country: "ES", canton: null, address: "Barcelona" },
    // Hiányos / szélső esetek.
    { country: "CH", canton: null, address: null },
    { country: "DE", canton: "XX", address: "ismeretlen" },  // nem létező régió-kód
    { country: "XX" as never, canton: null, address: "sehol" }, // ismeretlen ország
  ];

  it("minden mintára ugyanazt a terület-halmazt adja, mint a naiv szűrés", () => {
    for (const b of samples) {
      const fast = areasForBusiness(b).map((a) => a.slug).sort();
      const slow = naive(b).map((a) => a.slug).sort();
      expect(fast, `eltérés: ${JSON.stringify(b)}`).toEqual(slow);
    }
  });

  it("ismeretlen országra üres tömb (nem dob)", () => {
    expect(areasForBusiness({ country: "XX" as never, canton: null, address: "x" })).toEqual([]);
  });
});
