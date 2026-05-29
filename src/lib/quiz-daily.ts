/**
 * Quiz daily — napi 3 kérdéses kvíz logika.
 *
 * Determinisztikus seedezés a dátum alapján: minden user UGYANAZT a 3 kérdést
 * kapja egy adott napon (megosztható élmény). A user napi eredménye localStorage-ban
 * tárolva — egy nap egyszer játszható.
 */

import { QUIZ_BANK, type QuizQuestion } from "./quiz-bank";

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
}

const DEFAULT_STATE: QuizState = {
  today: null,
  streak: 0,
  lastPlayed: null,
  totalScore: 0,
  totalDays: 0,
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
export function getDailyQuestions(dateKey: string): QuizQuestion[] {
  // Hash: YYYY-MM-DD → szám (FNV-1a-szerű)
  let hash = 2166136261;
  for (let i = 0; i < dateKey.length; i++) {
    hash ^= dateKey.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }

  const n = QUIZ_BANK.length;
  const indexes = new Set<number>();
  let h = hash;
  while (indexes.size < 3) {
    h = (h * 1103515245 + 12345) >>> 0;
    indexes.add(h % n);
  }

  return Array.from(indexes).map((i) => QUIZ_BANK[i]);
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
export function recordResult(answers: number[]): QuizState {
  const today = todayKey();
  const questions = getDailyQuestions(today);
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
  };

  saveState(next);
  return next;
}
