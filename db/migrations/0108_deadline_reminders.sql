-- 0108 — Határidő-emlékeztetők. A Határidő-asszisztens push-emlékeztetője: a
-- felhasználó határidőit az ANONIM push-endpointhoz kötjük (mint a radarok —
-- nincs user-azonosító), és egy napi cron küld push-t a küszöböknél (14/7/1 nap).
-- A `sent` a már elküldött küszöböket tárolja (vesszős), hogy ne spammeljen.
CREATE TABLE IF NOT EXISTS deadline_reminders (
  id         TEXT PRIMARY KEY,
  endpoint   TEXT NOT NULL,
  p256dh     TEXT,
  auth       TEXT,
  title      TEXT NOT NULL,
  due_date   TEXT NOT NULL,            -- YYYY-MM-DD
  sent       TEXT NOT NULL DEFAULT '', -- elküldött küszöbök, pl. "14,7"
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_deadline_endpoint ON deadline_reminders (endpoint);
CREATE INDEX IF NOT EXISTS idx_deadline_due ON deadline_reminders (due_date);
