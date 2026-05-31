-- ===========================================================================
-- 0004_reviews  —  Account nélküli vélemény-rendszer (email-megerősítéses).
--
-- Cél: a kintiek (regisztráció nélkül) értékelhessék a szakembereket, de a
-- spam / fake-review veszélyt minimalizáljuk. A flow account-mentes:
--   1) submit → Turnstile + honeypot + form-validáció
--   2) review_drafts INSERT + email kiküldése
--   3) confirm link kattintás → review_drafts → reviews átmozgatás
--   4) businesses.rating + businesses.reviews automatikus újraszámolása
--
-- Üzleti szabály: 1 email = 1 vélemény / vállalkozás (UNIQUE constraint a
-- `reviews` táblán). Ismételt vélemény-feladás → 400 hibával elutasítva.
-- A felhasználó a manage-tokennel törölheti, és utána újra feladhatja.
-- ===========================================================================

-- --- 1) Megerősítésre váró vélemény-piszkozatok
CREATE TABLE review_drafts (
  id TEXT PRIMARY KEY,                                            -- crypto.randomUUID()
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT NOT NULL,                                             -- 30..1000 karakter
  reviewer_name TEXT NOT NULL,                                    -- megjelenő név (pl. "Eszter T.")
  confirm_token TEXT NOT NULL UNIQUE,
  manage_token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,                                       -- 24h
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  -- Audit-trail
  terms_version TEXT,
  accepted_terms_at TEXT,
  age_confirmed INTEGER NOT NULL DEFAULT 0,
  ip_hash TEXT
);
CREATE INDEX idx_review_drafts_expires ON review_drafts(expires_at);
CREATE INDEX idx_review_drafts_business ON review_drafts(business_id);
CREATE INDEX idx_review_drafts_email ON review_drafts(email);

-- --- 2) Publikált vélemények
CREATE TABLE reviews (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT NOT NULL,
  reviewer_name TEXT NOT NULL,
  manage_token TEXT NOT NULL UNIQUE,
  published_at TEXT NOT NULL DEFAULT (datetime('now')),

  -- Audit-trail
  terms_version TEXT,
  accepted_terms_at TEXT,
  age_confirmed INTEGER NOT NULL DEFAULT 0,
  ip_hash TEXT
);
CREATE INDEX idx_reviews_business ON reviews(business_id);

-- 1 email = 1 vélemény / vállalkozás (mindkettő case-insensitive)
CREATE UNIQUE INDEX idx_reviews_business_email
  ON reviews(business_id, lower(email));
