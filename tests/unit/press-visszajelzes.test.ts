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
  /**
   * ⚠️⚠️ EZ AZ ŐR EGYSZER MÁR ÁTENGEDETT EGY VALÓS HIBÁT, ÉS ÉLES MÉRÉS FOGTA MEG.
   * Az első változata csak a PUSZTA `transition` utility-t tiltotta, mert azt
   * hittem, a `transition-shadow` „csak az árnyékot adja hozzá". Nem: a
   * `transition` CSS-shorthand, tehát BÁRMELYIK `transition-*` utility a
   * utilities layerből TELJESEN felülírja a `.kinti-press` (base layer)
   * szabályát. Élesben mérve a kártyán a `transition-property` `box-shadow`
   * lett, a `transform` kiesett belőle, és a press-visszaengedés animáció
   * nélkül, ugorva történt — vagyis pontosan az a hiba maradt bent, amit az
   * osztály javítani hivatott. A forrás-alapú teszt zöld volt közben.
   */
  const TILTOTT = /\btransition(?:-[a-z]+)?(?=["'\s])/;
  const AKTIV_SCALE = /\bactive:scale-/;

  it("⚠️ ahol `.kinti-press` van, ott SEMMILYEN `transition-*` és `active:scale-*`", () => {
    const fajlok = globSync("src/**/*.tsx", { cwd: GYOKER }).map((f) => f.replace(/\\/g, "/"));
    const vetkesek: string[] = [];
    for (const f of fajlok) {
      const src = readFileSync(resolve(GYOKER, f), "utf8");
      if (!src.includes("kinti-press")) continue;
      // Soronként nézzük: egy fájlban lehet másik elem is a saját stílusával.
      // A megjegyzés-sorokat kihagyjuk — azok magyarázzák ezt a szabályt.
      src.split("\n").forEach((sor, i) => {
        if (!sor.includes("kinti-press")) return;
        if (/^\s*(\/\/|\*|\/\*)/.test(sor)) return;
        if (TILTOTT.test(sor)) {
          vetkesek.push(`${f}:${i + 1} — \`transition-*\` FELÜLÍRJA a rugót (shorthand!)`);
        }
        if (AKTIV_SCALE.test(sor)) {
          vetkesek.push(`${f}:${i + 1} — \`active:scale-*\` felülírja a mértéket`);
        }
      });
    }
    expect(vetkesek, vetkesek.join("\n")).toEqual([]);
  });

  it("a .kinti-press maga animálja az árnyékot is", () => {
    // Ha nem tenné, a kártyák elvesztenék a hover-árnyék átmenetét, amint a
    // `transition-shadow` utility-t levesszük róluk.
    const blokk = CSS.slice(CSS.indexOf(".kinti-press {"), CSS.indexOf(".kinti-press:active"));
    expect(blokk).toContain("transform var(--kinti-spring-pop-ido)");
    expect(blokk).toContain("box-shadow");
  });

  it("a szűrő MINDEN transition-alakot fog (kétirányú próba)", () => {
    // Enélkül egy elrontott regex némán mindent átengedne — ez pontosan
    // megtörtént: a `transition-shadow` átcsúszott a régi mintán.
    for (const rossz of [
      'className="kinti-press transition"',
      'className="kinti-press transition-shadow"',
      'className="kinti-press transition-all shadow-card"',
      'className="kinti-press transition-transform"',
    ]) {
      expect(TILTOTT.test(rossz), `nem fogja: ${rossz}`).toBe(true);
    }
    // Amit NEM szabad fognia: a rugót nem érintő osztályok.
    for (const jo of ['className="kinti-press shadow-card"', 'className="kinti-press hover:shadow-card-hover"']) {
      expect(TILTOTT.test(jo), `tévesen fogja: ${jo}`).toBe(false);
    }
    expect(AKTIV_SCALE.test('className="kinti-press active:scale-[0.99]"')).toBe(true);
    expect(AKTIV_SCALE.test('className="kinti-press shadow-card"')).toBe(false);
  });
});
