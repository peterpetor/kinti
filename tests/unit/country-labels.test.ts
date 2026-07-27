import { describe, it, expect } from "vitest";
import {
  COUNTRIES,
  courseLanguageName,
  countryLocative,
  countrySuperessive,
  countryIllative,
  countryAdjective,
  countryResidentialAdjective,
  regionWord,
} from "@/lib/countries";

/**
 * ⚠️ Visszatérő hibaosztály (a user többször jelezte): a UI-szövegek láncolt
 * ország-elágazással készültek, aminek az UTOLSÓ ága egy KONKRÉT ország volt.
 * Így Anglia hol Svájcot, hol Ausztriát kapott:
 *  - „Nyelvlecke — osztrák német" az angliai menüben (2026-07-28)
 *  - „a svájci magyarok átlaga" az Iránytűben
 *  - „Hogyan lettem autószerelő Zürichben" az élettörténet-írásban
 *
 * Ezért: MINDEN ország-tudatos szöveg-helper adjon SAJÁT értéket minden élő
 * országra — ne másét örökölje a `default` ágon.
 */
const HELPERS: Array<[string, (c: string) => string]> = [
  ["courseLanguageName", courseLanguageName],
  ["countryLocative", countryLocative],
  ["countrySuperessive", countrySuperessive],
  ["countryIllative", countryIllative],
  ["countryAdjective", countryAdjective],
  ["countryResidentialAdjective", countryResidentialAdjective],
  ["regionWord", regionWord],
];

describe("ország-tudatos szöveg-helperek", () => {
  it("minden élő ország kap NEM ÜRES értéket minden helperből", () => {
    for (const [name, fn] of HELPERS) {
      for (const c of COUNTRIES) {
        expect(fn(c.code)?.trim(), `${name}(${c.code})`).toBeTruthy();
      }
    }
  });

  it("⚠️ Anglia nem örökölhet svájci vagy osztrák szöveget", () => {
    for (const [name, fn] of HELPERS) {
      const gb = fn("GB");
      // A `regionWord` szándékosan adhat közös szót („régió"), de a többi
      // helper Angliára SOSEM adhatja ugyanazt, amit Svájcra/Ausztriára.
      if (name === "regionWord") continue;
      expect(gb, `${name}: GB ugyanazt kapja, mint CH`).not.toBe(fn("CH"));
      expect(gb, `${name}: GB ugyanazt kapja, mint AT`).not.toBe(fn("AT"));
    }
  });

  it("a nyelvlecke-címke minden országra a HELYES nyelvet nevezi meg", () => {
    expect(courseLanguageName("CH")).toBe("svájci német");
    expect(courseLanguageName("AT")).toBe("osztrák német");
    expect(courseLanguageName("DE")).toBe("német");
    expect(courseLanguageName("NL")).toBe("holland");
    expect(courseLanguageName("GB")).toBe("brit angol");
  });

  it("ismeretlen ország a svájci alapértelmezettre esik (DEFAULT_COUNTRY)", () => {
    expect(courseLanguageName("XX")).toBe("svájci német");
    expect(courseLanguageName(null)).toBe("svájci német");
  });
});
