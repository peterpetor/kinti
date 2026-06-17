import { getStreak } from "./streak";
import { loadState } from "./quiz-daily";
import type { GamificationExtras } from "./gamification";

/**
 * A poszton túli kitűző-jelek begyűjtése a kliensoldali tárolókból (streak,
 * napi kvíz, kedvencek) + PWA-állapot. Csak a böngészőben hívható.
 */
export function gatherAchievementExtras(): GamificationExtras {
  if (typeof window === "undefined") return {};

  const streak = getStreak();
  const quiz = loadState();

  let favorites = 0;
  try {
    const favs = JSON.parse(window.localStorage.getItem("kinti_favorites") || "[]");
    favorites = Array.isArray(favs) ? favs.length : 0;
  } catch {
    /* ignore */
  }

  const appInstalled =
    window.matchMedia?.("(display-mode: standalone)").matches === true ||
    (navigator as unknown as { standalone?: boolean }).standalone === true;

  return {
    streakLongest: streak.longest,
    quizBest: quiz.bestScore,
    quizDays: quiz.totalDays,
    appInstalled,
    favorites,
  };
}
