import { describe, it, expect } from "vitest";
import { baseToHufSeries, detectUpwardCrossing, type RatePoint } from "@/lib/remit-alert";

/** 1 CHF = 1.05 EUR körül; a HUF-ot adjuk meg, az EUR fix. */
function pts(hufs: number[], eur = 1.05): RatePoint[] {
  return hufs.map((huf, i) => ({ date: `2026-06-${String(i + 1).padStart(2, "0")}`, huf, eur }));
}

describe("remit-alert — árfolyam-keresztezés", () => {
  it("nem jelez, ha kevés az adat (nem küldünk bizonytalan jelzésre)", () => {
    expect(detectUpwardCrossing([400, 401, 402])).toBeNull();
  });

  it("nem jelez, ha az árfolyam végig az átlag körül van", () => {
    const flat = Array.from({ length: 30 }, () => 400);
    expect(detectUpwardCrossing(flat)?.crossed).toBe(false);
  });

  it("JELEZ a friss fölfelé-keresztezés napján", () => {
    // 29 nap 400 körül, ma 410 (=+2,4% az átlag felett, a +1,5% vonal fölött).
    const vals = [...Array.from({ length: 29 }, () => 400), 410];
    const r = detectUpwardCrossing(vals);
    expect(r?.crossed).toBe(true);
    expect(r!.pct).toBeGreaterThan(1.5);
  });

  it("NEM jelez újra, ha tegnap MÁR a küszöb fölött volt (anti-spam)", () => {
    // A lényeg: tartósan magas árfolyamnál nem megy ki minden nap push.
    const vals = [...Array.from({ length: 28 }, () => 400), 410, 411];
    expect(detectUpwardCrossing(vals)?.crossed).toBe(false);
  });

  it("nem jelez lefelé mozgásnál", () => {
    const vals = [...Array.from({ length: 29 }, () => 400), 380];
    expect(detectUpwardCrossing(vals)?.crossed).toBe(false);
  });

  it("EUR-bázis kereszt-árfolyamot számol (huf/eur), CHF-bázis a nyers hufot", () => {
    const series = pts([420, 420], 1.05);
    expect(baseToHufSeries(series, "CHF")).toEqual([420, 420]);
    expect(baseToHufSeries(series, "EUR")[0]).toBeCloseTo(400, 6);
  });

  it("a sorozatot dátum szerint rendezi, hogy a mai nap legyen az utolsó", () => {
    const unsorted: RatePoint[] = [
      { date: "2026-06-03", huf: 430, eur: 1 },
      { date: "2026-06-01", huf: 410, eur: 1 },
      { date: "2026-06-02", huf: 420, eur: 1 },
    ];
    expect(baseToHufSeries(unsorted, "CHF")).toEqual([410, 420, 430]);
  });

  it("kihagyja a hibás (0/NaN) pontokat", () => {
    const vals = [...Array.from({ length: 29 }, () => 400), 0, NaN, 410];
    expect(detectUpwardCrossing(vals)?.crossed).toBe(true);
  });
});
