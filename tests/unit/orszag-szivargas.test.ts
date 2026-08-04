import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { KEZDOCSOMAG, kezdoLepesek, hasKezdocsomag } from "../../src/lib/kezdocsomag";

/**
 * Ország-szivárgás: ország-specifikus tartalom MÁS ország felhasználójának.
 *
 * ⚠️ A memória szerint ez az app legdrágább hibaosztálya, és most is éles
 * hibaként jött elő: a Piactér „Költöztetés" fülén az ANGLIA fejléc alatt
 * svájci-német tanács állt (Halteverbot, svájci vámkezelés), a jelentkezés
 * utáni „Kezdőcsomag" pedig mindenkinek a SVÁJCI listát adta (AHV, Kreisbüro).
 *
 * A védelem elve: a fix MINDIG TÁBLA, és a hiányzó ország-sor NEM eshet vissza
 * csendben Svájcra.
 */

const ORSZAGOK = ["CH", "AT", "DE", "NL", "GB", "ES"] as const;

describe("Kezdőcsomag — minden országnak sajátja", () => {
  it.each(ORSZAGOK)("%s: van saját lépéslista", (c) => {
    expect(hasKezdocsomag(c)).toBe(true);
    expect(kezdoLepesek(c).length).toBeGreaterThanOrEqual(5);
  });

  it("⚠️ ismeretlen országra ÜRES lista, NEM svájci", () => {
    expect(kezdoLepesek("HU")).toEqual([]);
    expect(hasKezdocsomag("HU")).toBe(false);
  });

  it("⚠️ a lépés-AZONOSÍTÓK országonként EGYEDIEK", () => {
    // Közös id-nél az egyik ország kipipálása a másikban is késznek látszana.
    const mind = ORSZAGOK.flatMap((c) => kezdoLepesek(c).map((l) => l.id));
    const dup = mind.filter((x, i) => mind.indexOf(x) !== i);
    expect(dup, `ütköző lépés-azonosító: ${dup.join(", ")}`).toEqual([]);
  });

  it("⚠️ a SVÁJCI azonosítók változatlanok (a meglévő haladás ne vesszen el)", () => {
    expect(kezdoLepesek("CH").map((l) => l.id)).toEqual([
      "ahv", "bank", "kreisburo", "krankenkasse", "permit", "phone",
    ]);
  });

  it("minden lépés kitöltött, és nem abszurd hosszú", () => {
    for (const [c, lista] of Object.entries(KEZDOCSOMAG)) {
      for (const l of lista) {
        expect(l.title.trim().length, `${c}: üres cím`).toBeGreaterThan(6);
        expect(l.title.length, `${c}: túl hosszú cím — ${l.title}`).toBeLessThan(60);
        expect(l.description.trim().length, `${c}: üres leírás`).toBeGreaterThan(20);
      }
    }
  });

  /**
   * ⚠️ A LÉNYEG: egyik ország listájában sem szerepelhet MÁSIK ország
   * intézménye. Ettől lett a hiba: az angol felhasználó „Krankenkasse"-t látott.
   */
  it("⚠️ nincs IDEGEN ország intézménye egyik listában sem", () => {
    const IDEGEN: Record<string, RegExp> = {
      CH: /Meldezettel|Bürgeramt|BSN|DigiD|National Insurance|empadronamiento|ÖGK/i,
      AT: /Kreisbüro|Krankenkasse\b|BSN|DigiD|National Insurance|empadronamiento|AHV/i,
      DE: /Kreisbüro|AHV|Meldezettel|BSN|DigiD|National Insurance|empadronamiento|ÖGK/i,
      NL: /Kreisbüro|AHV|Meldezettel|Krankenkasse|National Insurance|empadronamiento|ÖGK/i,
      GB: /Kreisbüro|AHV|Meldezettel|Krankenkasse|BSN|DigiD|empadronamiento|ÖGK/i,
      ES: /Kreisbüro|AHV|Meldezettel|Krankenkasse|BSN|DigiD|National Insurance|ÖGK/i,
    };
    for (const c of ORSZAGOK) {
      const szoveg = kezdoLepesek(c).map((l) => `${l.title} ${l.description}`).join(" ");
      const talalat = szoveg.match(IDEGEN[c]);
      expect(talalat, `${c} listájában idegen ország intézménye: ${talalat?.[0]}`).toBeNull();
    }
  });
});

/**
 * ⚠️ Szerkezeti őrök: a két javított felület nem eshet vissza lapos,
 * ország-független listára.
 */
describe("szerkezeti őr — a javított felületek ország-tudatosak maradnak", () => {
  it("a Kezdőcsomag-lap NEM tartalmaz bedrótozott svájci címet", () => {
    const s = readFileSync(resolve(process.cwd(), "src/app/(app)/allasok/onboarding/page.tsx"), "utf8");
    expect(s, "visszakerült a „Svájci Kezdőcsomag” fix cím").not.toMatch(/Svájci Kezdőcsomag/);
    expect(s, "a lap nem olvassa az országot").toMatch(/usePreferredCountry/);
    expect(s, "a lap nem a táblából dolgozik").toMatch(/kezdoLepesek\(/);
  });

  it("a Piactér költözés-tippjei ország-tudatosak", () => {
    const s = readFileSync(resolve(process.cwd(), "src/app/(app)/piacter/piacter-tabs.tsx"), "utf8");
    expect(s, "a lapos MOVING_TIPS tömb visszakerült").not.toMatch(/const MOVING_TIPS\s*:/);
    expect(s, "a tippek nem a táblából jönnek").toMatch(/movingTips\(country\)/);
    // A vám-tipp csak EU-n kívülre — a projekt saját kapujával eldöntve.
    expect(s, "a vám-tipp nincs ország-kapuhoz kötve").toMatch(/isFeatureAvailable\("vam", country\)/);
  });

  it("⚠️ a Piactér-tippekben nincs FIX svájci/német hivatkozás", () => {
    const s = readFileSync(resolve(process.cwd(), "src/app/(app)/piacter/piacter-tabs.tsx"), "utf8");
    // A kommentek említhetik (a hiba leírásaként); a KÓD-részben nem lehet.
    const kod = s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    expect(kod, "visszakerült a „német és svájci városban” szöveg").not.toMatch(/német és svájci/);
    expect(kod, "visszakerült a fix „Svájcba vagy Svájcból” vám-szöveg").not.toMatch(/Svájcba vagy Svájcból/);
  });

  it("az őrök valóban fognának (bidirekcionális ellenőrzés)", () => {
    expect(/const MOVING_TIPS\s*:/.test("const MOVING_TIPS: string[] = [")).toBe(true);
    expect(/Svájci Kezdőcsomag/.test("<h1>Svájci Kezdőcsomag 🇨🇭</h1>")).toBe(true);
  });
});
