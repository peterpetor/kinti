import { describe, it, expect } from "vitest";
import {
  calculateLevel,
  levelThreshold,
  computeGamification,
  gamificationGain,
} from "@/lib/gamification";
import type { MyPostEntry, PostType } from "@/lib/my-posts";

function mkPosts(types: PostType[]): MyPostEntry[] {
  return types.map((type, i) => ({
    type,
    id: `${type}-${i}`,
    manageToken: `tok-${i}`,
    title: `${type} ${i}`,
    createdAt: new Date().toISOString(),
    manageUrl: `/x/${i}`,
  }));
}

describe("levelThreshold / calculateLevel", () => {
  it("küszöbök: L1=0, L2=60, L3=140", () => {
    expect(levelThreshold(1)).toBe(0);
    expect(levelThreshold(2)).toBe(60);
    expect(levelThreshold(3)).toBe(140);
  });
  it("pontból szint", () => {
    expect(calculateLevel(0)).toBe(1);
    expect(calculateLevel(59)).toBe(1);
    expect(calculateLevel(60)).toBe(2);
    expect(calculateLevel(139)).toBe(2);
    expect(calculateLevel(140)).toBe(3);
  });
});

describe("computeGamification", () => {
  it("üres lista → 1. szint, 0 XP, nincs kitűző", () => {
    const s = computeGamification([]);
    expect(s.points).toBe(0);
    expect(s.level).toBe(1);
    expect(s.total).toBe(0);
    expect(s.earnedBadgeCount).toBe(0);
  });

  it("XP típusonként összegződik (business 50 + review 20)", () => {
    const s = computeGamification(mkPosts(["business", "review"]));
    expect(s.points).toBe(70);
    expect(s.level).toBe(2); // 70 ≥ 60
    expect(s.countsByType.business).toBe(1);
    expect(s.countsByType.review).toBe(1);
  });

  it("kitűzők a küszöbök szerint oldódnak fel", () => {
    const s = computeGamification(mkPosts(["review", "business"]));
    const earned = new Set(s.badges.filter((b) => b.earned).map((b) => b.id));
    expect(earned.has("early_adopter")).toBe(true); // total ≥ 1
    expect(earned.has("first_voice")).toBe(true); // review ≥ 1
    expect(earned.has("entrepreneur")).toBe(true); // business ≥ 1
    expect(earned.has("pro_reviewer")).toBe(false); // review < 5
  });

  it("levelProgress 0..1 között marad", () => {
    const s = computeGamification(mkPosts(["review"])); // 20 XP, L1
    expect(s.levelProgress).toBeGreaterThan(0);
    expect(s.levelProgress).toBeLessThanOrEqual(1);
  });

  it("extras-alapú kitűzők (streak/kvíz/PWA/kedvencek)", () => {
    const s = computeGamification([], 0, {
      streakLongest: 7,
      quizBest: 3,
      quizDays: 1,
      appInstalled: true,
      favorites: 5,
    });
    const earned = new Set(s.badges.filter((b) => b.earned).map((b) => b.id));
    expect(earned.has("streak_3")).toBe(true); // 7 ≥ 3
    expect(earned.has("streak_7")).toBe(true); // 7 ≥ 7
    expect(earned.has("streak_30")).toBe(false); // 7 < 30
    expect(earned.has("quiz_perfect")).toBe(true); // best 3 = telitalálat
    expect(earned.has("quiz_first")).toBe(true); // 1 nap
    expect(earned.has("installed")).toBe(true);
    expect(earned.has("collector")).toBe(true); // 5 kedvenc
    expect(earned.has("curator")).toBe(false); // < 15
  });

  it("extras nélkül az új kitűzők zárva (visszafelé kompat)", () => {
    const earned = computeGamification([]).badges.filter((b) => b.earned);
    expect(earned).toHaveLength(0);
  });

  it("XP-bajnok (points ≥ 500) bónusz XP-ből is feloldható", () => {
    const s = computeGamification([], 500);
    expect(s.badges.find((b) => b.id === "xp_champ")?.earned).toBe(true);
  });

  it("van legalább 15 kitűző, köztük ritkák", () => {
    const s = computeGamification([]);
    expect(s.badges.length).toBeGreaterThanOrEqual(15);
    expect(s.badges.some((b) => b.rare)).toBe(true);
  });
});

describe("gamificationGain", () => {
  it("új beküldés XP-t és kitűzőt ad", () => {
    const before = computeGamification([]);
    const after = computeGamification(mkPosts(["review"]));
    const gain = gamificationGain(before, after);
    expect(gain.xpGained).toBe(20);
    expect(gain.unlockedBadges.map((b) => b.id)).toContain("first_voice");
  });

  it("szintlépés jelzése", () => {
    const before = computeGamification(mkPosts(["review", "review"])); // 40 XP, L1
    const after = computeGamification(mkPosts(["review", "review", "business"])); // 90 XP, L2
    const gain = gamificationGain(before, after);
    expect(gain.leveledUp).toBe(true);
    expect(gain.newLevel).toBe(2);
  });

  it("duplikált/azonos állapot → 0 XP, nincs új kitűző", () => {
    const same = computeGamification(mkPosts(["review"]));
    const gain = gamificationGain(same, same);
    expect(gain.xpGained).toBe(0);
    expect(gain.leveledUp).toBe(false);
    expect(gain.unlockedBadges).toHaveLength(0);
  });
});
