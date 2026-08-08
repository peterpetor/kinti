import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

/**
 * ⚠️⚠️ A KÉPERNYŐN LÁTHATÓ ÁR NEM ÍRHATÓ BE KÉZZEL.
 *
 * VALÓS HIBA (2026-08-08, user-jelzés): a vásárlás-gombokon „19 € / hó" állt,
 * az Android-app pénztárában viszont a Google Play 7400 Ft-ot mutatott. A Play
 * a KÉSZÜLÉK Play-régiója szerint áraz — nem az app ország-választása szerint —,
 * tehát magyar Play-fiókkal forint jön akkor is, ha az app Németországra van
 * állítva. Egy beégetett eurós címke ezért az appban SZÜKSÉGSZERŰEN eltér a
 * ténylegesen levont összegtől. Ez megtévesztő, és fogyasztóvédelmileg a
 * legérzékenyebb pont.
 *
 * A weben nincs baj, és ezt nem is bolygattuk: a Paddle-ár minden országban
 * ugyanaz (19 € / 49 €). Az EGYETLEN hely, ahol ez a szám leírható, ezért a
 * `useProductPrice` `STATIKUS_AR` táblája — minden más a hookon át kérdezi.
 */

const GYOKER = resolve(__dirname, "../..");
const SRC = join(GYOKER, "src");

/** A `STATIKUS_AR` otthona — itt SZABAD leírni az összeget. */
const FORRAS = join("src", "hooks", "useProductPrice.ts").replace(/\\/g, "/");

/**
 * Tartalom-bankok: itt az eurós összegek OKTATÁSI tartalmak (Rundfunkbeitrag,
 * Deutschlandticket, lakbér), nem a mi termékünk ára. Ezeket nem nézzük.
 */
const TARTALOM = /^src\/(lib\/(quiz-bank|.*-bank|es-ccse-bank)|app\/\(app\)\/nyelvlecke|components\/views\/(transport-guide|salary-calculator))/;

function osszesForras(dir: string, ki: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) osszesForras(p, ki);
    else if (/\.(ts|tsx)$/.test(e)) ki.push(p);
  }
  return ki;
}

/** Kommentek nélküli forrás — a magyarázó szövegben SZABAD árat említeni. */
function kommentNelkul(s: string): string {
  return s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");
}

/**
 * A termék-árak, ahogy a UI-ban megjelenhetnének. Csak a TERMÉK-összegeket
 * keressük (19 és 49 euró) — más eurós szám (Deutschlandticket, lakbér,
 * biztosítás) a tartalomban jogos, ezért nem általános „szám + €" mintát nézünk.
 */
const TILTOTT = [/\b19\s*€/, /\b49\s*€/, /€\s*19\b/, /€\s*49\b/];
/**
 * ⚠️ A markupban SZÉTTÖRT ár is ár: `19 <span>€ / hó</span>` — pontosan így volt
 * beégetve az /allasok/pro oldalon, és a sima „19 €" minta ÁTENGEDTE.
 */
const TILTOTT_TORT = /\b(19|49)\s*<span[^>]*>\s*€/;

describe("⚠️ termék-ár a felületen", () => {
  const fajlok = osszesForras(SRC)
    .map((p) => ({ p, rel: p.replace(GYOKER + "\\", "").replace(GYOKER + "/", "").replace(/\\/g, "/") }))
    .filter((f) => f.rel !== FORRAS && !TARTALOM.test(f.rel));

  it("a forrás-tábla létezik és mindhárom terméket tartalmazza", () => {
    const s = readFileSync(join(GYOKER, FORRAS), "utf8");
    for (const termek of ["kinti_pro_monthly", "business_pro_monthly", "job_featured"]) {
      expect(s, `${termek} hiányzik a STATIKUS_AR-ból`).toContain(termek);
    }
  });

  it("⚠️ SEHOL MÁSHOL nincs kézzel beírt termék-ár", () => {
    const vetkesek: string[] = [];
    for (const { p, rel } of fajlok) {
      const kod = kommentNelkul(readFileSync(p, "utf8"));
      for (const minta of TILTOTT) {
        const m = kod.match(minta);
        if (m) vetkesek.push(`${rel}: ${m[0]}`);
      }
    }
    expect(vetkesek, `beégetett termék-ár:\n${vetkesek.join("\n")}`).toEqual([]);
  });

  it("⚠️ a markupban SZÉTTÖRT ár sincs sehol", () => {
    const vetkesek: string[] = [];
    for (const { p, rel } of fajlok) {
      const kod = kommentNelkul(readFileSync(p, "utf8"));
      const m = kod.match(TILTOTT_TORT);
      if (m) vetkesek.push(`${rel}: ${m[0].replace(/\s+/g, " ")}`);
    }
    expect(vetkesek, `markupba tördelt termék-ár:\n${vetkesek.join("\n")}`).toEqual([]);
  });

  it("a vásárlás-gomb maga teszi ki az árat, nem a hívó", () => {
    // Ha a `label` prop megint árat kapna, a gomb kétszer írná ki.
    const gomb = readFileSync(join(GYOKER, "src/components/views/boost-checkout-button.tsx"), "utf8");
    expect(gomb).toContain("useProductPrice");
    const hivok = fajlok.filter((f) => readFileSync(f.p, "utf8").includes("<BoostCheckoutButton"));
    expect(hivok.length, "egyetlen BoostCheckoutButton-hívót sem találtam").toBeGreaterThan(0);
    for (const { p, rel } of hivok) {
      const cimkek = readFileSync(p, "utf8").match(/label="[^"]*"/g) ?? [];
      for (const c of cimkek) {
        expect(c, `${rel}: ár a label-ben`).not.toMatch(/€|Ft|CHF/);
      }
    }
  });
});
