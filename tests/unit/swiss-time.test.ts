import { describe, it, expect } from "vitest";
import { zurichOffsetMinutes, swissLocalToUtc } from "@/lib/swiss-time";

describe("zurichOffsetMinutes", () => {
  it("télen CET (+60)", () => {
    expect(zurichOffsetMinutes(new Date("2026-01-15T12:00:00Z"))).toBe(60);
  });
  it("nyáron CEST (+120)", () => {
    expect(zurichOffsetMinutes(new Date("2026-07-15T12:00:00Z"))).toBe(120);
  });
});

describe("swissLocalToUtc", () => {
  it("téli fal-óra 12:00 → 11:00 UTC", () => {
    const d = swissLocalToUtc("2026-01-15", "12:00");
    expect(d).not.toBeNull();
    expect(d!.getUTCHours()).toBe(11);
  });

  it("nyári fal-óra 12:00 → 10:00 UTC", () => {
    const d = swissLocalToUtc("2026-07-15", "12:00");
    expect(d!.getUTCHours()).toBe(10);
  });

  it("hiányzó idő → 19:00 default", () => {
    const d = swissLocalToUtc("2026-07-15", null);
    expect(d!.getUTCHours()).toBe(17); // 19:00 CEST → 17:00 UTC
  });

  it("érvénytelen dátum → null", () => {
    expect(swissLocalToUtc(null, "12:00")).toBeNull();
    expect(swissLocalToUtc("nope", "12:00")).toBeNull();
  });
});
