-- 0106 — Állás-radar DIGEST sor. A hibrid értesítés: a nap ELSŐ illeszkedő állását
-- a radar azonnal küldi (last_fired_at állítása), a többit ide gyűjti, és egy napi
-- cron egy összefoglalóban küldi ki (frequency capping a spam ellen).
CREATE TABLE IF NOT EXISTS radar_digest_queue (
  id         TEXT PRIMARY KEY,
  radar_id   TEXT NOT NULL,
  job_id     TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_radar_digest_radar ON radar_digest_queue (radar_id);
