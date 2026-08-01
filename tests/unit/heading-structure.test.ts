import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

/**
 * A címsor-szerkezet őre.
 *
 * ⚠️ KÉT HIBA A 2026-08-01-i AUDITBÓL, mindkettő élesben mérve:
 *  1. A KEZDŐLAPON EGYETLEN `h1` SEM VOLT. A márkanév `span`, a szekció-címek
 *     pedig `SectionHeader` → `h3`, így a legfontosabb oldal címsor-fa nélkül
 *     maradt (képernyőolvasós tájékozódás + kereső-értelmezés).
 *  2. A /berkalkulator KÉT `h1`-et adott: a lap sajátját ÉS a bérkalkulátor-
 *     nézet ország-specifikus címét („Bérkalkulátor Németország”). Mind a hat
 *     ország-változat így viselkedett.
 */
const SRC = resolve(process.cwd(), "src");

function files(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) files(p, out);
    else if (e.endsWith(".tsx")) out.push(p);
  }
  return out;
}

describe("címsor-szerkezet", () => {
  it("a kezdőlapnak van h1-e", () => {
    const home = readFileSync(resolve(SRC, "app/(app)/page.tsx"), "utf8");
    expect(home, "a kezdőlapról eltűnt a h1").toContain("<h1");
  });

  it("a kezdőlap h1-e LEÍRÓ, nem csak a márkanév", () => {
    // A puszta „Kinti” nem mondja meg, miről szól a lap.
    const home = readFileSync(resolve(SRC, "app/(app)/page.tsx"), "utf8");
    const m = /<h1[^>]*>([^<]+)</.exec(home);
    expect(m, "nem találom a h1 szövegét").toBeTruthy();
    expect(m![1].trim().length).toBeGreaterThan(20);
  });

  it("⚠️ a bérkalkulátor-nézetek NEM adnak saját h1-et (a lapnak már van)", () => {
    const rossz = files(join(SRC, "components/views"))
      .filter((f) => /salary-calculator/.test(f))
      .filter((f) => readFileSync(f, "utf8").includes("<h1"))
      .map((f) => f.replace(SRC, "src"));
    expect(rossz, `dupla h1 keletkezne: ${rossz.join(", ")}`).toEqual([]);
  });

  /**
   * ⚠️ AMIT SZÁNDÉKOSAN NEM TESZTELÜNK: „hány h1 van egy fájlban".
   *
   * Megpróbáltam, és HASZNÁLHATATLAN: 9 fájlban van 2–3 `h1`, de MINDEGYIK
   * egymást kizáró ág (ternár-lánc vagy állapot-kapcsoló) — global-error
   * (storage / chunk / általános), vélemény-megerősítés (lejárt / duplikált /
   * sikeres), lecke-oldalak (nyertél / elfogyott az életed / lecke közben),
   * b2b + munkáltató (kapuzott / nyílt nézet). Élesben ellenőrizve: ezeken a
   * lapokon EGY h1 renderel.
   *
   * Statikusan nem eldönthető, hogy két `h1` egyszerre renderel-e — a teszt
   * csak egy folyton növő kivétel-listát termelne, ami már nem véd semmit,
   * csak zajt csinál. A VALÓDI dupla-h1-et élő méréssel kell fogni (a
   * /berkalkulator így is derült ki), a fenti két teszt pedig pontosan azt a
   * regressziót őrzi, ami ténylegesen megtörtént.
   */
  it("a bérkalkulátor-nézetek helyett a LAP adja a h1-et", () => {
    const oldal = readFileSync(resolve(SRC, "app/(app)/berkalkulator/page.tsx"), "utf8");
    expect(oldal).toContain("<h1");
  });
});
