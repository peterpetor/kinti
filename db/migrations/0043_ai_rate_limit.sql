-- ===========================================================================
-- 0043_ai_rate_limit  —  Közös rate-limit log az AI endpoint-okhoz.
--
-- Sliding-window IP-hash alapú spam-védelem a Cloudflare Workers AI hívásokra.
-- Egy minden AI-endpoint közös tábla, az `endpoint` mező különbözteti meg, hogy
-- per-endpoint külön limit állítható (parse-search szigorúbb, german-term lazább).
--
-- Cleanup: a cron-purge naponta törli a >24 órás rekordokat.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS ai_rate_limit_log (
  id         TEXT PRIMARY KEY,
  endpoint   TEXT NOT NULL,           -- pl. 'parse-search', 'business-helper', 'german-term', 'review-summary'
  ip_hash    TEXT NOT NULL,           -- SHA-256(IP)
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ai_rl_ip_endpoint_time
  ON ai_rate_limit_log (ip_hash, endpoint, created_at);
