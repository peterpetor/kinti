-- 0099 — Szezonális push idempotencia: minden kampány ÉVENTE egyszer megy ki.
-- A kulcs pl. 'krankenkasse-2026'. A /api/cron/seasonal-push naponta fut, de a kampány
-- csak az első alkalommal megy ki az időablakában (a többi napon a claim már foglalt).
CREATE TABLE IF NOT EXISTS seasonal_push_log (
  campaign_key TEXT PRIMARY KEY,
  sent_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
