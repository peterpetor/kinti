import { describe, it, expect } from "vitest";
import {
  calculateBusinessHoursStatus,
  parseWorkingHours,
  parseWorkingHoursStrict,
  DEFAULT_WORKING_HOURS,
  type WorkingHours,
} from "@/lib/hours";

/**
 * Regresszió: a kártyák korábban a statikus `open_now` DB-flaget mutattak
 * (mindig "Zárva"). A javítás óta a `calculateBusinessHoursStatus` él a tényleges
 * nyitvatartásból. Itt rögzítjük a magját: munkaidőben nyitva, azon kívül zárva.
 *
 * A számítás Europe/Zurich idő szerint dolgozik — fix svájci hétköznap-időpontokra
 * tesztelünk (a CI gép zónájától függetlenül determinisztikus).
 */
const NINE_TO_FIVE: WorkingHours = {
  ...DEFAULT_WORKING_HOURS,
  mon: { open: "08:00", close: "18:00", closed: false },
};

/** Adott svájci helyi óra:perc egy hétfőn → UTC Date (télen UTC+1). */
function swissMondayAt(hour: number, minute = 0): Date {
  // 2024-01-08 hétfő. Svájc télen UTC+1 → a megadott helyi óra = UTC (hour-1).
  return new Date(Date.UTC(2024, 0, 8, hour - 1, minute));
}

describe("calculateBusinessHoursStatus", () => {
  it("délután (8–18 között) NYITVA — ez volt a bug", () => {
    const s = calculateBusinessHoursStatus(NINE_TO_FIVE, swissMondayAt(14));
    expect(s.isOpen).toBe(true);
    expect(s.statusText).toBe("Most nyitva");
  });

  it("nyitás előtt (kora reggel) zárva, ma nyit", () => {
    const s = calculateBusinessHoursStatus(NINE_TO_FIVE, swissMondayAt(6));
    expect(s.isOpen).toBe(false);
    expect(s.detailText).toContain("nyit ma");
  });

  it("zárás után (este) zárva", () => {
    const s = calculateBusinessHoursStatus(NINE_TO_FIVE, swissMondayAt(20));
    expect(s.isOpen).toBe(false);
  });

  it("pontosan záráskor (18:00) már zárva (close exkluzív)", () => {
    const s = calculateBusinessHoursStatus(NINE_TO_FIVE, swissMondayAt(18));
    expect(s.isOpen).toBe(false);
  });

  it("parseWorkingHours: null → default (hétköznap 8–18)", () => {
    expect(parseWorkingHours(null)).toEqual(DEFAULT_WORKING_HOURS);
  });

  it("parseWorkingHours: hibás JSON → default (nem dob)", () => {
    expect(parseWorkingHours("{nem json")).toEqual(DEFAULT_WORKING_HOURS);
  });

  it("a default nyitvatartással délután NYITVA (a képernyőképen látott eset)", () => {
    const s = calculateBusinessHoursStatus(parseWorkingHours(null), swissMondayAt(15));
    expect(s.isOpen).toBe(true);
  });

  // Regresszió: egy hiányos nap-objektum (close nélkül) korábban .split(":")-nél
  // TypeError-t dobott, ami a BusinessCard-on át az egész listát megdöntötte.
  it("parseWorkingHours: hiányos nap (nincs close) → nem dob, a napot a defaultból pótolja", () => {
    const wh = parseWorkingHours(JSON.stringify({ mon: { open: "09:00", closed: false } }));
    expect(wh.mon.close).toBe(DEFAULT_WORKING_HOURS.mon.close);
    // A státusz-számítás sem hasal el a normalizált napon.
    expect(() => calculateBusinessHoursStatus(wh, swissMondayAt(14))).not.toThrow();
    expect(calculateBusinessHoursStatus(wh, swissMondayAt(14)).isOpen).toBe(true);
  });

  it("parseWorkingHours: rossz típusú mezők (open szám, close null) → default-ra esik, nem dob", () => {
    const wh = parseWorkingHours(JSON.stringify({ tue: { open: 9, close: null, closed: false } }));
    expect(wh.tue).toEqual(DEFAULT_WORKING_HOURS.tue);
    expect(() => calculateBusinessHoursStatus(wh, swissMondayAt(14))).not.toThrow();
  });

  it("parseWorkingHours: nem-objektum JSON (tömb / szám) → default, nem dob", () => {
    expect(parseWorkingHours("[1,2,3]")).toEqual(DEFAULT_WORKING_HOURS);
    expect(parseWorkingHours("42")).toEqual(DEFAULT_WORKING_HOURS);
  });
});

describe("parseWorkingHoursStrict — ismerjuk-e a nyitvatartast (nincs kitalalt statusz)", () => {
  it("nincs adat (null / üres / üres objektum) → null", () => {
    expect(parseWorkingHoursStrict(null)).toBeNull();
    expect(parseWorkingHoursStrict("")).toBeNull();
    expect(parseWorkingHoursStrict("{}")).toBeNull();
  });

  it("hibás JSON / nem-objektum → null (nem dob)", () => {
    expect(parseWorkingHoursStrict("{nem json")).toBeNull();
    expect(parseWorkingHoursStrict("[1,2,3]")).toBeNull();
    expect(parseWorkingHoursStrict("42")).toBeNull();
  });

  it("legalább egy valódi nap → normalizált WorkingHours (nem null)", () => {
    const wh = parseWorkingHoursStrict(JSON.stringify({ mon: { open: "09:00", close: "17:00", closed: false } }));
    expect(wh).not.toBeNull();
    expect(wh!.mon).toEqual({ open: "09:00", close: "17:00", closed: false });
    // a meg nem adott napok a defaultra esnek (a strukturált szerkesztő amúgy mind a 7-et beállítja)
    expect(wh!.sun).toEqual(DEFAULT_WORKING_HOURS.sun);
  });

  it("a default-oló parseWorkingHours továbbra is teljes hetet ad ugyanerre", () => {
    // (Kontraszt: parseWorkingHours SOSE null — ott ez a szándék; a strict a megkülönböztető.)
    expect(parseWorkingHours(null)).toEqual(DEFAULT_WORKING_HOURS);
  });
});

describe("calculateBusinessHoursStatus — cselekvésre ösztönző relatív időzítés", () => {
  it("hamarosan zár (17:30, zár 18:00) → closingSoon + relatív detail", () => {
    const s = calculateBusinessHoursStatus(NINE_TO_FIVE, swissMondayAt(17, 30));
    expect(s.isOpen).toBe(true);
    expect(s.closingSoon).toBe(true);
    expect(s.openingSoon).toBe(false);
    expect(s.minutesUntilChange).toBe(30);
    expect(s.detailText).toBe("zár 30 perc múlva");
  });

  it("nem hamarosan zár (14:00, zár 18:00) → NEM closingSoon, abszolút detail", () => {
    const s = calculateBusinessHoursStatus(NINE_TO_FIVE, swissMondayAt(14));
    expect(s.isOpen).toBe(true);
    expect(s.closingSoon).toBe(false);
    expect(s.detailText).toBe("zár 18:00-kor");
    expect(s.minutesUntilChange).toBe(240);
  });

  it("hamarosan nyit (7:20, nyit 8:00) → openingSoon + relatív detail", () => {
    const s = calculateBusinessHoursStatus(NINE_TO_FIVE, swissMondayAt(7, 20));
    expect(s.isOpen).toBe(false);
    expect(s.openingSoon).toBe(true);
    expect(s.minutesUntilChange).toBe(40);
    expect(s.detailText).toBe("nyit 40 perc múlva");
  });

  it("nem hamarosan nyit (6:00, nyit 8:00) → abszolút detail, nincs jelzés", () => {
    const s = calculateBusinessHoursStatus(NINE_TO_FIVE, swissMondayAt(6));
    expect(s.isOpen).toBe(false);
    expect(s.openingSoon).toBe(false);
    expect(s.detailText).toBe("nyit ma 08:00-kor");
  });

  it("zárás után → holnap nyit, nincs relatív jelzés", () => {
    const s = calculateBusinessHoursStatus(NINE_TO_FIVE, swissMondayAt(20));
    expect(s.isOpen).toBe(false);
    expect(s.openingSoon).toBe(false);
    expect(s.minutesUntilChange).toBeNull();
    expect(s.detailText).toContain("nyit holnap");
  });
});
