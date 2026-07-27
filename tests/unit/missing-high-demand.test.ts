import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const SRC = readFileSync(join(process.cwd(), "src/components/views/explore-view.tsx"), "utf8");

/**
 * A „hiányzó szakmák" blokk a Szaknévsor lista alján azokat a NAGY KERESLETŰ
 * kategóriákat írja ki, amikből az adott országban nulla a találat.
 *
 * ⚠️ Miért kell rá teszt: ezek a kategóriák a pill-sorban NEM jelennek meg
 * (`visibleCategories` kiszűri az üreseket), tehát ha itt elgépeled a
 * kategória-kulcsot, a chip vagy nem jelenik meg, vagy egy nem létező
 * kategóriára visz az ajánló-űrlapon — és néma marad, mert semmi sem hasal el.
 */
describe("hiányzó nagy-keresletű szakmák (Szaknévsor)", () => {
  const ids = [...SRC.matchAll(/const HIGH_DEMAND_CATEGORY_IDS = \[([\s\S]*?)\] as const;/g)]
    .flatMap((m) => [...m[1].matchAll(/"([a-z_]+)"/g)].map((x) => x[1]));

  it("a lista nem üres és nincs benne duplikátum", () => {
    expect(ids.length).toBeGreaterThanOrEqual(5);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("⚠️ minden kulcs LÉTEZŐ kategória-id", () => {
    // ⚠️ A categories táblát KÉT forrás tölti: a gen-categories.mjs `ALL`
    // tömbje, ÉS a business-import szkript külön `INSERT OR IGNORE INTO
    // categories` sorai (így jött létre pl. az „elelmiszer"). Mindkettőt
    // nézni kell, különben a teszt létező kulcsot jelent ismeretlennek.
    const known = new Set<string>();
    for (const f of ["scripts/gen-categories.mjs", "scripts/prepare-business-import.mjs"]) {
      const src = readFileSync(join(process.cwd(), f), "utf8");
      for (const m of src.matchAll(/\[\s*'([a-z_]+)'\s*,/g)) known.add(m[1]);
      // ⚠️ NEM `[^)]*` — az oszlop-lista maga is zárójeles
      // („INTO categories (id, label, …) VALUES ('elelmiszer'…”).
      for (const m of src.matchAll(/INTO categories[\s\S]{0,120}?VALUES\s*\(\s*'([a-z_]+)'/g)) {
        known.add(m[1]);
      }
    }
    expect(known.size, "nem sikerült kategória-id-ket olvasni a seed-forrásokból").toBeGreaterThan(50);
    for (const id of ids) {
      expect(known.has(id), `ismeretlen kategória-id: ${id}`).toBe(true);
    }
  });

  it("a blokk az ország-tudatos ragozott alakot használja, nem fix szöveget", () => {
    // „…hiányoznak Angliában/Svájcban” — a countryLocative() adja.
    expect(SRC).toMatch(/hiányoznak \{countryLocative\(country\)\}/);
  });

  it("⚠️ minden ország kap térkép-középpontot (GB is), nincs svájci visszaesés", () => {
    const block = SRC.match(/const COUNTRY_MAP_CENTER[\s\S]*?\n\};/)?.[0] ?? "";
    for (const cc of ["CH", "AT", "DE", "NL", "GB"]) {
      expect(block, `${cc} hiányzik a térkép-középpontokból`).toContain(`${cc}:`);
    }
    const zoom = SRC.match(/const COUNTRY_MAP_ZOOM[^\n]*/)?.[0] ?? "";
    for (const cc of ["CH", "AT", "DE", "NL", "GB"]) {
      expect(zoom, `${cc} hiányzik a térkép-zoomból`).toContain(`${cc}:`);
    }
  });
});
