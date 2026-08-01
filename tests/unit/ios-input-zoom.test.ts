import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Az iOS auto-zoom elleni szabály őre.
 *
 * ⚠️ A HIBA: a Safari BELENAGYÍT a lapba, ha egy beviteli mező betűmérete
 * 16px ALATT van — és utána nagyítva is marad, a felhasználónak kézzel kell
 * visszahúznia. Mérve (iPhone 13, éles, 8 útvonal): **25 mezőből 24 volt 16px
 * alatt** (13–15px), vagyis gyakorlatilag MINDEN űrlapmező nagyított.
 *
 * ⚠️⚠️ A KÉT SZABÁLY ÖSSZEFÜGG, ÉS KÖNNYŰ ROSSZUL „JAVÍTANI":
 * a tünetet korábban a `viewport.maximumScale = 1` elfedte, DE azt
 * 2026-07-31-én HELYESEN kivezettük, mert a felhasználói nagyítást is
 * letiltotta (akadálymentesség — külön teszt őrzi). Aki ezt a tünetet később
 * újra látja, NE a nagyítás-tiltást hozza vissza: a megoldás a betűméret.
 */
const CSS = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");
const LAYOUT = readFileSync(resolve(process.cwd(), "src/app/layout.tsx"), "utf8");

/**
 * ⚠️ A magyarázó kommentek IDÉZIK a kivezetett beállítást („a `maximumScale: 1`
 * KIVÉVE…"), ezért a „nincs benne" állításokat a kommentektől MEGTISZTÍTOTT
 * forráson kell nézni — különben a dokumentáció buktatja meg a saját tesztjét.
 * (Ez a munkamenetben MÁSODSZOR fordult elő; ld. business-detail-order.test.ts.)
 */
const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const LAYOUT_CODE = stripComments(LAYOUT);

describe("iOS auto-zoom — a mezők betűmérete", () => {
  it("van érintőképernyőre szóló 16px-es szabály", () => {
    const blokk = CSS.slice(CSS.indexOf("@media (pointer: coarse)"));
    expect(blokk, "hiányzik a `@media (pointer: coarse)` blokk").toBeTruthy();
    expect(blokk).toMatch(/font-size:\s*16px\s*!important/);
  });

  it("mindhárom mezőtípusra vonatkozik", () => {
    const blokk = CSS.slice(CSS.indexOf("@media (pointer: coarse)"));
    const fej = blokk.slice(0, blokk.indexOf("font-size"));
    expect(fej).toContain("input");
    expect(fej).toContain("textarea");
    expect(fej).toContain("select");
  });

  it("a jelölőnégyzet/rádió/csúszka KI van véve", () => {
    // Azoknak a mérete nem a szövegtől függ; a 16px szétverné az elrendezést.
    const blokk = CSS.slice(CSS.indexOf("@media (pointer: coarse)"));
    expect(blokk).toContain('not([type="checkbox"])');
    expect(blokk).toContain('not([type="radio"])');
  });

  it("CSAK érintőn — egérrel maradnak a tervezett méretek", () => {
    expect(CSS).toContain("@media (pointer: coarse)");
  });

  it("a hosszú opció nem vágódik le csúnyán (select-csonkolás)", () => {
    // Mérve: az Állások „Egész Németország (minden régió)" választója 16px-en
    // 281px-et kért egy 274px-es dobozban. 14px-en épp befért — a csonkolás
    // hiánya tehát RÉGI adósság volt, csak a 16px hozta felszínre.
    const blokk = CSS.slice(CSS.indexOf("@media (pointer: coarse)"));
    expect(blokk).toContain("text-overflow: ellipsis");
  });

  it("⚠️ a nagyítás-tiltás NEM jött vissza (akadálymentesség)", () => {
    // A rossz „javítás" ellen: a maximumScale=1 elrejtené a tünetet, miközben
    // a valódi felhasználói nagyítást is megölné.
    const vp = LAYOUT_CODE.slice(LAYOUT_CODE.indexOf("export const viewport"));
    expect(vp).not.toMatch(/maximumScale:\s*1\b/);
    expect(vp).not.toMatch(/userScalable:\s*false/);
  });
});
