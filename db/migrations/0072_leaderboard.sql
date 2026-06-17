-- 0072 — Opt-in közösségi ranglista (privacy-by-design).
-- Nincs valódi név / email / Clerk-identitás: a felhasználó önként, becenévvel
-- csatlakozik, és egy kliensoldali random token (client_token) a szerkesztés
-- bizonyítéka (ugyanaz a minta, mint a manage-tokeneknél). A pontszám/szint
-- kliensoldali, ÖNBEVALLOTT érték.
CREATE TABLE IF NOT EXISTS leaderboard (
  id TEXT PRIMARY KEY,
  client_token TEXT NOT NULL UNIQUE,
  nickname TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  badges INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC, updated_at ASC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_nickname ON leaderboard(nickname COLLATE NOCASE);
