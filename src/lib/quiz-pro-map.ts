/**
 * quiz-pro-map.ts — „Kvízből Lead": a napi kvíz témái → Szaknévsor-szakmák
 * KURÁLT megfeleltetése (tiszta, vitest-elhető — Cloudflare-import tilos).
 *
 * Elv: a kvíz-eredményen CSAK olyan témához ajánlunk profit, ahol a kapcsolat
 * őszinte és erős (nyelv → nyelvtanár; hivatal/intézmények → könyvelő/adó/ügyvéd;
 * étel → magyar étterem). A gyenge párosítások (történelem→?) SZÁNDÉKOSAN
 * kimaradnak — az erőltetett ajánló hiteltelenít. NEM Vectorize: a szemantikus
 * index kicsi és a kurált pár pontosabb + determinisztikus (ai-content-accuracy elv).
 * A kategória-id-k az ÉLES categories táblából ellenőrzöttek (2026-07-12).
 */

import type { QuizCategory } from "./quiz-bank";

export interface QuizProTarget {
  /** A rontott kvíz-kategória. */
  quizCategory: QuizCategory;
  /** Szaknévsor kategória-id-k, relevancia-sorrendben. */
  businessCats: string[];
  /** A kártya címe — a rontott témára utal, tényállítás nélkül. */
  title: string;
}

export const QUIZ_PRO_MAP: Partial<Record<QuizCategory, Omit<QuizProTarget, "quizCategory">>> = {
  language: {
    businessCats: ["idegennyelv_tanar", "nyelviskola"],
    title: "A nyelvi kérdések fogtak ki rajtad?",
  },
  institutions: {
    businessCats: ["konyveles", "adotanacsado", "ugyved"],
    title: "A hivatalos ügyek útvesztője?",
  },
  food: {
    businessCats: ["etterem"],
    title: "Az étel-ital kérdéseknél véreztél el?",
  },
};

/**
 * A mai eredményből kiválasztja az ajánló célpontját: az ELSŐ ROSSZ válasz,
 * aminek a kvíz-kategóriájára van kurált szakma-pár. Hibátlan kvíznél (vagy
 * ha csak nem-párosított témát rontott) null — ilyenkor NINCS kártya.
 */
export function pickQuizProTarget(
  questions: { category: QuizCategory; correct: number }[],
  answers: number[],
): QuizProTarget | null {
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q || answers[i] === q.correct) continue;
    const mapped = QUIZ_PRO_MAP[q.category];
    if (mapped) return { quizCategory: q.category, ...mapped };
  }
  return null;
}
