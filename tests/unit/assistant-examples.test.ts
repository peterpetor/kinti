import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ASSISTANT_EXAMPLES, assistantExamples } from "../../src/lib/assistant-examples";
import { scoreGuides } from "../../src/lib/assistant-match";
import { heuristicParseSearch } from "../../src/lib/search-heuristic";
import { getGuides } from "../../src/lib/guides";

/**
 * Az Asszisztens példakérdései.
 *
 * ⚠️ FELHASZNÁLÓI BEJELENTÉSBŐL: „beírom a példamondatot a keresőbe, és
 * Angliában meg Spanyolországban nem működik — kiírja, hogy nem találta, pedig
 * ő ajánlotta." A közös példa a csőtörés volt; `gazvez` kategóriában viszont
 * GB/ES/NL-ben NULLA vállalkozásunk van.
 *
 * Ez a teszt a VALÓDI motorokkal méri, hogy minden felkínált példa
 * megválaszolható-e — nem elég, hogy „van szövege".
 */

const ORSZAGOK = ["CH", "AT", "DE", "NL", "GB", "ES"] as const;

/** A D1-ből kimentett kategória-lista (a heurisztika ezt kapja élesben is). */
const KATEGORIAK: { id: string; label: string }[] = JSON.parse(
  readFileSync(resolve(process.cwd(), "tests/fixtures/categories.json"), "utf8"),
).filter((c: { id: string }) => c.id !== "all");

describe("példakérdések — szerkezet", () => {
  it.each(ORSZAGOK)("%s: van legalább 3 példa", (c) => {
    expect(assistantExamples(c).length).toBeGreaterThanOrEqual(3);
  });

  it("⚠️ ismeretlen országra ÜRES lista (nem esik vissza a svájcira)", () => {
    expect(assistantExamples("HU")).toEqual([]);
    expect(assistantExamples("")).toEqual([]);
  });

  it("nincs duplikált példa egy országon belül", () => {
    for (const [c, lista] of Object.entries(ASSISTANT_EXAMPLES)) {
      const t = lista.map((x) => x.text);
      expect(t.filter((x, i) => t.indexOf(x) !== i), `${c}: duplikált példa`).toEqual([]);
    }
  });

  it("a példák elférnek a chipen (nem túl hosszúak)", () => {
    for (const [c, lista] of Object.entries(ASSISTANT_EXAMPLES)) {
      for (const ex of lista) {
        expect(ex.text.length, `${c}: túl hosszú példa — ${ex.text}`).toBeLessThan(50);
        expect(ex.text.trim().length, `${c}: üres példa`).toBeGreaterThan(8);
      }
    }
  });
});

describe("⚠️ példakérdések — MINDEGYIK megválaszolható", () => {
  it.each(ORSZAGOK)("%s: minden példa ad találatot (cikk VAGY szakember-kategória)", (c) => {
    const guides = getGuides(c).map((g) => ({ slug: g.slug, title: g.title, summary: g.summary }));
    const bukott: string[] = [];
    for (const ex of assistantExamples(c)) {
      const cikkek = scoreGuides(ex.text, guides);
      const heur = heuristicParseSearch(ex.text, c, KATEGORIAK);
      const van = cikkek.length > 0 || (ex.categoryId != null && heur?.categoryId === ex.categoryId);
      if (!van) bukott.push(`„${ex.text}” (cikk: ${cikkek.length}, heurisztika: ${heur?.categoryId ?? "null"})`);
    }
    expect(bukott, `${c}: NEM megválaszolható példa — pont ez volt a bejelentett hiba: ${bukott.join(" | ")}`).toEqual([]);
  });

  it.each(ORSZAGOK)("%s: a szakma-példát a heurisztika DETERMINISZTIKUSAN felismeri (nincs AI-kvóta)", (c) => {
    for (const ex of assistantExamples(c)) {
      if (ex.categoryId == null) continue;
      const h = heuristicParseSearch(ex.text, c, KATEGORIAK);
      expect(h?.categoryId, `${c}: „${ex.text}” az AI-ra esne (kvótát égetne, és nem determinisztikus)`).toBe(
        ex.categoryId,
      );
    }
  });

  it("⚠️ egyetlen példa sem használ olyan kategóriát, amiben nincs adatunk", () => {
    // A `gazvez` (víz-gáz szerelő) az eredeti hiba forrása: GB/ES/NL-ben 0 tétel.
    // Ha bárhol visszakerülne példaként, ez a teszt megfogja.
    for (const [c, lista] of Object.entries(ASSISTANT_EXAMPLES)) {
      for (const ex of lista) {
        expect(ex.categoryId, `${c}: a „gazvez” kategória nem alkalmas példának (GB/ES/NL-ben nincs adat)`).not.toBe(
          "gazvez",
        );
      }
    }
  });

  it("⚠️ a régi, ország-független csőtörés-példa NEM tért vissza", () => {
    const s = readFileSync(resolve(process.cwd(), "src/components/kinti-assistant.tsx"), "utf8");
    const kod = s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    expect(kod, "visszakerült a bedrótozott példa-lista").not.toMatch(/Csőtörés van/);
    expect(kod, "a komponens nem ország-függő példát használ").toMatch(/assistantExamples\(country\)/);
  });
});
