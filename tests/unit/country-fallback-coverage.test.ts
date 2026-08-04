import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Az import-pipeline ORSZÁG-TARTALÉK koordinátáinak lefedettsége.
 *
 * ⚠️⚠️ MIÉRT: a `COUNTRY_FALLBACK` térkép sokáig CSAK a négy eredeti országot
 * (CH/AT/DE/NL) tartalmazta, miközben az app hatországos lett. A hiányzó ES/GB
 * NÉMÁN egy beégetett ZÜRICHI koordinátára esett — élesben **21 tétel (13 brit,
 * 8 spanyol) térkép-pinje került Svájcba**, pontos utcacím mellett.
 *
 * Ez a binary-country-fallthrough hibaosztály: nem hibát dob, hanem rossz
 * adatot ad, és a grep sem fogja meg, mert a hiba az `||` ágban van.
 *
 * A teszt a countries.ts ENGEDÉLYEZETT országait veti össze a térképpel — így
 * egy hetedik ország bevezetése azonnal pirosra váltja.
 */
const SCRIPT = readFileSync(resolve(process.cwd(), "scripts/prepare-business-import.mjs"), "utf8");
const COUNTRIES = readFileSync(resolve(process.cwd(), "src/lib/countries.ts"), "utf8");

/** A countries.ts-ből: minden `{ code: "XX", …, enabled: true }`. */
function engedelyezettOrszagok(): string[] {
  return [...COUNTRIES.matchAll(/code:\s*"([A-Z]{2})"[^}]*enabled:\s*true/g)].map((m) => m[1]);
}

/** A scriptből: a COUNTRY_FALLBACK objektum kulcsai. */
function tartalekKulcsok(): string[] {
  const m = SCRIPT.match(/const COUNTRY_FALLBACK\s*=\s*\{([\s\S]*?)\n\};/);
  if (!m) throw new Error("A COUNTRY_FALLBACK nem található a prepare-business-import.mjs-ben");
  return [...m[1].matchAll(/^\s*([A-Z]{2}):/gm)].map((x) => x[1]);
}

describe("ország-tartalék koordináták lefedettsége", () => {
  it("MINDEN engedélyezett országnak van tartalék-koordinátája", () => {
    const orszagok = engedelyezettOrszagok();
    const kulcsok = tartalekKulcsok();
    expect(orszagok.length, "a countries.ts-ből nem sikerült országot kiolvasni").toBeGreaterThan(3);
    const hianyzo = orszagok.filter((o) => !kulcsok.includes(o));
    expect(hianyzo, `hiányzó ország(ok) a COUNTRY_FALLBACK-ből: ${hianyzo.join(", ")}`).toEqual([]);
  });

  it("⚠️ NINCS néma zürichi default — a hiányzó ország HANGOS hibát ad", () => {
    // A régi, hibás minta: `COUNTRY_FALLBACK[country] || [47.3769, 8.5417]`
    expect(SCRIPT).not.toMatch(/COUNTRY_FALLBACK\[country\]\s*\|\|/);
    // A hiányzó országnak kiírt hibát kell adnia:
    expect(SCRIPT).toMatch(/const f = COUNTRY_FALLBACK\[country\];[\s\S]{0,200}console\.error/);
  });
});
