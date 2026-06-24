-- 0087 — jelölt ↔ állás shortlist (admin közvetítő-pipeline).
-- A recruiter a talált hirdetéseket a jelölthöz menti („ezt az 5 melót neki"),
-- és követi, melyiket kereste meg. status: saved | contacted.
CREATE TABLE IF NOT EXISTS recruiting_shortlist (
  id           TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL,
  job_title    TEXT NOT NULL,
  job_company  TEXT,
  job_location TEXT,
  job_url      TEXT NOT NULL,
  match_score  INTEGER,
  status       TEXT NOT NULL DEFAULT 'saved',
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_shortlist_candidate ON recruiting_shortlist(candidate_id, created_at);
