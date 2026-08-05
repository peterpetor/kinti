import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { readFileSync, globSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Haptika — kontextus-érzékeny visszajelzés.
 *
 * ⚠️ KÉT DOLOG, AMI KÖNNYEN ÖSSZEKEVEREDIK:
 *
 * 1) A Vibration API NEM TUD INTENZITÁST, csak időtartamot. Az Apple HIG
 *    „növekvő intenzitású" mintáját ezért növekvő IMPULZUS-HOSSZAL közelítjük.
 * 2) Az iOS Safari egyáltalán nem támogatja a `navigator.vibrate`-et. A minták
 *    finomhangolása iPhone-on nem érzékelhető — ezért nem szabad iOS-en
 *    megmutatni a rezgés-kapcsolót sem.
 */

const GYOKER = resolve(__dirname, "../..");
const olvas = (p: string) => readFileSync(resolve(GYOKER, p), "utf8").replace(/\r\n/g, "\n");
const FORRAS = olvas("src/lib/haptics.ts");
const KAPCSOLO = olvas("src/components/haptic-toggle.tsx");

/** A minta-tömb rezgés-hosszai (páros indexek; a páratlanok a szünetek). */
function rezgesek(minta: number[]): number[] {
  return minta.filter((_, i) => i % 2 === 0);
}

/** Egy minta kiolvasása a forrásból. */
function minta(nev: string): number[] {
  const m = FORRAS.match(new RegExp(`${nev}:\\s*(\\[[^\\]]+\\]|\\d+)`));
  expect(m, `nincs ${nev} minta`).not.toBeNull();
  const nyers = m![1];
  return nyers.startsWith("[")
    ? nyers
        .slice(1, -1)
        .split(",")
        .map((s) => Number(s.trim()))
    : [Number(nyers)];
}

describe("minták", () => {
  it("⚠️ a figyelmeztetés HÁROM, EMELKEDŐ impulzus", () => {
    // Korábban két azonos, hosszú (30 ms) rezgés volt: a sikertől csak a
    // hosszában különbözött, tapintásra összemosódott vele — pedig ellentétes
    // dolgot jelentenek.
    const w = rezgesek(minta("warning"));
    expect(w.length, "nem három impulzus").toBe(3);
    for (let i = 1; i < w.length; i++) {
      expect(w[i], `a ${i + 1}. impulzus nem hosszabb az előzőnél`).toBeGreaterThan(w[i - 1]);
    }
  });

  it("a siker KÉT rövid, azonos impulzus", () => {
    const s = rezgesek(minta("success"));
    expect(s.length).toBe(2);
    expect(s[0]).toBe(s[1]);
  });

  it("⚠️ a siker és a figyelmeztetés tapintásra is KÜLÖNBÖZIK", () => {
    // Nem elég, hogy más a hossz: MÁS AZ IMPULZUSSZÁM is, mert a tapintás a
    // ritmust érzékeli jól, nem az abszolút időt.
    expect(rezgesek(minta("success")).length).not.toBe(rezgesek(minta("warning")).length);
  });

  it("a kiválasztás a leghalkabb, egyetlen impulzus", () => {
    const sel = minta("selection");
    const tap = minta("tap");
    expect(sel.length).toBe(1);
    expect(sel[0]).toBeLessThanOrEqual(tap[0]);
  });

  it("egyik minta sem hosszabb 200 ms-nál", () => {
    // Hosszabb rezgés már „telefon csörög" érzetet ad, nem visszajelzést.
    for (const nev of ["tap", "selection", "success", "warning"]) {
      const osszeg = minta(nev).reduce((a, b) => a + b, 0);
      expect(osszeg, `${nev} túl hosszú: ${osszeg} ms`).toBeLessThanOrEqual(200);
    }
  });
});

describe("kapcsolható", () => {
  const eredetiNavigator = globalThis.navigator;
  const eredetiStorage = globalThis.localStorage;

  beforeEach(() => {
    vi.resetModules();
    const tarolo = new Map<string, string>();
    Object.defineProperty(globalThis, "localStorage", {
      value: {
        getItem: (k: string) => tarolo.get(k) ?? null,
        setItem: (k: string, v: string) => void tarolo.set(k, v),
      },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "navigator", {
      value: eredetiNavigator,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(globalThis, "localStorage", {
      value: eredetiStorage,
      configurable: true,
      writable: true,
    });
  });

  /** Vibration API imitálása; visszaadja a rögzített hívásokat. */
  function vibrateFigyelo(): number[][] {
    const hivasok: number[][] = [];
    Object.defineProperty(globalThis, "navigator", {
      value: {
        vibrate: (m: number | number[]) => {
          hivasok.push(Array.isArray(m) ? m : [m]);
          return true;
        },
      },
      configurable: true,
      writable: true,
    });
    return hivasok;
  }

  it("alapból bekapcsolva", async () => {
    const hivasok = vibrateFigyelo();
    const { haptic } = await import("@/lib/haptics");
    haptic("tap");
    expect(hivasok).toHaveLength(1);
  });

  it("⚠️ kikapcsolva NEM rezeg", async () => {
    const hivasok = vibrateFigyelo();
    const { haptic, hapticBeallit } = await import("@/lib/haptics");
    hapticBeallit(false);
    haptic("tap");
    haptic("success");
    expect(hivasok).toHaveLength(0);
  });

  it("a beállítás túléli a modul újratöltését (tárolóból olvas)", async () => {
    vibrateFigyelo();
    const elso = await import("@/lib/haptics");
    elso.hapticBeallit(false);

    vi.resetModules();
    const hivasok = vibrateFigyelo();
    const masodik = await import("@/lib/haptics");
    expect(masodik.hapticBekapcsolva()).toBe(false);
    masodik.haptic("tap");
    expect(hivasok).toHaveLength(0);
  });

  it("⚠️ vibrate NÉLKÜLI eszközön (iOS) nem dob hibát", async () => {
    Object.defineProperty(globalThis, "navigator", {
      value: {},
      configurable: true,
      writable: true,
    });
    const { haptic, hapticTamogatott } = await import("@/lib/haptics");
    expect(hapticTamogatott()).toBe(false);
    expect(() => haptic("success")).not.toThrow();
  });

  it("hibázó localStorage mellett is működik (privát mód)", async () => {
    const hivasok = vibrateFigyelo();
    Object.defineProperty(globalThis, "localStorage", {
      value: {
        getItem: () => {
          throw new Error("privát mód");
        },
        setItem: () => {
          throw new Error("privát mód");
        },
      },
      configurable: true,
      writable: true,
    });
    const { haptic, hapticBeallit } = await import("@/lib/haptics");
    expect(() => hapticBeallit(false)).not.toThrow();
    // A munkamenetre viszont érvényes marad.
    haptic("tap");
    expect(hivasok).toHaveLength(0);
  });
});

describe("a kapcsoló megjelenése", () => {
  it("⚠️ iOS-en EL VAN REJTVE (ott a rezgés nem létezik)", () => {
    // Egy kapcsoló, ami semmit nem kapcsol, rosszabb a hiányánál: a felhasználó
    // azt hiszi, ő rontott el valamit.
    expect(KAPCSOLO).toMatch(/if \(!mounted \|\| !hapticTamogatott\(\)\) return null;/);
  });

  it("mount előtt nem renderel (hidratálási eltérés ellen)", () => {
    expect(KAPCSOLO).toContain("mounted");
    expect(KAPCSOLO).toMatch(/useEffect\(\(\) => \{[\s\S]{0,120}setMounted\(true\)/);
  });

  it("bekapcsoláskor mintát is ad (megmutatja, mit kapcsolt be)", () => {
    expect(KAPCSOLO).toMatch(/if \(uj\) haptic\(/);
  });
});

describe("hívóhelyek", () => {
  it("⚠️ a kedvencelés két iránya KÜLÖNBÖZŐ mintát ad", () => {
    // A hozzáadás elért eredmény, az eltávolítás sima visszavonás — eddig
    // mindkettő ugyanazt a koppanást adta.
    const src = olvas("src/components/ui/favorite-button.tsx");
    expect(src).toMatch(/haptic\(isAdding \? "success" : "tap"\)/);
  });

  it("⚠️ a swipe-akció VÉGREHAJTÁSA is jelez, nem csak a kinyitás", () => {
    // Az akció pusztító és az elem azonnal eltűnik alóla; eddig csak a lap
    // kinyitása adott visszajelzést.
    const src = olvas("src/components/ui/swipe-action.tsx");
    const gomb = src.slice(src.indexOf("aria-label={actionLabel}"), src.indexOf("onAction();"));
    expect(gomb).toContain('haptic("warning")');
  });

  it("senki nem hívja közvetlenül a navigator.vibrate-et", () => {
    // Különben kikerülné a kapcsolót és a támogatás-ellenőrzést.
    const fajlok = globSync("src/**/*.{ts,tsx}", { cwd: GYOKER }).map((f) => f.replace(/\\/g, "/"));
    const vetkesek = fajlok.filter(
      (f) => !f.endsWith("lib/haptics.ts") && /navigator\.vibrate/.test(olvas(f)),
    );
    expect(vetkesek, `használd a haptic()-ot: ${vetkesek.join(", ")}`).toEqual([]);
  });
});
