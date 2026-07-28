import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Forrás-szintű őr egy user-jelentette PRODUKCIÓS hibára (2026-07-29): a
 * vállalkozás-kártyákon a kategória-címke tördelhetett, mert nem volt rajta
 * `truncate`. A mező 50 karaktert enged (BUSINESS_LIMITS.labelMax), így egy
 * hosszabb saját megnevezés („Magyar bolt, pékség és kávézó") 4-5 sorra tört,
 * és a kártya jóval magasabb lett a szomszédainál — a térkép-carousel és a
 * lista is egyenetlenné vált.
 *
 * ⚠️ Miért forrás-ellenőrzés: a projekt vitest-környezete szándékosan böngésző
 * NÉLKÜLI (`environment: "node"`, nincs jsdom, és ne is telepíts) — renderelt
 * DOM-ot nem tudunk mérni, a class-invariánst viszont igen.
 */
const FILES = [
  "src/components/ui/business-card.tsx",
  "src/components/views/business-map.tsx",
];

function read(rel: string): string {
  return readFileSync(resolve(process.cwd(), rel), "utf8");
}

describe("kártya: a kategória-címke egy sor marad", () => {
  it.each(FILES)("%s — a {b.categoryLabel} elemén ott a truncate", (file) => {
    const src = read(file);
    // A címkét renderelő elem nyitó tagje közvetlenül a {b.categoryLabel} előtt.
    const m = /<span([^>]*)>\s*\{b\.categoryLabel\}/.exec(src);
    expect(m, `nem találom a kategória-címke <span>-jét itt: ${file}`).not.toBeNull();
    expect(m![1]).toContain("truncate");
  });

  it.each(FILES)("%s — a címke sorát flex-doboz fogja, min-w-0-val", (file) => {
    const src = read(file);
    // ⚠️ NEM a fájl első `{b.categoryLabel}`-jétől indulunk: azt a
    // <CategoryIcon categoryLabel={…}> propja is tartalmazza.
    const m = /<span([^>]*)>\s*\{b\.categoryLabel\}/.exec(src);
    expect(m).not.toBeNull();
    // A címke-span KÖZVETLEN szülője a sor: flex + min-w-0 kell hozzá, hogy a
    // truncate egyáltalán érvényre jusson (különben a sor a tartalomra nő).
    const before = src.slice(0, m!.index);
    const parent = /<div className="([^"]*)"[^>]*>\s*$/.exec(before);
    expect(parent, `nem találom a címke-sor <div>-jét itt: ${file}`).not.toBeNull();
    expect(parent![1]).toContain("flex");
    expect(parent![1]).toContain("min-w-0");
  });
});
