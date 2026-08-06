import { describe, it, expect } from "vitest";
import { readFileSync, globSync } from "node:fs";
import { resolve } from "node:path";
import { budgetCurrency, isBudgetCountry } from "@/lib/budget-plan";
import { COUNTRIES } from "@/lib/countries";

/**
 * Ország → pénznem.
 *
 * ⚠️⚠️ EZ AZ APP LEGDRÁGÁBB HIBAOSZTÁLYA: a bináris ország-fallthrough.
 * A `country === "CH" ? "CHF" : "EUR"` alak minden nem-svájci országot euróba
 * sorol — vagyis egy ANGLIAI tételt fontban gondolt összeggel EURÓKÉNT kezel.
 * A `job-sync.ts`-ben ezt egyszer már valódi hibaként javítottuk, a kommentje
 * ott is áll — mégis NÉGY további helyen bent maradt, és mind a négy ÉLES
 * GB-ben (az `allasok` és a `tudasbazis` is szerepel a GB_ALLOWED_FEATURES-ben):
 *
 *   components/views/job-post-form.tsx   a hirdetés valutáját ÁLLÍTJA BE → adatba kerül
 *   components/views/bulk-job-form.tsx   tömeges feladás
 *   app/(app)/tudasbazis/[slug]/page.tsx utalás-CTA valutája
 *   app/(app)/allasok/[id]/page.tsx      a megjelenített medián bér valutája
 *
 * ⚠️ A grep önmagában NEM elég ellene: a hiba a HALLGATÓLAGOS defaultban van,
 * nem egy leírt rossz értékben. Ezért a fix MINDIG TÁBLA (itt: budgetCurrency).
 */

const GYOKER = resolve(__dirname, "../..");
const olvas = (p: string) => readFileSync(resolve(GYOKER, p), "utf8").replace(/\r\n/g, "\n");

describe("a tábla minden országot ismer", () => {
  it("⚠️ MIND a hat országnak van pénzneme, és a GB nem euró", () => {
    for (const c of COUNTRIES) {
      expect(isBudgetCountry(c.code), `${c.code} hiányzik a pénznem-táblából`).toBe(true);
    }
    expect(budgetCurrency("GB")).toBe("GBP");
    expect(budgetCurrency("CH")).toBe("CHF");
    for (const c of ["AT", "DE", "NL", "ES"] as const) {
      expect(budgetCurrency(c)).toBe("EUR");
    }
  });

  it("egy új ország felvétele KIBUKIK itt, nem élesben", () => {
    // Ha valaki felvesz egy 7. országot a COUNTRIES-ba, de a pénznem-táblát
    // nem bővíti, a fenti eset azonnal pirosat ad — nem az fog kiderülni,
    // hogy a felhasználó rossz pénznemben lát összeget.
    expect(COUNTRIES.length).toBeGreaterThanOrEqual(6);
  });
});

describe("nincs bináris ország-fallthrough a pénznemnél", () => {
  /**
   * ⚠️ Ez az őr a KONKRÉT alakot tiltja: `=== "CH" ? "CHF" : "EUR"`, ahol a
   * GB-ág hiányzik. A háromágú (`… : country === "GB" ? "GBP" : "EUR"`) alak
   * helyes, azt átengedi.
   */
  const ROSSZ = /===\s*"CH"\s*\?\s*"CHF"\s*:\s*"EUR"/;

  it("⚠️ a forrásban sehol nincs GB-ág nélküli pénznem-elágazás", () => {
    const fajlok = globSync("src/**/*.{ts,tsx}", { cwd: GYOKER }).map((f) => f.replace(/\\/g, "/"));
    const vetkesek: string[] = [];
    for (const f of fajlok) {
      const src = olvas(f);
      src.split("\n").forEach((sor, i) => {
        // A megjegyzésekben szabad idézni — épp ez a fájl is megteszi.
        if (/^\s*(\/\/|\*|\/\*)/.test(sor)) return;
        if (ROSSZ.test(sor)) vetkesek.push(`${f}:${i + 1}`);
      });
    }
    expect(
      vetkesek,
      `használd a budgetCurrency()-t — a GB fontot használ: ${vetkesek.join(", ")}`,
    ).toEqual([]);
  });

  it("a szűrő tényleg megkülönbözteti a két alakot (kétirányú próba)", () => {
    expect(ROSSZ.test('const cur = country === "CH" ? "CHF" : "EUR";')).toBe(true);
    expect(ROSSZ.test('const cur = country === "CH" ? "CHF" : country === "GB" ? "GBP" : "EUR";')).toBe(
      false,
    );
  });
});

describe("a négy javított hívóhely", () => {
  const HELYEK = [
    "src/components/views/job-post-form.tsx",
    "src/components/views/bulk-job-form.tsx",
    "src/app/(app)/tudasbazis/[slug]/page.tsx",
    "src/app/(app)/allasok/[id]/page.tsx",
  ];

  it("mind a táblát használja", () => {
    for (const p of HELYEK) {
      expect(olvas(p), `${p}: nem a közös pénznem-táblát használja`).toContain("budgetCurrency");
    }
  });

  it("⚠️ a hirdetés-feladó a MENTETT adatban is a helyes pénznemet állítja", () => {
    // Ez a legsúlyosabb a négyből: itt nem csak megjelenítésről van szó, a
    // rossz érték BEKERÜL az adatbázisba, és onnan már nem derül ki, hogy a
    // hirdető valójában fontban gondolta.
    const src = olvas("src/components/views/job-post-form.tsx");
    expect(src).toMatch(/currency:\s*penznem\(country\)/);
  });
});
