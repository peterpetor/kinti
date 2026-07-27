import { describe, it, expect } from "vitest";
import { GUIDE_COMPARISONS } from "@/lib/guide-comparisons";
import { getGuide } from "@/lib/guides";

describe("összehasonlító táblák", () => {
  it("minden sor mind az öt oszlopot kitölti", () => {
    for (const table of GUIDE_COMPARISONS) {
      expect(table.rows.length, `${table.id} sorok`).toBeGreaterThan(0);
      for (const row of table.rows) {
        for (const col of ["ch", "at", "de", "nl", "gb"] as const) {
          expect(row[col]?.trim(), `${table.id} / ${row.label} / ${col}`).toBeTruthy();
        }
      }
    }
  });

  it("a slugok létező tudásbázis-cikkre mutatnak", () => {
    // Hibás slug = néma halott link a táblázat alatt („Tovább a cikkre").
    for (const table of GUIDE_COMPARISONS) {
      for (const [country, slug] of Object.entries(table.slugs)) {
        if (!slug) continue;
        expect(getGuide(slug), `${table.id} / ${country} → ${slug}`).toBeDefined();
      }
    }
  });

  /**
   * ⚠️ A legdrágább hiba ezen a lapon: a bevezető EU-s általánosítást állít
   * („mindenhol", „mind az öt országban"), miközben a GB-oszlop épp az
   * ellenkezőjét mondja — Angliára Brexit óta nem áll a szabad letelepedés,
   * az engedély nélküli munkavállalás, az U1-beszámítás és a családi ellátás
   * EU-koordinációja. Ha általánosítasz, Angliát nevesítened KELL.
   */
  it("az általánosító bevezetők nevesítik Angliát", () => {
    const universal = /\bmindenhol\b|\bminden országban\b|mind a[zt]? \w+ országban/i;
    for (const table of GUIDE_COMPARISONS) {
      if (!universal.test(table.intro)) continue;
      expect(
        // „Angli" tő: Anglia / Angliában / Angliára (a toldalék á-t ejt).
        /Angli|Brexit|angol/i.test(table.intro),
        `${table.id}: a bevezető általánosít, de nem tér ki Angliára — "${table.intro}"`,
      ).toBe(true);
    }
  });

  it("nincs elavult ország-darabszám a feliratokban", () => {
    // Az országok száma nő; a hardcode-olt „4/5 országban" felirat elavul, és
    // a látható oszlopszámnak mond ellent. A feliratok szándékosan szám nélküliek.
    for (const table of GUIDE_COMPARISONS) {
      expect(table.caption, `${table.id} felirat`).not.toMatch(/\b\d+ ország/);
    }
  });
});
