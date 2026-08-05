import { describe, it, expect } from "vitest";
import { readFileSync, globSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Szöveg-kontraszt (WCAG AA).
 *
 * ⚠️ VALÓS, MÉRT HIBÁBÓL (2026-08-05). Egy éles kontraszt-audit az egész appon
 * ugyanazokat az arányokat dobta vissza lapról lapra — vagyis a hiba nem
 * komponensekben volt, hanem a TOKENEKBEN:
 *
 *   világos `--text-faint`  #94a097 → 2,33–2,72:1   (kell 4,5)
 *   sötét   `--text-faint`  #6e7971 → 3,66–4,10:1
 *   fehér a PRO-aranyon     #ff9600 → 2,18:1        (19 gomb/jelvény)
 *   `text-pro` világos lapon              2,18:1     (23 hely)
 *
 * ⚠️ MIÉRT TESZT ÉS NEM ÍRÁSOS SZABÁLY: egy tokent egy sor átírásával bárki
 * elronthat, és a következmény NEM látszik hibaként — csak nehezebben olvasható
 * lesz az app, amit senki nem reklamál. Ezért a tokenekből SZÁMOLUNK.
 */

const CSS = readFileSync(resolve(__dirname, "../../src/app/globals.css"), "utf8");

type RGB = [number, number, number];

/** Egy RGB-csatornás token kiolvasása a megadott téma-blokkból. */
function token(blokk: string, nev: string): RGB {
  const m = blokk.match(new RegExp(`--${nev}:\\s*(\\d+)\\s+(\\d+)\\s+(\\d+)\\s*;`));
  if (!m) throw new Error(`nincs --${nev} token a blokkban`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function temaBlokk(valaszto: string): string {
  const i = CSS.indexOf(valaszto);
  if (i < 0) throw new Error(`nincs ilyen téma-blokk: ${valaszto}`);
  // A blokk a következő záró kapcsos zárójelig tart.
  return CSS.slice(i, CSS.indexOf("\n  }", i));
}

const csatorna = (c: number) => {
  const x = c / 255;
  return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
};
const luminancia = ([r, g, b]: RGB) => 0.2126 * csatorna(r) + 0.7152 * csatorna(g) + 0.0722 * csatorna(b);
function arany(elo: RGB, hatter: RGB): number {
  const a = luminancia(elo);
  const b = luminancia(hatter);
  const [vil, sot] = a > b ? [a, b] : [b, a];
  return (vil + 0.05) / (sot + 0.05);
}

/** WCAG AA normál szövegre. */
const AA = 4.5;

describe.each([
  ["világos", ':root,\n  [data-theme="warm"]'],
  ["sötét", '[data-theme="dark"]'],
])("szöveg-tokenek kontrasztja — %s téma", (_nev, valaszto) => {
  const blokk = temaBlokk(valaszto);
  const feluletek: [string, RGB][] = [
    ["surface", token(blokk, "surface")],
    ["bg", token(blokk, "bg")],
    ["surface-alt", token(blokk, "surface-alt")],
  ];

  it.each(["text", "text-muted", "text-faint"])("`--%s` minden felületen eléri az AA-t", (nev) => {
    const fg = token(blokk, nev);
    for (const [fnev, bg] of feluletek) {
      const a = arany(fg, bg);
      expect(a, `--${nev} a ${fnev} felületen: ${a.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA);
    }
  });

  it("a hierarchia megmarad (text sötétebb/világosabb, mint a muted, az pedig a faintnél)", () => {
    // Ha a javítás során a faint „beérné" a mutedet, elveszne a vizuális rangsor.
    const s = token(blokk, "surface");
    expect(arany(token(blokk, "text"), s)).toBeGreaterThan(arany(token(blokk, "text-muted"), s));
    expect(arany(token(blokk, "text-muted"), s)).toBeGreaterThan(arany(token(blokk, "text-faint"), s));
  });

  it("a PRO-arany háttéren a szöveg olvasható (`--on-pro`)", () => {
    // A márka-arany maga NEM téma-függő (Tailwind `pro` = #ff9600).
    const arany2: RGB = [255, 150, 0];
    const a = arany(token(blokk, "on-pro"), arany2);
    expect(a, `--on-pro az aranyon: ${a.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA);
  });

  it("a PRO-arany SZÖVEGKÉNT olvasható (`--pro-ink`)", () => {
    const fg = token(blokk, "pro-ink");
    for (const [fnev, bg] of feluletek) {
      const a = arany(fg, bg);
      expect(a, `--pro-ink a ${fnev} felületen: ${a.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA);
    }
  });
});

describe("PRO-arany — nincs visszacsúszás", () => {
  const fajlok = globSync("src/**/*.tsx", { cwd: resolve(__dirname, "../..") }).map((f) => f.replace(/\\/g, "/"));

  it("legalább néhány tsx-et megtalált (a keresés se romolhat el némán)", () => {
    expect(fajlok.length).toBeGreaterThan(50);
  });

  it("⚠️ `bg-pro` mellett SOHA nem áll `text-white` (2,18:1 volt)", () => {
    const vetkesek: string[] = [];
    for (const f of fajlok) {
      const sorok = readFileSync(resolve(__dirname, "../..", f), "utf8").split("\n");
      sorok.forEach((sor, i) => {
        if (/\bbg-pro\b(?!\/)/.test(sor) && /\btext-white\b/.test(sor)) vetkesek.push(`${f}:${i + 1}`);
      });
    }
    expect(vetkesek, `használd a \`text-on-pro\`-t: ${vetkesek.join(", ")}`).toEqual([]);
  });

  it("⚠️ nincs nyers `text-pro` (világos lapon 2,18:1) — `text-pro-ink` a helyes", () => {
    const vetkesek: string[] = [];
    for (const f of fajlok) {
      const sorok = readFileSync(resolve(__dirname, "../..", f), "utf8").split("\n");
      sorok.forEach((sor, i) => {
        if (/\btext-pro\b(?!-|\/)/.test(sor)) vetkesek.push(`${f}:${i + 1}`);
      });
    }
    expect(vetkesek, `használd a \`text-pro-ink\`-et: ${vetkesek.join(", ")}`).toEqual([]);
  });
});
