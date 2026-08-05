import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { globSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Csúszka — egyetlen forrás.
 *
 * ⚠️ VALÓS, MÉRT HIBÁBÓL: sötét témán a csúszka sínje VAKÍTÓ FEHÉR volt. Az
 * `accent-color` (Tailwind `accent-primary`) csak a KITÖLTÖTT részt és a
 * fogantyút színezi; a kitöltetlen sín a böngésző világos alapértelmezése
 * marad, és ezen a `color-scheme: dark` sem segít.
 *
 * A sín csak `appearance: none` mellett színezhető át — az viszont a
 * KITÖLTÉST is elviszi. Ezért a kitöltés gradiens, amihez ismerni kell az
 * arányt: ezt a `RangeSlider` adja át `--kitoltes`-ként.
 *
 * ⚠️ Nyers `<input type="range">` esetén a `--kitoltes` hiányzik, és a
 * gradiens a tartalék 50%-nál rajzol — a zöld sáv ELVÁLNA a fogantyútól.
 * Ez a teszt ezt fogja meg.
 */

const GYOKER = resolve(__dirname, "../..");
const KIVETEL = "src/components/ui/range-slider.tsx";

describe("csúszka — nincs nyers input", () => {
  const fajlok = globSync("src/**/*.tsx", { cwd: GYOKER }).map((f) => f.replace(/\\/g, "/"));

  it("legalább egy tsx-et megtalált (a keresés maga se romolhat el némán)", () => {
    expect(fajlok.length).toBeGreaterThan(50);
  });

  it("⚠️ `type=\"range\"` CSAK a RangeSlider komponensben szerepel", () => {
    const vetkesek = fajlok.filter((f) => {
      if (f === KIVETEL) return false;
      return /type=\s*["']range["']/.test(readFileSync(resolve(GYOKER, f), "utf8"));
    });
    expect(vetkesek, `nyers csúszka (használd a RangeSlider-t): ${vetkesek.join(", ")}`).toEqual([]);
  });

  it("a RangeSlider tényleg átadja a kitöltés-arányt", () => {
    const src = readFileSync(resolve(GYOKER, KIVETEL), "utf8");
    expect(src).toContain("--kitoltes");
    // Nullával osztás ellen (min === max) — enélkül NaN% kerülne a stílusba.
    expect(src).toMatch(/tartomany > 0/);
  });
});

describe("csúszka — a globális stílus", () => {
  const css = readFileSync(resolve(GYOKER, "src/app/globals.css"), "utf8");

  it("a sín token-alapú, nem fix szín", () => {
    expect(css).toMatch(/slider-runnable-track/);
    expect(css).toMatch(/var\(--kitoltes/);
  });

  it("⚠️ a nyers CSS a `--text` tokent használja, NEM a `--ink` aliast", () => {
    // Az `ink` csak Tailwind-alias. A `var(--ink)` definiálatlan, attól pedig az
    // EGÉSZ gradiens érvénytelen lesz, és a sín nyom nélkül eltűnik — nem
    // hibaüzenettel, hanem üres csíkkal. Pontosan ez történt először.
    const blokk = css.slice(css.indexOf('input[type="range"]'), css.indexOf("Egységes press-feedback"));
    expect(blokk).not.toMatch(/var\(--ink\b/);
    expect(blokk).toMatch(/var\(--text\b/);
  });
});
