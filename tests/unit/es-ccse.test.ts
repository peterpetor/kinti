import { describe, it, expect } from "vitest";
import {
  ES_BANK,
  ES_QUIZ_REGIONS,
  ES_QUIZ_LENGTH,
  ES_PASS_THRESHOLD,
  ES_TOPIC_META,
  generateQuizES,
} from "@/lib/es-ccse-bank";
import { EB_BANK } from "@/lib/einburgerung-bank";
import { GB_BANK } from "@/lib/gb-lifeintheuk-bank";
import { getRegions } from "@/lib/regions";
import { isFeatureAvailable } from "@/lib/feature-availability";

/**
 * ⚠️ Miért érdemes tesztelni: a kvíz-motor közös mind a hat országnál, és a
 * hibák NÉMÁK. Egy hiányzó `correct` index nem fordítási hiba — a kvíz lefut,
 * csak sosem lesz jó válasz. Egy ütköző kérdés-id pedig azt okozza, hogy a
 * generátor kihagy egy kérdést, és rövidebb menetet ad.
 */
describe("spanyol CCSE kérdésbank", () => {
  it("a vizsga-paraméterek a VALÓDI CCSE-t követik (25 kérdés / 60%)", () => {
    expect(ES_QUIZ_LENGTH).toBe(25);
    expect(ES_PASS_THRESHOLD).toBe(60);
  });

  it("minden kérdés kitöltött, és a helyes válasz LÉTEZŐ opcióra mutat", () => {
    expect(ES_BANK.length).toBeGreaterThanOrEqual(80);
    for (const q of ES_BANK) {
      expect(q.question.trim(), q.id).not.toBe("");
      expect(q.options, `${q.id} opciók`).toHaveLength(4);
      for (const o of q.options) expect(o.trim(), `${q.id} üres opció`).not.toBe("");
      expect(q.correct, `${q.id} correct`).toBeGreaterThanOrEqual(0);
      expect(q.correct, `${q.id} correct`).toBeLessThanOrEqual(3);
      expect(q.explanation.trim().length, `${q.id} magyarázat`).toBeGreaterThan(15);
    }
  });

  it("nincs duplikált kérdés-azonosító, és nem ütközik a másik bankokkal", () => {
    const ids = ES_BANK.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    const others = new Set([...EB_BANK, ...GB_BANK].map((q) => q.id));
    for (const id of ids) expect(others.has(id), `ütköző id: ${id}`).toBe(false);
  });

  it("nincs duplikált válasz-opció egy kérdésen belül", () => {
    for (const q of ES_BANK) {
      expect(new Set(q.options).size, `${q.id}: ismétlődő opció`).toBe(q.options.length);
    }
  });

  it("mind az öt témakör fel van töltve, a menet-összetételhez elegendően", () => {
    const need: Record<string, number> = { federal: 6, civic: 5, geography: 4, history: 7, canton: 3 };
    for (const topic of Object.keys(ES_TOPIC_META)) {
      const n = ES_BANK.filter((q) => q.topic === topic).length;
      expect(n, `${topic}: csak ${n} kérdés`).toBeGreaterThanOrEqual(need[topic] ?? 1);
    }
  });

  /**
   * ⚠️ A közösség-kódoknak LÉTEZŐ regions.ts-kódoknak kell lenniük, különben a
   * generátor a választott közösséghez nem talál kérdést, és csendben más
   * közösség kérdéseivel tölt fel.
   */
  it("a közösség-kódok LÉTEZŐ ES-régiókódok", () => {
    const valid = new Set(getRegions("ES").map((r) => r.code));
    for (const r of ES_QUIZ_REGIONS) {
      expect(valid.has(r.code), `${r.code} nincs a regions.ts-ben`).toBe(true);
    }
    for (const q of ES_BANK) {
      if (q.topic === "canton") {
        expect(q.cantonCode, `${q.id}: nincs közösség-kód`).toBeTruthy();
        expect(valid.has(q.cantonCode!), `${q.id}: ismeretlen kód ${q.cantonCode}`).toBe(true);
      }
    }
  });

  it("minden felkínált közösséghez van legalább 2 saját kérdés", () => {
    for (const r of ES_QUIZ_REGIONS) {
      const n = ES_BANK.filter((q) => q.topic === "canton" && q.cantonCode === r.code).length;
      expect(n, `${r.code}: csak ${n} kérdés`).toBeGreaterThanOrEqual(2);
    }
  });

  it("a generátor pontosan 25, egyedi kérdést ad — közösséggel és anélkül is", () => {
    for (const region of [null, "MD", "CT", "CN", "PV"]) {
      const quiz = generateQuizES(region);
      expect(quiz, `${region}`).toHaveLength(25);
      expect(new Set(quiz.map((q) => q.id)).size, `${region}: duplikátum`).toBe(25);
    }
  });

  it("a választott közösség kérdései ELŐNYT kapnak a sorsolásban", () => {
    // 20 menetből legalább egyben legyen madridi kérdés (a sorsolás véletlen,
    // de a MIX 3 közösségi kérdést kér, és Madridhoz van elég).
    let sawMadrid = false;
    for (let i = 0; i < 20 && !sawMadrid; i++) {
      sawMadrid = generateQuizES("MD").some((q) => q.cantonCode === "MD");
    }
    expect(sawMadrid).toBe(true);
  });

  /**
   * ⚠️ TÉNYÁLLÍTÁS-FEGYELEM: a bank szándékosan kerüli a gyorsan avuló adatokat
   * (mindenkori kormányfő neve, minimálbér, aktuális összegek), mert egy elavult
   * „helyes" válasz rosszabb, mint a kérdés hiánya. Ld. [[ai-content-accuracy]].
   */
  it("⚠️ a bank nem kérdez gyorsan avuló, személyhez kötött adatot", () => {
    const text = JSON.stringify(ES_BANK).toLowerCase();
    for (const term of ["sánchez", "rajoy", "zapatero", "minimálbér", "salario mínimo"]) {
      expect(text.includes(term), `avuló adat a bankban: „${term}"`).toBe(false);
    }
  });

  it("kimondja a két legfontosabb honosítási feltételt (DELE A2, lemondás)", () => {
    const text = JSON.stringify(ES_BANK);
    expect(text).toContain("DELE A2");
    expect(text.toLowerCase()).toContain("lemondani");
  });

  it("az állampolgárság-funkció ENGEDÉLYEZETT Spanyolországban", () => {
    expect(isFeatureAvailable("allampolgarsag", "ES")).toBe(true);
  });
});
