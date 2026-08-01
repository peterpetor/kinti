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
 *
 * ⚠️ A `sr-only` VÁLTOZAT HELYES és kötelező: a shimmer-váz `aria-hidden`, így a
 * képernyőolvasónak kell egy rejtett szöveges megfelelő. A teszt csak a LÁTHATÓ
 * szöveget tiltja.
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

/** „…betöltése…" / „Betöltés…" alakok, tetszőleges szórenddel. */
const LOADING_TEXT = /bet[öo]lt[ée]s(e|ek)?\s*(…|\.\.\.)/i;

/**
 * SZÁNDÉKOS KIVÉTELEK — nem tartalom-loaderek, hanem AKCIÓ-visszajelzések.
 *
 * A design-rendszer külön kezeli a kettőt: a gombon belüli felirat-csere tap
 * után NATÍV minta (a natív appok is a gombon mutatnak activity-indicatort),
 * a TARTALOM helyén álló szöveg viszont nem az. Ezért ezek maradhatnak — de
 * nevesítve, hogy egy új előfordulás ne bújhasson meg mögöttük.
 */
const ALLOWED = new Map<string, string>([
  [
    "src/components/business-analytics-tracker.tsx",
    "PhoneReveal GOMB felirat-cseréje a rate-limitelt kontakt-lekérés alatt",
  ],
  [
    "src/components/views/invite-landing.tsx",
    "11px-es állapotsor, ami sikerre vált — nem tartalom-blokk",
  ],
]);

describe("tartalom-loader sosem nyers szöveg", () => {
  const offenders: string[] = [];

  for (const file of tsxFiles(SRC)) {
    const lines = readFileSync(file, "utf8").split(/\r?\n/);
    lines.forEach((line, i) => {
      if (!LOADING_TEXT.test(line)) return;
      const t = line.trim();
      // Kizárások, sorrendben:
      if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")) return; // komment
      if (line.includes("sr-only")) return; // a11y-megfelelő — KÖTELEZŐ a shimmer mellé
      if (/new Error\(|reject\(|throw /.test(line)) return; // hibaüzenet, nem UI-állapot
      if (/aria-label=|title=/.test(line)) return; // kisegítő attribútum
      const rel = file.replace(SRC, "src").split("\\").join("/");
      if (ALLOWED.has(rel)) return; // nevesített akció-visszajelzés
      offenders.push(`${rel}:${i + 1}  ${t.slice(0, 80)}`);
    });
  }

  it("nincs látható betöltés-szöveg tartalom helyén", () => {
    expect(offenders, `Használj Skeleton shimmer-vázat + sr-only szöveget:\n${offenders.join("\n")}`)
      .toEqual([]);
  });

  it("a kivétel-lista nem avult el (minden nevesített fájl létezik és tényleg érintett)", () => {
    // Egy holt kivétel csendben lyukat hagyna a szabályon.
    for (const [rel, indok] of ALLOWED) {
      const abs = resolve(process.cwd(), rel);
      const src = readFileSync(abs, "utf8");
      expect(LOADING_TEXT.test(src), `${rel} már nem érintett — töröld a kivételt (${indok})`).toBe(true);
    }
  });

  it("a szabály tényleg fogja a fordított szórendet is", () => {
    // Regressziós önteszt: pontosan ez a forma csúszott át a grep-recepten.
    expect(LOADING_TEXT.test('<p>Állások betöltése…</p>')).toBe(true);
    expect(LOADING_TEXT.test('<p>Betöltés...</p>')).toBe(true);
    expect(LOADING_TEXT.test('<span className="sr-only">Térkép betöltése…</span>')).toBe(true);
  });
});
