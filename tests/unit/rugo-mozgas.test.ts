import { describe, it, expect } from "vitest";
import { readFileSync, globSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Mozgás-tokenek: egy görbe-készlet az egész appnak, valódi rugóval.
 *
 * A `cubic-bezier` négy kontrollpontja EGYETLEN irányváltást tud leírni:
 * túllendül, aztán monoton beáll. A natív iOS-mozgás ezzel szemben csillapított
 * rugó — túllendül, VISSZALENG, és úgy ül be. Ezt a `linear()` easing adja meg,
 * mert az a görbét pontonként mintavételezi.
 *
 * ⚠️ A FALLBACK NEM ELHAGYHATÓ, és ez a teszt fő tétje. A `linear()` Chrome 113 /
 * Safari 17.2 / Firefox 112 óta van meg. Régebbi böngészőben az érték ÉRVÉNYTELEN,
 * és a CSS ilyenkor nem a korábbi görbére esik vissza, hanem az EGÉSZ deklarációt
 * eldobja — vagyis a böngésző alap `ease`-ét kapnánk. Ezért kell a tokent előbb
 * bezier-rel definiálni, és csak `@supports` mögött felülírni.
 */

const GYOKER = resolve(__dirname, "../..");
const CSS = readFileSync(resolve(GYOKER, "src/app/globals.css"), "utf8");

/** A `:root` blokk a `@supports`-on KÍVÜL (az alap-definíciók helye). */
const ROOT_ELEJE = CSS.slice(0, CSS.indexOf("@supports (transition-timing-function"));

describe("rugó-tokenek", () => {
  it("mind a négy token definiálva van", () => {
    for (const t of [
      "--kinti-spring:",
      "--kinti-spring-ido:",
      "--kinti-spring-pop:",
      "--kinti-spring-pop-ido:",
    ]) {
      expect(ROOT_ELEJE, `hiányzik: ${t}`).toContain(t);
    }
  });

  it("⚠️ az ALAP definíció bezier-fallback, NEM linear()", () => {
    // Ha a linear() lenne az alap, régi böngészőn a böngésző `ease`-ét kapnánk.
    const alap = ROOT_ELEJE.match(/--kinti-spring:\s*([^;]+);/);
    expect(alap).not.toBeNull();
    expect(alap![1]).not.toContain("linear(");
    expect(alap![1]).toContain("var(--kinti-ease");

    const alapPop = ROOT_ELEJE.match(/--kinti-spring-pop:\s*([^;]+);/);
    expect(alapPop).not.toBeNull();
    expect(alapPop![1]).not.toContain("linear(");
  });

  it("a linear() felülírás `@supports` mögött van", () => {
    const i = CSS.indexOf("@supports (transition-timing-function: linear(0, 1))");
    expect(i, "nincs @supports kapu a linear() körül").toBeGreaterThan(-1);
    // A blokkon belül tényleg felülírja mindkettőt.
    const blokk = CSS.slice(i, i + 900);
    expect(blokk).toMatch(/--kinti-spring:\s*linear\(/);
    expect(blokk).toMatch(/--kinti-spring-pop:\s*linear\(/);
  });
});

describe("a rugó-görbék tényleg rugók", () => {
  /** Kiszedi a `linear(...)` számsorát tokennév alapján. */
  function gorbe(nev: string): number[] {
    const m = CSS.match(new RegExp(`${nev}:\\s*linear\\(([^)]+)\\)`));
    expect(m, `nincs linear() érték: ${nev}`).not.toBeNull();
    return m![1]
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => !Number.isNaN(n));
  }

  /** Hány irányváltás van a görbében (ennyiszer „leng"). */
  function lengesek(a: number[]): number {
    let n = 0;
    for (let i = 2; i < a.length; i++) {
      const emelkedik1 = a[i - 1] - a[i - 2] > 0.0005;
      const emelkedik2 = a[i] - a[i - 1] > 0.0005;
      if (emelkedik1 !== emelkedik2) n++;
    }
    return n;
  }

  it("0-ról indulnak és 1 körül állnak be", () => {
    for (const nev of ["--kinti-spring", "--kinti-spring-pop"]) {
      const g = gorbe(nev);
      expect(g.length, `${nev}: túl kevés minta`).toBeGreaterThanOrEqual(20);
      expect(g[0], `${nev}: nem 0-ról indul`).toBe(0);
      expect(Math.abs(g[g.length - 1] - 1), `${nev}: nem 1-nél áll be`).toBeLessThan(0.01);
    }
  });

  it("⚠️ a MIKRO-rugó vissza is leng, a MODÁLIS alig lendül túl", () => {
    // Ez a lényegi különbség a bezierhez képest: a mikro-elem oda-vissza
    // mozdul. Ha ez valaha 1 lengésre esne, elveszne a fizikai érzet.
    const pop = gorbe("--kinti-spring-pop");
    expect(lengesek(pop), "a mikro-rugó nem leng vissza").toBeGreaterThanOrEqual(3);
    expect(Math.max(...pop), "a mikro-rugó nem lendül túl").toBeGreaterThan(1.05);
    // Vissza is esik 1 alá — ez az „alullendülés".
    expect(Math.min(...pop.slice(10)), "nincs alullendülés").toBeLessThan(1);

    const modal = gorbe("--kinti-spring");
    // Egy nagy felület nagy kilengése olcsónak hat: itt szándékosan kicsi.
    const tul = Math.max(...modal);
    expect(tul, "a modális rugó egyáltalán nem lendül túl").toBeGreaterThan(1);
    expect(tul, "a modális rugó TÚL sokat lendül (nagy felület)").toBeLessThan(1.05);
  });

  it("egyik görbe sem lép ki a [0, 1.2] sávból", () => {
    // Nagyobb kilengés vizuálisan „gumis", és transzformnál levágásra futhat.
    for (const nev of ["--kinti-spring", "--kinti-spring-pop"]) {
      const g = gorbe(nev);
      expect(Math.min(...g)).toBeGreaterThanOrEqual(0);
      expect(Math.max(...g)).toBeLessThanOrEqual(1.2);
    }
  });
});

describe("nincs kézzel bemásolt görbe", () => {
  /**
   * ⚠️ EZ A TESZT VALÓS LELETET ŐRIZ. A globals.css maga írja elő, hogy egy
   * mozgás-görbe van az appnak — mégis öt helyen állt kézzel bemásolt bezier,
   * köztük kettő (0.16,1,0.3,1), ami sehol máshol nem szerepelt, és a két alsó
   * lap emiatt MÁSKÉPP mozgott. Ez nem hibaüzenet, csak érzet: teszt nélkül
   * nem derül ki.
   */
  it("a forrásban csak a token-definíció tartalmaz cubic-bezier-t", () => {
    const fajlok = globSync("src/**/*.{ts,tsx,css}", { cwd: GYOKER }).map((f) =>
      f.replace(/\\/g, "/"),
    );
    expect(fajlok.length).toBeGreaterThan(50);

    const vetkesek: string[] = [];
    for (const f of fajlok) {
      const src = readFileSync(resolve(GYOKER, f), "utf8");
      // A megjegyzések szövegében szabad említeni a szót — csak a tényleges
      // `cubic-bezier(` FÜGGVÉNYHÍVÁS a szabályszegés.
      const talalatok = src.match(/cubic-bezier\s*\(/g);
      if (!talalatok) continue;
      // A globals.css-ben a KÉT token-definíció (és csak az) megengedett.
      if (f.endsWith("globals.css")) {
        const definiciok = (src.match(/--kinti-ease(?:-pop)?:\s*cubic-bezier\(/g) ?? []).length;
        if (talalatok.length > definiciok) vetkesek.push(`${f} (${talalatok.length} db)`);
        continue;
      }
      vetkesek.push(`${f} (${talalatok.length} db)`);
    }
    expect(
      vetkesek,
      `használd a --kinti-ease / --kinti-spring tokent: ${vetkesek.join(", ")}`,
    ).toEqual([]);
  });
});

describe("a rugó tényleg használatban van", () => {
  it("⚠️ MINDKÉT alsó lap a rugóval mozog", () => {
    // Két külön BottomSheet él a repóban, a hívók fele-fele arányban oszlanak
    // meg köztük — a lap-szintű viselkedést mindkettőbe be kell tenni.
    for (const p of ["src/components/ui/bottom-sheet.tsx", "src/components/bottom-sheet.tsx"]) {
      const src = readFileSync(resolve(GYOKER, p), "utf8");
      expect(src, `${p}: nem a rugóval mozog`).toContain("var(--kinti-spring)");
    }
  });
});
