import { describe, it, expect } from "vitest";
import { pickQuizProTarget, QUIZ_PRO_MAP } from "@/lib/quiz-pro-map";
import type { QuizCategory } from "@/lib/quiz-bank";

const q = (category: QuizCategory, correct = 0) => ({ category, correct });

describe("quiz-pro-map", () => {
  it("az ELSŐ rossz, párosított témát választja", () => {
    const questions = [q("geography"), q("language"), q("institutions")];
    const answers = [0, 1, 2]; // 1. jó, 2-3. rossz
    const t = pickQuizProTarget(questions, answers);
    expect(t?.quizCategory).toBe("language");
    expect(t?.businessCats).toContain("idegennyelv_tanar");
  });

  it("hibátlan kvíz → null (nincs kártya)", () => {
    const questions = [q("language"), q("food"), q("institutions")];
    expect(pickQuizProTarget(questions, [0, 0, 0])).toBeNull();
  });

  it("csak nem-párosított témát rontott → null (nem erőltetünk)", () => {
    const questions = [q("geography"), q("history"), q("culture")];
    expect(pickQuizProTarget(questions, [1, 1, 1])).toBeNull();
  });

  it("a kurált párok kategória-id-i validak (kisbetű/aláhúzás, nem üres)", () => {
    for (const target of Object.values(QUIZ_PRO_MAP)) {
      expect(target.businessCats.length).toBeGreaterThan(0);
      for (const c of target.businessCats) expect(c).toMatch(/^[a-z0-9_]{1,64}$/);
      expect(target.title.length).toBeGreaterThan(5);
    }
  });
});
