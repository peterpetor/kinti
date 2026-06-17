import { describe, it, expect } from "vitest";
import {
  calculateBusinessHoursStatus,
  parseWorkingHours,
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

/** Adott svájci helyi óra egy hétfőn → UTC Date (télen UTC+1). */
function swissMondayAt(hour: number): Date {
  // 2024-01-08 hétfő. Svájc télen UTC+1 → a megadott helyi óra = UTC (hour-1).
  return new Date(Date.UTC(2024, 0, 8, hour - 1, 0));
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
});
