import { describe, it, expect } from "vitest";
import { calculateGbTravel, GB_TARIF_SYSTEMS, GB_TICKET_TYPES } from "@/lib/transport";
import { getChecklists, CHECKLISTS_GB, getChecklist } from "@/lib/admin-checklists";
import { isFeatureAvailable } from "@/lib/feature-availability";

describe("GB közlekedés — TfL capping", () => {
  const CAP = { dailyCap: 8.9, weeklyCap: 44.7 };

  it("kevés utazásnál nincs plafon, a nyers ár érvényes", () => {
    const r = calculateGbTravel({ daysPerWeek: 1, tripsPerDay: 2, singleFare: 2.9, ...CAP });
    expect(r.rawWeekly).toBeCloseTo(5.8, 2);
    expect(r.actualWeekly).toBeCloseTo(5.8, 2);
    expect(r.cappedBy).toBe("none");
    expect(r.savedWeekly).toBe(0);
  });

  it("sok napon belüli utazásnál a NAPI plafon lép életbe", () => {
    // 6 út/nap × 2,90 = 17,40 → napi plafon 8,90
    const r = calculateGbTravel({ daysPerWeek: 2, tripsPerDay: 6, singleFare: 2.9, ...CAP });
    expect(r.rawWeekly).toBeCloseTo(34.8, 2);
    expect(r.afterDailyCap).toBeCloseTo(17.8, 2); // 8,90 × 2 nap
    expect(r.actualWeekly).toBeCloseTo(17.8, 2);
    expect(r.cappedBy).toBe("daily");
    expect(r.savedWeekly).toBeCloseTo(17, 2);
  });

  it("napi ingázásnál a HETI plafon lép életbe", () => {
    // 5 nap × napi plafon 8,90 = 44,50 → heti plafon 44,70 fölött nem
    const r = calculateGbTravel({ daysPerWeek: 7, tripsPerDay: 6, singleFare: 2.9, ...CAP });
    expect(r.actualWeekly).toBeCloseTo(44.7, 2);
    expect(r.cappedBy).toBe("weekly");
    expect(r.actualWeekly).toBeLessThan(r.afterDailyCap);
  });

  it("a tényleges összeg SOHA nem több a nyersnél és nem negatív", () => {
    for (const days of [0, 1, 3, 5, 7])
      for (const trips of [0, 2, 4, 10])
        for (const fare of [0, 1.75, 2.9, 6]) {
          const r = calculateGbTravel({ daysPerWeek: days, tripsPerDay: trips, singleFare: fare, ...CAP });
          expect(r.actualWeekly).toBeLessThanOrEqual(r.rawWeekly + 1e-9);
          expect(r.actualWeekly).toBeGreaterThanOrEqual(0);
          expect(Number.isNaN(r.actualWeekly)).toBe(false);
        }
  });

  it("0 plafon = nincs plafonozás (nem nullázza le a díjat)", () => {
    const r = calculateGbTravel({ daysPerWeek: 5, tripsPerDay: 2, singleFare: 3, dailyCap: 0, weeklyCap: 0 });
    expect(r.actualWeekly).toBeCloseTo(30, 2);
    expect(r.cappedBy).toBe("none");
  });

  it("a tarifa-rendszerek és jegytípusok fontban, brit forrással", () => {
    expect(GB_TARIF_SYSTEMS.length).toBeGreaterThanOrEqual(4);
    expect(GB_TICKET_TYPES.some((t) => t.id === "contactless")).toBe(true);
    for (const t of GB_TARIF_SYSTEMS) {
      expect(t.websiteUrl, t.id).toMatch(/^https:\/\//);
      // ⚠️ nem szivároghat be svájci/EU-s tartalom
      expect(t.description.toLowerCase(), t.id).not.toContain("chf");
    }
  });
});

describe("GB ügyintézés-csekklisták", () => {
  it("a getChecklists GB-re a GB-listát adja (nem a svájcit)", () => {
    const gb = getChecklists("GB");
    expect(gb).toBe(CHECKLISTS_GB);
    expect(gb.length).toBe(6);
    for (const c of gb) expect(c.slug).toMatch(/^gb-/);
  });

  it("minden GB-csekklista teljes és brit forrásra mutat", () => {
    for (const c of CHECKLISTS_GB) {
      expect(c.steps.length, c.slug).toBeGreaterThan(2);
      expect(c.sources.length, c.slug).toBeGreaterThan(0);
      expect(c.warnings?.length ?? 0, c.slug).toBeGreaterThan(0);
      const urls = [...c.sources.map((s) => s.url), ...c.steps.flatMap((s) => (s.link ? [s.link.url] : []))];
      for (const u of urls) {
        expect(u, `${c.slug}: ${u}`).toMatch(/gov\.uk|nhs\.uk|shelter\.org\.uk/);
      }
    }
  });

  it("a slug alapján visszakereshető", () => {
    expect(getChecklist("gb-nin")?.title).toContain("National Insurance");
    expect(getChecklist("gb-council-tax")).toBeTruthy();
  });

  it("a többi ország csekklistái változatlanok", () => {
    expect(getChecklists("NL").every((c) => c.slug.startsWith("nl-"))).toBe(true);
    expect(getChecklists("CH").some((c) => c.slug.startsWith("gb-"))).toBe(false);
  });
});

describe("GB feature-gate — az új modulok engedélyezve", () => {
  it("ügyintézés, iskolarendszer, közlekedés nyitva GB-n", () => {
    for (const f of ["ugyintezes", "iskolarendszer", "kozlekedes"]) {
      expect(isFeatureAvailable(f, "GB"), f).toBe(true);
    }
  });
});
