-- ===========================================================================
-- 0023_business_owner_linking
--   1) business_submissions kap egy `owner_user_id` (Clerk) oszlopot, hogy ha
--      a beküldést egy belépett vállalkozó indítja, a megerősítés AUTOMATIKUSAN
--      hozzákösse a publikus businesses-rekordhoz (nincs külön igénylési lépés).
--   2) Új `business_claim_requests` tábla: meglévő, gazdátlan business-rekord
--      igénylése Clerk userhez, email-megerősítéssel (a business.contact_email
--      kapja a verifikációs linket; a linkre kattintva updateljük owner_user_id-t).
-- ===========================================================================

ALTER TABLE business_submissions ADD COLUMN owner_user_id TEXT;

CREATE TABLE business_claim_requests (
  id              TEXT PRIMARY KEY,                 -- UUID
  business_id     TEXT NOT NULL,                    -- businesses(id), FK logikai
  user_id         TEXT NOT NULL,                    -- Clerk user_id, aki igényli
  user_email      TEXT NOT NULL,                    -- a Clerk user e-mailje (audit)
  business_email  TEXT NOT NULL,                    -- a business.contact_email-re küldve
  verify_token    TEXT NOT NULL UNIQUE,
  expires_at      TEXT NOT NULL,                    -- 24h TTL
  consumed_at     TEXT,                             -- megerősítés időpontja (NULL = függőben)
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_claim_token   ON business_claim_requests (verify_token);
CREATE INDEX idx_claim_biz     ON business_claim_requests (business_id);
CREATE INDEX idx_claim_user    ON business_claim_requests (user_id);
CREATE INDEX idx_claim_expires ON business_claim_requests (expires_at);
