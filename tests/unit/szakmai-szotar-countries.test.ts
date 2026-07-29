import { describe, it, expect } from "vitest";
import {
  getIndustryLessons,
  findLessonById,
  INDUSTRY_LESSONS,
  INDUSTRY_LESSONS_AT,
  INDUSTRY_LESSONS_DE,
  INDUSTRY_LESSONS_NL,
} from "@/app/(app)/allasok/szakmai-szotar/data";
import { INDUSTRY_LESSONS_GB } from "@/app/(app)/allasok/szakmai-szotar/data-gb";
import { INDUSTRY_LESSONS_ES } from "@/app/(app)/allasok/szakmai-szotar/data-es";
import { COUNTRIES } from "@/lib/countries";
import { isFeatureAvailable } from "@/lib/feature-availability";

const ALL_BANKS = [
  ["CH", INDUSTRY_LESSONS],
  ["AT", INDUSTRY_LESSONS_AT],
  ["DE", INDUSTRY_LESSONS_DE],
  ["NL", INDUSTRY_LESSONS_NL],
  ["GB", INDUSTRY_LESSONS_GB],
  ["ES", INDUSTRY_LESSONS_ES],
] as const;

/**
 * ⚠️ A hibák ITT IS NÉMÁK: egy hiányzó `correctOptionId` nem fordítási hiba —
 * a lecke lefut, csak sosem lehet helyes választ adni. Egy ütköző lecke-id
 * pedig azt okozza, hogy a `findLessonById` MÁS ország leckéjét adja vissza
 * (az URL csak az id-t hordozza), vagyis a felhasználó rossz nyelvet tanul.
 */
describe("Szakmai Szótár — ország-lefedettség", () => {
  it("MINDEN app-ország kap saját leckebankot", () => {
    for (const c of COUNTRIES) {
      expect(getIndustryLessons(c.code).length, `${c.code}: üres bank`).toBeGreaterThan(0);
    }
  });

  it("⚠️ egyik ország sem a SVÁJCI bankot kapja (a CH kivételével)", () => {
    const swiss = getIndustryLessons("CH");
    for (const c of COUNTRIES) {
      if (c.code === "CH") continue;
      expect(getIndustryLessons(c.code), `${c.code} a svájci bankot kapta`).not.toBe(swiss);
    }
  });

  it("a GB és az ES bank a többivel összemérhető méretű", () => {
    expect(INDUSTRY_LESSONS_GB.length).toBeGreaterThanOrEqual(20);
    expect(INDUSTRY_LESSONS_ES.length).toBeGreaterThanOrEqual(20);
  });

  /**
   * ⚠️ A lecke-id az URL-ben utazik, és a `findLessonById` az ÖSSZES bankban
   * keres. Két ország közti ütközés = rossz nyelvű lecke a felhasználónál.
   */
  it("⚠️ nincs ütköző lecke-azonosító EGYETLEN két ország között sem", () => {
    const seen = new Map<string, string>();
    for (const [cc, bank] of ALL_BANKS) {
      for (const l of bank) {
        const prev = seen.get(l.id);
        if (prev) expect.fail(`ütköző lecke-id „${l.id}": ${prev} ÉS ${cc}`);
        seen.set(l.id, cc);
      }
    }
  });

  it("a findLessonById mind a hat bankban megtalálja a leckét", () => {
    for (const [cc, bank] of ALL_BANKS) {
      const first = bank[0];
      expect(findLessonById(first.id)?.id, `${cc}: ${first.id}`).toBe(first.id);
    }
  });

  it("ismeretlen lecke-azonosítóra undefined-ot ad (nem esik szét)", () => {
    expect(findLessonById("nincs-ilyen-lecke")).toBeUndefined();
  });
});

describe("lecke-integritás mind a hat országban", () => {
  it("minden lecke kitöltött, és minden kérdés érvényes", () => {
    for (const [cc, bank] of ALL_BANKS) {
      for (const l of bank) {
        const w = `${cc}/${l.id}`;
        expect(l.title.trim(), w).not.toBe("");
        expect(l.description.trim(), w).not.toBe("");
        expect(l.industry.trim(), w).not.toBe("");
        expect(l.xpReward, w).toBeGreaterThan(0);
        expect(l.questions.length, `${w}: kérdések`).toBeGreaterThanOrEqual(3);

        const qIds = l.questions.map((q) => q.id);
        expect(new Set(qIds).size, `${w}: duplikált kérdés-id`).toBe(qIds.length);

        for (const q of l.questions) {
          const qw = `${w}/${q.id}`;
          expect(q.prompt.trim(), qw).not.toBe("");
          if (q.type === "multiple_choice") {
            expect(q.options?.length, `${qw}: opciók`).toBeGreaterThanOrEqual(2);
            expect(q.correctOptionId, `${qw}: nincs helyes válasz`).toBeTruthy();
            // ⚠️ A helyes válasz LÉTEZŐ opcióra mutasson.
            expect(
              q.options!.some((o) => o.id === q.correctOptionId),
              `${qw}: a correctOptionId nem létező opcióra mutat`,
            ).toBe(true);
            const oIds = q.options!.map((o) => o.id);
            expect(new Set(oIds).size, `${qw}: duplikált opció-id`).toBe(oIds.length);
          }
          if (q.type === "flashcard") {
            expect(q.backText?.trim(), `${qw}: nincs hátlap`).toBeTruthy();
          }
          if (q.type === "match") {
            expect(q.pairs?.length, `${qw}: párok`).toBeGreaterThanOrEqual(2);
            for (const p of q.pairs!) {
              expect(p.left.trim(), `${qw}/${p.id} bal`).not.toBe("");
              expect(p.right.trim(), `${qw}/${p.id} jobb`).not.toBe("");
            }
          }
        }
      }
    }
  });

  /**
   * ⚠️ A TTS-nyelv nem kozmetika: en-US hanggal a brit bank pont azt a
   * kiejtést adná vissza, amit megkülönböztetni tanít; es-MX hanggal pedig a
   * spanyolországi bank latin-amerikai kiejtést kapna.
   */
  it("⚠️ a TTS-nyelv az ORSZÁGÉ (nem amerikai angol, nem latin-amerikai spanyol)", () => {
    for (const l of INDUSTRY_LESSONS_GB) {
      expect(l.lang, `${l.id}`).toBe("en-GB");
    }
    for (const l of INDUSTRY_LESSONS_ES) {
      expect(l.lang, `${l.id}`).toBe("es-ES");
    }
  });

  /**
   * ⚠️ SZERKEZETI SZABÁLY: legfeljebb EGY ingyenes bevezető lecke országonként.
   * Több ingyenes lecke elvinné a PRO-tartalom értékét; a fizetős bank lényege,
   * hogy a kóstoló után jön a zár.
   *
   * ⚠️ MEGFIGYELÉS, NEM HIBA: Svájcban jelenleg NULLA ingyenes lecke van (mind
   * a 23 PRO), miközben AT/DE/NL/GB/ES mindegyikében van egy kóstoló. Ez
   * TERMÉKI DÖNTÉS kérdése — a teszt ezért nem kényszeríti ki az egyet, csak a
   * felső korlátot. Ha a CH is kapna kóstolót, ez a teszt akkor is zöld marad.
   */
  it("egy országban sincs egynél több ingyenes lecke", () => {
    for (const [cc, bank] of ALL_BANKS) {
      const free = bank.filter((l) => !l.isPro);
      expect(free.length, `${cc}: ${free.length} ingyenes lecke`).toBeLessThanOrEqual(1);
    }
  });

  it("a GB és az ES bankban VAN ingyenes kóstoló lecke", () => {
    expect(INDUSTRY_LESSONS_GB.filter((l) => !l.isPro)).toHaveLength(1);
    expect(INDUSTRY_LESSONS_ES.filter((l) => !l.isPro)).toHaveLength(1);
  });
});

describe("a bankok tartalmi sajátosságai", () => {
  /**
   * ⚠️ A GB bank LÉTOKA a brit↔amerikai különbség és a kötelező engedélyek.
   * Ha ezek kiesnének egy szerkesztésnél, a bank elveszítené az értékét —
   * ezért a teszt név szerint kéri őket.
   */
  it("⚠️ a GB bank tanítja a kötelező brit engedélyeket", () => {
    const text = JSON.stringify(INDUSTRY_LESSONS_GB);
    for (const term of ["CSCS", "DBS", "SIA", "Gas Safe", "MOT", "ACAS"]) {
      expect(text.includes(term), `GB: hiányzik a „${term}"`).toBe(true);
    }
  });

  it("⚠️ a GB bank tanítja a brit↔amerikai szó-csapdákat", () => {
    const text = JSON.stringify(INDUSTRY_LESSONS_GB);
    for (const term of ["Spanner", "Hoover", "Nappy", "Petrol", "Tyre", "Tap", "Fringe", "Earth"]) {
      expect(text.includes(term), `GB: hiányzik a „${term}"`).toBe(true);
    }
  });

  it("⚠️ az ES bank tanítja a kötelező spanyol tanfolyamokat/kártyákat", () => {
    const text = JSON.stringify(INDUSTRY_LESSONS_ES);
    for (const term of ["PRL", "TPC", "carretillero", "TIP", "manipulador de alimentos", "CAP"]) {
      expect(text.includes(term), `ES: hiányzik a „${term}"`).toBe(true);
    }
  });

  /**
   * ⚠️ SPANYOLORSZÁGI, nem latin-amerikai szókincs. A magyar felhasználó
   * jellemzően appból tanul, ami „mesero"-t és „carro"-t ad — a munkahelyen
   * viszont „camarero" és „coche" a használatos.
   */
  it("⚠️ az ES bank a SPANYOLORSZÁGI szót tanítja, nem a latin-amerikait", () => {
    // ⚠️ Kis-nagybetű-független: a szó lehet mondat elején is („Ordenador…").
    const text = JSON.stringify(INDUSTRY_LESSONS_ES).toLowerCase();
    for (const good of ["camarero", "coche", "ordenador"]) {
      expect(text.includes(good), `ES: hiányzik a spanyolországi „${good}"`).toBe(true);
    }
    // A latin-amerikai alakok CSAK mint elvetendő válasz szerepelhetnek —
    // helyes megnevezésként (backText / right oldal) nem.
    for (const l of INDUSTRY_LESSONS_ES) {
      for (const q of l.questions) {
        for (const bad of ["mesero", "carro", "computadora", "celular"]) {
          expect(q.backText?.toLowerCase().includes(bad), `${l.id}/${q.id} backText`).not.toBe(true);
          for (const p of q.pairs ?? []) {
            expect(p.right.toLowerCase().includes(bad), `${l.id}/${q.id} pár`).toBe(false);
          }
        }
      }
    }
  });
});

describe("funkció-kapu", () => {
  it("a szakmai szótár MINDEN app-országban elérhető", () => {
    for (const c of COUNTRIES) {
      expect(isFeatureAvailable("szakmai-szotar", c.code), c.code).toBe(true);
    }
  });
});
