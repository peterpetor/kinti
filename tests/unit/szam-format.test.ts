import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { szam } from "../../src/lib/szam-format";

/**
 * Determinisztikus számformázás.
 *
 * ⚠️ EZ EGY ÉLES HIBÁBÓL SZÜLETETT. A /berkalkulator lapon a csúszka-felirat
 * `toLocaleString("hu-HU")`-t használt: a prerender-környezet `4300`-at írt a
 * HTML-be (nincs teljes ICU), a böngésző viszont `4 300`-at képzett — a React
 * eldobta a hidratálást (#425 + #422). A testvér-lapok, ahol ez a felirat
 * nincs, tiszták voltak — így lehetett bezárni, hogy tényleg ez az ok.
 */

describe("szam() — magyar ezres tagolás", () => {
  it("tagol", () => {
    expect(szam(0)).toBe("0");
    expect(szam(7)).toBe("7");
    expect(szam(999)).toBe("999");
    expect(szam(1000)).toBe("1 000");
    expect(szam(4300)).toBe("4 300");
    expect(szam(6800)).toBe("6 800");
    expect(szam(1234567)).toBe("1 234 567");
  });

  it("nem törő szóközzel tagol (ne törjön sorvégen)", () => {
    expect(szam(4300)).toContain(" ");
    expect(szam(4300)).not.toContain(" "); // sima szóköz NEM lehet benne
  });

  it("kerekít, és a negatívot tipográfiai mínusszal írja", () => {
    expect(szam(1234.6)).toBe("1 235");
    expect(szam(-2500)).toBe("−2 500");
  });

  it("⚠️ nem véges értékre ÜRES sztring, sosem „NaN”", () => {
    expect(szam(NaN)).toBe("");
    expect(szam(Infinity)).toBe("");
    expect(szam(-Infinity)).toBe("");
  });

  it("⚠️ DETERMINISZTIKUS: nem függ az `Intl`-től", () => {
    // Ha `Intl`-t használna, ez a teszt környezetfüggően más eredményt adna.
    const forras = readFileSync(resolve(process.cwd(), "src/lib/szam-format.ts"), "utf8");
    const kod = forras.split("export function szam")[1] ?? "";
    expect(kod, "a formázó Intl/toLocaleString-et használ — újra környezetfüggő lesz").not.toMatch(
      /toLocaleString|Intl\./,
    );
  });
});

/**
 * ⚠️ ŐR: a SZERVER-OLDALON IS renderelődő komponenseimben nem lehet
 * `toLocaleString`. A `/berkalkulator` és a `/hova-koltozzek` lap `force-static`,
 * tehát a kezdeti kimenet előre legyártott HTML — ott az `Intl` eredménye
 * eltérhet a böngészőétől, és a hidratálás elszáll.
 */
describe("hidratálás-őr: nincs locale-függő formázás az SSR-es komponensekben", () => {
  const FAJLOK = [
    "src/components/views/orszag-osszehasonlito-chart.tsx",
    "src/components/views/hova-koltozzek-matrix.tsx",
  ];

  it.each(FAJLOK)("%s nem használ toLocaleString-et", (f) => {
    const s = readFileSync(resolve(process.cwd(), f), "utf8");
    expect(s, `${f}: toLocaleString visszakerült — hidratálási eltérést okoz (React #425)`).not.toMatch(
      /toLocaleString/,
    );
  });

  it("az őr valóban fogna is: a tiltott minta felismerhető", () => {
    // Bidirekcionális ellenőrzés — egy szabály, ami sosem tud bukni, hamis biztonság.
    const hamis = 'const x = (4300).toLocaleString("hu-HU");';
    expect(/toLocaleString/.test(hamis)).toBe(true);
  });
});
