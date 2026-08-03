import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * A publikus cég-leírás (`blurb`) tartalmi tilalmainak őre.
 *
 * ⚠️⚠️ MIÉRT: a `blurb` az ADATLAPON MEGJELENŐ, felhasználónak szóló szöveg.
 * Nem tartozik rá, HOGYAN találtuk meg a céget, és pláne nem a saját belső
 * munkajegyzetünk. 2026-08-03-án **97 élő tételben** ott állt, hogy honnan
 * származik („… a nemetorszagi-magyarok.de közösségi adatbázisából",
 * „(Iránytű Németországban cégregiszter)"), egyben pedig egy belső
 * DEDUP-jegyzet („a MÁR bent lévő … éttermtől eltérő, önálló bolt").
 *
 * ⚠️ A kapu MÁR LÉTEZETT, mégis átcsúsztak: az első változat KONKRÉT
 * SZÓFORDULATOKRA figyelt („hozta elő", „Google Maps"), a 97 tétel viszont
 * MÁSKÉPP fogalmazott ugyanarról. A tanulság — és amit ez a teszt őriz —:
 * a mintákat a HIBAOSZTÁLYRA kell írni, nem egyetlen megfogalmazásra.
 */
const SCRIPT = readFileSync(resolve(process.cwd(), "scripts/prepare-business-import.mjs"), "utf8");

/** A `DESCRIPTION_BANS` tömbből kiolvasott élő regexek. */
function tiltoMintak(): RegExp[] {
  const blokk = SCRIPT.match(/const DESCRIPTION_BANS = \[([\s\S]*?)\n\];/);
  if (!blokk) throw new Error("A DESCRIPTION_BANS lista nem található");
  return [...blokk[1].matchAll(/\[\s*(\/(?:[^/\\]|\\.)+\/[a-z]*)\s*,/g)].map((m) => {
    const lit = m[1];
    const v = lit.lastIndexOf("/");
    return new RegExp(lit.slice(1, v), lit.slice(v + 1));
  });
}

const tiltott = (s: string) => tiltoMintak().some((re) => re.test(s));

describe("publikus leírás — tartalmi tilalmak", () => {
  it("a kapu létezik és az import tényleg használja", () => {
    expect(SCRIPT).toContain("const DESCRIPTION_BANS");
    expect(SCRIPT).toMatch(/for \(const \[re, mit\] of DESCRIPTION_BANS\)/);
    expect(tiltoMintak().length).toBeGreaterThanOrEqual(4);
  });

  it("⚠️ elkapja a FORRÁS-HIVATKOZÁST, tetszőleges megfogalmazásban", () => {
    // A 97 valós eset szövegei:
    expect(tiltott("Magyar vendéglátóhely — a nemetorszagi-magyarok.de közösségi adatbázisából.")).toBe(true);
    expect(tiltott("Magyar fogorvos Bonnban (Iránytű Németországban cégregiszter).")).toBe(true);
    // Más megfogalmazások, amikre szintén illeszkednie kell:
    expect(tiltott("Magyar ügyvéd — a kamarai regiszterből.")).toBe(true);
    expect(tiltott("Forrás: arkadasi.hu")).toBe(true);
    expect(tiltott("Magyar bolt, a katalogus.nl címtárából.")).toBe(true);
  });

  it("⚠️ elkapja a BELSŐ MUNKAJEGYZETET", () => {
    expect(tiltott("Magyar élelmiszerbolt Kasselben — a MÁR bent lévő 'Magyar etterem Kassel' éttermtől eltérő.")).toBe(true);
    expect(tiltott("Duplikátum-gyanús, ellenőrizve: 2026-08-01")).toBe(true);
  });

  it("elkapja az IDEGEN PLATFORM PONTSZÁMÁT és a seed-módszertant", () => {
    expect(tiltott("Magyar étterem, 4,8 csillag")).toBe(true);
    expect(tiltott("Kiváló hely — 4.6/5")).toBe(true);
    expect(tiltott("A vezetéknév + szakma keresés hozta elő.")).toBe(true);
    expect(tiltott("Google Maps-en találtuk")).toBe(true);
  });

  it("⚠️ NEM akad fenn a valódi, hasznos leíráson", () => {
    // Ezek élő blurbök a szaknévsorból — egyiknek sem szabad tiltottnak lennie.
    expect(tiltott("Magyar vendéglátóhely · Wolfsburg · pusztarestaurant.blogspot.com")).toBe(false);
    expect(tiltott("Magyar autószerviz Geisenfeldben. · sb-kfztechnik.de")).toBe(false);
    expect(tiltott("Hétvégi magyar iskola és közösség · Coventry · comat.org.uk")).toBe(false);
    expect(tiltott("Magyar festő-tapétázó Stuttgart térségében.")).toBe(false);
    expect(tiltott("Erdélyi és magyar konyha Haringey-ben.")).toBe(false);
    // ⚠️ A szálloda HIVATALOS csillagbesorolása NEM idegen platform pontszáma:
    expect(tiltott("3 csillagos szálloda étteremmel a Costa Blancán")).toBe(false);
  });
});
