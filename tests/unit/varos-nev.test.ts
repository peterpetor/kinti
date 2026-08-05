import { describe, it, expect } from "vitest";
import { varosNev } from "../../src/lib/address";

/**
 * Város kiemelése a címből (lista-kártya).
 *
 * ⚠️ HAT ORSZÁG, KÉT KÜLÖNBÖZŐ IRÁNYÍTÓSZÁM-HELY. A hiba itt NÉMA lenne: nem
 * hibaüzenetet adna, hanem egy csúnya, félig levágott sztringet a kártyán
 * („London W5 4EA", „70178 Stuttgart"), és senkinek nem tűnne fel, hogy pont a
 * brit találatoknál rossz. Minden formátumra VALÓS, az adatbázisból vett
 * mintával mérünk.
 */

describe("varosNev — valós címformátumok", () => {
  it("DE: az irányítószám a város ELŐTT", () => {
    expect(varosNev("Christophstraße 7, 70178 Stuttgart")).toBe("Stuttgart");
    expect(varosNev("Oberföhringer Straße 40, 81925 München")).toBe("München");
  });

  it("AT / CH: ugyanaz a minta", () => {
    expect(varosNev("Thaliastraße 156, 1160 Wien")).toBe("Wien");
    expect(varosNev("Seestrasse 181, 8820 Wädenswil")).toBe("Wädenswil");
  });

  it("NL: irányítószám = szám + KÉT BETŰ", () => {
    expect(varosNev("Middenweg 116, 1097 BT Amsterdam")).toBe("Amsterdam");
  });

  it("⚠️ GB: az irányítószám a város UTÁN áll", () => {
    // Ha csak az elöl álló kódra szűrnénk, itt „London W5 4EA" maradna.
    expect(varosNev("62 Little Ealing Lane, London W5 4EA")).toBe("London");
    expect(varosNev("1 Deansgate, Manchester M1 1AE")).toBe("Manchester");
  });

  it("ES: több vesszős cím — az UTOLSÓ szegmens a város", () => {
    expect(varosNev("Colegio de La Salle Gracia, Plaça del Nord 14, 08024 Barcelona")).toBe("Barcelona");
  });

  it("csak város (a seed nagy része ilyen)", () => {
    expect(varosNev("Stuttgart")).toBe("Stuttgart");
    expect(varosNev("Pforzheim")).toBe("Pforzheim");
  });
});

/**
 * ⚠️ EZEK A TESZTEK A VALÓS ADATBÁZISBÓL JÖNNEK, NEM KITALÁLT PÉLDÁKBÓL.
 * Az első változatom a fenti „tiszta" mintákon hibátlan volt, a 2224 élő címen
 * viszont 59 rossz kimenetet adott — mind némán (nem hiba, csak egy fura
 * sztring a kártyán). Ezek a sorok azok a formátumok, amiket akkor NEM láttam.
 */
describe("varosNev — amit csak a valós adat mutatott meg", () => {
  it("FORDÍTOTT sorrend: város elöl, utca hátul", () => {
    expect(varosNev("85457 Wörth, Osterfeldweg 3")).toBe("Wörth");
    expect(varosNev("78465 Konstanz, Kornblumenweg 14")).toBe("Konstanz");
  });

  it("nincs vessző — minden egy szegmensben", () => {
    expect(varosNev("Domplatz 5 93047 Regensburg")).toBe("Regensburg");
    expect(varosNev("Husener Str. 46 33098 Paderborn")).toBe("Paderborn");
  });

  it("város, MÖGÖTTE az irányítószám", () => {
    expect(varosNev("Im Röhrich 1, Ötisheim 75443")).toBe("Ötisheim");
    expect(varosNev("Gute Anger 15, Freising 85354")).toBe("Freising");
  });

  it("GB: CSAK a külső kód (nincs teljes irányítószám)", () => {
    expect(varosNev("Cricklewood, London NW2")).toBe("London");
    expect(varosNev("Croydon, London CR0")).toBe("London");
  });

  it("⚠️ CSAK utca, város nélkül → null (nem tudjuk, ne találjuk ki)", () => {
    expect(varosNev("Keizersgracht 132")).toBeNull();
    expect(varosNev("Prager Straße 4")).toBeNull();
    expect(varosNev("Tempelhofer Berg 7D")).toBeNull();
  });

  it("⚠️ szolgáltatási TERÜLET nem város", () => {
    expect(varosNev("Országos, telefonos és online tanácsadás")).toBeNull();
    expect(varosNev("Corby és környéke — helyszíni kiszállásos szerviz")).toBeNull();
    expect(varosNev("Német nyelvű kantonok · Zürich")).toBeNull();
    // ⚠️ Ez a `\b` szóhatár miatt csúszott át: a JS-ben az „é” nem szó-karakter,
    // így a `\bés\b` sosem illeszkedik.
    expect(varosNev("Frankfurt am Main és környéke")).toBeNull();
  });

  it("bécsi kerület-jelölés nem városnév", () => {
    expect(varosNev("Linzerstr. 373, 14. ker")).toBeNull();
    expect(varosNev("Hofstattgasse 17/3 (18. ker)")).toBeNull();
  });

  it("hosszú, valós városnevek épen maradnak", () => {
    expect(varosNev("Zellerstrasse 27, 5671 Bruck an der Großglocknerstraße")).toBe(
      "Bruck an der Großglocknerstraße",
    );
    expect(varosNev("Gartenstraße 13, 06386 Osternienburger Land (Trinum)")).toBe(
      "Osternienburger Land (Trinum)",
    );
  });
});

describe("varosNev — ami NEM város", () => {
  it("üres bemenetre null", () => {
    expect(varosNev(null)).toBeNull();
    expect(varosNev(undefined)).toBeNull();
    expect(varosNev("   ")).toBeNull();
  });

  it("„Mobil” / „Online” nem hely", () => {
    // Ezek valódi értékek az adatbázisban, és helyként megjelenítve hazudnának.
    expect(varosNev("Mobil")).toBeNull();
    expect(varosNev("online")).toBeNull();
  });

  it("puszta szám nem városnév", () => {
    expect(varosNev("Fő utca, 12")).toBeNull();
  });

  it("kétszavas városnevet nem csonkol", () => {
    expect(varosNev("Hauptstraße 1, 60313 Frankfurt am Main")).toBe("Frankfurt am Main");
    expect(varosNev("High Street, Stoke-on-Trent ST1 1AA")).toBe("Stoke-on-Trent");
  });
});
