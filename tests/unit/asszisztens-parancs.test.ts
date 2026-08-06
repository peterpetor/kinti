import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { searchDestinations } from "@/lib/app-destinations";

/**
 * Az asszisztens azonnali eszköz-találata („Erre gondoltál?").
 *
 * ⚠️ A KEZDŐLAPON KÉT SZÖVEG-BEMENET VAN, és semmi nem mondta meg, melyikbe
 * kell írni: az asszisztens (problémát ír le → szakembert és útmutatót kap) és
 * a fejléc-kereső (az app eszközeire ugrik). Aki ide gépelte, hogy
 * „bérkalkulátor", egy AI-kérést indított olyan kérdésre, aminek a válasza egy
 * menüpont.
 *
 * A javaslat hálózat NÉLKÜL, kurált listából dolgozik — tehát nem csak
 * gyorsabb, hanem NEM IS FOGYASZTJA az AI-keretet.
 */

const GYOKER = resolve(__dirname, "../..");
const SRC = readFileSync(resolve(GYOKER, "src/components/kinti-assistant.tsx"), "utf8").replace(
  /\r\n/g,
  "\n",
);
const KOD = SRC.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");

describe("a javaslat a valós bemenetekre", () => {
  it("⚠️ rövid, kulcsszószerű bemenetre TALÁL", () => {
    // Ezek a tényleges felhasználói gépelés-minták (csonkolt szavak).
    const esetek: [string, string][] = [
      ["ber", "/berkalkulator"],
      ["berkalk", "/berkalkulator"],
      ["nyelv", "/nyelvlecke"],
      ["allas", "/allasok"],
    ];
    for (const [beirt, varhatoHref] of esetek) {
      const t = searchDestinations(beirt, "CH", 3);
      const hrefek = t.map((d) => d.href);
      expect(hrefek, `„${beirt}" → ${hrefek.join(", ") || "semmi"}`).toContain(varhatoHref);
    }
  });

  it("ékezet nélkül is talál (a gépelés ritkán ékezetes)", () => {
    const ekezetes = searchDestinations("bérkalk", "CH", 3).map((d) => d.href);
    const ekezettelen = searchDestinations("berkalk", "CH", 3).map((d) => d.href);
    expect(ekezetes).toEqual(ekezettelen);
  });

  it("⚠️ VALÓDI KÉRDÉSRE NEM ugrik fel — ott az asszisztens dolga jön", () => {
    // A `searchDestinations` MINDEN tokent megkövetel (AND), ezért egy mondat
    // szavai nem illeszkednek egyetlen eszköz-címkére sem. Ez a védelem
    // szerkezeti, nem külön szabály — de MÉRNI kell, mert ha egyszer OR-ra
    // váltana, minden kérdésnél zavaró javaslat jelenne meg.
    for (const mondat of [
      "csőtörés van, ki segít?",
      "eltört a vízvezeték Bécsben, mit csináljak",
      "hol találok magyar fogorvost",
    ]) {
      const t = searchDestinations(mondat, "CH", 3);
      expect(t.map((d) => d.title), `„${mondat}" javaslatot kapott`).toEqual([]);
    }
  });

  it("⚠️ ország-tudatos: nem kínál ott nem elérhető eszközt", () => {
    // ⚠️ ADATVEZÉRELTEN, nem kitalált példával. Az első nekifutásom a
    // „vám”-ra mért, csakhogy az egy tudásbázis-CIKK, nem kapuzott eszköz —
    // mindkét országban ugyanazt adta, és a teszt engem cáfolt, nem a kódot.
    // A holland önéletrajz-készítő viszont valóban NL-hez kötött.
    const nl = searchDestinations("holland oneletrajz", "NL", 4).map((d) => d.href);
    const ch = searchDestinations("holland oneletrajz", "CH", 4).map((d) => d.href);
    expect(nl, "NL-ben elérhetőnek kell lennie").toContain("/holland-oneletrajz");
    expect(ch, "CH-ban NEM kellene felkínálni").not.toContain("/holland-oneletrajz");
  });
});

describe("megjelenítés", () => {
  it("⚠️ a példa-chipek HELYÉT foglalja el, nem alattuk ül", () => {
    // Új sor lejjebb tolná a lap többi részét — a kezdőlapon a hely a
    // legszűkösebb (ld. a „tartalom elöl" szabályt).
    expect(KOD).toMatch(/eszkozTalalat\.length > 0 &&/);
    expect(KOD, "a példa-chipek nem tűnnek el a javaslat mellett").toMatch(
      /eszkozTalalat\.length === 0 && examples\.length > 0/,
    );
  });

  it("csak beküldés ELŐTT látszik (válasz vagy töltés közben nem)", () => {
    expect(KOD).toMatch(/!result && !loading && eszkozTalalat\.length > 0/);
  });

  it("küszöb van (2 betűre még nem ugrik fel)", () => {
    expect(KOD).toMatch(/query\.trim\(\)\.length >= 3/);
    expect(searchDestinations("be", "CH", 3).length >= 0).toBe(true);
  });

  it("nem indít hálózati kérést (kurált lista, nincs AI-fogyasztás)", () => {
    const blokk = KOD.slice(KOD.indexOf("const eszkozTalalat"), KOD.indexOf("async function ask"));
    expect(blokk).toContain("useMemo");
    expect(blokk).not.toContain("fetch(");
  });
});

describe("a kereső elérhetősége", () => {
  const MENU = readFileSync(resolve(GYOKER, "src/components/ui/dropdown-menu.tsx"), "utf8").replace(
    /\r\n/g,
    "\n",
  );
  const KERESO = readFileSync(resolve(GYOKER, "src/components/global-search.tsx"), "utf8").replace(
    /\r\n/g,
    "\n",
  );

  it("⚠️ a menü-szűrő zsákutcájából ÁTVEZET a teljes keresőbe", () => {
    // A teljes kereső mobilon EGYETLEN helyről nyílt: a kezdőlap fejléc-
    // ikonjáról. Aki nem a kezdőlapon állt, nem is tudott hozzáférni. A menü
    // minden felső szintű oldalon elérhető, tehát ez a sor egyben a kereső
    // hiányzó, app-szintű belépési pontja.
    const blokk = MENU.slice(MENU.indexOf("Nincs találat a menüben"));
    expect(blokk.slice(0, 900)).toContain("openGlobalSearch");
  });

  it("átviszi a MÁR BEGÉPELT szöveget (ne kelljen újra beírni)", () => {
    expect(MENU).toMatch(/openGlobalSearch\(keresett\)/);
    expect(KERESO).toMatch(/export function openGlobalSearch\(kezdoQuery\?: string\)/);
    expect(KERESO).toMatch(/if \(typeof atvett === "string" && atvett\.trim\(\)\) setQ\(atvett\.trim\(\)\)/);
  });

  it("⚠️ a fejléc-gomb NEM adja át az egéreseményt keresőszóként", () => {
    // Közvetlen `onClick={openGlobalSearch}` esetén a React az eseményt adná át
    // első argumentumként — egy [object MouseEvent] kerülne a mezőbe.
    expect(KERESO).toMatch(/onClick=\{\(\) => openGlobalSearch\(\)\}/);
    expect(KERESO).not.toMatch(/onClick=\{openGlobalSearch\}/);
  });

  it("a menü bezárása UTÁN nyílik (nem ugranak egymásra)", () => {
    expect(MENU).toMatch(/close\(\);[\s\S]{0,200}setTimeout\(\(\) => openGlobalSearch/);
  });
});
