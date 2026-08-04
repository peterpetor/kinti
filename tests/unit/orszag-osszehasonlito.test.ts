import { describe, it, expect } from "vitest";
import {
  orszagSor, egyenleg, MEDIAN_GROSS, SAVOK, OSSZEHASONLITO_ORSZAGOK, RENT_MIN_MINTA,
} from "../../src/lib/orszag-osszehasonlito";

/**
 * „Hol marad több?" — ország-összehasonlító motor.
 *
 * A grafikon állításokat tesz a felhasználó pénzéről, ezért a motort a
 * TARTALMI helyességén mérjük, nem csak azon, hogy lefut:
 *   1. a sávok összege PONTOSAN 100% (különben a rúd kilóg),
 *   2. a vékony mintájú lakbér NEM kerülhet a rangsorba (kitalált adat lenne),
 *   3. több bér → több marad (monotonitás),
 *   4. a nettó tényleg kevesebb a bruttónál mind a 6 országban.
 */

// Valós nagyságrendű lakbér-mediánok (a rent_benchmarks 3-szobás adatából),
// hogy a teszt ne szintetikus számokon fusson.
const LAKBER: Record<string, number> = { CH: 1500, AT: 900, DE: 950, NL: 1250, GB: 1100, ES: 850 };
const sor = (c: (typeof OSSZEHASONLITO_ORSZAGOK)[number], pct = 100) =>
  orszagSor(c, pct, LAKBER[c], 30);

describe("ország-összehasonlító — arányok", () => {
  it.each(OSSZEHASONLITO_ORSZAGOK)("%s: a négy sáv PONTOSAN 100%%-ot ad ki", (c) => {
    const s = sor(c);
    const ossz = SAVOK.reduce((sum, x) => sum + s.arany[x.id], 0);
    expect(ossz).toBeCloseTo(100, 6);
  });

  it("⚠️ ha a költség meghaladja a nettót, a sávok akkor sem lógnak ki 100%% fölé", () => {
    // 25%-os bér: a fix költségek biztosan túllépik a nettót.
    const s = orszagSor("CH", 25, 3000, 30);
    const ossz = SAVOK.reduce((sum, x) => sum + s.arany[x.id], 0);
    expect(ossz).toBeCloseTo(100, 6);
    expect(s.arany.marad, "hiánynál a „marad” sáv nulla").toBe(0);
    expect(egyenleg(s), "az egyenleg viszont NEGATÍV — a hiányt nem nyeljük el").toBeLessThan(0);
  });

  it("egyik arány sem negatív és egyik sem megy 100 fölé", () => {
    for (const c of OSSZEHASONLITO_ORSZAGOK) {
      for (const pct of [25, 50, 100, 150, 250]) {
        const s = orszagSor(c, pct, LAKBER[c], 30);
        for (const sav of SAVOK) {
          expect(s.arany[sav.id], `${c} @ ${pct}% / ${sav.id}`).toBeGreaterThanOrEqual(0);
          expect(s.arany[sav.id], `${c} @ ${pct}% / ${sav.id}`).toBeLessThanOrEqual(100);
        }
      }
    }
  });
});

describe("ország-összehasonlító — adat-becsületesség", () => {
  it("⚠️ a VÉKONY mintájú lakbér „keves” jelölést kap (nem rangsorolható)", () => {
    expect(orszagSor("DE", 100, 950, RENT_MIN_MINTA - 1).keves).toBe(true);
    expect(orszagSor("DE", 100, 950, RENT_MIN_MINTA).keves).toBe(false);
  });

  it("⚠️ HIÁNYZÓ lakbér-adat is „keves” — nem tesszük úgy, mintha 0 lenne a lakbér", () => {
    const s = orszagSor("DE", 100, null, 99);
    expect(s.keves).toBe(true);
  });
});

describe("ország-összehasonlító — számtani józanság", () => {
  it.each(OSSZEHASONLITO_ORSZAGOK)("%s: a nettó kisebb a bruttónál, de pozitív", (c) => {
    const s = sor(c);
    expect(s.net).toBeGreaterThan(0);
    expect(s.net, `${c}: a nettó nem lehet több a bruttónál`).toBeLessThan(s.gross);
    // Épkézláb terhelés: sehol nem visz el 60%-nál többet a levonás.
    expect(s.net / s.gross, `${c}: gyanúsan alacsony nettó-arány`).toBeGreaterThan(0.4);
  });

  it.each(OSSZEHASONLITO_ORSZAGOK)("%s: magasabb bérnél TÖBB marad (monotonitás)", (c) => {
    const kicsi = egyenleg(orszagSor(c, 80, LAKBER[c], 30));
    const nagy = egyenleg(orszagSor(c, 160, LAKBER[c], 30));
    expect(nagy).toBeGreaterThan(kicsi);
  });

  it("a csúszka 100%-a tényleg az országos mediánt adja", () => {
    for (const c of OSSZEHASONLITO_ORSZAGOK) {
      expect(orszagSor(c, 100, LAKBER[c], 30).gross).toBe(MEDIAN_GROSS[c]);
    }
  });

  it("mind a 6 országnak van medián-bére és pénzneme", () => {
    for (const c of OSSZEHASONLITO_ORSZAGOK) {
      expect(MEDIAN_GROSS[c], `${c}: hiányzó medián`).toBeGreaterThan(0);
      expect(["CHF", "EUR", "GBP"]).toContain(sor(c).currency);
    }
  });
});

/**
 * ⚠️ A `dataviz` validátor a VILÁGOS és a SÖTÉT palettát külön mérte, és a
 * sorrend is számít: a piros és a zöld NEM lehet szomszédos sáv (deuteranopia
 * mellett összeolvadnak). Ez a teszt a sorrendet rögzíti, hogy egy későbbi
 * „logikusabb” átrendezés ne rontsa el némán az akadálymentességet.
 */
describe("grafikon — sávsorrend", () => {
  it("a „marad” (zöld) és a „megélhetés” (piros) nem szomszédos", () => {
    const idx = (id: string) => SAVOK.findIndex((s) => s.id === id);
    expect(Math.abs(idx("marad") - idx("megelhetes")), "piros és zöld egymás mellé került — CVD-ütközés").toBeGreaterThan(1);
  });

  it("a sávsorrend a validált paletta sorrendje", () => {
    expect(SAVOK.map((s) => s.id)).toEqual(["lakhatas", "megelhetes", "biztositas", "marad"]);
  });
});
