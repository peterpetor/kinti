import { describe, it, expect } from "vitest";
import { advanceStreak, DAILY_XP, STREAK_MILESTONES, type StreakState } from "@/lib/streak";

const empty: StreakState = { current: 0, longest: 0, lastDate: "", xpEarned: 0 };

describe("advanceStreak", () => {
  it("első belépés → sorozat 1, +DAILY_XP", () => {
    const r = advanceStreak(empty, "2026-06-17");
    expect(r.incremented).toBe(true);
    expect(r.state.current).toBe(1);
    expect(r.awardedXp).toBe(DAILY_XP);
    expect(r.state.xpEarned).toBe(DAILY_XP);
  });

  it("ugyanaznap újra → nincs változás", () => {
    const day1 = advanceStreak(empty, "2026-06-17").state;
    const r = advanceStreak(day1, "2026-06-17");
    expect(r.incremented).toBe(false);
    expect(r.awardedXp).toBe(0);
    expect(r.state).toBe(day1);
  });

  it("másnap → sorozat nő", () => {
    const day1 = advanceStreak(empty, "2026-06-17").state;
    const day2 = advanceStreak(day1, "2026-06-18");
    expect(day2.state.current).toBe(2);
    expect(day2.state.xpEarned).toBe(2 * DAILY_XP);
  });

  it("kihagyott nap → sorozat újraindul 1-ről (XP nem csökken)", () => {
    let s = advanceStreak(empty, "2026-06-17").state; // 1
    s = advanceStreak(s, "2026-06-18").state; // 2
    const xpBefore = s.xpEarned;
    const r = advanceStreak(s, "2026-06-20"); // kihagyott 19-e
    expect(r.state.current).toBe(1);
    expect(r.state.longest).toBe(2); // megőrzi a leghosszabbat
    expect(r.state.xpEarned).toBe(xpBefore + DAILY_XP); // monoton
  });

  it("7. napon mérföldkő-bónusz", () => {
    let s = empty;
    let last;
    for (let d = 1; d <= 7; d++) {
      last = advanceStreak(s, `2026-06-${String(9 + d).padStart(2, "0")}`);
      s = last.state;
    }
    expect(s.current).toBe(7);
    expect(last!.milestoneBonus).toBe(STREAK_MILESTONES[7]);
    expect(last!.awardedXp).toBe(DAILY_XP + STREAK_MILESTONES[7]);
  });
});
