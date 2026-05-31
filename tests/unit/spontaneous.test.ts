import { describe, it, expect } from "vitest";
import {
  validateSpontaneousInput,
  computeSpontaneousExpiry,
  SPONTANEOUS_MAX_TTL_MS,
  type SpontaneousFormInput,
} from "@/lib/spontaneous";

function inFuture(hours: number): string {
  return new Date(Date.now() + hours * 3600 * 1000).toISOString();
}

const validBase: SpontaneousFormInput = {
  title: "Bringázás a Sihl mentén",
  locationName: "Sihl-part, Zürich",
  cantonCode: "ZH",
  meetupTime: inFuture(3),
  maxPeople: 3,
  contactPhone: "+41791234567",
  website: "",
};

describe("validateSpontaneousInput", () => {
  it("érvényes input → ok", () => {
    const res = validateSpontaneousInput(validBase);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.maxPeople).toBe(3);
      expect(res.value.contactPhone).toBe("+41791234567");
    }
  });

  it("múltbeli időpont → meetupTime hiba", () => {
    const res = validateSpontaneousInput({ ...validBase, meetupTime: inFuture(-5) });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors.some((e) => e.field === "meetupTime")).toBe(true);
  });

  it("48h-nál távolabbi időpont → meetupTime hiba", () => {
    const res = validateSpontaneousInput({ ...validBase, meetupTime: inFuture(72) });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors.some((e) => e.field === "meetupTime")).toBe(true);
  });

  it("hiányzó telefonszám → contactPhone hiba", () => {
    const res = validateSpontaneousInput({ ...validBase, contactPhone: "" });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors.some((e) => e.field === "contactPhone")).toBe(true);
  });
});

describe("computeSpontaneousExpiry", () => {
  it("meetup + 1 óra, ISO-szerű formátum", () => {
    const meetup = inFuture(2);
    const expiry = computeSpontaneousExpiry(meetup);
    expect(expiry).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    const expiryMs = Date.parse(expiry + "Z");
    expect(expiryMs).toBeCloseTo(Date.parse(meetup) + 3600 * 1000, -4);
  });

  it("a lejárat max 48h+1h-ra van korlátozva", () => {
    const expiry = computeSpontaneousExpiry(inFuture(200));
    const expiryMs = Date.parse(expiry + "Z");
    expect(expiryMs).toBeLessThanOrEqual(Date.now() + SPONTANEOUS_MAX_TTL_MS + 61 * 60 * 1000);
  });
});
