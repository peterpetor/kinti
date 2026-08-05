import { describe, it, expect } from "vitest";
import { readFileSync, globSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Nem létező Tailwind-osztályok.
 *
 * ⚠️ VALÓS HIBÁBÓL (2026-08-05). Öt fájlban `border-border-subtle`,
 * `bg-background` és `text-border-subtle` állt — EGYIK SEM létezik a
 * `tailwind.config.ts` palettájában. Az ilyen osztály NEM hibázik: a Tailwind
 * egyszerűen nem generál hozzá szabályt, tehát némán SEMMI stílus nem
 * érvényesül. A `/nyelvlecke` ragadós fejléce emiatt átlátszó volt, keret
 * nélkül — a tartalom olvashatatlanul úszott át alatta.
 *
 * ⚠️ MIÉRT PONT EZEK A NEVEK: mind a shadcn/ui alapértelmezett token-készletéből
 * valók. Példakódot bemásolva kerülnek be, és a Kinti palettájában (bg, surface,
 * ink, line, primary, accent…) nincs párjuk. Ezért a szűrő SZÁNDÉKOSAN erre a
 * családra megy, nem „minden ismeretlen szó"-ra — az tele lenne hamis
 * találattal (bg-white, text-red-500, border-t, bg-gradient-to-br).
 */

const GYOKER = resolve(__dirname, "../..");

/** shadcn/ui token-nevek, amikre a Kinti-palettában NINCS megfelelő. */
const IDEGEN_TOKENEK = [
  "background",
  "foreground",
  "border-subtle",
  "muted-foreground",
  "card-foreground",
  "primary-foreground",
  "secondary-foreground",
  "accent-foreground",
  "destructive-foreground",
  "popover",
  "popover-foreground",
];

const ELOTAGOK = ["bg", "text", "border", "from", "to", "via", "divide", "ring", "fill", "stroke"];

describe("nincs halott Tailwind-osztály", () => {
  const fajlok = globSync("src/**/*.tsx", { cwd: GYOKER }).map((f) => f.replace(/\\/g, "/"));

  it("legalább néhány tsx-et megtalált (a keresés se romolhat el némán)", () => {
    expect(fajlok.length).toBeGreaterThan(50);
  });

  it.each(IDEGEN_TOKENEK)("`%s` sehol nem szerepel osztálynévként", (token) => {
    const minta = new RegExp(`\\b(${ELOTAGOK.join("|")})-${token}\\b`);
    const vetkesek: string[] = [];
    for (const f of fajlok) {
      const sorok = readFileSync(resolve(GYOKER, f), "utf8").split(String.fromCharCode(10));
      sorok.forEach((sor, i) => {
        if (minta.test(sor)) vetkesek.push(`${f}:${i + 1}`);
      });
    }
    expect(
      vetkesek,
      `nem létező osztály (Kinti-token kell: bg/surface/ink/line/primary/accent): ${vetkesek.slice(0, 6).join(", ")}`,
    ).toEqual([]);
  });

  it("a szűrő NEM riaszt a valódi Tailwind-osztályokra", () => {
    // ⚠️ Mindkét irányban ellenőrizni kell: egy túl tág minta a `bg-white`-ra
    // vagy a `border-t`-re is bukna, és akkor a tesztet kikapcsolnák.
    const artalmatlan = 'className="bg-white text-red-500 border-t bg-gradient-to-br from-primary/10 ring-2"';
    for (const token of IDEGEN_TOKENEK) {
      expect(new RegExp(`\\b(${ELOTAGOK.join("|")})-${token}\\b`).test(artalmatlan)).toBe(false);
    }
  });
});
