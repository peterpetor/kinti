import { describe, it, expect } from "vitest";

/**
 * A bejelentkezés/regisztráció `redirect_url` paraméterének open-redirect
 * védelme. A függvény a két oldal page.tsx-ében él (szerver-komponens, nem
 * importálható tesztből), ezért a LOGIKÁJA van ide tükrözve — ha ott változik,
 * ezt is frissíteni kell.
 *
 * Regresszió-védelem (2026-07-22, biztonsági átvizsgálás): a korábbi verzió
 * csak a `//`-t tiltotta, de a böngésző a `\`-t `/`-re alakítja és a TAB/CR/LF-et
 * eldobja — így a `/\evil.com` protokoll-relatív URL-lé vált és KIVITT az
 * idegen domainre (adathalász-vektor).
 */
function safeRedirect(target: string | undefined): string {
  if (!target) return "/profil";
  const norm = target.replace(/[\t\r\n]/g, "").replace(/\\/g, "/");
  if (norm.startsWith("/") && !norm.startsWith("//")) return norm;
  try {
    const u = new URL(norm);
    if (u.host === "kinti.app") return u.pathname + u.search;
  } catch {
    /* érvénytelen URL */
  }
  return "/profil";
}

/** Ahogy a BÖNGÉSZŐ értelmezné a Location fejlécet. */
function resolvedHost(location: string): string {
  return new URL(location, "https://kinti.app").host;
}

describe("safeRedirect — open-redirect védelem", () => {
  it("a saját relatív útvonalat átengedi", () => {
    expect(safeRedirect("/profil")).toBe("/profil");
    expect(safeRedirect("/allasok/profil")).toBe("/allasok/profil");
  });

  it("üres/hiányzó értéknél a /profil-ra esik vissza", () => {
    expect(safeRedirect(undefined)).toBe("/profil");
    expect(safeRedirect("")).toBe("/profil");
  });

  it("a saját abszolút URL-ből relatívat csinál", () => {
    expect(safeRedirect("https://kinti.app/x?a=1")).toBe("/x?a=1");
  });

  it("idegen abszolút URL-t elutasít", () => {
    expect(safeRedirect("https://evil.com")).toBe("/profil");
  });

  // A lényeg: a böngésző-normalizálás UTÁN sem juthat ki idegen hostra.
  it.each([
    "//evil.com",
    "/\\evil.com",
    "/\\/evil.com",
    "/\t/evil.com",
    "/\r\n//evil.com",
    "https://evil.com/x",
    "http://evil.com",
  ])("nem enged ki idegen domainre: %j", (input) => {
    expect(resolvedHost(safeRedirect(input))).toBe("kinti.app");
  });
});
