import { describe, it, expect } from "vitest";
import { jobMatchScore, hasMatchableProfile, type MatchProfile, type MatchableJob } from "@/lib/job-match";

const job: MatchableJob = { category: "epitoipar", cantonCode: "ZH", salaryMin: 5500, salaryMax: 7000 };

describe("jobMatchScore", () => {
  it("teljes egyezés (szakma+kanton+bér) → magas pont", () => {
    const p: MatchProfile = { category: "epitoipar", cantonCode: "ZH", expectedSalaryMin: 6000 };
    const m = jobMatchScore(p, job);
    expect(m.score).toBe(100);
    expect(m.reasons).toContain("Szakma egyezik");
    expect(m.reasons).toContain("Azonos kanton");
  });

  it("szakma+kanton eltér → alacsonyabb pont", () => {
    const p: MatchProfile = { category: "vendeglatas", cantonCode: "GE", expectedSalaryMin: null };
    const full = jobMatchScore({ category: "epitoipar", cantonCode: "ZH", expectedSalaryMin: 6000 }, job).score;
    expect(jobMatchScore(p, job).score).toBeLessThan(full);
  });

  it("bér-elvárás a job felett → kevesebb pont, mint amikor belefér", () => {
    const fits: MatchProfile = { category: "epitoipar", cantonCode: "ZH", expectedSalaryMin: 6000 };
    const tooHigh: MatchProfile = { category: "epitoipar", cantonCode: "ZH", expectedSalaryMin: 9000 };
    expect(jobMatchScore(tooHigh, job).score).toBeLessThan(jobMatchScore(fits, job).score);
  });

  it("a pontszám mindig 0–100 közé esik", () => {
    const p: MatchProfile = { category: null, cantonCode: null, expectedSalaryMin: null };
    const m = jobMatchScore(p, { category: null, cantonCode: null, salaryMin: null, salaryMax: null });
    expect(m.score).toBeGreaterThanOrEqual(0);
    expect(m.score).toBeLessThanOrEqual(100);
  });

  it("hasMatchableProfile: üres profil → false, szakma VAGY kanton → true", () => {
    expect(hasMatchableProfile(null)).toBe(false);
    expect(hasMatchableProfile({ category: null, cantonCode: null, expectedSalaryMin: 5000 })).toBe(false);
    expect(hasMatchableProfile({ category: "epitoipar", cantonCode: null, expectedSalaryMin: null })).toBe(true);
    expect(hasMatchableProfile({ category: null, cantonCode: "ZH", expectedSalaryMin: null })).toBe(true);
  });
});
