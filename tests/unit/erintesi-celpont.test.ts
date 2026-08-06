import { describe, it, expect } from "vitest";
import { readFileSync, globSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Érintési célpontok — a látható méret és a MEGFOGHATÓ terület szétválasztása.
 *
 * ⚠️ MÉRT HIBÁBÓL (2026-08-06, éles Playwright-mérés a /szaknevsor-on).
 * A listában 100 darab 32×32-es kedvenc-szív ült a kártyák sarkában,
 * közvetlenül a kártya-link mellett. Aki elvétette — menet közben, egy kézzel,
 * ez a tipikus eset —, az nem mentett, hanem MEGNYITOTTA az adatlapot: a hiba
 * büntetése egy teljes oldal-navigáció, és nem is derül ki, mit rontott el.
 *
 * Küszöbök: Apple HIG 44×44pt, WCAG 2.2 (2.5.8, AA) 24×24 CSS-px.
 * Ugyanez a mérés 9 elemet talált a WCAG-küszöb ALATT is — köztük a lábléc
 * jogi linkjeit (Impresszum / Adatvédelem / ÁSZF), 17 px magasan.
 */

const GYOKER = resolve(__dirname, "../..");
const olvas = (p: string) => readFileSync(resolve(GYOKER, p), "utf8").replace(/\r\n/g, "\n");
const CSS = olvas("src/app/globals.css");

describe("a kiterjesztett célpont (.kinti-tap)", () => {
  it("a pszeudo-elem 44 px-et céloz, a látható méret marad", () => {
    const blokk = CSS.slice(CSS.indexOf(".kinti-tap {"), CSS.indexOf(".kinti-tap {") + 500);
    expect(blokk).toContain("position: relative");
    expect(blokk).toMatch(/width:\s*max\(100%,\s*44px\)/);
    expect(blokk).toMatch(/height:\s*max\(100%,\s*44px\)/);
    // Középre igazítva — különben aszimmetrikusan nőne, és a szomszéd elem
    // találati területébe lógna.
    expect(blokk).toContain("translate(-50%, -50%)");
  });

  it("⚠️ NEM növeli a látható elemet (nincs háttér/keret a pszeudo-elemen)", () => {
    const blokk = CSS.slice(CSS.indexOf(".kinti-tap::after"), CSS.indexOf(".kinti-tap::after") + 400);
    expect(blokk).not.toMatch(/background(-color)?:/);
    expect(blokk).not.toMatch(/border:/);
  });
});

describe("hol van alkalmazva", () => {
  const HASZNALOK = globSync("src/**/*.tsx", { cwd: GYOKER })
    .map((f) => f.replace(/\\/g, "/"))
    .filter((f) => olvas(f).includes("kinti-tap"));

  it("a kedvenc-szív megkapta (ez volt a 100 példányos eset)", () => {
    expect(olvas("src/components/ui/favorite-button.tsx")).toContain("kinti-tap");
  });

  it("a fő navigációs belépők megkapták", () => {
    // A menü minden felső szintű oldalon ott van, a kereső-gomb a kezdőlapon —
    // ezek a leggyakrabban megnyomott 44 alatti gombok.
    expect(olvas("src/components/ui/dropdown-menu.tsx")).toContain("kinti-tap");
    expect(olvas("src/components/global-search.tsx")).toContain("kinti-tap");
  });

  it("a bezáró X-ek megkapták (ezek a legkisebbek, 24–28 px)", () => {
    for (const p of [
      "src/components/newsletter-cta-card.tsx",
      "src/components/pwa-install-card.tsx",
      "src/components/onboarding-checklist.tsx",
      "src/components/personalized-home.tsx",
    ]) {
      expect(olvas(p), `${p}: a bezáró gomb célpontja kicsi maradt`).toContain("kinti-tap");
    }
  });

  it("⚠️ NEM kerül `.glass` elemre (ütköző ::after)", () => {
    // A `.glass::after` a belső fényt rajzolja; két `::after` egy elemen nem
    // fér meg, a később definiált némán elnyelné a másikat.
    const vetkesek: string[] = [];
    for (const f of HASZNALOK) {
      for (const sor of olvas(f).split("\n")) {
        if (!sor.includes("kinti-tap")) continue;
        if (/\bglass\b/.test(sor)) vetkesek.push(f);
      }
    }
    expect(vetkesek, `.glass + .kinti-tap ütközik: ${vetkesek.join(", ")}`).toEqual([]);
  });

  it("⚠️ NEM kerül `overflow-hidden` elemre (levágná a célpontot)", () => {
    const vetkesek: string[] = [];
    for (const f of HASZNALOK) {
      for (const sor of olvas(f).split("\n")) {
        if (!sor.includes("kinti-tap")) continue;
        if (/overflow-hidden/.test(sor)) vetkesek.push(f);
      }
    }
    expect(vetkesek, `overflow-hidden levágja a célpontot: ${vetkesek.join(", ")}`).toEqual([]);
  });
});

describe("a lábléc jogi linkjei", () => {
  it("⚠️ függőleges padinggal érik el a WCAG-küszöböt", () => {
    // Éles mérés: 17 px magasak voltak (Impresszum 67×17, Adatvédelem 75×17,
    // ÁSZF 29×17, Visszatérítés 70×17) — a 24×24 alatt. Épp azok az oldalak,
    // amiket a legnehezebben találó felhasználónak kellene elérnie.
    const src = olvas("src/components/trust-bar.tsx");
    expect(src).toMatch(/-my-1\.5 py-1\.5/);
  });

  it("a lábléc magassága NEM nő (negatív margó veszi vissza)", () => {
    // Ha csak paddinget adnánk, a lábléc magasabb lenne — a `-my` ezt
    // kompenzálja, tehát a találati terület nő, a layout marad.
    const src = olvas("src/components/trust-bar.tsx");
    const m = src.match(/-my-(\d+\.?\d*) py-(\d+\.?\d*)/);
    expect(m, "nincs kiegyenlítő negatív margó").not.toBeNull();
    expect(m![1], "a negatív margó nem egyezik a paddinggal").toBe(m![2]);
  });
});
