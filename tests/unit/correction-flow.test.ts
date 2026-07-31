import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  CORRECTION_FIELDS,
  CORRECTION_FIELD_LABELS,
  isCorrectionField,
  needsSuggestion,
} from "@/lib/correction-fields";

/**
 * A „Javíts rajta" út szerkezeti őre.
 *
 * ⚠️ A LÉNYEG, AMIT VÉDÜNK: ez az út NEM rejti el a vállalkozást. Korábban az
 * EGYETLEN felhasználói visszajelzés a „Jelentem" volt, ami azonnal levette a
 * tételt (DSA Art. 16) — aránytalan egy elgépelt telefonszámra. Ha valaki
 * később „egyszerűsítésként" összevonná a két utat, ez a teszt bukik.
 *
 * ⚠️ ÉS: a javaslat SOSEM írhatja felül automatikusan a publikus adatot.
 */
const publicRoute = readFileSync("src/app/api/business/correction/route.ts", "utf8");
const adminRoute = readFileSync("src/app/api/admin/corrections/route.ts", "utf8");
const repo = readFileSync("src/lib/repo-corrections.ts", "utf8");

describe("adatjavítás — a mezőkészlet zárt", () => {
  it("csak az ismert mezőket fogadja el", () => {
    for (const f of CORRECTION_FIELDS) expect(isCorrectionField(f)).toBe(true);
    expect(isCorrectionField("hidden")).toBe(false);
    expect(isCorrectionField("rating")).toBe(false);
    expect(isCorrectionField("")).toBe(false);
    expect(isCorrectionField(null)).toBe(false);
  });

  it("minden mezőnek van magyar címkéje (nem marad nyers kulcs a felületen)", () => {
    for (const f of CORRECTION_FIELDS) {
      expect(CORRECTION_FIELD_LABELS[f], `hiányzó címke: ${f}`).toBeTruthy();
    }
  });

  it("a „már nem működik” jelzéshez NEM kell javasolt érték, a többihez igen", () => {
    expect(needsSuggestion("closed")).toBe(false);
    expect(needsSuggestion("phone")).toBe(true);
    expect(needsSuggestion("address")).toBe(true);
  });

  it("⚠️ a mezőkészlet TISZTA modulban van (a kliens űrlap is importálja)", () => {
    // Ha valaki visszateszi a repo-ba, a kliens-komponens D1-et húzna be.
    const pure = readFileSync("src/lib/correction-fields.ts", "utf8");
    expect(pure).not.toMatch(/from\s+"\.\/cloudflare"|getDB/);
  });
});

describe("adatjavítás — a javaslat NEM rejt el és NEM ír felül", () => {
  it("⚠️ a végpont SEHOL nem rejti el a vállalkozást", () => {
    expect(publicRoute).not.toMatch(/setBusinessHidden/);
    expect(publicRoute).not.toMatch(/hidden\s*=\s*1/);
  });

  it("⚠️ a javaslat NEM ír a businesses táblába (csak sorba áll)", () => {
    expect(publicRoute).not.toMatch(/updateBusiness|UPDATE businesses/i);
    expect(repo).not.toMatch(/UPDATE businesses/i);
  });

  it("az admin-lezárás sem írja át magától a cégadatot", () => {
    expect(adminRoute).not.toMatch(/UPDATE businesses|updateBusiness/i);
  });
});

describe("adatjavítás — visszaélés-védelem", () => {
  it("Turnstile-t ellenőriz, fail-closed", () => {
    expect(publicRoute).toMatch(/verifyTurnstile\s*\(/);
    expect(publicRoute).toMatch(/captcha\.ok/);
  });

  it("per-IP órás korlát van", () => {
    expect(publicRoute).toMatch(/CORRECTIONS_PER_HOUR/);
    expect(publicRoute).toMatch(/countRecentCorrections\s*\(/);
  });

  it("csak LÉTEZŐ vállalkozásra lehet javaslatot tenni", () => {
    expect(publicRoute).toMatch(/getBusinessById\s*\(/);
    expect(publicRoute).toMatch(/not_found/);
  });

  it("az admin-lezárás hitelesítés mögött van", () => {
    expect(adminRoute).toMatch(/getAdminUserId\s*\(/);
    expect(adminRoute).toMatch(/forbidden/);
  });
});
