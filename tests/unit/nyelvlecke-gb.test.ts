import { describe, it, expect } from "vitest";
import { LESSONS_GB } from "@/app/(app)/nyelvlecke/data-gb";
import { LESSONS } from "@/app/(app)/nyelvlecke/data";
import { LESSONS_AT } from "@/app/(app)/nyelvlecke/data-at";
import { LESSONS_DE } from "@/app/(app)/nyelvlecke/data-de";
import { LESSONS_NL } from "@/app/(app)/nyelvlecke/data-nl";

/**
 * ⚠️ Miért érdemes ezt tesztelni: a lecke-oldal EGYETLEN összefűzött listában
 * keres (`[...LESSONS, ...]. find(l => l.id === lessonId)`), a `generateStaticParams`
 * pedig ugyanebből a listából építi a statikus útvonalakat. Egy duplikált id
 * ezért NEM dob hibát — csak némán a rossz leckét nyitja meg, és a másik lecke
 * elérhetetlenné válik. Ugyanígy a hiányzó `correctOptionId` sem fordítási hiba:
 * a kvíz simán lefut, csak SOHA nem lesz jó válasz.
 */
describe("brit angol kurzus (LESSONS_GB)", () => {
  it("100 lecke, 20 fejezet, fejezetenként 5", () => {
    expect(LESSONS_GB).toHaveLength(100);
    const byChapter = new Map<number, number>();
    for (const l of LESSONS_GB) byChapter.set(l.chapter, (byChapter.get(l.chapter) ?? 0) + 1);
    expect([...byChapter.keys()].sort((a, b) => a - b)).toEqual(
      Array.from({ length: 20 }, (_, i) => i + 1),
    );
    for (const [chapter, count] of byChapter) {
      expect(count, `${chapter}. fejezet`).toBe(5);
    }
  });

  it("nincs duplikált lecke- vagy kérdés-azonosító", () => {
    const lessonIds = LESSONS_GB.map((l) => l.id);
    expect(new Set(lessonIds).size).toBe(lessonIds.length);

    const questionIds = LESSONS_GB.flatMap((l) => l.questions.map((q) => q.id));
    expect(questionIds).toHaveLength(300);
    expect(new Set(questionIds).size).toBe(questionIds.length);
  });

  it("⚠️ a lecke-azonosítók nem ütköznek a másik négy ország kurzusával", () => {
    // A [lessonId] route mind az öt listát összefűzi — ütközésnél a find() a
    // korábbi ország leckéjét adná vissza.
    const others = new Set(
      [...LESSONS, ...LESSONS_AT, ...LESSONS_DE, ...LESSONS_NL].map((l) => l.id),
    );
    for (const l of LESSONS_GB) {
      expect(others.has(l.id), `ütköző lecke-id: ${l.id}`).toBe(false);
    }
    // A TTS-nyelvet (en-GB) a "gl" előtag választja ki — enélkül de-CH hangot kapna.
    for (const l of LESSONS_GB) {
      expect(l.id.startsWith("gl"), `rossz előtag: ${l.id}`).toBe(true);
    }
  });

  it("minden kérdés a saját típusának megfelelően kitöltött", () => {
    for (const lesson of LESSONS_GB) {
      expect(lesson.questions.length, `${lesson.id} kérdésszám`).toBe(3);
      expect(lesson.title.trim()).not.toBe("");
      expect(lesson.description.trim()).not.toBe("");
      expect(lesson.xpReward).toBeGreaterThan(0);

      for (const q of lesson.questions) {
        expect(q.prompt.trim(), `${q.id} prompt`).not.toBe("");
        if (q.type === "multiple_choice") {
          expect(q.options?.length, `${q.id} válaszok`).toBeGreaterThanOrEqual(2);
          // A helyes válasz LÉTEZŐ opcióra mutasson.
          expect(
            q.options?.some((o) => o.id === q.correctOptionId),
            `${q.id} correctOptionId`,
          ).toBe(true);
        } else if (q.type === "flashcard") {
          expect(q.backText?.trim(), `${q.id} backText`).toBeTruthy();
        } else {
          expect(q.pairs?.length, `${q.id} párok`).toBeGreaterThanOrEqual(2);
          // Duplikált bal/jobb oldal a párosítót megoldhatatlanná tenné.
          const lefts = q.pairs!.map((p) => p.left);
          const rights = q.pairs!.map((p) => p.right);
          expect(new Set(lefts).size, `${q.id} bal oldal`).toBe(lefts.length);
          expect(new Set(rights).size, `${q.id} jobb oldal`).toBe(rights.length);
        }
      }
    }
  });
});
