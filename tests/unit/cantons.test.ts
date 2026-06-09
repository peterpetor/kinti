import { describe, it, expect } from "vitest";
import {
  cantonToSlug,
  cantonFromSlug,
  cantonFromAddress,
  isSwissAddress,
  isValidCantonCode,
  cantonName,
} from "@/lib/cantons";

describe("cantonToSlug", () => {
  it("ékezet-mentes, kisbetűs slug", () => {
    expect(cantonToSlug("Zürich")).toBe("zurich");
    expect(cantonToSlug("Genève")).toBe("geneve");
  });
});

describe("cantonFromSlug", () => {
  it("név-slug → kanton", () => {
    expect(cantonFromSlug("zurich")?.code).toBe("ZH");
  });
  it("kód-slug → kanton", () => {
    expect(cantonFromSlug("zh")?.code).toBe("ZH");
  });
  it("ismeretlen → null", () => {
    expect(cantonFromSlug("nincs-ilyen")).toBeNull();
  });
});

describe("cantonFromAddress", () => {
  it("PLZ-ből kanton (8003 → ZH)", () => {
    expect(cantonFromAddress("Birmensdorferstr. 142, 8003 Zürich")?.code).toBe("ZH");
  });
  it("nincs PLZ → null", () => {
    expect(cantonFromAddress("nincs itt irányítószám")).toBeNull();
    expect(cantonFromAddress(null)).toBeNull();
  });
});

describe("isSwissAddress", () => {
  it("svájci cím (város + PLZ) → true", () => {
    expect(isSwissAddress("Bahnhofstrasse 1, 8001 Zürich")).toBe(true);
  });
  it("külföldi cím (Budapest, Hungary) → false", () => {
    expect(isSwissAddress("Andrássy út 1, 1051 Budapest, Hungary")).toBe(false);
  });
});

describe("isValidCantonCode", () => {
  it("érvényes kód → true", () => {
    expect(isValidCantonCode("ZH")).toBe(true);
    expect(isValidCantonCode("GE")).toBe(true);
  });
  it("érvénytelen / rossz típus → false", () => {
    expect(isValidCantonCode("XX")).toBe(false);
    expect(isValidCantonCode("zh")).toBe(false); // kis-nagybetű érzékeny
    expect(isValidCantonCode("")).toBe(false);
    expect(isValidCantonCode(null)).toBe(false);
    expect(isValidCantonCode(26)).toBe(false);
  });
});

describe("cantonName", () => {
  it("kód → név", () => {
    expect(cantonName("ZH")).toBe("Zürich");
    expect(cantonName("BS")).toBe("Basel-Stadt");
  });
  it("ismeretlen / null → null", () => {
    expect(cantonName("XX")).toBeNull();
    expect(cantonName(null)).toBeNull();
    expect(cantonName(undefined)).toBeNull();
  });
});
