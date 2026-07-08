/**
 * Quiz daily — napi 3 kérdéses kvíz logika.
 *
 * Determinisztikus seedezés a dátum alapján: minden user UGYANAZT a 3 kérdést
 * kapja egy adott napon (megosztható élmény). A user napi eredménye localStorage-ban
 * tárolva — egy nap egyszer játszható.
 */

import { QUIZ_BANK, type QuizQuestion } from "./quiz-bank";
import { AT_QUIZ_BANK } from "./quiz-bank-at";
import { NL_QUIZ_BANK } from "./quiz-bank-nl";
import { DE_QUIZ_BANK } from "./quiz-bank-de";

const STORAGE_KEY = "kinti.quizState";

export interface DailyQuizResult {
  date: string; // YYYY-MM-DD
  answers: number[]; // index 0-3, vagy -1 ha kihagyott
  score: number; // helyes válaszok száma (0-3)
  completedAt: string; // ISO
}

export interface QuizState {
  /** Mai eredmény (ha játszott). */
  today: DailyQuizResult | null;
  /** Hányadik napja megy a sorozat. */
  streak: number;
  /** Utolsó játszott nap (streak-számolás). */
  lastPlayed: string | null;
  /** Összes pont (history). */
  totalScore: number;
  /** Hány nap óta játszik. */
  totalDays: number;
  /** Valaha elért legjobb napi eredmény (0-3) — a „Telitalálat" kitűzőhöz. */
  bestScore: number;
  /** Utolsó ~14 nap (date + score) — a személyes HETI stat fallbackhez, amikor
   *  még nincs elég közösségi minta a percentilishez. Csak localStorage. */
  history?: { date: string; score: number }[];
}

/** Ennyi napnyi eredményt tartunk meg a személyes heti statokhoz (7 + ráhagyás). */
const HISTORY_CAP = 14;

const DEFAULT_STATE: QuizState = {
  today: null,
  streak: 0,
  lastPlayed: null,
  totalScore: 0,
  totalDays: 0,
  bestScore: 0,
  history: [],
};

/** Mai dátum YYYY-MM-DD (Europe/Zurich-szerű egyszerűsítés). */
export function todayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Determinisztikus seedezés egy dátum-key-ből.
 * Egyszerű hash → kiválaszt 3 különböző indexet a bankból.
 */
export function getDailyQuestions(dateKey: string, country: string = "CH"): QuizQuestion[] {
  const bank = country === "AT" ? AT_QUIZ_BANK : country === "DE" ? DE_QUIZ_BANK : country === "NL" ? NL_QUIZ_BANK : QUIZ_BANK;
  // Hash: ország + YYYY-MM-DD → szám (FNV-1a-szerű). Az ország a seedben, hogy
  // CH és AT más napi szettet kapjon.
  const seedStr = `${country}:${dateKey}`;
  let hash = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    hash ^= seedStr.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }

  const n = bank.length;
  const indexes = new Set<number>();
  let h = hash;
  while (indexes.size < 3) {
    h = (h * 1103515245 + 12345) >>> 0;
    indexes.add(h % n);
  }

  return Array.from(indexes).map((i) => bank[i]);
}

export function loadState(): QuizState {
  if (typeof window === "undefined") return { ...DEFAULT_STATE };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return { ...DEFAULT_STATE, ...parsed };
    }
    return { ...DEFAULT_STATE };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveState(state: QuizState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* private mode → ok */
  }
}

/** Visszaadja a mai state-et, normalizálva (régi today resetelve, streak frissítve). */
export function getTodayState(): QuizState {
  const state = loadState();
  const today = todayKey();

  // Ha a 'today' nem ma — resetelni kell
  if (state.today && state.today.date !== today) {
    state.today = null;
  }

  return state;
}

/** Lemented az eredményt és frissíti a streak-et. */
export function recordResult(answers: number[], country: string = "CH"): QuizState {
  const today = todayKey();
  const questions = getDailyQuestions(today, country);
  let score = 0;
  for (let i = 0; i < 3; i++) {
    if (answers[i] === questions[i].correct) score++;
  }

  const state = loadState();

  // Ha ma már játszott, ne duplázzuk
  if (state.today?.date === today) {
    return state;
  }

  // Streak-frissítés: ha tegnap játszott, +1; ha régebben, reset 1-re
  let newStreak = 1;
  if (state.lastPlayed) {
    const last = new Date(state.lastPlayed);
    const now = new Date(today);
    const diffDays = Math.round((now.getTime() - last.getTime()) / 86_400_000);
    if (diffDays === 1) newStreak = state.streak + 1;
    else if (diffDays === 0) newStreak = state.streak;
  }

  // Napi eredmény a személyes history-ba (dedup mai napra, utolsó HISTORY_CAP nap).
  const history = [
    ...(state.history ?? []).filter((h) => h.date !== today),
    { date: today, score },
  ].slice(-HISTORY_CAP);

  const next: QuizState = {
    today: {
      date: today,
      answers,
      score,
      completedAt: new Date().toISOString(),
    },
    streak: newStreak,
    lastPlayed: today,
    totalScore: state.totalScore + score,
    totalDays: state.totalDays + 1,
    bestScore: Math.max(state.bestScore ?? 0, score),
    history,
  };

  saveState(next);
  return next;
}

/**
 * PURE — személyes HETI statok a history-ból (az utolsó 7 naptári nap, a mai
 * napot is beleértve). A percentilis fallbackje: amikor még nincs elég közösségi
 * minta, a saját heti teljesítményt mutatjuk (őszinte, backend nélkül).
 */
export function weeklyPersonalStats(
  history: { date: string; score: number }[] | undefined,
  today: string = todayKey(),
): { days: number; accuracyPct: number } {
  if (!history || history.length === 0) return { days: 0, accuracyPct: 0 };
  // A mai naptól visszafelé 7 nap ablak (today-6 .. today), string-összevetéssel.
  // A dátumot kézzel bontjuk (nem `new Date("YYYY-MM-DD")`, ami UTC-t parse-olna
  // és időzónánként off-by-one lehetne) — a streak.ts mintáját követve.
  const [ty, tm, td] = today.split("-").map(Number);
  const fromDt = new Date(ty, tm - 1, td);
  fromDt.setDate(fromDt.getDate() - 6);
  const fromKey = `${fromDt.getFullYear()}-${String(fromDt.getMonth() + 1).padStart(2, "0")}-${String(fromDt.getDate()).padStart(2, "0")}`;
  const inWeek = history.filter((h) => h.date >= fromKey && h.date <= today);
  const days = inWeek.length;
  if (days === 0) return { days: 0, accuracyPct: 0 };
  const correct = inWeek.reduce((s, h) => s + h.score, 0);
  const accuracyPct = Math.round((correct / (days * 3)) * 100);
  return { days, accuracyPct };
}
