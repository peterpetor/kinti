import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { COUNTRIES } from "@/lib/countries";

const SRC = readFileSync(
  resolve(process.cwd(), "src/app/(app)/pro/page.tsx"),
  "utf8",
);

/** Zászló-emojik, amiknek NEM szabad szövegbe hardkódolva lenniük. */
const FLAG_EMOJI = /[\u{1F1E6}-\u{1F1FF}]{2}|\u{1F3F4}[\u{E0060}-\u{E007F}]+/gu;

/**
 * ⚠️ EZT A TESZTET EGY USER-BEJELENTÉS SZÜLTE (2026-07-30, képernyőképpel):
 * a PRO-lapon KÉTSZER jelent meg az angol és a spanyol zászló.
 *
 * Ok: a hat ország zászló-sora KILENC helyen (3 nyelv × 3 termék) volt
 * emojiként beírva a leíró szövegbe, és hatban duplikálva szerepelt az
 * Anglia+Spanyolország pár. Kilenc kézzel másolt stringet nem lehet szinkronban
 * tartani — ez a hardkódolt-ismételt-string hibaosztály.
 *
 * ⚠️ MÁSODIK, REJTETTEBB HIBA ugyanott: az angol zászló tag-sequence emoji,
 * amit a WINDOWS NEM RENDEREL (sima fekete lobogó lesz belőle). A projektben ez
 * már három külön hibakörön átment; a szabály azóta: React-elemben CountryFlag
 * SVG-komponens, nem emoji.
 *
 * A megoldás mindkettőre ugyanaz: a zászlók EGY forrásból (COUNTRIES)
 * renderelődnek SVG-ként. Ez a teszt azt védi, hogy ne kerüljenek vissza.
 */
describe("PRO-lap zászló-sor", () => {
  it("⚠️ NINCS zászló-emoji a lap szövegeibe hardkódolva", () => {
    const found = SRC.match(FLAG_EMOJI) ?? [];
    expect(
      found,
      `zászló-emoji került a PRO-lapra (${found.length} db) — használd a CountryFlagRow-t`,
    ).toEqual([]);
  });

  it("a zászló-sor a COUNTRIES-ból renderel, nem kézi listából", () => {
    expect(SRC).toContain("COUNTRIES.map");
    expect(SRC).toContain("CountryFlag");
  });

  /**
   * ⚠️ A SZÖVEGBEN SZEREPLŐ ORSZÁG-SZÁM is elcsúszhat: élesben már előfordult,
   * hogy a zászló-sor 5 elemű volt, a cím viszont „4 ország"-ot írt. A prózában
   * lévő számot ezért a COUNTRIES hosszához kötjük.
   */
  it("⚠️ a szövegekben szereplő ország-szám EGYEZIK a valódi ország-számmal", () => {
    const n = COUNTRIES.length;
    // Minden „N ország…" alakú előfordulás a helyes számot használja.
    const mentions = SRC.match(/(\d+)\s+(ország|orszá|Länder|countries)/gu) ?? [];
    expect(mentions.length, "nincs ország-szám a szövegben").toBeGreaterThan(0);
    for (const m of mentions) {
      const num = Number(/(\d+)/.exec(m)![1]);
      expect(num, `„${m}" — a valódi ország-szám ${n}`).toBe(n);
    }
  });

  it("mind a hat országhoz van zászló-rajz (nem esik semleges szürkére)", async () => {
    const flagSrc = readFileSync(
      resolve(process.cwd(), "src/components/ui/country-flag.tsx"),
      "utf8",
    );
    const defined = new Set(
      [...flagSrc.matchAll(/^\s{2}([A-Z]{2}):\s*\(/gm)].map((m) => m[1]),
    );
    for (const c of COUNTRIES) {
      expect(defined.has(c.code), `${c.code}: nincs zászló a CountryFlag-ben`).toBe(true);
    }
  });
});
