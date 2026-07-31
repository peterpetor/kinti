import { describe, it, expect } from "vitest";
import { regionCodeFromLocation, isOutsideCountryScope } from "@/lib/region-resolve";

/**
 * ⚠️ ÉLESBEN MÉRT HIBA regresszió-védelme. A Jooble GLOBÁLIS végpontja a
 * `location: "Nederland"` keresésre megtalálta **Nederland, Texas** városát, és
 * a holland állás-lista 100%-a (149 hirdetés) délkelet-texasi lett. A gyökérokot
 * az ország-specifikus aldomain javítja, ez a szűrő a második védvonal.
 */
describe("isOutsideCountryScope — amerikai hely kiszűrése", () => {
  it("a valódi hibás adat mindegyik alakját elkapja", () => {
    for (const loc of [
      "Beaumont, TX", "Nederland, TX", "Port Arthur, TX", "Bridge City, TX",
      "Groves, TX", "Port Neches, TX", "Orange, TX", "Rose Hill Acres, TX",
    ]) {
      expect(isOutsideCountryScope("NL", loc)).toBe(true);
    }
  });

  it("MINDEN országra fog, nem csak a GB-re", () => {
    for (const cc of ["AT", "DE", "NL", "GB", "ES", "CH"]) {
      expect(isOutsideCountryScope(cc, "Austin, TX")).toBe(true);
    }
  });

  it("a jogos európai helyeket NEM dobja el", () => {
    expect(isOutsideCountryScope("GB", "London, UK")).toBe(false);
    expect(isOutsideCountryScope("NL", "Amsterdam, Noord-Holland")).toBe(false);
    expect(isOutsideCountryScope("AT", "Wien")).toBe(false);
    expect(isOutsideCountryScope("DE", "München, Bayern")).toBe(false);
    expect(isOutsideCountryScope("ES", "Madrid")).toBe(false);
  });

  it("⚠️ a svájci kanton-rövidítést NEM nézi amerikai tagállamnak", () => {
    // AR = Appenzell Ausserrhoden, NE = Neuchâtel — ezért maradtak ki a listából.
    expect(isOutsideCountryScope("CH", "Herisau, AR")).toBe(false);
    expect(isOutsideCountryScope("CH", "La Chaux-de-Fonds, NE")).toBe(false);
    // DE = Németország kódja (nem Delaware).
    expect(isOutsideCountryScope("DE", "Berlin, DE")).toBe(false);
  });

  it("a GB=Anglia szűrés változatlanul működik", () => {
    expect(isOutsideCountryScope("GB", "Glasgow")).toBe(true);
    expect(isOutsideCountryScope("GB", "Cardiff")).toBe(true);
    expect(isOutsideCountryScope("GB", "Manchester")).toBe(false);
    // Más országra a nem-angliai lista NEM fut (egy „Belfast" nevű hely másutt is lehet).
    expect(isOutsideCountryScope("DE", "Glasgow")).toBe(false);
  });

  it("üres bemenetre false (nem dobunk el adat hiányában)", () => {
    expect(isOutsideCountryScope("NL", null)).toBe(false);
    expect(isOutsideCountryScope("NL", "")).toBe(false);
    expect(isOutsideCountryScope("NL", "   ")).toBe(false);
  });
});

describe("regionCodeFromLocation", () => {
  it("AT: régiónév a location-szövegben", () => {
    expect(regionCodeFromLocation("AT", "Linz, Oberösterreich")).toBe("OOE");
    expect(regionCodeFromLocation("AT", "Wien, Österreich")).toBe("W");
    expect(regionCodeFromLocation("AT", "Vorarlberg, Österreich")).toBe("VBG");
    expect(regionCodeFromLocation("AT", "Salzburg")).toBe("SBG");
  });

  it("AT: ismeretlen városnév → null; ismert város-alias → régió", () => {
    expect(regionCodeFromLocation("AT", "Korneuburg")).toBeNull();
    // 2026-07-12: a nagyvárosok régió-aliasok lettek (Telegram-bot + kereső +
    // állás-szinkron) — a Dornbirn már Vorarlbergre oldódik.
    expect(regionCodeFromLocation("AT", "Dornbirn")).toBe("VBG");
    expect(regionCodeFromLocation("AT", "Graz")).toBe("STM");
    expect(regionCodeFromLocation("DE", "München")).toBe("BY");
  });

  it("strukturált area a specifikusabb régiót adja (Wien-Umgebung → NÖ)", () => {
    expect(
      regionCodeFromLocation("AT", "Klosterneuburg, Wien-Umgebung", ["Österreich", "Niederösterreich"]),
    ).toBe("NOE");
  });

  it("DE: régiónév + area", () => {
    expect(regionCodeFromLocation("DE", "München, Bayern")).toBe("BY");
    expect(regionCodeFromLocation("DE", "Berlin")).toBe("BE");
    expect(regionCodeFromLocation("DE", "Stuttgart", ["Deutschland", "Baden-Württemberg", "Stuttgart"])).toBe("BW");
  });

  it("NL: provincia név + area", () => {
    expect(regionCodeFromLocation("NL", "Amsterdam, Noord-Holland")).toBe("NH");
    expect(regionCodeFromLocation("NL", "Rotterdam", ["Nederland", "Zuid-Holland"])).toBe("ZH");
  });

  it("CH: kanton-név / PLZ / város", () => {
    expect(regionCodeFromLocation("CH", "8001 Zürich")).toBe("ZH");
    expect(regionCodeFromLocation("CH", "Genève")).toBe("GE");
  });

  it("token-határon illeszt: „Wien” NEM illeszkedik a „Wiener Neustadt”-ba", () => {
    // Wiener Neustadt Niederösterreichben van; area nélkül, csak városnévvel → nincs W.
    expect(regionCodeFromLocation("AT", "Wiener Neustadt")).not.toBe("W");
  });

  it("üres / ismeretlen ország → null", () => {
    expect(regionCodeFromLocation("AT", null)).toBeNull();
    expect(regionCodeFromLocation("XX", "Berlin")).toBeNull();
  });
});
