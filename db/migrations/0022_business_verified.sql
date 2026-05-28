-- ===========================================================================
-- 0022_business_verified — "Verified Hungarian-speaking" jelvény.
-- A vállalkozó kérheti, az admin manuálisan ellenőrzi és bekapcsolja.
-- Megjelenik a Szaknévsorban a vállalkozói kártyán és a detail oldalon.
-- ===========================================================================

ALTER TABLE businesses ADD COLUMN verified INTEGER NOT NULL DEFAULT 0 CHECK (verified IN (0, 1));
CREATE INDEX idx_businesses_verified ON businesses (verified);
