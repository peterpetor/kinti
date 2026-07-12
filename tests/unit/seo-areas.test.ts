import { describe, it, expect } from "vitest";
import { SEO_AREAS, areaFromSlug, addressMatchesCity, businessInArea } from "@/lib/seo-areas";
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

  it("mind a 9 AT + 16 DE + 12 NL régióhoz van terület-oldal", () => {
    for (const country of ["AT", "DE", "NL"] as const) {
      const covered = new Set(SEO_AREAS.filter((a) => a.country === country && !a.cityMatch).map((a) => a.code));
      for (const r of REGIONS[country]) {
        expect(covered.has(r.code), `${country}/${r.code} lefedetlen`).toBe(true);
      }
    }
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
