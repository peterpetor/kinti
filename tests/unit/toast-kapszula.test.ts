import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Toast: felülről ereszkedő kapszula (Dynamic Island-logika).
 *
 * ⚠️ MIÉRT FELÜL. Korábban a TabBar fölött úszott fel. A megerősítés viszont
 * arra a MŰVELETRE vonatkozik, amit a felhasználó épp elvégzett, és az ujja
 * ilyenkor a képernyő alján van — a saját keze takarta ki a visszajelzést.
 *
 * ⚠️ A KILÉPÉS KÜLÖN ÁLLAPOT. Enélkül a kapszula egyik képkockáról a másikra
 * eltűnne. A React egyszerűen kiveszi a listából, és a CSS-nek nincs mit
 * animálnia — kilépő animációhoz a csomópontnak még a DOM-ban kell lennie.
 */

const GYOKER = resolve(__dirname, "../..");
const CSS = readFileSync(resolve(GYOKER, "src/app/globals.css"), "utf8");
const HOST = readFileSync(resolve(GYOKER, "src/components/ui/toast-host.tsx"), "utf8");

describe("toast — pozíció", () => {
  it("⚠️ FELÜL van, nem alul", () => {
    expect(HOST).toMatch(/top:\s*"calc\(env\(safe-area-inset-top\)/);
    expect(HOST, "a régi, alsó pozicionálás visszacsúszott").not.toMatch(/bottom:\s*"calc\(env\(safe-area-inset-bottom\)/);
  });

  it("a notch-scrim (z-80) FÖLÖTT ül, különben állványos PWA-ban alá úszna", () => {
    const m = HOST.match(/z-\[(\d+)\]/);
    expect(m, "nincs explicit z-index a toast-sínen").not.toBeNull();
    expect(Number(m![1])).toBeGreaterThan(80);
  });
});

describe("toast — mozgás", () => {
  it("a belépés TÚLLENDÜL (kapszula-pattanás), a kilépés NEM", () => {
    const be = CSS.slice(CSS.indexOf(".kinti-toast-in {"), CSS.indexOf(".kinti-toast-out {"));
    const ki = CSS.slice(CSS.indexOf(".kinti-toast-out {"), CSS.indexOf(".kinti-toast-out {") + 160);
    expect(be).toContain("--kinti-ease-pop");
    // A kilépő visszapattanás azt sugallná, hogy még történik valami.
    expect(ki).toContain("var(--kinti-ease)");
    expect(ki).not.toContain("--kinti-ease-pop");
  });

  it("a belépő animáció FELÜLRŐL jön (negatív eltolás)", () => {
    const kf = CSS.slice(CSS.indexOf("@keyframes kintiToastIn"), CSS.indexOf("@keyframes kintiToastOut"));
    expect(kf).toMatch(/translateY\(-\d/);
    // Kicsiből nő a helyére — ez adja a kapszula-érzetet.
    expect(kf).toMatch(/scale\(0\.\d+\)/);
  });

  it("van reduced-motion ág MINDKÉT irányra", () => {
    const rm = CSS.slice(CSS.indexOf(".kinti-toast-out {"), CSS.indexOf(".kinti-toast-out {") + 400);
    expect(rm).toContain("prefers-reduced-motion");
    expect(rm).toContain(".kinti-toast-in");
    expect(rm).toContain(".kinti-toast-out");
  });
});

describe("toast — kilépő állapot", () => {
  it("a lejárat NEM azonnali eltávolítás, hanem előbb `tavozo` jelölés", () => {
    expect(HOST).toContain("tavozo");
    expect(HOST).toMatch(/kinti-toast-out/);
    // A lejárati időzítő a záró animációt indítja, nem a törlést.
    expect(HOST).toMatch(/setTimeout\(\(\)\s*=>\s*zar\(t\.id\), t\.duration\)/);
  });

  it("⚠️ a kilépés hossza egyezik a CSS-beli időtartammal", () => {
    // Ha elcsúsznak, vagy levágódik az animáció, vagy a kapszula ott ragad.
    const m = HOST.match(/KILEPES_MS\s*=\s*(\d+)/);
    expect(m).not.toBeNull();
    const ms = Number(m![1]);
    const cssMs = Number((CSS.match(/animation:\s*kintiToastOut\s+([\d.]+)s/) ?? [])[1]) * 1000;
    expect(cssMs, "nincs kintiToastOut időtartam a CSS-ben").toBeGreaterThan(0);
    expect(ms).toBe(cssMs);
  });

  it("kapszula-forma marad (rounded-pill)", () => {
    expect(HOST).toContain("rounded-pill");
  });
});
