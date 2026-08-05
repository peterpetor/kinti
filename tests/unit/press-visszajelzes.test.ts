import { describe, it, expect } from "vitest";
import { readFileSync, globSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Press-visszajelzés (push-down): a megnyomott felület összenyomódik.
 *
 * ⚠️ A LÉNYEG A FELENGEDÉS, NEM A LENYOMÁS. A lenyomás eddig is megvolt
 * (`active:scale-*` 460+ helyen), de az átmenet CSAK a `:active` szabályban
 * szerepelt — vagyis abban a pillanatban, amikor a felhasználó felemeli az
 * ujját, a szabály megszűnik érvényesnek lenni, és nincs mit interpolálni:
 * az elem VISSZAUGRIK. A natív érzet ezzel szemben aszimmetrikus: lefelé
 * gyors és lineáris, felfelé rugós.
 *
 * ⚠️ MÁSODIK CSAPDA: a Tailwind `transition` osztály `transform`-ot is animál,
 * és mint utility felülírja a `.kinti-press` (base layer) átmenetét. Aki
 * `.kinti-press`-t tesz egy elemre, de rajta hagyja a puszta `transition`-t,
 * az visszakapja a régi, szimmetrikus mozgást — csendben. Ezért van rá őr.
 */

const GYOKER = resolve(__dirname, "../..");
const CSS = readFileSync(resolve(GYOKER, "src/app/globals.css"), "utf8");
const TW = readFileSync(resolve(GYOKER, "tailwind.config.ts"), "utf8");

describe("gomb-press", () => {
  it("⚠️ van ALAP átmenet is, nem csak `:active`-ben (különben visszaugrik)", () => {
    // A `:active` NÉLKÜLI szabálynak kell tartalmaznia a transitiont.
    expect(CSS).toMatch(
      /button:not\(:disabled\),\s*\n\s*\[role="button"\]\s*\{\s*\n\s*transition:\s*transform\s+var\(--kinti-spring-pop-ido\)/,
    );
  });

  it("a lenyomás és a felengedés NEM ugyanaz a görbe", () => {
    const aktiv = CSS.match(
      /button:not\(:disabled\):active,[\s\S]{0,200}?transition:\s*transform\s+([^;]+);/,
    );
    expect(aktiv, "nincs :active átmenet").not.toBeNull();
    // Lefelé: rövid és nem rugós — az ujj alatt azonnal reagáljon.
    expect(aktiv![1]).toContain("ease-out");
    expect(aktiv![1], "a lenyomás is rugózik — az késleltetettnek hat").not.toContain("spring");
  });
});

describe(".kinti-press (kártyák)", () => {
  it("az osztály létezik, felülírható mértékkel", () => {
    expect(CSS).toMatch(/\.kinti-press\s*\{[\s\S]{0,200}--kinti-press:\s*0\.9/);
    expect(CSS).toMatch(/\.kinti-press:active\s*\{[\s\S]{0,120}scale\(var\(--kinti-press\)\)/);
  });

  it("rugóval enged fel", () => {
    const blokk = CSS.slice(CSS.indexOf(".kinti-press {"), CSS.indexOf(".kinti-press:active"));
    expect(blokk).toContain("var(--kinti-spring-pop)");
  });

  it("van reduced-motion ág (a transzformációra IS, nem csak az átmenetre)", () => {
    const i = CSS.indexOf(".kinti-press:active");
    const utana = CSS.slice(i, i + 700);
    expect(utana).toContain("prefers-reduced-motion");
    // Csak az átmenet kikapcsolása kevés: a mozgásra érzékeny felhasználó
    // ugráló felületet kapna átmenet nélkül.
    expect(utana).toMatch(/\.kinti-press:active\s*\{\s*\n?\s*transform:\s*none/);
  });

  it("⚠️ NEM `a:active` globálisan — szöveg-közi link nem nyomódik össze", () => {
    expect(CSS).not.toMatch(/^\s*a:active\s*\{/m);
  });
});

describe("a Tailwind alapgörbéje a mienk", () => {
  it("⚠️ `transitionTimingFunction.DEFAULT` a `--kinti-ease`", () => {
    // Enélkül a 460+ puszta `transition` osztály a Tailwind saját görbéjével
    // futna — az „egy mozgás-görbe az egész appnak" szabály ki lett mondva, és
    // közben a felület nagy része mást mozgott.
    const blokk = TW.slice(
      TW.indexOf("transitionTimingFunction:"),
      TW.indexOf("transitionTimingFunction:") + 400,
    );
    expect(blokk).toMatch(/DEFAULT:\s*"var\(--kinti-ease\)"/);
    expect(blokk).toMatch(/"kinti-spring":\s*"var\(--kinti-spring\)"/);
  });
});

describe("nincs ütköző utility a .kinti-press mellett", () => {
  it("⚠️ ahol `.kinti-press` van, ott nincs puszta `transition` és `active:scale-*`", () => {
    const fajlok = globSync("src/**/*.tsx", { cwd: GYOKER }).map((f) => f.replace(/\\/g, "/"));
    const vetkesek: string[] = [];
    for (const f of fajlok) {
      const src = readFileSync(resolve(GYOKER, f), "utf8");
      if (!src.includes("kinti-press")) continue;
      // Soronként nézzük: egy fájlban lehet másik elem is a saját stílusával.
      src.split("\n").forEach((sor, i) => {
        if (!sor.includes("kinti-press")) return;
        // A puszta `transition` (nem `transition-shadow`, `transition-transform` stb.)
        if (/\btransition(?=["'\s])/.test(sor)) {
          vetkesek.push(`${f}:${i + 1} — puszta \`transition\` felülírja a rugót`);
        }
        if (/\bactive:scale-/.test(sor)) {
          vetkesek.push(`${f}:${i + 1} — \`active:scale-*\` felülírja a mértéket`);
        }
      });
    }
    expect(vetkesek, vetkesek.join("\n")).toEqual([]);
  });

  it("a szűrő tényleg megkülönbözteti a két alakot", () => {
    // Kétirányú ellenőrzés: enélkül egy elrontott regex némán mindent átengedne.
    const rossz = 'className="kinti-press transition active:scale-[0.99]"';
    const jo = 'className="kinti-press transition-shadow"';
    expect(/\btransition(?=["'\s])/.test(rossz)).toBe(true);
    expect(/\btransition(?=["'\s])/.test(jo)).toBe(false);
    expect(/\bactive:scale-/.test(rossz)).toBe(true);
    expect(/\bactive:scale-/.test(jo)).toBe(false);
  });
});
