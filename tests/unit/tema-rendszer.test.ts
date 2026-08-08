import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { systemTheme, VILAGOS_TOL, VILAGOS_IG } from "../../src/lib/theme-schedule";

/**
 * A „Rendszer” téma-mód őre.
 *
 * ⚠️ 2026-08-08: a „Rendszer” mostantól NAPSZAK-alapú (06:00–18:00 világos,
 * 18:00–06:00 sötét), nem a böngésző `prefers-color-scheme` beállítását követi.
 *
 * MIÉRT VÁLTOZOTT: a böngésző-beállítás sok készüléken fixen sötét — Androidon
 * a Chrome SAJÁT témája dönt, nem a telefoné —, ezért az app éjjel-nappal sötét
 * maradt, és a „Rendszer” gyakorlatilag „mindig sötét”-et jelentett. A
 * felhasználó ezt jelezte, és a logika volt a hibás, nem a visszajelzés.
 */

const GYOKER = resolve(__dirname, "../..");
const olvas = (p: string) => readFileSync(resolve(GYOKER, p), "utf8").replace(/\r\n/g, "\n");

const TOGGLE = olvas("src/components/theme-toggle.tsx");
const LAYOUT = olvas("src/app/layout.tsx");
const CSS = olvas("src/app/globals.css");

const ora = (h: number) => new Date(2026, 7, 8, h, 30, 0);

describe("„Rendszer” mód — napszak szerint", () => {
  it("nappal világos, éjjel sötét", () => {
    expect(systemTheme(ora(6))).toBe("warm");
    expect(systemTheme(ora(12))).toBe("warm");
    expect(systemTheme(ora(17))).toBe("warm");
    expect(systemTheme(ora(18))).toBe("dark");
    expect(systemTheme(ora(23))).toBe("dark");
    expect(systemTheme(ora(3))).toBe("dark");
    expect(systemTheme(ora(5))).toBe("dark");
  });

  it("⚠️ a HATÁROK pontosan 6 és 18 — a 6:00 már világos, a 18:00 már sötét", () => {
    // A félreértés klasszikus helye: a záró óra INKLUZÍV vagy sem.
    expect(VILAGOS_TOL).toBe(6);
    expect(VILAGOS_IG).toBe(18);
    expect(systemTheme(new Date(2026, 7, 8, 6, 0, 0))).toBe("warm");
    expect(systemTheme(new Date(2026, 7, 8, 17, 59, 59))).toBe("warm");
    expect(systemTheme(new Date(2026, 7, 8, 18, 0, 0))).toBe("dark");
    expect(systemTheme(new Date(2026, 7, 8, 5, 59, 59))).toBe("dark");
  });

  it("⚠️ a betöltéskori szkript IS a napszakot nézi, nem a prefers-color-scheme-et", () => {
    // Ha csak a React-komponens váltana, a lap FOUC-cal indulna és
    // menü nélkül soha nem frissülne.
    expect(LAYOUT).toContain("var napszak=function(){var h=new Date().getHours();return (h>=6&&h<18)?'warm':'dark';}");
    expect(LAYOUT).not.toContain("prefers-color-scheme: dark')");
  });

  it("⚠️ nyitott appban is vált: időzítő a határra + visibilitychange", () => {
    // Az időzítő önmagában kevés — a böngésző a háttérben felfüggeszti.
    expect(LAYOUT).toContain("visibilitychange");
    expect(LAYOUT).toContain("setTimeout(frissit");
    expect(TOGGLE).toContain("visibilitychange");
  });

  it("⚠️ a KÉZI választás erősebb az óránál — azt a napszak nem írja felül", () => {
    // A `frissit` legelső dolga a mentett érték újraolvasása.
    expect(LAYOUT).toContain("if(s==='dark'||s==='warm')return;");
    expect(TOGGLE).toMatch(/localStorage\.removeItem\(STORAGE_KEY\)/);
    expect(TOGGLE).not.toMatch(/setItem\(STORAGE_KEY,\s*["']system["']\)/);
  });

  it("⚠️ a téma KIZÁRÓLAG a data-theme-en dől el, nincs vak CSS-média-ág", () => {
    // Egy `@media (prefers-color-scheme: dark)` blokk a stíluslapban felülütné
    // a kézi „Világos" választást is — ez a visszatérő sötét-mód hibaosztály.
    expect(CSS).not.toMatch(/@media[^{]*prefers-color-scheme/);
    expect(CSS).toMatch(/\[data-theme="dark"\]/);
    expect(CSS).toMatch(/\[data-theme="warm"\]/);
  });

  it("⚠️ a magyarázó szöveg NINCS a vezérlő alatt", () => {
    // A felhasználó kérésére eltávolítva; a napszak-logika magától érthető.
    expect(TOGGLE).not.toContain("Az eszközöd most");
  });
});
