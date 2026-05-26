-- ===========================================================================
-- 0015_business_submissions — Self-service vállalkozás-beküldés.
--
-- Account NÉLKÜL, email-megerősítéssel (mint a hirdetésnél): a beküldés egy
-- piszkozat-sor a business_submissions-ben (24h TTL). A megerősítő linkre
-- kattintva AUTOMATIKUSAN létrejön a publikus businesses-rekord, és a piszkozat
-- törlődik. Nincs kézi admin-jóváhagyás → magától pörög a Szaknévsor.
--
-- A spam-védelem: Turnstile + email-megerősítés + svájci cím-ellenőrzés +
-- profanitásszűrő + eldobható-email tiltás + IP rate-limit (a /api rétegben).
-- ===========================================================================

CREATE TABLE business_submissions (
  id                TEXT PRIMARY KEY,                 -- UUID
  name              TEXT NOT NULL,
  category_id       TEXT NOT NULL,                    -- categories(id)
  category_label    TEXT,                             -- pontos szakma (opcionális)
  address           TEXT,                             -- svájci cím (validált, opcionális)
  canton_code       TEXT NOT NULL,                    -- kötelező: a hely + térkép-koordináta
  phone             TEXT,
  email             TEXT NOT NULL,                    -- megerősítéshez + kapcsolat (nem publikus)
  blurb             TEXT,
  confirm_token     TEXT NOT NULL,
  expires_at        TEXT NOT NULL,                    -- 24h megerősítési TTL
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  terms_version     TEXT,                             -- elfogadott ÁSZF/Adatkezelési verzió
  accepted_terms_at TEXT,
  age_confirmed     INTEGER NOT NULL DEFAULT 0 CHECK (age_confirmed IN (0, 1)),
  ip_hash           TEXT                              -- SHA-256(IP), nullable
);

CREATE INDEX idx_biz_sub_confirm ON business_submissions (confirm_token);
CREATE INDEX idx_biz_sub_ip_time ON business_submissions (ip_hash, created_at);
CREATE INDEX idx_biz_sub_expires ON business_submissions (expires_at);

-- A publikus businesses táblát kiegészítjük a beküldés eredetével + kapcsolati
-- emaillel (az email NEM jelenik meg a listán; admin/jövőbeni claimhez tartjuk).
ALTER TABLE businesses ADD COLUMN source TEXT;          -- 'self_submitted' | NULL (seed/claim)
ALTER TABLE businesses ADD COLUMN contact_email TEXT;
