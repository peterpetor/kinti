import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * A rendszer-téma követésének őre.
 *
 * ⚠️ A JAVÍTOTT HIBA (2026-08-01): a layout inline szkriptje CSAK a mentett
 * választást olvasta. Aki soha nem nyúlt a téma-váltóhoz — tehát a felhasználók
 * túlnyomó része —, annál `data-theme` se került ki, és maradt a világos
 * alapértelmezés. Élesben mérve: `colorScheme: dark` böngészőben `data-theme`
 * = „warm", body-fény 0.93. Vagyis sötét módra állított telefonon a Kinti
 * VILÁGOSAN nyílt — a legfeltűnőbb „ez egy weboldal, nem app" jel.
 *
 * A logika, amit ez a teszt véd: MENTETT VÁLASZTÁS > NAPSZAK.
 *
 * ⚠️ 2026-08-08-tól a „Rendszer” mód NAPSZAK szerint dönt (06–18 világos),
 * nem a `prefers-color-scheme` szerint — ld. `tema-rendszer.test.ts`.
 *
 * ⚠️ A viselkedés egy inline szkript-SZTRINGBEN él (FOUC-mentesség miatt kell a
 * festés elé), ezért nem futtatható unit-tesztként — szerkezeti ellenőrzés.
 */
const LAYOUT = readFileSync(resolve(process.cwd(), "src/app/layout.tsx"), "utf8");
const TOGGLE = readFileSync(
  resolve(process.cwd(), "src/components/theme-toggle.tsx"),
  "utf8",
);
const SCRIPT = LAYOUT.slice(
  LAYOUT.indexOf("const THEME_INIT_SCRIPT"),
  LAYOUT.indexOf("export const metadata"),
);

describe("téma — a rendszer-beállítás az alapértelmezés", () => {
  it("⚠️ az init-szkript a NAPSZAKOT nézi, nem a prefers-color-scheme-et", () => {
    // 2026-08-08: a „Rendszer” mód napszak-alapú lett. A böngésző-beállítás
    // sok készüléken fixen sötét (Androidon a Chrome saját témája dönt),
    // ezért a régi logika gyakorlatilag „mindig sötét”-et jelentett.
    expect(SCRIPT).toContain("var napszak=function()");
    expect(SCRIPT).toContain("(h>=6&&h<18)?'warm':'dark'");
    expect(SCRIPT).not.toContain("prefers-color-scheme: dark");
  });

  it("a MENTETT választás erősebb a rendszernél", () => {
    // A `manual` kapu nélkül a rendszer felülírná a felhasználó döntését.
    expect(SCRIPT).toMatch(/manual\s*=\s*\(?t\s*===\s*'dark'/);
    expect(SCRIPT).toMatch(/if\s*\(\s*!manual\s*\)/);
  });

  it("a data-theme MINDIG kikerül (nem csak mentett választásnál)", () => {
    // Ez volt a hiba lényege: a régi kód `if(t==='dark'||t==='warm')` mögé
    // rejtette a beállítást, így választás nélkül semmi nem történt.
    expect(SCRIPT).toContain("document.documentElement.dataset.theme=t");
  });

  it("⚠️ élőben is vált: időzítő a HATÁRRA + visibilitychange", () => {
    // Az időzítő önmagában kevés: a böngésző a háttérben felfüggeszti,
    // tehát egy éjszakán át nyitva hagyott lap nem váltana reggel.
    expect(SCRIPT).toContain("setTimeout(frissit");
    expect(SCRIPT).toContain("visibilitychange");
  });

  it("⚠️ a napszak-frissítő félreáll, ha van kézi választás", () => {
    // Enélkül az óra felülírná a felhasználó döntését.
    const frissit = SCRIPT.slice(SCRIPT.indexOf("var frissit=function"));
    expect(frissit).toContain("localStorage.getItem(K)");
    expect(frissit).toContain("if(s==='dark'||s==='warm')return;");
  });

  it("a böngésző-króm színe együtt vált a témával", () => {
    expect(SCRIPT).toContain("#101411"); // sötét
    expect(SCRIPT).toContain("#f4ede0"); // világos
    expect(SCRIPT).toContain('meta[name="theme-color"]');
  });
});

describe("téma-váltó — vissza lehet térni az automatikára", () => {
  it("⚠️ három mód van, és a Napszak az első", () => {
    // A felirat 2026-08-08-tól „Napszak" (az óra dönt), a belső azonosító
    // viszont MARADT "system" — azt a mentett-érték logika és az init-szkript
    // is ismeri, átnevezni némán elrontaná a visszatérő felhasználók témáját.
    expect(TOGGLE).toContain('label: "Napszak"');
    expect(TOGGLE).not.toContain('label: "Rendszer"');
    const modes = TOGGLE.slice(TOGGLE.indexOf("const MODES"));
    expect(modes).toContain('id: "system"');
    expect(modes).toContain('id: "warm"');
    expect(modes).toContain('id: "dark"');
    expect(modes.indexOf('id: "system"')).toBeLessThan(modes.indexOf('id: "warm"'));
  });

  it("⚠️ a Rendszer mód TÖRLI a kulcsot, nem egy harmadik értéket ment", () => {
    // Az init-szkript és a matchMedia-figyelő is a kulcs HIÁNYÁRA épül; egy
    // 'system' nevű tárolt érték mindkettőt elrontaná (nem 'dark'/'warm' →
    // manual=false, de a váltó mégis kézi választásnak hinné).
    expect(TOGGLE).toContain("localStorage.removeItem(STORAGE_KEY)");
  });

  it("⚠️ a váltó állapota a MENTETT értékből jön, nem a data-theme-ből", () => {
    // A data-theme csak a VÉGEREDMÉNYT mutatja: abból nem derülne ki, hogy a
    // sötétet a rendszer vagy a felhasználó kérte — a váltó „Sötét"-et
    // jelölne meg olyankor is, amikor valójában „Rendszer" az aktív mód.
    const fn = TOGGLE.slice(TOGGLE.indexOf("function currentMode"));
    expect(fn).toContain("localStorage.getItem(STORAGE_KEY)");
    expect(fn.slice(0, fn.indexOf("}"))).not.toContain("dataset.theme");
  });
});
