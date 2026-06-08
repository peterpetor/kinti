import { describe, it, expect } from "vitest";
import { salaryStanding, type HistogramBucket } from "@/lib/benchmark-stats";

// Eloszlás: 60k×2, 70k×4, 80k×4, 90k×2, 100k×... (összesen jól meghatározott)
const HIST: HistogramBucket[] = [
  { bucket_k: 60, entry_count: 2 },
  { bucket_k: 70, entry_count: 4 },
  { bucket_k: 80, entry_count: 4 },
  { bucket_k: 90, entry_count: 2 },
];
// total = 12

describe("salaryStanding", () => {
  it("üres eloszlás → null", () => {
    expect(salaryStanding([], 80000)).toBeNull();
  });

  it("érvénytelen bér → null", () => {
    expect(salaryStanding(HIST, 0)).toBeNull();
    expect(salaryStanding(HIST, -5)).toBeNull();
  });

  it("medián körüli bér ~50. percentilis", () => {
    // 85.000 → 80-as sáv. below = 2+4 = 6, own = 4 → (6 + 2)/12 = 66.7%? ellenőrizzük
    const s = salaryStanding(HIST, 85000);
    expect(s).not.toBeNull();
    expect(s!.total).toBe(12);
    // below=6, own=4 → (6+2)/12 = 0.666… → 67
    expect(s!.percentile).toBe(67);
  });

  it("legalacsonyabb sáv → alacsony percentilis", () => {
    // 62.000 → 60-as sáv. below=0, own=2 → (0+1)/12 = 8.3 → 8
    expect(salaryStanding(HIST, 62000)!.percentile).toBe(8);
  });

  it("eloszlás fölötti bér → 100", () => {
    // 150.000 → minden sáv alatta. below=12, own=0 → 12/12 = 100
    expect(salaryStanding(HIST, 150000)!.percentile).toBe(100);
  });

  it("a percentilis 0..100 közé szorítva marad", () => {
    const s = salaryStanding(HIST, 200000)!;
    expect(s.percentile).toBeLessThanOrEqual(100);
    expect(s.percentile).toBeGreaterThanOrEqual(0);
  });
});
