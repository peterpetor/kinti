/**
 * quiz-battle.ts — „Országok és Régiók Harca" tiszta (vitest-elhető) matek.
 *
 * A quiz_daily_stats / quiz_region_stats heti hisztogramjaiból csapat-rangsort
 * számol: átlagpont (0–3) szerint, minimum-minta kapuval. A napi kvíz országon
 * belül determinisztikus → a RÉGIÓK harca teljesen fair; az ORSZÁGOK harca
 * más-más kérdéssoron megy — ezt a UI játékosan kezeli, nem „hivatalos" mérce.
 * Cloudflare/D1 import TILOS (pure lib, a quiz-percentile mintája).
 */

/** Egy (csapat, pontszám) heti darabszáma — a GROUP BY sor. */
export interface BattleScoreCount {
  key: string;   // országkód vagy régió-kód
  score: number; // 0..3
  count: number;
}

export interface BattleRow {
  key: string;
  plays: number;     // heti játékok száma
  avg: number;       // átlagpont, 2 tizedesre kerekítve (0..3)
}

/** Minimum heti játék, hogy egy ORSZÁG felkerüljön a táblára. */
export const BATTLE_MIN_COUNTRY = 25;
/** Minimum heti játék, hogy egy RÉGIÓ felkerüljön a táblára (kisebb halmazok). */
export const BATTLE_MIN_REGION = 10;
/** Ennyi csapat alatt nincs verseny → a UI nem mutat táblát (üresség-elv). */
export const BATTLE_MIN_TEAMS = 2;

/**
 * Csapat-rangsor a heti hisztogramból: átlagpont csökkenő, holtversenyben a
 * több játék előrébb (nagyobb minta = megbízhatóbb átlag). A minPlays alatti
 * csapatok kiesnek. Ha a kapun átjutó csapatok száma < BATTLE_MIN_TEAMS,
 * ÜRES tömböt ad — nincs egyszereplős „verseny".
 */
export function battleRanking(rows: BattleScoreCount[], minPlays: number): BattleRow[] {
  const byKey = new Map<string, { plays: number; sum: number }>();
  for (const r of rows) {
    const count = Math.max(0, Math.floor(r.count));
    if (count === 0) continue;
    const cur = byKey.get(r.key) ?? { plays: 0, sum: 0 };
    cur.plays += count;
    cur.sum += r.score * count;
    byKey.set(r.key, cur);
  }
  const ranked: BattleRow[] = [];
  for (const [key, v] of byKey) {
    if (v.plays < minPlays) continue;
    ranked.push({ key, plays: v.plays, avg: Math.round((v.sum / v.plays) * 100) / 100 });
  }
  ranked.sort((a, b) => (b.avg !== a.avg ? b.avg - a.avg : b.plays - a.plays));
  return ranked.length >= BATTLE_MIN_TEAMS ? ranked : [];
}

/** 1-alapú helyezés a rangsorban, vagy null, ha a csapat nincs a táblán. */
export function battlePlace(ranking: BattleRow[], key: string): number | null {
  const i = ranking.findIndex((r) => r.key === key);
  return i >= 0 ? i + 1 : null;
}
