/**
 * repo-quiz-stats.ts — a napi kvíz ANONIM pontszám-eloszlása (heti percentilis).
 *
 * Se azonosító, se token, se IP: kizárólag darabszám (ország × nap × pontszám).
 * A napi kvíz determinisztikus (aznap mindenki ugyanazt a 3 kérdést kapja az
 * adott országban), ezért a heti pontszám-összevetés tisztességes. A tényleges
 * percentilis-számítás PURE (`quizPercentile`) → unit-tesztelhető; a repo csak a
 * heti darabszámokat hozza le és ránézeti a matekot.
 */
import { getDB } from "./cloudflare";
import { quizPercentile, type QuizScoreCount } from "./quiz-percentile";

// A pure matek + a küszöb külön (Cloudflare-mentes) modulban, hogy a kliens és a
// tesztek is behúzhassák. Innen re-exportáljuk a repo-API kényelméért.
export { quizPercentile, QUIZ_PERCENTILE_MIN_SAMPLE, type QuizScoreCount } from "./quiz-percentile";

/** A heti (utolsó 7 nap) pontszám-darabszámok az adott országban. */
export async function getWeeklyQuizCounts(country: string): Promise<QuizScoreCount[]> {
  const { results } = await getDB()
    .prepare(
      `SELECT score, SUM(count) AS count
         FROM quiz_daily_stats
        WHERE country = ? AND day >= date('now', '-6 days')
        GROUP BY score`,
    )
    .bind(country)
    .all<{ score: number; count: number }>();
  return results.map((r) => ({ score: Number(r.score), count: Number(r.count) }));
}

/** Egy mai eredmény anonim beszámítása a hisztogramba (ország × mai nap × pont). */
export async function incrementQuizScore(country: string, score: number): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO quiz_daily_stats (country, day, score, count)
       VALUES (?, date('now'), ?, 1)
       ON CONFLICT(country, day, score) DO UPDATE SET count = count + 1`,
    )
    .bind(country, score)
    .run();
}

/**
 * A heti percentilis az adott országban egy adott pontszámhoz (beszámítás nélkül).
 * A route POST-nál előbb `incrementQuizScore`-t hív, majd EZT — így a friss
 * beküldés is benne van a mintában.
 */
export async function getWeeklyQuizPercentile(
  country: string,
  score: number,
): Promise<{ total: number; percentile: number } | null> {
  const counts = await getWeeklyQuizCounts(country);
  return quizPercentile(counts, score);
}
