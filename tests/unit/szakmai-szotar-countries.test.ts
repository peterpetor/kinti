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
   * ⚠️ MINDEN leckének KELL `lang`, mert a felolvasó `lesson?.lang ?? "de-CH"`
   * alakban esik vissza — vagyis egy hiányzó `lang` SVÁJCI NÉMET hangot adna egy
   * angol vagy spanyol szótárnak. A tartalom közben helyes lenne, csak a hang
   * lenne érthetetlen: pontosan az a hibaosztály, amit a user a nyelvleckén
   * bejelentett (2026-07-30).
   */
  it("⚠️ MINDEN szótár-leckének van saját TTS-nyelve (nincs svájci visszaesés)", () => {
    const EXPECTED: Record<string, string> = {
      CH: "de-CH", AT: "de-AT", DE: "de-DE", NL: "nl-NL", GB: "en-GB", ES: "es-ES",
    };
    for (const [cc, bank] of ALL_BANKS) {
      for (const l of bank as { id: string; lang?: string }[]) {
        expect(l.lang, `${cc}/${l.id}: nincs lang → svájci hangra esne vissza`).toBeTruthy();
        expect(l.lang, `${cc}/${l.id}`).toBe(EXPECTED[cc as string]);
      }
    }
  });

  /**
   * ⚠️ SZERKEZETI SZABÁLY: PONTOSAN EGY ingyenes bevezető lecke országonként.
   * Mindkét irány hiba:
   *   • NULLA ingyenes → a felhasználó fizetés előtt ki sem tudja próbálni a
   *     szótárt. 2026-07-30-ig a SVÁJCI bank pontosan ilyen volt (mind a 23
   *     lecke PRO), egyedül a hat ország közül — vagyis épp a legnagyobb piacon
   *     nem volt kóstoló. User-döntéssel javítva (bau_1 → ingyenes).
   *   • KETTŐ VAGY TÖBB ingyenes → elviszi a PRO-tartalom értékét.
   * Ez a teszt korábban csak a felső korlátot kérte; most mindkét irányt.
   */
  it("⚠️ MINDEN országban PONTOSAN EGY ingyenes kóstoló lecke van", () => {
    for (const [cc, bank] of ALL_BANKS) {
      const free = bank.filter((l) => !l.isPro);
      expect(free.length, `${cc}: ${free.length} ingyenes lecke`).toBe(1);
    }
  });

  /**
   * ⚠️ A kóstoló mindenhol a bank ELSŐ leckéje (építőipari alapok) — ez a
   * legnagyobb szakma a magyar közösségben, tehát a legtöbb embert szólítja meg.
   * Ha a kóstoló egy hátsó, ritka szakmához csúszna, a legtöbb felhasználó
   * továbbra is zárt tartalommal találkozna először.
   */
  it("a kóstoló a bank ELSŐ leckéje, nem egy hátsó szakma", () => {
    for (const [cc, bank] of ALL_BANKS) {
      expect(bank[0].isPro, `${cc}: az első lecke nem ingyenes`).toBeFalsy();
    }
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
