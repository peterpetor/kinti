/**
 * repo-leaderboard.ts — opt-in közösségi ranglista adatrétege.
 * A pontszám önbevallott (kliensoldali gamifikáció); a client_token a
 * szerkesztés bizonyítéka. Sem valódi név, sem email nem tárolódik.
 */
import { getDB } from "./cloudflare";

export interface LeaderboardEntry {
  nickname: string;
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
      `INSERT INTO leaderboard (id, client_token, nickname, score, level, badges, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
       ON CONFLICT(client_token) DO UPDATE SET
         nickname = excluded.nickname,
         score = excluded.score,
         level = excluded.level,
         badges = excluded.badges,
         updated_at = datetime('now')`,
    )
    .bind(crypto.randomUUID(), input.clientToken, input.nickname, input.score, input.level, input.badges)
    .run();
}

export async function getTopLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  const { results } = await getDB()
    .prepare(
      `SELECT nickname, score, level, badges, updated_at
       FROM leaderboard ORDER BY score DESC, updated_at ASC LIMIT ?`,
    )
    .bind(limit)
    .all<Row>();
  return results.map((r) => ({
    nickname: r.nickname, score: r.score, level: r.level, badges: r.badges, updatedAt: r.updated_at,
  }));
}

export async function getLeaderboardByToken(clientToken: string): Promise<(LeaderboardEntry & { rank: number }) | null> {
  const row = await getDB()
    .prepare("SELECT nickname, score, level, badges, updated_at FROM leaderboard WHERE client_token = ?")
    .bind(clientToken)
    .first<Row>();
  if (!row) return null;
  const rank = await rankForScore(row.score);
  return { nickname: row.nickname, score: row.score, level: row.level, badges: row.badges, updatedAt: row.updated_at, rank };
}

/** Hányadik helyen áll egy adott pontszám (1-alapú; a nálánál többet érők + 1). */
export async function rankForScore(score: number): Promise<number> {
  const row = await getDB()
    .prepare("SELECT COUNT(*) AS n FROM leaderboard WHERE score > ?")
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
