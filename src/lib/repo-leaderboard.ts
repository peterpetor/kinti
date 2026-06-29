/**
 * repo-leaderboard.ts — opt-in közösségi ranglista adatrétege.
 * A pontszám önbevallott (kliensoldali gamifikáció); a client_token a
 * szerkesztés bizonyítéka. Sem valódi név, sem email nem tárolódik.
 *
 * Kategóriák: `overall` (összesített), `language` (nyelvtanulás-XP),
 * `community` (közösségi hozzájárulás). Mindhárom al-pontszám a kliensoldali
 * gamifikációból jön; a ranglista kategóriánként rendezhető.
 */
import { getDB } from "./cloudflare";

export type LeaderboardCategory = "overall" | "language" | "community";

/** Kategória → rendezési oszlop. FIX whitelist → biztonságos SQL-interpoláció. */
const SCORE_COLUMN: Record<LeaderboardCategory, string> = {
  overall: "score",
  language: "score_language",
  community: "score_community",
};
function colFor(category: LeaderboardCategory): string {
  return SCORE_COLUMN[category] ?? "score";
}

/** Tetszőleges bemenetből érvényes kategória (default: overall). */
export function parseLeaderboardCategory(v: unknown): LeaderboardCategory {
  return v === "language" || v === "community" ? v : "overall";
}

export interface LeaderboardEntry {
  nickname: string;
  /** A KIVÁLASZTOTT kategória szerinti pontszám (az oszlop aliasolva). */
  score: number;
  level: number;
  badges: number;
  updatedAt: string;
}

interface Row {
  nickname: string;
  score: number;
  level: number;
  badges: number;
  updated_at: string;
}

export interface UpsertLeaderboardInput {
  clientToken: string;
  nickname: string;
  score: number;
  level: number;
  badges: number;
  scoreLanguage: number;
  scoreCommunity: number;
}

/** Foglalt-e a becenév MÁS token által? (case-insensitive). */
export async function isNicknameTaken(nickname: string, exceptToken: string): Promise<boolean> {
  const row = await getDB()
    .prepare("SELECT 1 AS x FROM leaderboard WHERE nickname = ? COLLATE NOCASE AND client_token <> ? LIMIT 1")
    .bind(nickname, exceptToken)
    .first<{ x: number }>();
  return !!row;
}

export async function upsertLeaderboardEntry(input: UpsertLeaderboardInput): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO leaderboard (id, client_token, nickname, score, level, badges, score_language, score_community, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
       ON CONFLICT(client_token) DO UPDATE SET
         nickname = excluded.nickname,
         score = excluded.score,
         level = excluded.level,
         badges = excluded.badges,
         score_language = excluded.score_language,
         score_community = excluded.score_community,
         updated_at = datetime('now')`,
    )
    .bind(
      crypto.randomUUID(), input.clientToken, input.nickname, input.score, input.level, input.badges,
      input.scoreLanguage, input.scoreCommunity,
    )
    .run();
}

export async function getTopLeaderboard(category: LeaderboardCategory = "overall", limit = 50): Promise<LeaderboardEntry[]> {
  const col = colFor(category);
  // Kategória-boardon (nyelv/közösségi) csak a TÉNYLEG aktívak (>0) jelenjenek meg,
  // különben a frissen 0-ra szinkronizált tagok elárasztanák nullákkal. Az
  // összesített boardon mindenki látszik.
  const where = category === "overall" ? "" : `WHERE ${col} > 0`;
  const { results } = await getDB()
    .prepare(
      `SELECT nickname, ${col} AS score, level, badges, updated_at
       FROM leaderboard ${where} ORDER BY ${col} DESC, updated_at ASC LIMIT ?`,
    )
    .bind(limit)
    .all<Row>();
  return results.map((r) => ({
    nickname: r.nickname, score: r.score, level: r.level, badges: r.badges, updatedAt: r.updated_at,
  }));
}

export async function getLeaderboardByToken(
  category: LeaderboardCategory,
  clientToken: string,
): Promise<(LeaderboardEntry & { rank: number }) | null> {
  const col = colFor(category);
  const row = await getDB()
    .prepare(`SELECT nickname, ${col} AS score, level, badges, updated_at FROM leaderboard WHERE client_token = ?`)
    .bind(clientToken)
    .first<Row>();
  if (!row) return null;
  const rank = await rankForScore(category, row.score);
  return { nickname: row.nickname, score: row.score, level: row.level, badges: row.badges, updatedAt: row.updated_at, rank };
}

/** Hányadik helyen áll egy adott pontszám a kategóriában (1-alapú). */
export async function rankForScore(category: LeaderboardCategory, score: number): Promise<number> {
  const col = colFor(category);
  const row = await getDB()
    .prepare(`SELECT COUNT(*) AS n FROM leaderboard WHERE ${col} > ?`)
    .bind(score)
    .first<{ n: number }>();
  return (row?.n ?? 0) + 1;
}

export async function getLeaderboardCount(): Promise<number> {
  const row = await getDB().prepare("SELECT COUNT(*) AS n FROM leaderboard").first<{ n: number }>();
  return row?.n ?? 0;
}

export async function deleteLeaderboardEntry(clientToken: string): Promise<boolean> {
  const res = await getDB().prepare("DELETE FROM leaderboard WHERE client_token = ?").bind(clientToken).run();
  return (res.meta.changes ?? 0) > 0;
}
