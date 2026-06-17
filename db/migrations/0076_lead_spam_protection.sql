-- db/migrations/0076_lead_spam_protection.sql
--
-- Árajánlat-kérés spam-védelem:
--   1. business_leads.digest_sent_at — nyomon követi, mikor ment ki a
--      napi digest emailbe (NULL = azonnali első-ping emailként ment, vagy
--      még nem ment ki semmi). A cron beállítja a kiküldés után.
--   2. business_leads.first_ping_sent — jelzi hogy az adott napra az
--      első azonnali email már elment-e (ne küldjük kétszer).
--   3. businesses.lead_opt_out — a vállalkozó leiratkozhat az
--      árajánlat-kérések fogadásáról (a kezelő linkről állítható be).
-- ===========================================================================

ALTER TABLE business_leads ADD COLUMN digest_sent_at TEXT DEFAULT NULL;
ALTER TABLE business_leads ADD COLUMN first_ping_sent INTEGER NOT NULL DEFAULT 0;

ALTER TABLE businesses ADD COLUMN lead_opt_out INTEGER NOT NULL DEFAULT 0;

-- Index a cron lekérdezéshez: ki nem küldött, tegnapi leadek gyors keresése
CREATE INDEX IF NOT EXISTS idx_business_leads_digest
  ON business_leads (business_id, digest_sent_at, created_at);
