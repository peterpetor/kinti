/**
 * quiz-percentile.ts — a napi kvíz heti percentilisének PURE matekja.
 *
 * Cloudflare/DB-függés NÉLKÜL (nem importál `getDB`-t) → unit-tesztelhető, és a
 * kliens is behúzhatja. A SQL-t a `repo-quiz-stats.ts` intézi, majd ránézeti ezt.
 */

/** Egy pontszám (0..3) heti előfordulási darabszáma az adott országban. */
export interface QuizScoreCount {
  score: number;
  count: number;
}

/** Legalább ennyi heti játék kell egy országban, hogy a percentilist MUTASSUK.
 *  Alatta a UI a személyes heti statot mutatja (ne „reklámozzuk az ürességet"). */
export const QUIZ_PERCENTILE_MIN_SAMPLE = 25;

/**
 * PURE percentilis-számítás a heti pontszám-hisztogramból. Textbook percentilis-
 * rang: a nálam KISEBB pontszámúak + a HOLTVERSENY fele, elosztva az összessel.
 * Így egy telitalálat sem állítja, hogy „100%-nál jobb", és a medián ~50% — se
 * túlzás, se lekicsinylés. `null`, ha nincs elég minta (minSample alatt).
 *
 * @param counts a heti (score→count) darabszámok (a hívó saját beküldése MÁR
 *               benne van — a holtverseny-tag lefedi az önmagával összevetést).
 * @param myScore a felhasználó mai pontszáma (0..3).
 */
export function quizPercentile(
  counts: QuizScoreCount[],
  myScore: number,
  minSample = QUIZ_PERCENTILE_MIN_SAMPLE,
): { total: number; percentile: number } | null {
  const total = counts.reduce((s, c) => s + Math.max(0, c.count), 0);
  if (total < minSample) return null;
  let below = 0;
  let equal = 0;
  for (const c of counts) {
    const n = Math.max(0, c.count);
    if (c.score < myScore) below += n;
    else if (c.score === myScore) equal += n;
  }
  const pr = ((below + 0.5 * equal) / total) * 100;
  // 1..99 közé fogva: sose ígérjünk 0%-ot vagy 100%-ot (holtverseny miatt amúgy
  // sem éri el, de a kerekítés szélein biztos, ami biztos).
  const percentile = Math.min(99, Math.max(1, Math.round(pr)));
  return { total, percentile };
}
