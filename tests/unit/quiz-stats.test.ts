import { describe, it, expect } from "vitest";
import { quizPercentile, type QuizScoreCount } from "@/lib/quiz-percentile";
import { weeklyPersonalStats } from "@/lib/quiz-daily";

describe("quizPercentile — anonim heti percentilis-rang", () => {
  const dist: QuizScoreCount[] = [
    { score: 0, count: 5 },
    { score: 1, count: 10 },
    { score: 2, count: 20 },
    { score: 3, count: 15 },
  ]; // total = 50

  it("nincs elég minta → null (küszöb alatt)", () => {
    const few: QuizScoreCount[] = [
      { score: 3, count: 10 },
      { score: 2, count: 9 },
    ]; // total = 19 < 25
    expect(quizPercentile(few, 3)).toBeNull();
  });

  it("telitalálat: a nála kisebbek + holtverseny fele", () => {
    // below = 5+10+20 = 35, equal = 15 → (35 + 7.5)/50 = 85%
    expect(quizPercentile(dist, 3)).toEqual({ total: 50, percentile: 85 });
  });

  it("közepes pontszám", () => {
    // score=2: below = 5+10 = 15, equal = 20 → (15 + 10)/50 = 50%
    expect(quizPercentile(dist, 2)).toEqual({ total: 50, percentile: 50 });
  });

  it("legrosszabb pontszám 1%-ra fogva (sose 0%)", () => {
    // score=0: below = 0, equal = 5 → (0 + 2.5)/50 = 5% → 5
    expect(quizPercentile(dist, 0)).toEqual({ total: 50, percentile: 5 });
  });

  it("mindenki telitalálat → a percentilis 50 körül, sose 100", () => {
    const allPerfect: QuizScoreCount[] = [{ score: 3, count: 40 }];
    const r = quizPercentile(allPerfect, 3);
    expect(r).not.toBeNull();
    expect(r!.percentile).toBe(50); // (0 + 20)/40 = 50%
  });

  it("egyéni küszöb megadható", () => {
    const small: QuizScoreCount[] = [{ score: 3, count: 3 }, { score: 1, count: 2 }];
    expect(quizPercentile(small, 3, 3)).not.toBeNull(); // total 5 ≥ 3
    expect(quizPercentile(small, 3, 10)).toBeNull(); // total 5 < 10
  });
});

describe("weeklyPersonalStats — személyes heti stat (fallback)", () => {
  it("üres history → 0/0", () => {
    expect(weeklyPersonalStats([], "2026-07-08")).toEqual({ days: 0, accuracyPct: 0 });
    expect(weeklyPersonalStats(undefined, "2026-07-08")).toEqual({ days: 0, accuracyPct: 0 });
  });

  it("csak az utolsó 7 nap számít (a régebbi kiesik)", () => {
    const history = [
      { date: "2026-07-08", score: 3 },
      { date: "2026-07-07", score: 2 },
      { date: "2026-06-30", score: 1 }, // 8+ napja → kiesik
    ];
    // inWeek: 2 nap, 5 helyes / (2*3) = 83%
    expect(weeklyPersonalStats(history, "2026-07-08")).toEqual({ days: 2, accuracyPct: 83 });
  });

  it("a 7 napos ablak alsó határa is beleszámít (today-6)", () => {
    const history = [
      { date: "2026-07-08", score: 3 },
      { date: "2026-07-02", score: 3 }, // pont a határon (today-6)
      { date: "2026-07-01", score: 0 }, // egy nappal a határ alatt → kiesik
    ];
    expect(weeklyPersonalStats(history, "2026-07-08")).toEqual({ days: 2, accuracyPct: 100 });
  });
});
