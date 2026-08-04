import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getDailyWord, getWordBank, hasDailyWord, ttsLang } from "../../src/lib/napi-szo";

/**
 * Napi szó — forgatás és tartalom.
 *
 * A felhasználói panasz az volt, hogy „mindig ugyanazokat látom”. Ennek KÉT
 * független oka volt, és mindkettőre külön teszt kell:
 *   1. a bank kicsi volt (30 szó = havi ismétlés),
 *   2. a sorrend minden körben AZONOS volt (`dayIndex % n`), így a minta is
 *      felismerhető lett.
 *
 * ⚠️ A 2. javítása (körönként változó lépésköz) új hibalehetőséget nyit: ha a
 * lépésköz nem relatív prím a lista hosszához, egy körből szavak ESNEK KI és
 * mások KÉTSZER jönnek elő. Ezt méri a „minden szó pontosan egyszer” teszt —
 * ez a fájl legfontosabb állítása.
 */

const ORSZAGOK = ["CH", "AT", "DE", "NL", "GB", "ES"] as const;

describe("napi szó — bank mérete", () => {
  it.each(ORSZAGOK)("%s bankja legalább 60 szó (2 hónapnál hosszabb ciklus)", (o) => {
    expect(getWordBank(o).length).toBeGreaterThanOrEqual(60);
  });

  it.each(ORSZAGOK)("%s bankjában nincs ismétlődő szó", (o) => {
    const szavak = getWordBank(o).map((w) => w.word);
    const dup = szavak.filter((w, i) => szavak.indexOf(w) !== i);
    expect(dup, `duplikátum: ${dup.join(", ")}`).toEqual([]);
  });

  it.each(ORSZAGOK)("%s minden tétele kitöltött (hu, word, phonetic, standard)", (o) => {
    for (const w of getWordBank(o)) {
      for (const mezo of ["hu", "word", "phonetic", "standard"] as const) {
        expect(w[mezo]?.trim(), `${o} / ${w.word} → üres mező: ${mezo}`).toBeTruthy();
      }
    }
  });
});

describe("napi szó — forgatás", () => {
  it.each(ORSZAGOK)("⚠️ %s: egy körben MINDEN szó pontosan egyszer jön elő", (o) => {
    const n = getWordBank(o).length;
    // Több kört is végignézünk: a lépésköz körönként más, a hibát csak akkor
    // fogjuk meg, ha nem csak az első kört ellenőrizzük.
    for (let ciklus = 0; ciklus < 8; ciklus++) {
      const latott = new Set<string>();
      for (let d = 0; d < n; d++) {
        latott.add(getDailyWord(o, ciklus * n + d)!.word);
      }
      expect(latott.size, `${o}, ${ciklus}. kör: ${n} napból csak ${latott.size} különböző szó`).toBe(n);
    }
  });

  it.each(ORSZAGOK)("%s: a sorrend körönként MÁS (nem ismerhető fel a minta)", (o) => {
    const n = getWordBank(o).length;
    const kor = (c: number) => Array.from({ length: n }, (_, d) => getDailyWord(o, c * n + d)!.word).join("|");
    const elso = kor(0);
    const kesobbiek = [1, 2, 3, 4].map(kor);
    expect(kesobbiek.filter((k) => k === elso), `${o}: valamelyik későbbi kör azonos az elsővel`).toEqual([]);
  });

  it("determinisztikus: ugyanaz a nap ugyanazt adja (SSR/kliens egyezés)", () => {
    for (const o of ORSZAGOK) {
      for (const nap of [0, 1, 47, 365, 12_345]) {
        expect(getDailyWord(o, nap)).toEqual(getDailyWord(o, nap));
      }
    }
  });

  it("negatív és nagy nap-sorszámra sem esik ki (nincs undefined)", () => {
    for (const o of ORSZAGOK) {
      for (const nap of [-1, -70, -99_999, 0, 1_000_000]) {
        expect(getDailyWord(o, nap), `${o} / ${nap}`).toBeTruthy();
      }
    }
  });

  it("ismeretlen országra null, nem hiba", () => {
    expect(hasDailyWord("HU")).toBe(false);
    expect(getDailyWord("HU", 5)).toBeNull();
    expect(getWordBank("HU")).toEqual([]);
  });
});

describe("napi szó — TTS nyelv", () => {
  it("minden szó-bankos országnak van saját BCP-47 kódja", () => {
    const kodok = ORSZAGOK.map(ttsLang);
    expect(new Set(kodok).size, `ütköző TTS-kódok: ${kodok.join(", ")}`).toBe(ORSZAGOK.length);
  });
});

/**
 * ⚠️ A kártya böngésző-TTS-t használ (speechSynthesis), NEM szerveroldali
 * AI-modellt. Az AI-átláthatósági oldal ezt így is írja le — ha valaki
 * átírná Workers AI-ra, a jogi szöveg némán hazuggá válna.
 */
describe("napi szó — hang forrása", () => {
  it("a kártya speechSynthesis-t használ, nem szerver-AI-t", () => {
    const kartya = readFileSync(resolve(process.cwd(), "src/components/napi-szo-card.tsx"), "utf8");
    expect(kartya).toMatch(/speechSynthesis/);
    expect(kartya, "szerveroldali AI-hívás került a napi szó kártyába — az AI-átláthatósági oldalt is frissíteni kell").not.toMatch(
      /\/api\/(ai|assistant)|Workers AI|@cf\//,
    );
  });
});
