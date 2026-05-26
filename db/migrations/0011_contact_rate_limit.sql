-- ===========================================================================
-- 0011_contact_rate_limit  —  IP-alapú rate-limit log a kapcsolatfelvételhez.
--
-- Egy hirdetésre érkező üzeneteket logoljuk IP-hash + timestamp alapján,
-- hogy ugyanarról az IP-ről legfeljebb 5 üzenet menjen ki óránként.
-- A táblát naponta érdemes pruneolni (cron vagy lazy TTL).
-- ===========================================================================

CREATE TABLE bulletin_contact_log (
  id         TEXT    PRIMARY KEY,           -- UUID
  post_id    TEXT    NOT NULL,
  ip_hash    TEXT,                          -- SHA-256(IP), nullable (localhost)
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_contact_log_ip_time ON bulletin_contact_log (ip_hash, created_at);
