import { describe, it, expect, beforeEach, vi } from "vitest";
import { recordUse, getTopUsed } from "@/lib/usage-frecency";

/**
 * usage-frecency — a „Gyakran használt" menü/rács kliensoldali számlálója.
 * localStorage-alapú; itt egy egyszerű in-memory stubbal fut.
 */

const store = new Map<string, string>();

beforeEach(() => {
  store.clear();
  vi.stubGlobal("window", {});
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  });
});

const DAY = 24 * 60 * 60 * 1000;

describe("usage-frecency", () => {
  it("az egyszeri kattintás még nem szokás (minCount=2 alapból)", () => {
    recordUse("/berkalkulator");
    expect(getTopUsed(5)).toEqual([]);
    recordUse("/berkalkulator");
    expect(getTopUsed(5)).toEqual(["/berkalkulator"]);
  });

  it("használat-szám szerint rangsorol", () => {
    for (let i = 0; i < 5; i++) recordUse("/szaknevsor");
    for (let i = 0; i < 3; i++) recordUse("/allasok");
    for (let i = 0; i < 2; i++) recordUse("/utalas");
    expect(getTopUsed(2)).toEqual(["/szaknevsor", "/allasok"]);
  });

  it("a frissesség felülírja a régi tömeges használatot (30 napos felezés)", () => {
    const t0 = Date.now();
    // Régi szokás: 8 kattintás 90 napja → 8 × 0.5^3 = 1 pont.
    for (let i = 0; i < 8; i++) recordUse("/kviz", t0 - 90 * DAY);
    // Friss szokás: 3 mai kattintás → 3 pont.
    for (let i = 0; i < 3; i++) recordUse("/berkalkulator", t0);
    expect(getTopUsed(2, 2, t0)).toEqual(["/berkalkulator", "/kviz"]);
  });

  it("sérült tárolt érték esetén üresről indul, nem dob hibát", () => {
    store.set("kinti.usage.v1", "{nem json");
    expect(getTopUsed(5)).toEqual([]);
    recordUse("/utalas");
    recordUse("/utalas");
    expect(getTopUsed(5)).toEqual(["/utalas"]);
  });

  it("üres azonosítót nem rögzít", () => {
    recordUse("");
    recordUse("");
    expect(getTopUsed(5, 1)).toEqual([]);
  });
});
