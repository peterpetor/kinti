-- ===========================================================================
-- 0030_generic_spam_log — generikus IP-alapú rate-limit log.
--
-- Eddig minden flow-nak külön logja volt (bulletin_contact_log,
-- event_submit_log, ride_submit_log). Az új email-küldős endpointok
-- (quote, rating, digest) UGYANAZT a mintát igénylik, ezért egy közös
-- táblát adunk hozzájuk `kind` diszkriminátorral.
--
-- Használat: countRecentSpamLog(kind, ipHash) → count per 60min;
--            logSpamSubmit(kind, ipHash) fire-and-forget.
-- A táblát napi pruneolja a cron-purge.
-- ===========================================================================

CREATE TABLE spam_log (
  id         TEXT    PRIMARY KEY,         -- UUID
  kind       TEXT    NOT NULL,            -- 'quote' | 'rating' | 'digest' | …
  ip_hash    TEXT,                        -- SHA-256(IP), nullable
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_spam_log_kind_ip_time ON spam_log (kind, ip_hash, created_at);
