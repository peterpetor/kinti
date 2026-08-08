import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * A „Rendszer” téma-mód őre.
 *
 * ⚠️ 2026-08-08-i user-jelzés: „a Rendszeren vagyok, de MINDIG sötétet mutat”.
 * A logikát megmértem az éles oldalon, és HELYES: világos rendszeren
 * `data-theme=warm` + krém háttér, sötéten `dark` + fenyő-fekete. A hiba a
 * VISSZAJELZÉSBEN volt: a vezérlő nem árulta el, mit jelent épp a „Rendszer”,
 * így nem lehetett megkülönböztetni a helyes működést az elromlástól.
 *
 * ⚠️⚠️ ANDROIDON A BÖNGÉSZŐ SAJÁT TÉMÁJA DÖNT, nem az Android rendszer-témája:
 * ha a Chrome témája „Sötét”, a TWA-app ÉS a weboldal is sötét marad, hiába
 * világos a telefon. Ezért látszott ugyanaz mindkét úton.
 */

const GYOKER = resolve(__dirname, "../..");
const olvas = (p: string) => readFileSync(resolve(GYOKER, p), "utf8").replace(/\r\n/g, "\n");

const TOGGLE = olvas("src/components/theme-toggle.tsx");
const LAYOUT = olvas("src/app/layout.tsx");
const CSS = olvas("src/app/globals.css");

describe("„Rendszer” mód", () => {
  it("⚠️ a „Rendszer” a kulcs TÖRLÉSE, nem harmadik tárolt érték", () => {
    // Ha „system” néven tárolnánk, a layout inline szkriptje `manual`-nak
    // hinné, és befagyasztaná az utoljára alkalmazott témát.
    expect(TOGGLE).toMatch(/localStorage\.removeItem\(STORAGE_KEY\)/);
    expect(TOGGLE).not.toMatch(/setItem\(STORAGE_KEY,\s*["']system["']\)/);
  });

  it("a betöltéskori szkript CSAK kézi választás hiányában követi a rendszert", () => {
    expect(LAYOUT).toContain("var manual=(t==='dark'||t==='warm')");
    expect(LAYOUT).toContain("if(!manual){t=(mq&&mq.matches)?'dark':'warm';}");
  });

  it("⚠️ a rendszer-váltásra ÉLŐBEN reagál, de a kézi választást tiszteletben tartja", () => {
    // A `change`-figyelő minden eseménynél újraolvassa a mentett értéket:
    // aki kézzel világosat kért, annak a rendszer sötétre váltása se írja felül.
    expect(LAYOUT).toMatch(/mq\.addEventListener\('change',h\)/);
    expect(LAYOUT).toMatch(/if\(s==='dark'\|\|s==='warm'\)return;/);
  });

  it("⚠️ a vezérlő MEGMONDJA, mit jelent épp a „Rendszer”", () => {
    // Enélkül a helyes működés és az elromlás megkülönböztethetetlen.
    expect(TOGGLE).toContain("rendszerTema");
    expect(TOGGLE).toMatch(/mode === "system" && rendszerTema/);
    expect(TOGGLE).toMatch(/Az eszközöd most/);
  });

  it("⚠️ a téma KIZÁRÓLAG a data-theme-en dől el, nincs vak CSS-média-ág", () => {
    // Egy `@media (prefers-color-scheme: dark)` blokk a stíluslapban felülütné
    // a kézi „Világos” választást is — pont ez a visszatérő sötét-mód hibaosztály.
    expect(CSS).not.toMatch(/@media[^{]*prefers-color-scheme/);
    expect(CSS).toMatch(/\[data-theme="dark"\]/);
    expect(CSS).toMatch(/\[data-theme="warm"\]/);
  });
});
