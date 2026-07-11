import { describe, it, expect } from "vitest";
import { buildWeeklyReport, splitUsageRows } from "@/lib/weekly-report";

const COUNTS = {
  leads7: 12, lockedLeads7: 4, cv7: 3, quizPlays7: 58,
  jobApps7: 7, b2bNew7: 1, pushSubsTotal: 21, newsletterSubsTotal: 40,
};

describe("weekly-report", () => {
  it("splitUsageRows: page/action szétválogatás, top-N levágás, sorrend megőrzés", () => {
    const rows = [
      { event: "page:home", count: 201 },
      { event: "action:budget-calc", count: 9 },
      { event: "page:szaknevsor", count: 78 },
      { event: "action:battle-share", count: 2 },
      { event: "egyeb:zaj", count: 99 },
    ];
    const { topPages, topActions } = splitUsageRows(rows, 1);
    expect(topPages).toEqual([{ name: "home", count: 201 }]);
    expect(topActions).toEqual([{ name: "budget-calc", count: 9 }]);
  });

  it("buildWeeklyReport: tárgy dátum-tartománnyal, kulcsszám-sorok, zárolt lead jelölve", () => {
    const now = new Date("2026-07-13T06:00:00Z"); // hétfő
    const r = buildWeeklyReport(COUNTS, [{ event: "page:home", count: 10 }], now);
    expect(r.subject).toBe("📊 Kinti heti pulzus (2026-07-06 – 2026-07-13)");
    expect(r.rows.find((x) => x.label.includes("lead"))?.value).toBe("12 db — ebből zárolt: 4");
    expect(r.rows.find((x) => x.label.includes("Push"))?.value).toBe("21 fő");
    expect(r.topPages).toEqual([{ name: "home", count: 10 }]);
    expect(r.topActions).toEqual([]);
  });
});
