import { describe, it, expect } from "vitest";
import { battleRanking, battlePlace, BATTLE_MIN_REGION } from "@/lib/quiz-battle";

describe("quiz-battle", () => {
  it("aggregál, rangsorol átlagpont szerint, holtversenyben a nagyobb minta nyer", () => {
    const rows = [
      // BY: 20 játék, átlag 2.5
      { key: "BY", score: 2, count: 10 },
      { key: "BY", score: 3, count: 10 },
      // BW: 40 játék, átlag 2.5 → holtverseny, de nagyobb minta → előrébb
      { key: "BW", score: 2, count: 20 },
      { key: "BW", score: 3, count: 20 },
      // HE: 12 játék, átlag 1.0
      { key: "HE", score: 1, count: 12 },
    ];
    const ranked = battleRanking(rows, BATTLE_MIN_REGION);
    expect(ranked.map((r) => r.key)).toEqual(["BW", "BY", "HE"]);
    expect(ranked[0].avg).toBe(2.5);
    expect(ranked[0].plays).toBe(40);
    expect(battlePlace(ranked, "BY")).toBe(2);
    expect(battlePlace(ranked, "NINCS")).toBeNull();
  });

  it("min-minta kapu: kevés játékú csapat kiesik", () => {
    const ranked = battleRanking(
      [
        { key: "BY", score: 3, count: 15 },
        { key: "HE", score: 3, count: 3 }, // 10 alatt → kiesik
        { key: "BW", score: 2, count: 11 },
      ],
      BATTLE_MIN_REGION,
    );
    expect(ranked.map((r) => r.key)).toEqual(["BY", "BW"]);
  });

  it("egyszereplős vagy üres verseny → üres tábla (ürességet nem reklámozunk)", () => {
    expect(battleRanking([{ key: "BY", score: 3, count: 100 }], BATTLE_MIN_REGION)).toEqual([]);
    expect(battleRanking([], BATTLE_MIN_REGION)).toEqual([]);
    // két csapat, de az egyik a kapu alatt → megint egyszereplős → üres
    expect(
      battleRanking(
        [
          { key: "BY", score: 3, count: 100 },
          { key: "HE", score: 3, count: 2 },
        ],
        BATTLE_MIN_REGION,
      ),
    ).toEqual([]);
  });

  it("nulla/negatív count sorok nem torzítanak", () => {
    const ranked = battleRanking(
      [
        { key: "BY", score: 3, count: 12 },
        { key: "BY", score: 0, count: 0 },
        { key: "BW", score: 2, count: -5 },
        { key: "BW", score: 2, count: 10 },
      ],
      BATTLE_MIN_REGION,
    );
    expect(ranked.map((r) => r.key)).toEqual(["BY", "BW"]);
    expect(ranked[0].avg).toBe(3);
    expect(ranked[1].plays).toBe(10);
  });
});
