import { describe, it, expect, beforeEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Ismétlő (spaced repetition) — a Leitner-tároló logikája.
 *
 * A `bookmarks.test.ts`-hez hasonlóan minimális `window` + `localStorage`
 * cserével dolgozunk: nem a DOM-ot szimuláljuk, hanem a tároló-réteg valós
 * hibalehetőségeit fedjük le.
 */
const tarolo = new Map<string, string>();

beforeEach(() => {
  tarolo.clear();
  vi.useRealTimers();
  vi.stubGlobal("window", {
    dispatchEvent: () => true,
    localStorage: {
      getItem: (k: string) => tarolo.get(k) ?? null,
      setItem: (k: string, v: string) => void tarolo.set(k, v),
      removeItem: (k: string) => void tarolo.delete(k),
    },
  });
  vi.stubGlobal("CustomEvent", class {});
});

async function lib() {
  vi.resetModules();
  return import("../../src/lib/tanulas");
}

describe("ismétlő — Leitner-ütemezés", () => {
  it("⚠️ az ELRONTOTT kérdés HOLNAP visszajön", async () => {
    const { recordAnswer, readCards, today } = await lib();
    recordAnswer("quiz", "polg-CH", "q1", false);
    const [c] = readCards();
    expect(c.box).toBe(0);
    expect(c.due).toBe(today() + 1);
  });

  it("a helyes válaszok egyre ritkábban hozzák elő", async () => {
    const { recordAnswer, readCards, today } = await lib();
    const tavolsagok: number[] = [];
    for (let i = 0; i < 5; i++) {
      recordAnswer("quiz", "polg-CH", "q1", true);
      tavolsagok.push(readCards()[0].due - today());
    }
    // Szigorúan növekvő intervallumok — ez a spaced repetition lényege.
    expect(tavolsagok).toEqual([...tavolsagok].sort((a, b) => a - b));
    expect(new Set(tavolsagok).size).toBe(tavolsagok.length);
  });

  it("a doboz száma = hány EGYMÁS UTÁNI helyes válasz van rá", async () => {
    const { recordAnswer, readCards, MASTERED_BOX } = await lib();
    for (let i = 0; i < MASTERED_BOX; i++) recordAnswer("quiz", "polg-CH", "q1", true);
    expect(readCards()[0].box).toBe(MASTERED_BOX);
  });

  it("⚠️ a megtanult kérdés EGY rontásra visszaesik a nullába", async () => {
    const { recordAnswer, readCards, MASTERED_BOX, today } = await lib();
    for (let i = 0; i < MASTERED_BOX + 2; i++) recordAnswer("quiz", "polg-CH", "q1", true);
    recordAnswer("quiz", "polg-CH", "q1", false);
    const [c] = readCards();
    expect(c.box).toBe(0);
    expect(c.due).toBe(today() + 1);
    expect(c.wrong).toBe(1);
    expect(c.seen).toBe(MASTERED_BOX + 3);
  });

  it("a doboz nem nő a plafon fölé", async () => {
    const { recordAnswer, readCards, MAX_BOX } = await lib();
    for (let i = 0; i < 40; i++) recordAnswer("quiz", "polg-CH", "q1", true);
    expect(readCards()[0].box).toBe(MAX_BOX);
  });

  it("⚠️ KÜLÖNBÖZŐ bankok AZONOS kérdés-id-je nem üti ki egymást", async () => {
    const { recordAnswer, readCards } = await lib();
    recordAnswer("quiz", "polg-CH", "azonos", false);
    recordAnswer("quiz", "kviz-CH", "azonos", true);
    expect(readCards()).toHaveLength(2);
  });
});

describe("ismétlő — esedékes lista", () => {
  it("csak a mára esedékesek jönnek, a nehezebbek elöl", async () => {
    const { recordAnswer, dueCards, today } = await lib();
    recordAnswer("quiz", "polg-CH", "konnyu", true); // box 1 → 2 nap múlva
    recordAnswer("quiz", "polg-CH", "nehez", false); // box 0 → holnap
    expect(dueCards(today())).toEqual([]); // ma egyik sem esedékes
    const holnap = dueCards(today() + 1);
    expect(holnap.map((c) => c.id)).toEqual(["nehez"]);
    const kesobb = dueCards(today() + 10);
    expect(kesobb.map((c) => c.id), "a nehezebb (kisebb dobozú) kártya menjen előre").toEqual(["nehez", "konnyu"]);
  });
});

describe("ismétlő — tudás-statisztika", () => {
  it("⚠️ a százalék a TELJES bankhoz mér, nem a látott kérdésekhez", async () => {
    const { recordAnswer, bankStat, MASTERED_BOX } = await lib();
    for (let i = 0; i < MASTERED_BOX; i++) recordAnswer("quiz", "polg-CH", "q1", true);
    const s = bankStat("polg-CH", 100);
    expect(s.mastered).toBe(1);
    // Ha a látott kérdésekhez mérnénk, itt 100% jönne ki egyetlen kérdés után.
    expect(s.pct).toBe(1);
    expect(s.seen).toBe(1);
    expect(s.total).toBe(100);
  });

  it("a még nem stabil kérdés nem számít tudottnak", async () => {
    const { recordAnswer, bankStat, MASTERED_BOX } = await lib();
    for (let i = 0; i < MASTERED_BOX - 1; i++) recordAnswer("quiz", "polg-CH", "q1", true);
    expect(bankStat("polg-CH", 10).mastered).toBe(0);
  });

  it("üres bankméretre nem oszt nullával", async () => {
    const { bankStat } = await lib();
    expect(bankStat("nincs-ilyen", 0).pct).toBe(0);
  });

  it("csak a SAJÁT bank kártyáit számolja", async () => {
    const { recordAnswer, bankStat, MASTERED_BOX } = await lib();
    for (let i = 0; i < MASTERED_BOX; i++) recordAnswer("quiz", "kviz-AT", "x", true);
    expect(bankStat("polg-CH", 50).mastered).toBe(0);
  });
});

describe("ismétlő — sérült tároló", () => {
  it("⚠️ szemetet elnyel, nem dob", async () => {
    const { readCards } = await lib();
    for (const szemet of ["", "nem json", "{}", '"szöveg"', "null", "[1,2,3]", '[{"bank":"a"}]', '[{"kind":"x","bank":"a","id":"b","box":0,"due":0}]']) {
      tarolo.set("kinti.tanulas.v1", szemet);
      expect(() => readCards(), `elszállt ezen: ${szemet}`).not.toThrow();
      expect(Array.isArray(readCards())).toBe(true);
    }
  });

  it("tartományon kívüli dobozt visszavág", async () => {
    const { readCards, MAX_BOX } = await lib();
    tarolo.set(
      "kinti.tanulas.v1",
      JSON.stringify([
        { kind: "quiz", bank: "a", id: "1", box: 999, due: 0 },
        { kind: "quiz", bank: "a", id: "2", box: -5, due: 0 },
      ]),
    );
    expect(readCards().map((c) => c.box)).toEqual([MAX_BOX, 0]);
  });

  it("a törlés kiüríti az előzményt", async () => {
    const { recordAnswer, resetLearning, readCards } = await lib();
    recordAnswer("word", "szo-DE", "Termin", false);
    expect(readCards()).toHaveLength(1);
    resetLearning();
    expect(readCards()).toEqual([]);
  });
});

/**
 * ⚠️ A `tanulas-bankok.ts` behúzza MIND a 12 kérdésbankot — ezért csak
 * DINAMIKUSAN szabad importálni. Egy statikus import a profil-oldalról vagy a
 * kvíz-komponensekből a teljes kérdésbankot ráültetné a belépő bundle-re
 * (lásd perf-list-bundle-split). Ez a teszt a szabályt őrzi.
 */
describe("bundle-őr: a nehéz bank-modul csak dinamikusan jöhet", () => {
  const FAJLOK = [
    "src/components/views/tanulas-section.tsx",
    "src/components/views/kviz-game.tsx",
    "src/components/views/einburgerung-quiz.tsx",
    "src/components/napi-szo-card.tsx",
    "src/app/(app)/sajatjaim/page.tsx",
  ];

  it.each(FAJLOK)("%s nem importálja ÉRTÉKKÉNT a tanulas-bankok modult", (f) => {
    const s = readFileSync(resolve(process.cwd(), f), "utf8");
    // ⚠️ Az `import type { … }` NEM számít: fordításkor nyomtalanul eltűnik,
    // nem kerül bele a bundle-be. Csak az ÉRTÉK-importot kell megfogni — és a
    // dinamikus `await import("…")` is megengedett.
    const ertekImport = /^import\s+(?!type\s)[^;]*?from\s+["'][^"']*tanulas-bankok["']/m.test(s);
    expect(ertekImport, `${f}: statikus érték-import — a teljes kérdésbank ráülne a bundle-re`).toBe(false);
  });

  it("a tanulas-section CSAK típusként hivatkozik a bank-modulra", () => {
    const s = readFileSync(resolve(process.cwd(), "src/components/views/tanulas-section.tsx"), "utf8");
    expect(s, "hiányzik a dinamikus import — a statisztika és az ismétlő nem tud tartalmat feloldani").toMatch(
      /import\(["']@\/lib\/tanulas-bankok["']\)/,
    );
  });
});

/**
 * A bank-azonosítót a RÖGZÍTŐ (kvíz, napi szó) és az OLVASÓ (statisztika)
 * külön helyen képzi. Ha elcsúsznának, a rögzített válaszok némán eltűnnének a
 * statisztikából — hibaüzenet nélkül.
 */
describe("bank-azonosítók egyezése", () => {
  it("a rögzítő és az olvasó ugyanazt a bank-nevet képzi", async () => {
    const { polgBank, kvizBank, szoBank } = await lib();
    const bankok = await import("../../src/lib/tanulas-bankok");
    for (const o of ["CH", "AT", "DE", "NL", "GB", "ES"]) {
      const nevek = bankok.bankInfok(o).map((b) => b.bank);
      expect(nevek, `${o}: hiányzó vagy elcsúszott bank-azonosító`).toEqual(
        expect.arrayContaining([polgBank(o), kvizBank(o), szoBank(o)]),
      );
    }
  });

  it("minden bank mérete valós (nem nulla)", async () => {
    const bankok = await import("../../src/lib/tanulas-bankok");
    for (const o of ["CH", "AT", "DE", "NL", "GB", "ES"]) {
      const infok = bankok.bankInfok(o);
      expect(infok.length, `${o}: nincs egyetlen bank sem`).toBe(3);
      for (const b of infok) expect(b.total, `${o} / ${b.bank} üres`).toBeGreaterThan(0);
    }
  });
});

describe("kártya-feloldás", () => {
  it("valódi kérdést és szót old fel", async () => {
    const bankok = await import("../../src/lib/tanulas-bankok");
    const { EB_BANK } = await import("../../src/lib/einburgerung-bank");
    const { getWordBank } = await import("../../src/lib/napi-szo");

    const k = bankok.feloldKartya({ kind: "quiz", bank: "polg-CH", id: EB_BANK[0].id, box: 0, due: 0, seen: 1, wrong: 1 });
    expect(k?.elol).toBe(EB_BANK[0].question);
    expect(k?.hatul).toBe(EB_BANK[0].options[EB_BANK[0].correct]);
    expect(k?.options).toHaveLength(4);

    const szo = getWordBank("AT")[0];
    const w = bankok.feloldKartya({ kind: "word", bank: "szo-AT", id: szo.word, box: 0, due: 0, seen: 1, wrong: 1 });
    expect(w?.elol).toBe(szo.hu);
    expect(w?.hatul).toBe(szo.word);
    expect(w?.options, "szó-kártyán nem lehet feleletválasztó").toBeUndefined();
  });

  it("⚠️ az ÁRVA kártya (időközben kikerült kérdés) null, nem hiba", async () => {
    const bankok = await import("../../src/lib/tanulas-bankok");
    expect(bankok.feloldKartya({ kind: "quiz", bank: "polg-CH", id: "nincs-ilyen-id", box: 0, due: 0, seen: 1, wrong: 0 })).toBeNull();
    expect(bankok.feloldKartya({ kind: "word", bank: "szo-DE", id: "nincs-ilyen-szó", box: 0, due: 0, seen: 1, wrong: 0 })).toBeNull();
    expect(bankok.feloldKartya({ kind: "quiz", bank: "polg-XX", id: "akarmi", box: 0, due: 0, seen: 1, wrong: 0 })).toBeNull();
  });
});
