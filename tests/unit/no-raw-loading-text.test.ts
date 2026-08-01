import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

/**
 * A „tartalom-loader sosem szöveg" szabály őre.
 *
 * A design-rendszer szabálya régóta él: tartalom betöltésekor shimmer-váz jár,
 * nem nyers szöveg és nem pörgő kör — ez az egyik legerősebb „ez egy weboldal,
 * nem app" jel. A szabályt eddig egy MEMÓRIÁBAN LEÍRT GREP-RECEPT őrizte
 * (`grep "Betöltés\.\.\.|animate-spin"`), és az 2026-08-01-ig ÖT helyet nem
 * fogott meg, mert a szórend fordított volt:
 *
 *   „Állások betöltése…"   ← az Állások fő listája!
 *   „Térkép betöltése…"    ← 3 helyen
 *   „Időjárás betöltése…"
 *
 * Tanulság: egy szabályt, amit grep-recept őriz, előbb-utóbb megkerül a
 * természetes nyelv. Ezért lett teszt.
 */
const SRC = resolve(process.cwd(), "src");

function tsxFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) {
      // Az admin belső eszköz — nem része a végfelhasználói natív-érzetnek.
      if (entry === "admin") continue;
      tsxFiles(p, out);
    } else if (entry.endsWith(".tsx")) {
      out.push(p);
    }
  }
  return out;
}

/**
 * „…betöltése…", „Betöltés…", „…töltődik…", „Töltés…" — tetszőleges szórenddel.
 *
 * ⚠️ A `\b` SZÓHATÁR NEM ELHAGYHATÓ: nélküle a minta a „**Le**töltés…"
 * (=letöltés) és a „**Fel**töltés…" (=feltöltés) szavakra is illeszkedik, amik
 * NEM betöltés-állapotok, hanem valódi felhasználói műveletek. Az első, túl tág
 * változatom pontosan ezen a kettőn adott vakriasztást.
 */
const LOADING_TEXT = /\b(bet[öo]lt[ée]s(e|ek)?|t[öo]lt[őo]dik|t[öo]lt[ée]s)\s*(…|\.\.\.)/i;

/**
 * GOMB-FELIRAT-CSERE = megengedett.
 *
 * A design-rendszer külön kezeli a kettőt: a gombon belüli felirat-csere tap
 * után NATÍV minta (a natív appok is a gombon mutatnak activity-indicatort),
 * a TARTALOM helyén álló szöveg viszont nem az.
 *
 * A felismerés ELVI, nem fájl-lista: `feltétel ? "…" : "…"` — két sztring-
 * literál közti ternár mindig felirat-csere, tehát rendben. Ez korábban
 * nevesített fájl-lista volt; az elvi szabály nem avul el, és nem takar el
 * véletlenül egy ÚJ, valódi hibát ugyanabban a fájlban.
 */
const LABEL_SWAP = /\?\s*(["'`])[^"'`]*\1\s*:\s*(["'`])/;

/**
 * SZÁNDÉKOS KIVÉTELEK, amikre a fenti elvi szabály nem illik.
 * Nevesítve, hogy egy új előfordulás ne bújhasson meg mögöttük.
 */
const ALLOWED = new Map<string, string>([
  [
    "src/components/views/explore-view.tsx",
    // ⚠️ APOSZTRÓF-HATÁROLÓ: a magyar záró idézőjel ASCII " — dupla határolóban
    // lezárná a stringet (ebben a munkamenetben ez a HARMADIK ilyen csapda).
    'a találatszám melletti „(lista töltődik…)" jegyzet — NEM a tartalom helyén ' +
      'áll: a SZÁM már a valódi, és az SSR-szelet kártyái már renderelnek. ' +
      'Csak azt jelzi, hogy a teljes készlet még érkezik (progresszív töltés).',
  ],
]);

describe("tartalom-loader sosem nyers szöveg", () => {
  const offenders: string[] = [];

  for (const file of tsxFiles(SRC)) {
    const lines = readFileSync(file, "utf8").split(/\r?\n/);
    lines.forEach((line, i) => {
      if (!LOADING_TEXT.test(line)) return;
      const t = line.trim();
      if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")) return; // komment
      if (line.includes("sr-only")) return; // a11y-megfelelő — KÖTELEZŐ a shimmer mellé
      if (/new Error\(|reject\(|throw /.test(line)) return; // hibaüzenet, nem UI-állapot
      if (/aria-label=|title=/.test(line)) return; // kisegítő attribútum
      if (LABEL_SWAP.test(line)) return; // gombon belüli felirat-csere
      const rel = file.replace(SRC, "src").split("\\").join("/");
      if (ALLOWED.has(rel)) return;
      offenders.push(`${rel}:${i + 1}  ${t.slice(0, 80)}`);
    });
  }

  it("nincs látható betöltés-szöveg tartalom helyén", () => {
    expect(offenders, `Használj Skeleton shimmer-vázat + sr-only szöveget:\n${offenders.join("\n")}`)
      .toEqual([]);
  });

  it("a kivétel-lista nem avult el (a nevesített fájl tényleg érintett)", () => {
    for (const [rel, indok] of ALLOWED) {
      const src = readFileSync(resolve(process.cwd(), rel), "utf8");
      expect(LOADING_TEXT.test(src), `${rel} már nem érintett — töröld a kivételt (${indok})`)
        .toBe(true);
    }
  });

  it("a minta fogja a fordított szórendet, de nem riaszt a le-/feltöltésre", () => {
    // Ezek csúsztak át a grep-recepten:
    expect(LOADING_TEXT.test("<p>Állások betöltése…</p>")).toBe(true);
    expect(LOADING_TEXT.test("<p>Betöltés...</p>")).toBe(true);
    expect(LOADING_TEXT.test("(lista töltődik…)")).toBe(true);
    // ⚠️ Ezek VISZONT valódi műveletek, nem betöltés-állapotok:
    expect(LOADING_TEXT.test("`Letöltés… ${progress}%`")).toBe(false);
    expect(LOADING_TEXT.test('return "Feltöltés…";')).toBe(false);
  });

  it("a gomb-felirat-csere felismerése tényleg működik", () => {
    expect(LABEL_SWAP.test('{loading ? "Betöltés…" : "Telefonszám mutatása"}')).toBe(true);
    expect(LABEL_SWAP.test('{isCheckoutLoading ? "Töltés…" : "Előfizetés (19 €/hó)"}')).toBe(true);
    // Egy csupasz tartalom-szöveg NEM felirat-csere:
    expect(LABEL_SWAP.test("<p>Állások betöltése…</p>")).toBe(false);
  });
});
