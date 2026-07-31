import { describe, it, expect } from "vitest";
import { formatVerifiedLabel, VERIFIED_MAX_AGE_MONTHS } from "@/lib/verified-label";

/**
 * A frissesség-jel feliratának őre.
 *
 * ⚠️ A LEJÁRAT ÜZLETI SZABÁLY, nem stílus: egy 3 éves „Ellenőrizve" rosszabb,
 * mint a semmi — azt sugallná, hogy az adat friss. A 2026-07-31-i audit
 * kimutatta, hogy a szaknévsor fogyasztó-arcú részének 20,6%-a halott volt;
 * pont ez ellen véd a jel, ezért nem szabad, hogy maga is elavuljon.
 */
const NOW = new Date("2026-07-31T12:00:00Z");

describe("frissesség-jel felirata", () => {
  it("friss dátumot magyar hónapnévvel ír ki", () => {
    expect(formatVerifiedLabel("2026-07-31", NOW)).toBe("2026. július");
    expect(formatVerifiedLabel("2026-01-05", NOW)).toBe("2026. január");
  });

  it("a D1 „YYYY-MM-DD HH:MM:SS” alakját is elfogadja", () => {
    expect(formatVerifiedLabel("2026-03-14 08:30:00", NOW)).toBe("2026. március");
  });

  it("nincs adat → nincs felirat (nem hazudunk frissességet)", () => {
    expect(formatVerifiedLabel(null, NOW)).toBeNull();
    expect(formatVerifiedLabel(undefined, NOW)).toBeNull();
    expect(formatVerifiedLabel("", NOW)).toBeNull();
  });

  it("⚠️ a 12 hónapnál régebbi ellenőrzést NEM állítjuk", () => {
    // Pont a határon még kiírjuk…
    expect(formatVerifiedLabel("2025-07-15", NOW)).toBe("2025. július");
    // …egy hónappal túl már nem.
    expect(formatVerifiedLabel("2025-06-15", NOW)).toBeNull();
    expect(formatVerifiedLabel("2023-01-01", NOW)).toBeNull();
  });

  it("a küszöb 12 hónap (ha valaki átírja, tudatos döntés legyen)", () => {
    expect(VERIFIED_MAX_AGE_MONTHS).toBe(12);
  });

  it("jövőbeli dátum hibás adat → nincs felirat", () => {
    expect(formatVerifiedLabel("2027-01-01", NOW)).toBeNull();
  });

  it("érvénytelen bemenetre nem dob és nem ír ki semmit", () => {
    expect(formatVerifiedLabel("tegnap", NOW)).toBeNull();
    expect(formatVerifiedLabel("2026-13-01", NOW)).toBeNull();
    expect(formatVerifiedLabel("2026-07", NOW)).toBeNull();
  });
});
