import { describe, it, expect } from "vitest";
import { regionCodeFromLocation } from "@/lib/region-resolve";

describe("regionCodeFromLocation", () => {
  it("AT: régiónév a location-szövegben", () => {
    expect(regionCodeFromLocation("AT", "Linz, Oberösterreich")).toBe("OOE");
    expect(regionCodeFromLocation("AT", "Wien, Österreich")).toBe("W");
    expect(regionCodeFromLocation("AT", "Vorarlberg, Österreich")).toBe("VBG");
    expect(regionCodeFromLocation("AT", "Salzburg")).toBe("SBG");
  });

  it("AT: csak városnév (nincs régió) → null", () => {
    expect(regionCodeFromLocation("AT", "Korneuburg")).toBeNull();
    expect(regionCodeFromLocation("AT", "Dornbirn")).toBeNull();
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
