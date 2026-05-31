-- ===========================================================================
-- 0053_abuse_metrics — Rate-limit and abuse pattern tracking
--
-- Tracks submission attempts, blocklisted IPs, and abuse patterns to
-- power a simple dashboard showing:
-- - Most abusive IPs (by strike count, report frequency)
-- - Submission trends (pending, rejected, etc.)
-- - Rate-limit activity
-- ===========================================================================

CREATE TABLE IF NOT EXISTS rate_limit_events (
  id          TEXT    PRIMARY KEY,
  ip_hash     TEXT    NOT NULL,
  endpoint    TEXT    NOT NULL,    -- e.g., '/api/reviews/submit', '/api/bulletin/submit'
  attempt_count INTEGER NOT NULL,  -- How many attempts in the window
  window_start TEXT   NOT NULL,    -- Start of the rate-limit window
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Track which IPs hit rate limits
CREATE INDEX IF NOT EXISTS idx_rate_limit_ip
  ON rate_limit_events (ip_hash, created_at);

CREATE INDEX IF NOT EXISTS idx_rate_limit_endpoint
  ON rate_limit_events (endpoint, created_at);

-- ===========================================================================
-- Blocklist summary (for dashboard quick stats)
-- ===========================================================================

CREATE TABLE IF NOT EXISTS blocklist_summary (
  ip_hash         TEXT    PRIMARY KEY,
  blocked_at      TEXT    NOT NULL,
  reason          TEXT,
  strike_count    INTEGER NOT NULL DEFAULT 0,
  report_count    INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_blocklist_blocked_at
  ON blocklist_summary (blocked_at DESC);
