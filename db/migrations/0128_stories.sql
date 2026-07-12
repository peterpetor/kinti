-- 0128 — „Expat Élettörténetek" UGC-blog: a felhasználók saját kiköltözési
-- sztorija (markdown + opcionális borítókép az R2-ben). Admin-moderált
-- (a meglévo moderációs rendszerbe illesztve); minden publikált történet
-- organikus SEO-céloldal (/tortenetek/<slug>). A contact_email PRIVÁT
-- (jóváhagyás-értesítéshez), az ip_hash csak rate-limit.
CREATE TABLE IF NOT EXISTS stories (
  id                     TEXT PRIMARY KEY,
  slug                   TEXT NOT NULL UNIQUE,
  title                  TEXT NOT NULL,
  author_name            TEXT NOT NULL,
  country_code           TEXT NOT NULL,
  city                   TEXT,
  summary                TEXT,
  body_md                TEXT NOT NULL,
  image_key              TEXT,
  contact_email          TEXT,
  ip_hash                TEXT NOT NULL,
  moderation_status      INTEGER NOT NULL DEFAULT 0,
  moderation_decision_at TEXT,
  moderation_decided_by  TEXT,
  created_at             TEXT NOT NULL DEFAULT (datetime('now')),
  published_at           TEXT
);
CREATE INDEX IF NOT EXISTS idx_stories_pub ON stories(moderation_status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_iphash ON stories(ip_hash, created_at);
