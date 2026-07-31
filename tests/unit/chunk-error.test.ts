import { describe, it, expect } from "vitest";
import { isChunkLoadError } from "@/lib/chunk-error";

/**
 * ⚠️ ÉLESBEN MEGTÖRTÉNT (2026-07-31). Három deploy ment ki ~40 perc alatt,
 * miközben a felhasználónál nyitva volt az oldal. Deploy után a JS-darabok neve
 * megváltozik, a régi lap pedig már nem létező fájlra hivatkozik → a React a
 * hiba-határra esik.
 *
 * A valódi hiba nem ez volt, hanem hogy a hiba-határ gombja `reset()`-et hívott
 * — vagyis CSAK újrarenderelt, ugyanazzal a hiányzó fájllal. A gomb, amin
 * „Újratöltés" állt, ennél a hibatípusnál sosem tudott segíteni.
 *
 * A böngészők MÁS-MÁS szöveggel jelzik ugyanezt, ezért kell a felismerő.
 */
describe("isChunkLoadError — a deploy-közbeni darab-hiba felismerése", () => {
  it("felismeri a böngészők eltérő üzeneteit", () => {
    const cases = [
      Object.assign(new Error("Loading chunk 4821 failed."), { name: "ChunkLoadError" }),
      new Error("Failed to fetch dynamically imported module: https://kinti.app/_next/static/chunks/x.js"),
      new Error("error loading dynamically imported module"),
      new Error("Importing a module script failed."),
    ];
    for (const e of cases) expect(isChunkLoadError(e), e.message).toBe(true);
  });

  it("a NEVE alapján is felismeri, üres üzenettel is", () => {
    expect(isChunkLoadError(Object.assign(new Error(""), { name: "ChunkLoadError" }))).toBe(true);
  });

  it("⚠️ MÁS hibát NEM minősít annak (különben elnyelnénk valódi hibákat)", () => {
    for (const e of [
      new Error("Cannot read properties of undefined (reading 'name')"),
      new Error("NetworkError when attempting to fetch resource."),
      new Error("SecurityError: localStorage is not available"),
      new Error("D1_ERROR: no such column"),
    ]) {
      expect(isChunkLoadError(e), e.message).toBe(false);
    }
  });

  it("nem dob nem-Error bemenetre sem", () => {
    expect(isChunkLoadError(null)).toBe(false);
    expect(isChunkLoadError(undefined)).toBe(false);
    expect(isChunkLoadError("Loading chunk 1 failed.")).toBe(false); // nem Error-alakú
    expect(isChunkLoadError({ name: 42, message: {} })).toBe(false);
  });
});
