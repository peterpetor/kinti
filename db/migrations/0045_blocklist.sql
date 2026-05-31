-- ===========================================================================
-- 0045_blocklist  —  Admin által karbantartott tiltólista (ban-rendszer).
--
-- Account-mentes platformon a "user-ban" valójában IP-cím-hash VAGY email-cím-
-- hash alapú: ha az admin egy felhasználót banol, a következő submit-on
-- (review / business / event / spontán / hofladen / akció) az adott
-- IP-hash vagy email-hash 403-as választ kap.
--
-- A 'value' minden esetben SHA-256(IP) vagy SHA-256(lower(email)) — sose
-- nyers IP vagy email. GDPR-tisztaság.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS blocklist (
  id          TEXT    PRIMARY KEY,           -- UUID
  kind        TEXT    NOT NULL,              -- 'ip_hash' | 'email_hash'
  value       TEXT    NOT NULL,              -- SHA-256 hex
  reason      TEXT,                          -- admin-megjegyzés (mit csinált)
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  created_by  TEXT    NOT NULL,              -- admin Clerk user_id (audit)
  active      INTEGER NOT NULL DEFAULT 1,    -- 0 = unbanned, 1 = aktív
  UNIQUE (kind, value)
);

CREATE INDEX IF NOT EXISTS idx_blocklist_lookup
  ON blocklist (kind, value, active);
