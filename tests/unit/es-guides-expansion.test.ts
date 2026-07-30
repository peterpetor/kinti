import { describe, it, expect } from "vitest";
import { GUIDES_ES, getGuide, relatedCategoriesForGuide, isMoneyGuide } from "@/lib/guides";
import { GUIDE_COMPARISONS } from "@/lib/guide-comparisons";

/**
 * A spanyol (ES) tudásbázis 12 cikkből állt, míg a nyugdíj és a
 * munkanélküli-ellátás (SEPE/paro) témája hiányzott — pedig ez a két
 * legkeresettebb pénzügyi témájú cikk a többi országnál. Ez a teszt védi a
 * 2026-07-30-i bővítést (es-nyugdij, es-munkanelkuli) egy jövőbeli
 * refaktortól, ugyanazzal a fegyelemmel, mint a GB-bővítés tesztje
 * (gb-guides-expansion.test.ts).
 */
const NEW_SLUGS = ["es-nyugdij", "es-munkanelkuli"];

describe("ES tudásbázis-bővítés", () => {
  it("⚠️ az ES cikkszám nem csökkenhet 14 alá (a bővítés előtti 12-höz képest)", () => {
    expect(GUIDES_ES.length).toBeGreaterThanOrEqual(14);
  });

  it("mind a 2 új slug létezik és megtalálható a getGuide()-dal", () => {
    for (const slug of NEW_SLUGS) {
      const g = getGuide(slug);
      expect(g, `${slug}: nem található`).toBeDefined();
      expect(g!.title.length, `${slug}: üres cím`).toBeGreaterThan(3);
      expect(g!.summary.length, `${slug}: üres summary`).toBeGreaterThan(10);
    }
  });

  it("mindegyiknek van tldr, legalább 2 elemmel", () => {
    for (const slug of NEW_SLUGS) {
      const g = getGuide(slug)!;
      expect(g.tldr?.length ?? 0, `${slug}: tldr`).toBeGreaterThanOrEqual(2);
    }
  });

  it("mindegyiknek van legalább 3 szekciója (body VAGY bullets nem üres)", () => {
    for (const slug of NEW_SLUGS) {
      const g = getGuide(slug)!;
      expect(g.sections.length, `${slug}: szekciók száma`).toBeGreaterThanOrEqual(3);
      for (const s of g.sections) {
        const hasContent = (s.body?.length ?? 0) > 0 || (s.bullets?.length ?? 0) > 0;
        expect(hasContent, `${slug} / "${s.heading}": üres szekció`).toBe(true);
      }
    }
  });

  /**
   * ⚠️ A CIKKEK HIVATALOS spanyol állami forrásra hivatkoznak
   * (seg-social.es / sepe.es) — ld. ai-content-accuracy memória.
   */
  it("⚠️ minden forrás seg-social.es vagy sepe.es https URL", () => {
    for (const slug of NEW_SLUGS) {
      const g = getGuide(slug)!;
      expect(g.sources.length, `${slug}: nincs forrás`).toBeGreaterThan(0);
      for (const src of g.sources) {
        expect(src.url, `${slug} forrás "${src.label}"`).toMatch(
          /^https:\/\/www\.(seg-social|sepe)\.es\//
        );
      }
    }
  });

  it("nincs duplikált slug a GUIDES_ES tömbben", () => {
    const slugs = GUIDES_ES.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  /**
   * ⚠️ A "nyugdij" és "munkanelkuli" összehasonlító tábla MÁR TARTALMAZOTT
   * ES-adatot a `rows` mezőben, csak a `slugs.es` hiányzott — a táblázat
   * sosem jelent meg egyetlen ES-cikken sem, mert azok nem léteztek.
   */
  it("⚠️ a kapcsolódó összehasonlító táblák ES-slugja az ÚJ cikkekre mutat", () => {
    const expectEsSlug: Record<string, string> = {
      nyugdij: "es-nyugdij",
      munkanelkuli: "es-munkanelkuli",
    };
    for (const [tableId, slug] of Object.entries(expectEsSlug)) {
      const table = GUIDE_COMPARISONS.find((t) => t.id === tableId);
      expect(table, `nincs "${tableId}" tábla`).toBeDefined();
      expect(table!.slugs.es, `"${tableId}" tábla slugs.es`).toBe(slug);
    }
  });

  it("a topik-mappingen keresztül szaknévsor-kategóriák kapcsolódnak az új cikkekhez", () => {
    expect(relatedCategoriesForGuide("es-nyugdij").length).toBeGreaterThan(0);
    expect(relatedCategoriesForGuide("es-munkanelkuli").length).toBeGreaterThan(0);
  });

  it("⚠️ a két új pénz-témájú cikk megkapja a hazautalás-CTA jelzőt", () => {
    for (const slug of NEW_SLUGS) {
      expect(isMoneyGuide(slug), slug).toBe(true);
    }
  });
});
