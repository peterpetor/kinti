-- ===========================================================================
-- 0020_digest_subscribers — Heti email-digest feliratkozók (GDPR-tiszta).
--
-- Double opt-in: a beküldés után confirmed=0, email-megerősítés (confirm_token)
-- után confirmed=1. Csak megerősített feliratkozóknak küldünk. Minden levélben
-- egy token-alapú egy-kattintásos leiratkozó link (unsubscribe_token).
-- ===========================================================================

CREATE TABLE digest_subscribers (
  id                TEXT PRIMARY KEY,
  email             TEXT NOT NULL UNIQUE,
  canton_code       TEXT,                            -- NULL = egész Svájc
  confirmed         INTEGER NOT NULL DEFAULT 0 CHECK (confirmed IN (0, 1)),
  confirm_token     TEXT,                            -- megerősítéshez (használat után törölhető)
  unsubscribe_token TEXT NOT NULL UNIQUE,            -- minden levélben szerepel
  terms_version     TEXT,                            -- elfogadott jogi szöveg verziója
  accepted_terms_at TEXT,
  ip_hash           TEXT,                            -- audit trail
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  last_sent_at      TEXT                             -- legutóbbi digest időbélyege
);

CREATE INDEX idx_digest_canton  ON digest_subscribers (canton_code);
CREATE INDEX idx_digest_confirm ON digest_subscribers (confirm_token);
CREATE INDEX idx_digest_unsub   ON digest_subscribers (unsubscribe_token);
