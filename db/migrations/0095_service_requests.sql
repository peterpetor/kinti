-- 0095 — „Keresek" igény-tábla: a felhasználók hirdetést adhatnak fel
-- („Keresek magyarul beszélő villanyszerelőt Münchenben jövő hétre"), amire a
-- szakik a megadott (a kérő által választott, publikus) elérhetőségen jelentkeznek.
-- Admin-moderált (moderation_status: 0=beérkezett, 1=jóváhagyva) — a meglévő
-- moderációs rendszerbe illeszkedik. Az ip_hash CSAK rate-limit (nem identitás).
CREATE TABLE IF NOT EXISTS service_requests (
  id                     TEXT PRIMARY KEY,
  country_code           TEXT NOT NULL,
  region_code            TEXT,
  category               TEXT,
  title                  TEXT NOT NULL,
  description            TEXT,
  city                   TEXT,
  when_text              TEXT,
  contact                TEXT NOT NULL,
  ip_hash                TEXT NOT NULL,
  moderation_status      INTEGER NOT NULL DEFAULT 0,
  moderation_decision_at TEXT,
  moderation_decided_by  TEXT,
  status                 TEXT NOT NULL DEFAULT 'approved',
  created_at             TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at             TEXT
);
CREATE INDEX IF NOT EXISTS idx_service_req_country ON service_requests(country_code, moderation_status, expires_at);
CREATE INDEX IF NOT EXISTS idx_service_req_iphash ON service_requests(ip_hash, created_at);
