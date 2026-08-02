import { describe, it, expect } from "vitest";
// @ts-expect-error — .mjs segédszkript, nincs típusdefiníciója
import { cimEgyezik, nemzetkozi, utcaEsSzam } from "../../scripts/match-verified-phones.mjs";

/**
 * A Maps-ből visszakapott telefonok hozzárendelésének biztonsági szabálya.
 *
 * ⚠️⚠️ MIÉRT: a Maps a NÉVRE keresve „segítőkészen" egy MÁSIK, hasonló profilú
 * helyet is visszaad. 2026-08-03-i valós mérés: 10 osztrák pszichológusból
 * 6-ra jött találat, de kettő HAMIS volt — Göschl-Kraemer Karla (Phorusgasse 2,
 * 1040 Wien) helyett egy másik praxis a Semperstraße 5-ben (1180 Wien).
 * Ha a nevet fogadtam volna el bizonyítéknak, IDEGEN TELEFONSZÁM került volna
 * egy magyar szakember adatlapjára — pontosan az a hiba, amit a
 * contact-completion runbook „nyers substring-illesztés IDEGEN telefont ad"
 * néven dokumentál.
 *
 * ⚠️ A német utcanév-normalizálás nélkül a VALÓDI egyezések hullanának el
 * („Grazer Straße" vs „Grazer Str."), ezért a teszt MINDKÉT irányban mér.
 */
describe("cím-egyeztetés a telefon-hozzárendeléshez", () => {
  it("elfogadja a valódi egyezést a német rövidítések ellenére", () => {
    // Straße ↔ Str.
    expect(cimEgyezik("Grazer Straße 71/1/3, 2700 Wiener Neustadt", "Grazer Str. 71/1/3, 2700 Wiener Neustadt")).toBe(true);
    // platz ↔ Pl. + a Maps elhagyja az ajtószámot
    expect(cimEgyezik("Zimmermannplatz 4/27, 1090 Wien", "Zimmermannpl. 4, 1090 Wien")).toBe(true);
    // ß ↔ ss
    expect(cimEgyezik("Tiroler Straße 22/8/3, 9800 Spittal", "Tiroler Strasse 22, 9800 Spittal")).toBe(true);
    expect(cimEgyezik("St. Veiter Straße 41/1, 9020 Klagenfurt", "St. Veiter Str. 41/1, 9020 Klagenfurt")).toBe(true);
  });

  it("⚠️ ELUTASÍTJA, ha más az utca vagy a házszám — ez véd az idegen telefontól", () => {
    // A valós hamis pozitív, ami miatt a szabály létezik:
    expect(cimEgyezik("Phorusgasse 2/9a, 1040 Wien", "Semperstraße 5/Tür 7, 1180 Wien")).toBe(false);
    // Ugyanaz az utca, MÁS házszám:
    expect(cimEgyezik("Grazer Straße 71, 2700 Wiener Neustadt", "Grazer Straße 17, 2700 Wiener Neustadt")).toBe(false);
    // Ugyanaz a házszám, MÁS utca:
    expect(cimEgyezik("Löblichgasse 13/16, 1090 Wien", "Landhausgasse 13/1/5, 1010 Wien")).toBe(false);
    // Hiányzó adat sosem egyezés:
    expect(cimEgyezik("", "Grazer Str. 71, 2700 Wiener Neustadt")).toBe(false);
    expect(cimEgyezik("Grazer Str. 71, 2700 Wiener Neustadt", "")).toBe(false);
  });

  it("az ORSZÁG-FÜGGETLEN változat a brit és spanyol címrendet is kezeli", async () => {
    // @ts-expect-error — .mjs segédszkript, nincs típusdefiníciója
    const { cimEgyezikAltalanos } = await import("../../scripts/match-verified-phones.mjs");
    // ⚠️ Brit: a HÁZSZÁM elöl áll — a német logika ezt félreolvasná.
    expect(cimEgyezikAltalanos("353 Green Lanes, Harringay, London N4 1DZ", "353 Green Lanes, Finsbury Park, London N4 1DZ")).toBe(true);
    // ⚠️ Spanyol: vesszős tagolás.
    expect(cimEgyezikAltalanos("Carrer de Lepant 311, Barcelona", "Carrer de Lepant, 311, Eixample, 08025 Barcelona")).toBe(true);
    // Holland: házszám a név után.
    expect(cimEgyezikAltalanos("Pottenbakkerstraat 4, 2984 AX Ridderkerk", "Pottenbakkerstraat 4, Ridderkerk")).toBe(true);
    // Német továbbra is:
    expect(cimEgyezikAltalanos("Grazer Straße 71/1/3, 2700 Wiener Neustadt", "Grazer Str. 71, 2700 Wiener Neustadt")).toBe(true);

    // ⚠️ ELUTASÍTÁS: más utca, más házszám.
    expect(cimEgyezikAltalanos("Phorusgasse 2, 1040 Wien", "Semperstraße 5, 1180 Wien")).toBe(false);
    // Azonos utcanév, de MÁS házszám → nem egyezés.
    expect(cimEgyezikAltalanos("353 Green Lanes, London", "17 Green Lanes, London")).toBe(false);
    // Hiányzó adat sosem egyezés.
    expect(cimEgyezikAltalanos("", "353 Green Lanes, London")).toBe(false);
    expect(cimEgyezikAltalanos("London", "353 Green Lanes, London")).toBe(false);
  });

  it("kiemeli az utcanevet és az ELSŐ házszámot (az ajtó-jelölő nélkül)", () => {
    expect(utcaEsSzam("Grazer Straße 71/1/3, 2700 Wiener Neustadt")).toEqual({ utca: "grazer str", szam: "71" });
    expect(utcaEsSzam("Phorusgasse 2/9a, 1040 Wien")).toEqual({ utca: "phorusgasse", szam: "2" });
  });

  it("a PsyOnline szóközös-kötőjeles alakját is nemzetközire hozza", async () => {
    // @ts-expect-error — .mjs segédszkript, nincs típusdefiníciója
    const { atTelefon } = await import("../../scripts/psyonline-match.mjs");
    // A regiszter „0676 - 3508814" alakban írja ki:
    expect(atTelefon("0676 - 3508814")).toBe("+43 676 3508814");
    expect(atTelefon("0680 - 140 99 85")).toBe("+43 680 1409985");
    expect(atTelefon("0699 - 11510203")).toBe("+43 699 11510203");
    // ⚠️ Ami nem telefonszám, arra NULL — különben szemét kerülne az adatlapra:
    expect(atTelefon("")).toBeNull();
    expect(atTelefon("12345")).toBeNull();
    expect(atTelefon("Kontaktdaten")).toBeNull();
  });

  it("osztrák helyi telefonszámot nemzetközi alakra hoz", () => {
    expect(nemzetkozi("0660 4846455")).toBe("+43 660 4846455");
    expect(nemzetkozi("01 5334740")).toBe("+43 1 5334740");
    // A már nemzetközi alakot NEM bántja:
    expect(nemzetkozi("+43 664 5141035")).toBe("+43 664 5141035");
    expect(nemzetkozi("")).toBeNull();
  });
});
