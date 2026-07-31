import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

/**
 * ⚠️ A NAGYÍTÁS TILTÁSA TUDATOSAN KIVEZETETT DÖNTÉS — ez a teszt őrzi.
 *
 * A gyökér-elrendezés korábban `maximumScale: 1`-et állított, ami LETILTOTTA a
 * csippentéses nagyítást. Ez WCAG 2.1 AA (1.4.4 „Resize text") sértés, és nem
 * elméleti: az app két leggyakoribb szövegmérete a 11px és a 11,5px (912
 * előfordulás; a méretezett szövegek 35%-a 12px alatti). Apró szöveg, amit a
 * felhasználó nem tudott felnagyítani — az idősebb, kint élő magyar
 * korosztálynak valódi akadály. A hat országból négy EU-tag, ahol 2025
 * júniusától az akadálymentességi irányelv is érvényes.
 *
 * ⚠️ A beállítás egyetlen jogos célja (véletlen dupla-koppintásos nagyítás)
 * MÁR MEG VAN OLDVA a `touch-action: manipulation`-nel a globals.css-ben —
 * tehát a `maximumScale` fölösleges volt, csak a kárt okozta.
 *
 * A fájl-szintű ellenőrzés szándékos: a `layout.tsx` importja behúzná a teljes
 * Next/Clerk-fát, ami egy egysoros szabályhoz aránytalan.
 */
describe("viewport — a nagyítás nem tiltható le", () => {
  const layout = readFileSync("src/app/layout.tsx", "utf8");

  it("a gyökér-elrendezés NEM állít maximumScale-t", () => {
    // Csak a tényleges beállítást keressük, a magyarázó kommentet nem.
    const active = layout
      .split("\n")
      .filter((l) => !l.trim().startsWith("//"))
      .join("\n");
    expect(active).not.toMatch(/maximumScale\s*:/);
  });

  it("a gyökér-elrendezés NEM tiltja a felhasználói méretezést", () => {
    const active = layout
      .split("\n")
      .filter((l) => !l.trim().startsWith("//"))
      .join("\n");
    expect(active).not.toMatch(/userScalable\s*:\s*false/);
    expect(active).not.toMatch(/user-scalable\s*=\s*no/);
  });

  it("a statikus landing-oldal sem tiltja", () => {
    const landing = readFileSync("public/landing.html", "utf8");
    const vp = landing.match(/<meta name="viewport" content="([^"]*)"/);
    expect(vp, "nincs viewport meta a landing.html-ben").not.toBeNull();
    expect(vp![1]).not.toMatch(/maximum-scale|user-scalable\s*=\s*no/);
  });
});
