/**
 * tanulas-bankok.ts — az ismétlő kártyáinak TARTALMA (kérdés, válaszok, szó).
 *
 * ⚠️ SZÁNDÉKOSAN KÜLÖN MODUL a `tanulas.ts`-től. Ez a fájl behúzza mind a 12
 * kérdésbankot + a szóbankokat, vagyis nagy. A `/sajatjaim` oldal a
 * `tanulas.ts`-t azonnal használja (kell a „hány kártya esedékes" szám), de EZT
 * csak akkor tölti be dinamikus importtal, amikor a felhasználó tényleg
 * elindítja az ismétlést. Ha valaki statikusan importálná a profil-oldalról, a
 * teljes kérdésbank ráülne a kezdő bundle-re (lásd perf-list-bundle-split).
 */

import { EB_BANK } from "./einburgerung-bank";
import { AT_BANK } from "./staatsbuergerschaft-bank";
import { DE_BANK } from "./de-einburgerung-bank";
import { NL_BANK } from "./nl-inburgering-bank";
import { GB_BANK } from "./gb-lifeintheuk-bank";
import { ES_BANK } from "./es-ccse-bank";
import { QUIZ_BANK } from "./quiz-bank";
import { AT_QUIZ_BANK } from "./quiz-bank-at";
import { DE_QUIZ_BANK } from "./quiz-bank-de";
import { NL_QUIZ_BANK } from "./quiz-bank-nl";
import { GB_QUIZ_BANK } from "./quiz-bank-gb";
import { ES_QUIZ_BANK } from "./quiz-bank-es";
import { getWordBank } from "./napi-szo";
import { polgBank, kvizBank, szoBank, type LearnCard } from "./tanulas";

/** Kérdés-alak, ami a két bank-családban (EbQuestion / QuizQuestion) közös. */
interface Kerdes {
  id: string;
  question: string;
  options: readonly string[];
  correct: number;
  explanation: string;
}

const POLG: Record<string, readonly Kerdes[]> = {
  CH: EB_BANK, AT: AT_BANK, DE: DE_BANK, NL: NL_BANK, GB: GB_BANK, ES: ES_BANK,
};
const KVIZ: Record<string, readonly Kerdes[]> = {
  CH: QUIZ_BANK, AT: AT_QUIZ_BANK, DE: DE_QUIZ_BANK, NL: NL_QUIZ_BANK, GB: GB_QUIZ_BANK, ES: ES_QUIZ_BANK,
};

export const ORSZAGOK = ["CH", "AT", "DE", "NL", "GB", "ES"] as const;

export interface BankInfo {
  bank: string;
  label: string;
  emoji: string;
  total: number;
}

/** Egy ország három bankja — méretekkel, a tanulási statisztikához. */
export function bankInfok(country: string): BankInfo[] {
  const polgCim = country === "GB" ? "Life in the UK" : country === "ES" ? "CCSE-vizsga" : "Állampolgársági kvíz";
  return [
    { bank: polgBank(country), label: polgCim, emoji: "🏛️", total: POLG[country]?.length ?? 0 },
    { bank: kvizBank(country), label: "Napi kvíz", emoji: "🎯", total: KVIZ[country]?.length ?? 0 },
    { bank: szoBank(country), label: "Napi szó", emoji: "📖", total: getWordBank(country).length },
  ].filter((b) => b.total > 0);
}

export interface Flashcard {
  key: string;
  kind: LearnCard["kind"];
  bank: string;
  id: string;
  box: number;
  /** A kártya eleje — a kérdés, vagy szónál a magyar jelentés. */
  elol: string;
  /** A helyes válasz / az idegen szó. */
  hatul: string;
  /** Rövid magyarázat vagy kiejtés (opcionális). */
  reszlet?: string;
  /** Kvíznél a válaszlehetőségek (szónál nincs). */
  options?: readonly string[];
  correct?: number;
}

/**
 * Egy tárolt kártyát feloldunk megjeleníthető tartalommá.
 *
 * `null`-t ad, ha a kérdés/szó azóta KIKERÜLT a bankból (átfogalmaztuk,
 * töröltük). Ilyenkor a hívó egyszerűen kihagyja — árva kártya miatt nem
 * hasalhat el az ismétlő.
 */
export function feloldKartya(c: LearnCard): Flashcard | null {
  const kozos = { key: `${c.bank}::${c.id}`, kind: c.kind, bank: c.bank, id: c.id, box: c.box };

  if (c.kind === "word") {
    const orszag = c.bank.slice("szo-".length);
    const szo = getWordBank(orszag).find((w) => w.word === c.id);
    if (!szo) return null;
    return {
      ...kozos,
      elol: szo.hu,
      hatul: szo.word,
      reszlet: `[${szo.phonetic}] · ${szo.standard}`,
    };
  }

  const [tipus, orszag] = [c.bank.split("-")[0], c.bank.split("-")[1] ?? ""];
  const bank = tipus === "polg" ? POLG[orszag] : KVIZ[orszag];
  const k = bank?.find((q) => q.id === c.id);
  if (!k) return null;
  return {
    ...kozos,
    elol: k.question,
    hatul: k.options[k.correct] ?? "",
    reszlet: k.explanation,
    options: k.options,
    correct: k.correct,
  };
}
