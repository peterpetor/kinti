import { describe, it, expect } from "vitest";
import { haversineKm, formatDistanceKm } from "@/lib/distance";

describe("haversineKm", () => {
  it("egyazon pont távolsága ~0", () => {
    expect(haversineKm(47.3769, 8.5417, 47.3769, 8.5417)).toBeCloseTo(0, 5);
  });

  it("Zürich → Bern ~90–100 km", () => {
    const km = haversineKm(47.3769, 8.5417, 46.948, 7.4474);
    expect(km).toBeGreaterThan(90);
    expect(km).toBeLessThan(100);
  });

  it("szimmetrikus (A→B == B→A)", () => {
    const ab = haversineKm(47.0, 8.0, 46.0, 7.0);
    const ba = haversineKm(46.0, 7.0, 47.0, 8.0);
    expect(ab).toBeCloseTo(ba, 9);
  });
});

describe("formatDistanceKm", () => {
  it("1 km alatt méterben", () => {
    expect(formatDistanceKm(0.5)).toBe("500 m");
  });
  it("10 km alatt egy tizedessel", () => {
    expect(formatDistanceKm(4.25)).toBe("4.3 km");
  });
  it("10 km felett kerekítve", () => {
    expect(formatDistanceKm(18.4)).toBe("18 km");
  });
});
