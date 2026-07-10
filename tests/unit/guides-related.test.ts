import { describe, it, expect } from "vitest";
import { GUIDES, guideCountry, relatedGuides } from "@/lib/guides";

describe("relatedGuides", () => {
  it("3 cikket ad, önmaga nélkül, csak a cikk országából", () => {
    for (const g of GUIDES) {
      const rel = relatedGuides(g.slug);
      expect(rel.length).toBe(3);
      expect(rel.some((r) => r.slug === g.slug)).toBe(false);
      for (const r of rel) expect(guideCountry(r.slug)).toBe(guideCountry(g.slug));
    }
  });

  it("determinisztikus (SSG-stabil)", () => {
    const a = relatedGuides("de-nyugdij").map((g) => g.slug);
    const b = relatedGuides("de-nyugdij").map((g) => g.slug);
    expect(a).toEqual(b);
  });

  it("oldalanként változatos — nem minden cikk ugyanazt a hármast linkeli", () => {
    // A régi hiba: az ország ELSŐ 3 cikke ment mindenhová. Az új forgatásnál a
    // DE-cikkek ajánló-hármasai közt legalább 5 különbözőnek kell lennie.
    const deSlugs = GUIDES.filter((g) => guideCountry(g.slug) === "DE").map((g) => g.slug);
    const combos = new Set(deSlugs.map((s) => relatedGuides(s).map((g) => g.slug).sort().join("|")));
    expect(combos.size).toBeGreaterThanOrEqual(5);
  });

  it("topikus rokon előre: a szülés-cikk a családi pótlékot ajánlja (közös topik-család)", () => {
    // de-szules-elterngeld és de-csaladi-potlek ugyanarra a topik-kulcsra képződik.
    const rel = relatedGuides("de-szules-elterngeld").map((g) => g.slug);
    expect(rel).toContain("de-csaladi-potlek");
  });
});
