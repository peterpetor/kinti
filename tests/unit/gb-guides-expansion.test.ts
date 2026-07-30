import { describe, it, expect } from "vitest";
import { GUIDES_GB, getGuide, relatedCategoriesForGuide, isMoneyGuide } from "@/lib/guides";
import { GUIDE_COMPARISONS } from "@/lib/guide-comparisons";

/**
 * ⚠️ A GB TUDÁSBÁZIS FELÉNYI MÉRETŰ VOLT a többi országénál (8 cikk a
 * CH 21 / AT 22 / DE 18 / NL 20 / ES 12 mellett) — hiányzott a munkavállalás,
 * a családi pótlék, a nyugdíj, a munkanélküli-ellátás, a vállalkozásindítás
 * és a TV Licence. Ez a teszt azt védi, hogy a bővítés (2026-07-30) ne
 * kophasson vissza egy jövőbeli refaktornál, és hogy az új cikkek ugyanazt a
 * fegyelmet kövessék, mint a meglévők (hivatalos forrás, nem üres szekció).
 */
const NEW_SLUGS = [
  "gb-munkavallalas",
  "gb-csaladi-potlek",
  "gb-nyugdij",
  "gb-munkanelkuli",
  "gb-vallalkozas",
  "gb-tv-dij",
];

describe("GB tudásbázis-bővítés", () => {
  it("⚠️ a GB cikkszám nem csökkenhet 14 alá (a bővítés előtti 8-hoz képest)", () => {
    expect(GUIDES_GB.length).toBeGreaterThanOrEqual(14);
  });

  it("mind a 6 új slug létezik és megtalálható a getGuide()-dal", () => {
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
   * ⚠️ A CIKKEK HIVATALOS gov.uk FORRÁSRA HIVATKOZNAK — ez a projekt egyik
   * alapelve (ld. ai-content-accuracy memória: hivatali szótár/forrás
   * kurált-előbb). Ez a teszt azt zárja ki, hogy egy jövőbeli szerkesztés
   * harmadik féltől származó (nem hivatalos) linket csempésszen be forrásként.
   */
  it("⚠️ minden forrás gov.uk https URL", () => {
    for (const slug of NEW_SLUGS) {
      const g = getGuide(slug)!;
      expect(g.sources.length, `${slug}: nincs forrás`).toBeGreaterThan(0);
      for (const src of g.sources) {
        expect(src.url, `${slug} forrás "${src.label}"`).toMatch(/^https:\/\/www\.gov\.uk\//);
      }
    }
  });

  it("nincs duplikált slug a GUIDES_GB tömbben", () => {
    const slugs = GUIDES_GB.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  /**
   * ⚠️ A meglévő 5 összehasonlító tábla (munkavállalás/munkanélküli/
   * családi pótlék/nyugdíj/vállalkozás) MÁR TARTALMAZOTT GB-adatot a `rows`
   * mezőben, csak a `slugs.gb` hiányzott — vagyis a táblázat sosem jelent meg
   * a GB-cikkeken, mert azok nem léteztek. Most, hogy a cikkek megvannak, a
   * `slugs.gb`-nek is léteznie kell, különben a bővítés féloldalas marad.
   */
  it("⚠️ a kapcsolódó összehasonlító táblák GB-slugja az ÚJ cikkekre mutat", () => {
    const expectGbSlug: Record<string, string> = {
      munkavallalas: "gb-munkavallalas",
      "munkanelkuli": "gb-munkanelkuli",
      "csaladi-potlek": "gb-csaladi-potlek",
      nyugdij: "gb-nyugdij",
      vallalkozas: "gb-vallalkozas",
    };
    for (const [tableId, slug] of Object.entries(expectGbSlug)) {
      const table = GUIDE_COMPARISONS.find((t) => t.id === tableId);
      expect(table, `nincs "${tableId}" tábla`).toBeDefined();
      expect(table!.slugs.gb, `"${tableId}" tábla slugs.gb`).toBe(slug);
    }
  });

  it("a topik-mappingen keresztül szaknévsor-kategóriák kapcsolódnak az új cikkekhez", () => {
    expect(relatedCategoriesForGuide("gb-munkavallalas").length).toBeGreaterThan(0);
    expect(relatedCategoriesForGuide("gb-csaladi-potlek").length).toBeGreaterThan(0);
    expect(relatedCategoriesForGuide("gb-nyugdij").length).toBeGreaterThan(0);
    expect(relatedCategoriesForGuide("gb-munkanelkuli").length).toBeGreaterThan(0);
    expect(relatedCategoriesForGuide("gb-vallalkozas").length).toBeGreaterThan(0);
  });

  /**
   * ⚠️ A GB (ÉS ES) CIKKEK EDDIG TELJESEN HIÁNYOZTAK a hazautalás-CTA
   * listájából — nem tudatos kizárás volt, csak a lista nem lett bővítve.
   */
  it("⚠️ a pénz-témájú GB/ES cikkek megkapják a hazautalás-CTA jelzőt", () => {
    for (const slug of ["gb-adozas", "gb-bankszamla", "gb-munkavallalas", "gb-nyugdij", "gb-csaladi-potlek", "gb-munkanelkuli", "gb-vallalkozas"]) {
      expect(isMoneyGuide(slug), slug).toBe(true);
    }
    for (const slug of ["es-adozas", "es-bankszamla", "es-autonomo"]) {
      expect(isMoneyGuide(slug), slug).toBe(true);
    }
  });

  it("a TV Licence cikknek NINCS pénz-CTA jelzője (nem bér/ellátás témájú)", () => {
    expect(isMoneyGuide("gb-tv-dij")).toBe(false);
  });
});
