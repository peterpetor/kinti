-- 0084 — napi „gyere vissza" push + idempotens napi-guard.
-- A meglévő push-kategóriák (business/event/job) MIND esemény-vezéreltek; egyik
-- sem hív vissza NAPONTA. A napi szokás triggere egy generikus napi nudge, amely
-- a meglévő napi-hurkokra (streak, napi kvíz, nyelvlecke) tereli vissza a usert.
-- notify_daily: a napi emlékeztető kategória-kapcsolója (alapból BE — a meglévő
-- feliratkozók is megkapják, opt-out a beállításokban).
ALTER TABLE push_subscriptions ADD COLUMN notify_daily INTEGER NOT NULL DEFAULT 1;

-- A napi nudge cron idempotenciája: napi EGY küldés. A cron a nap kulcsra
-- INSERT-tel „lefoglalja" a mai napot; ha a sor már létezik (kettős külső ping),
-- kihagyja. Így a cron-job.org esetleges dupla pingje nem küld kétszer.
CREATE TABLE IF NOT EXISTS daily_nudge_log (
  day        TEXT PRIMARY KEY,
  sent       INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
