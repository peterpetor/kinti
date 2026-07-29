import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { COUNTRIES, isValidCountry, DEFAULT_COUNTRY } from "@/lib/countries";
import { countryExamples } from "@/lib/country-examples";
import { getRegions } from "@/lib/regions";
import {
  benchRegions,
  benchRegionLabel,
  benchCurrency,
  benchAllLabel,
  benchDefaultRegion,
} from "@/app/(app)/iranytu/region-util";

/**
 * ⚠️ EZ A FÁJL EGYETLEN HIBAOSZTÁLYT VÉD: az ORSZÁG-FALLTHROUGH-t.
 *
 * A minta mindig ugyanaz: egy funkció kézzel felsorolja a támogatott országokat
 * (`country === "AT" || country === "DE" || country === "NL"`), a lánc végén
 * pedig a svájci alapeset áll. Amikor jön egy ÚJ ország, az némán a svájci ágra
 * esik — nincs hibaüzenet, nincs üres képernyő, csak HELYTELEN, de hitelesnek
 * látszó tartalom. Ez a legdrágább hibaosztály az appban, mert a felhasználó
 * nem tudja, hogy rossz adatot lát.
 *
 * 2026-07-29-én a spanyol ország felvétele közben ez öt helyen élt egyszerre,
 * és HÁROM közülük Angliát is érintette (tehát élesben már hibás volt):
 *   • Iránytű: svájci kantonok + CHF az angol/spanyol felhasználónál,
 *   • költségtervező: német árak és német Kindergeld a spanyolnál,
 *   • AI CV-audit: „svájci CV-szakértő", B/C/L engedélyt kérve számon,
 *   • szaknévsor-ajánlás: londoni/madridi ajánlás svájci koordinátával,
 *   • űrlap-helyőrzők: „Pl. Zürich" mindenhol.
 *
 * A tesztek ezért NEM egy országra kérdeznek rá, hanem VÉGIGMENNEK a
 * `COUNTRIES` listán — így egy jövőbeli 7. ország felvételekor is elbuknak.
 */

const SRC = resolve(process.cwd(), "src");
const read = (p: string) => readFileSync(resolve(SRC, p), "utf8");

describe("Iránytű (benchmark) — minden ország saját régióit kapja", () => {
  it("MINDEN app-ország saját régió-készletet kap (nem svájci kantonokat)", () => {
    const swiss = benchRegions("CH").map((r) => r.code).join(",");
    for (const c of COUNTRIES) {
      const codes = benchRegions(c.code).map((r) => r.code);
      expect(codes.length, `${c.code}: üres régió-lista`).toBeGreaterThan(0);
      if (c.code !== "CH") {
        expect(codes.join(","), `${c.code} SVÁJCI kantonokat kapott`).not.toBe(swiss);
      }
    }
  });

  it("a régió-készlet EGYEZIK a regions.ts-ével (nem külön, elcsúszó lista)", () => {
    for (const c of COUNTRIES) {
      if (c.code === "CH") continue; // CH: a CANTONS a közös forrás
      const bench = benchRegions(c.code).map((r) => r.code).sort();
      const canonical = getRegions(c.code).map((r) => r.code).sort();
      // AT/DE a salary-calc Bundesland-listájából jön — ott csak a HALMAZ egyezzen.
      expect(new Set(bench).size, c.code).toBe(bench.length);
      if (c.code === "NL" || c.code === "GB" || c.code === "ES") {
        expect(bench, c.code).toEqual(canonical);
      }
    }
  });

  it("MINDEN országnak saját összesítő-felirata van (nem „Egész Svájc”)", () => {
    for (const c of COUNTRIES) {
      const label = benchAllLabel(c.code);
      if (c.code !== "CH") {
        expect(label, `${c.code}: „${label}”`).not.toContain("Svájc");
      }
    }
  });

  it("az alapértelmezett régió LÉTEZIK az adott országban", () => {
    for (const c of COUNTRIES) {
      const codes = benchRegions(c.code).map((r) => r.code);
      expect(codes, `${c.code}: ${benchDefaultRegion(c.code)}`).toContain(
        benchDefaultRegion(c.code),
      );
    }
  });

  it("⚠️ a pénznem ORSZÁG-HELYES (Anglia font, nem euró)", () => {
    expect(benchCurrency("CH")).toBe("CHF");
    expect(benchCurrency("GB")).toBe("GBP");
    for (const c of COUNTRIES) {
      if (c.code !== "CH" && c.code !== "GB") expect(benchCurrency(c.code), c.code).toBe("EUR");
    }
  });

  it("a régió-szint felirata nem ragad „Bundesland”-on", () => {
    expect(benchRegionLabel("CH")).toBe("Kanton");
    expect(benchRegionLabel("NL")).toBe("Provincia");
    expect(benchRegionLabel("GB")).toBe("Régió");
    expect(benchRegionLabel("ES")).toBe("Régió");
  });
});

describe("űrlap-példák — egy sem esik svájcira", () => {
  it("MINDEN országnak saját példa-városa és pénzneme van", () => {
    const swiss = countryExamples("CH");
    for (const c of COUNTRIES) {
      const ex = countryExamples(c.code);
      if (c.code === "CH") continue;
      expect(ex.city, `${c.code}: város`).not.toBe(swiss.city);
      expect(ex.phone, `${c.code}: telefon`).not.toBe(swiss.phone);
      expect(ex.companyIdExample, `${c.code}: cégazonosító`).not.toContain("CHE");
    }
  });

  it("ismeretlen ország SEMLEGES példát kap, NEM svájcit", () => {
    const unknown = countryExamples("XX");
    expect(unknown.city).not.toBe("Zürich");
    expect(unknown.phone).not.toContain("+41");
  });
});

/**
 * ⚠️ FORRÁSKÓD-SZINTŰ ŐR.
 *
 * A fenti tesztek a VISELKEDÉST védik, de csak ott, ahol van exportált
 * függvény. A leggyakoribb fallthrough viszont egy JSX-en belüli, kézzel
 * felsorolt ország-lánc — azt csak a forráson lehet elkapni. Ezek a tesztek
 * ezért kifejezetten a MINTÁT keresik: „hármas whitelist, svájci véggel".
 */
describe("forráskód-őr: nincs kézi ország-whitelist a közös útvonalakon", () => {
  const FILES = [
    "app/api/benchmark/route.ts",
    "app/api/benchmark/heatmap/route.ts",
    "app/api/benchmark/histogram/route.ts",
    "app/api/benchmark/ratio/route.ts",
    "app/api/benchmark/rent-histogram/route.ts",
    "app/api/benchmark/trend/route.ts",
    "app/api/ai/cv-review/route.ts",
    "app/api/ai/parse-search/route.ts",
  ];

  it("⚠️ a benchmark- és CV-audit-útvonalak isValidCountry-t használnak", () => {
    for (const f of FILES) {
      const src = read(f);
      expect(src, `${f}: kézi 3-elemű whitelist maradt`).not.toMatch(
        /=== "AT" \|\| \w+(\.\w+)? === "DE" \|\| \w+(\.\w+)? === "NL"/,
      );
      expect(src, `${f}: nem használ isValidCountry-t`).toContain("isValidCountry");
    }
  });

  it("⚠️ nincs bináris pénznem-elágazás (minden nem-CH = euró)", () => {
    for (const f of FILES) {
      expect(read(f), `${f}: bináris pénznem`).not.toMatch(
        /country !== "CH" \? "EUR" : "CHF"/,
      );
    }
  });
});

describe("ország-validáció", () => {
  it("minden felsorolt ország érvényes, az ismeretlen nem", () => {
    for (const c of COUNTRIES) expect(isValidCountry(c.code), c.code).toBe(true);
    for (const bad of ["", "XX", "cH", null, undefined]) {
      expect(isValidCountry(bad as string), String(bad)).toBe(false);
    }
  });

  it("az alapértelmezett ország szerepel a listában", () => {
    expect(isValidCountry(DEFAULT_COUNTRY)).toBe(true);
  });
});
