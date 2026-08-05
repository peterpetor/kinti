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

const SORTORES = String.fromCharCode(10);

/**
 * ⚠️ REGEX-LITERÁL, NEM `new RegExp("…")`.
 * Egy JS-STRINGBEN a `\b` nem szóhatár, hanem BACKSPACE (U+0008) — a
 * `new RegExp("\btext-primary\b")` tehát sosem illeszkedik semmire, és az őr
 * NÉMÁN mindig zöld lesz. Pontosan ez történt az első nekifutásnál: a tesztek
 * átmentek, miközben nem őriztek semmit. A literál alakot nem lehet így elrontani.
 */
const NYERS_PRIMARY = /\btext-primary\b(?![-/])/;
const NYERS_STAR = /\btext-star\b(?![-/])/;
const NYERS_SUCCESS = /\btext-success\b(?![-/])/;
const NYERS_PRO = /\btext-pro\b(?![-/])/;
const BG_STAR = /\bbg-star\b(?![-/])/;
const BG_PRO = /\bbg-pro\b(?!\/)/;
const FEHER = /\btext-white\b/;

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

  it("mindkét arany HÁTTÉREN olvasható a szöveg (`--on-pro`)", () => {
    // Az aranyak maguk NEM téma-függők (Tailwind `pro` és `star`).
    const aranyak: [string, RGB][] = [["pro", [255, 150, 0]], ["star", [240, 162, 58]]];
    for (const [nev, bg] of aranyak) {
      const a = arany(token(blokk, "on-pro"), bg);
      expect(a, `--on-pro a ${nev} háttéren: ${a.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA);
    }
  });

  it("a PRO-arany SZÖVEGKÉNT olvasható (`--pro-ink`)", () => {
    const fg = token(blokk, "pro-ink");
    for (const [fnev, bg] of feluletek) {
      const a = arany(fg, bg);
      expect(a, `--pro-ink a ${fnev} felületen: ${a.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA);
    }
  });

  it("a siker-zöld SZÖVEGKÉNT olvasható (`--success-ink`)", () => {
    const fg = token(blokk, "success-ink");
    for (const [fnev, bg] of feluletek) {
      const a = arany(fg, bg);
      expect(a, `--success-ink a ${fnev} felületen: ${a.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA);
    }
  });

  it("a csillag-arany SZÖVEGKÉNT olvasható (`--star-ink`)", () => {
    const fg = token(blokk, "star-ink");
    for (const [fnev, bg] of feluletek) {
      const a = arany(fg, bg);
      expect(a, `--star-ink a ${fnev} felületen: ${a.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA);
    }
  });

  it("a márka-zöld SZÖVEGKÉNT olvasható (`--primary-ink`) — a `--primary-soft`-on is", () => {
    // ⚠️ A `--primary-soft` külön eset: a `bg-primary-soft text-primary-ink`
    // párosítás végigmegy az appon (kategória-címkék, jelvények). Ha csak a
    // semleges felületeken mérnénk, ez a leggyakoribb páros maradna ki.
    const fg = token(blokk, "primary-ink");
    const hatterek: [string, RGB][] = [...feluletek, ["primary-soft", token(blokk, "primary-soft")]];
    for (const [fnev, bg] of hatterek) {
      const a = arany(fg, bg);
      expect(a, `--primary-ink a ${fnev} felületen: ${a.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA);
    }
  });

  it("a `--primary` HÁTTÉRKÉNT is működik: a fehér felirat olvasható rajta", () => {
    // Ez a másik fele annak, amiért két token kell. Ha valaki a `--primary`-t a
    // szöveg-igényhez világosítaná, ez a teszt bukna el.
    const a = arany([255, 255, 255], token(blokk, "primary"));
    expect(a, `fehér a --primary háttéren: ${a.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA);
  });
});

describe("sáv-feliratok tintája (stacked bar)", () => {
  /** A sáv-színek HEX-ben állnak (nem RGB-csatornákban) — külön kiolvasó. */
  function savHex(blokk: string, nev: string): RGB {
    // ⚠️ `new RegExp` STRINGET kap: ott a `\s` csak `s`-t jelentene (ismeretlen
    // escape), ezért dupla backslash kell. Ez elsőre elszúrva némán nem talált.
    const m = blokk.match(new RegExp(`--sav-${nev}:\\s*#([0-9a-f]{6})`, "i"));
    if (!m) throw new Error(`nincs --sav-${nev}`);
    const h = m[1];
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
  }

  // ⚠️ A blokk-kezdetet a sáv-szín HEX-értéke azonosítja: az egyedi, és nem
  // kell hozzá sortörés-escape a mintában.
  it.each([
    ["világos", "--sav-lakhatas: #2f6fb3"],
    ["sötét", "--sav-lakhatas: #4e90d2"],
  ])("%s téma: mind a négy sávon olvasható a százalék", (_nev, kezdet) => {
    const i = CSS.indexOf(kezdet);
    expect(i, "nincs meg a sáv-blokk").toBeGreaterThan(-1);
    const blokk = CSS.slice(i, CSS.indexOf(SORTORES + "  }", i));
    for (const sav of ["lakhatas", "megelhetes", "biztositas", "marad"]) {
      const a = arany(token(blokk, `on-sav-${sav}`), savHex(blokk, sav));
      expect(a, `--on-sav-${sav}: ${a.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA);
    }
  });

  it("⚠️ a felirat NEM fix `text-white` (a drop-shadow nem számít a kontrasztba)", () => {
    const chart = readFileSync(
      resolve(__dirname, "../../src/components/views/orszag-osszehasonlito-chart.tsx"),
      "utf8",
    );
    expect(chart).toContain("--on-sav-");
    // A szegmens-felirat sorában nem maradhat fix fehér.
    const feliratSor = chart.split(SORTORES).filter((x) => x.includes("tabular-nums") && x.includes("10.5px"));
    expect(feliratSor.length).toBeGreaterThan(0);
    for (const sor of feliratSor) expect(sor).not.toContain("text-white");
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

  it("⚠️ nincs nyers `text-primary` (sötét témán 3,57:1) — `text-primary-ink` a helyes", () => {
    const vetkesek: string[] = [];
    for (const f of fajlok) {
      const sorok = readFileSync(resolve(__dirname, "../..", f), "utf8").split(SORTORES);
      sorok.forEach((sor, i) => {
        // A `text-primary-soft`, `text-primary-dark` és `text-primary/40` NEM
        // érintett — a negatív lookahead pont ezekre való.
        if (NYERS_PRIMARY.test(sor)) vetkesek.push(`${f}:${i + 1}`);
      });
    }
    expect(vetkesek, `használd a \`text-primary-ink\`-et: ${vetkesek.slice(0, 8).join(", ")}`).toEqual([]);
  });

  it("⚠️ `bg-star` mellett SOHA nem áll `text-white` (2,11:1 volt)", () => {
    const vetkesek: string[] = [];
    for (const f of fajlok) {
      const sorok = readFileSync(resolve(__dirname, "../..", f), "utf8").split(SORTORES);
      sorok.forEach((sor, i) => {
        if (BG_STAR.test(sor) && FEHER.test(sor)) vetkesek.push(`${f}:${i + 1}`);
      });
    }
    expect(vetkesek, `használd a \`text-on-pro\`-t: ${vetkesek.slice(0, 8).join(", ")}`).toEqual([]);
  });

  it("⚠️ nincs nyers `text-star` (világos lapon 1,82:1) — `text-star-ink` a helyes", () => {
    const vetkesek: string[] = [];
    for (const f of fajlok) {
      const sorok = readFileSync(resolve(__dirname, "../..", f), "utf8").split(SORTORES);
      sorok.forEach((sor, i) => {
        if (NYERS_STAR.test(sor)) vetkesek.push(`${f}:${i + 1}`);
      });
    }
    expect(vetkesek, `használd a \`text-star-ink\`-et: ${vetkesek.slice(0, 8).join(", ")}`).toEqual([]);
  });

  it("⚠️ nincs nyers `text-success` (sötét felületen 2,51:1) — `text-success-ink` a helyes", () => {
    const vetkesek: string[] = [];
    for (const f of fajlok) {
      const sorok = readFileSync(resolve(__dirname, "../..", f), "utf8").split(SORTORES);
      sorok.forEach((sor, i) => {
        if (NYERS_SUCCESS.test(sor)) vetkesek.push(`${f}:${i + 1}`);
      });
    }
    expect(vetkesek, `használd a \`text-success-ink\`-et: ${vetkesek.slice(0, 8).join(", ")}`).toEqual([]);
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
