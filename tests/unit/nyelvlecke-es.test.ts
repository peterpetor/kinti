import { describe, it, expect } from "vitest";
import { LESSONS_ES } from "@/app/(app)/nyelvlecke/data-es";
import { LESSONS } from "@/app/(app)/nyelvlecke/data";
import { LESSONS_AT } from "@/app/(app)/nyelvlecke/data-at";
import { LESSONS_DE } from "@/app/(app)/nyelvlecke/data-de";
import { LESSONS_NL } from "@/app/(app)/nyelvlecke/data-nl";
import { LESSONS_GB } from "@/app/(app)/nyelvlecke/data-gb";
import { isFeatureAvailable } from "@/lib/feature-availability";

/**
 * ⚠️ Miért érdemes ezt tesztelni: a lecke-oldal EGYETLEN összefűzött listában
 * keres (`[...LESSONS, ...].find(l => l.id === lessonId)`), a
 * `generateStaticParams` pedig ugyanebből építi a statikus útvonalakat. Egy
 * duplikált id ezért NEM dob hibát — csak némán a rossz leckét nyitja meg, és a
 * másik lecke elérhetetlenné válik. Ugyanígy a hiányzó `correctOptionId` sem
 * fordítási hiba: a kvíz simán lefut, csak SOHA nem lesz jó válasz.
 */
describe("spanyol kurzus (LESSONS_ES)", () => {
  it("100 lecke, 20 fejezet, fejezetenként 5", () => {
    expect(LESSONS_ES).toHaveLength(100);
    const byChapter = new Map<number, number>();
    for (const l of LESSONS_ES) byChapter.set(l.chapter, (byChapter.get(l.chapter) ?? 0) + 1);
    expect([...byChapter.keys()].sort((a, b) => a - b)).toEqual(
      Array.from({ length: 20 }, (_, i) => i + 1),
    );
    for (const [chapter, count] of byChapter) {
      expect(count, `${chapter}. fejezet`).toBe(5);
    }
  });

  it("nincs duplikált lecke- vagy kérdés-azonosító", () => {
    const lessonIds = LESSONS_ES.map((l) => l.id);
    expect(new Set(lessonIds).size).toBe(lessonIds.length);

    const questionIds = LESSONS_ES.flatMap((l) => l.questions.map((q) => q.id));
    expect(questionIds).toHaveLength(300);
    expect(new Set(questionIds).size).toBe(questionIds.length);
  });

  /**
   * ⚠️ Az „sl" előtag KÉT dolgot dönt el egyszerre: melyik adat-modult tölti be
   * a route, és milyen TTS-hangot kap a lecke. Ha egy id elrontott előtaggal
   * kerülne be, a spanyol mondatot SVÁJCI NÉMET hang olvasná fel — ez a hiba
   * némán megy át, mert renderelni ugyanúgy renderel.
   */
  it("⚠️ a lecke-azonosítók nem ütköznek a másik öt ország kurzusával", () => {
    const others = new Set(
      [...LESSONS, ...LESSONS_AT, ...LESSONS_DE, ...LESSONS_NL, ...LESSONS_GB].map((l) => l.id),
    );
    for (const l of LESSONS_ES) {
      expect(others.has(l.id), `ütköző lecke-id: ${l.id}`).toBe(false);
      expect(l.id.startsWith("sl"), `rossz előtag: ${l.id}`).toBe(true);
    }
  });

  /**
   * ⚠️ Az „nl" előtag a HOLLAND kurzusé, és a router `startsWith`-tel dönt.
   * Egy „nl…"-lel kezdődő spanyol id a holland modult töltené be — ez a
   * legvalószínűbb elgépelés, ezért külön kimondjuk.
   */
  it("⚠️ egyetlen spanyol id sem kezdődik másik ország előtagjával", () => {
    for (const l of LESSONS_ES) {
      for (const prefix of ["al", "dl", "nl", "gl"]) {
        expect(l.id.startsWith(prefix), `${l.id} ütközik a(z) "${prefix}" előtaggal`).toBe(false);
      }
    }
  });

  it("minden kérdés a saját típusának megfelelően kitöltött", () => {
    for (const lesson of LESSONS_ES) {
      expect(lesson.questions.length, `${lesson.id} kérdésszám`).toBe(3);
      expect(lesson.title.trim()).not.toBe("");
      expect(lesson.description.trim()).not.toBe("");
      expect(lesson.xpReward).toBeGreaterThan(0);

      for (const q of lesson.questions) {
        expect(q.prompt.trim(), `${q.id} prompt`).not.toBe("");
        if (q.type === "multiple_choice") {
          expect(q.options?.length, `${q.id} válaszok`).toBeGreaterThanOrEqual(2);
          expect(
            q.options?.some((o) => o.id === q.correctOptionId),
            `${q.id} correctOptionId`,
          ).toBe(true);
        } else if (q.type === "flashcard") {
          expect(q.backText?.trim(), `${q.id} backText`).toBeTruthy();
        } else {
          expect(q.pairs?.length, `${q.id} párok`).toBeGreaterThanOrEqual(2);
          const lefts = q.pairs!.map((p) => p.left);
          const rights = q.pairs!.map((p) => p.right);
          expect(new Set(lefts).size, `${q.id} bal oldal`).toBe(lefts.length);
          expect(new Set(rights).size, `${q.id} jobb oldal`).toBe(rights.length);
        }
      }
    }
  });

  /**
   * ⚠️ A spanyol kurzus két dologban SZÁNDÉKOSAN tér el a többitől, és mindkettő
   * könnyen elveszne egy későbbi átszerkesztésnél:
   *   • a 2. fejezet a KIEJTÉS (a hat szabály többet ér az első héten, mint száz szó),
   *   • a hivatali szókincs ELŐRE került (6–7. fejezet), nem a kurzus végére.
   */
  it("⚠️ a kiejtés-fejezet a 2., és tanítja a hat kulcsszabályt", () => {
    const ch2 = LESSONS_ES.filter((l) => l.chapter === 2);
    const text = JSON.stringify(ch2);
    for (const rule of ["néma", "ll", "ñ", "v", "z", "¿"]) {
      expect(text, `hiányzó kiejtési szabály: ${rule}`).toContain(rule);
    }
  });

  it("⚠️ a cita previa a hivatali fejezetben van, nem a kurzus végén", () => {
    const cita = LESSONS_ES.find((l) => JSON.stringify(l).includes("cita previa"));
    expect(cita, "nincs cita previa lecke").toBeDefined();
    expect(cita!.chapter, "a cita previa túl hátra került").toBeLessThanOrEqual(7);
  });

  it("a nyelvlecke ENGEDÉLYEZETT Spanyolországban", () => {
    expect(isFeatureAvailable("nyelvlecke", "ES")).toBe(true);
  });
});
