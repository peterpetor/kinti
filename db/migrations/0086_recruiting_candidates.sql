-- 0086 — Feedback Jobs közvetítői jelölt-CRM (admin-only).
-- A recruiter MAGA viszi fel a jelöltet (CV-vel), és követi a folyamatot:
-- új → megkeresve → elhelyezve → kifizetve. Független a self-service
-- worker_profiles-tól (az a jelölt-oldali opt-in funnel).
CREATE TABLE IF NOT EXISTS recruiting_candidates (
  id          TEXT PRIMARY KEY,
  full_name   TEXT NOT NULL,
  country     TEXT NOT NULL DEFAULT 'AT',   -- AT/DE/NL (EU placement)
  keyword     TEXT,                          -- szakma/kulcsszó a kereséshez
  cv_key      TEXT,                          -- R2 kulcs (cv/recruiting/...)
  status      TEXT NOT NULL DEFAULT 'new',   -- new|contacted|placed|paid|dropped
  notes       TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_recruiting_status ON recruiting_candidates(status, updated_at);
