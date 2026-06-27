-- 0096 — Külső (API-ból aggregált) álláshirdetések gyorsítótár-táblája.
-- A jogtiszta aggregátor-API-kból (Adzuna / Jooble / Arbeitnow) szinkronizált
-- találatok ide kerülnek (cron: /api/cron/sync-jobs), és a publikus /allasok
-- külön „Élő állások" szekcióban listázza őket — KIFELÉ, a forrásra mutató
-- linkkel (védő-recept: attribúció + link-out + auto-lejárat, NINCS belső
-- jelentkezés). NEM keverjük a munkáltatói `jobs` táblába (külön életciklus).
CREATE TABLE IF NOT EXISTS external_jobs (
  id            TEXT PRIMARY KEY,
  source        TEXT NOT NULL,                 -- 'adzuna' | 'jooble' | 'arbeitnow'
  source_url    TEXT NOT NULL UNIQUE,          -- dedup + link-out cél
  title         TEXT NOT NULL,
  company       TEXT,
  location      TEXT,
  country_code  TEXT NOT NULL,                 -- AT | DE | NL
  category      TEXT,                          -- a mi job-categories id-nk
  salary_min    INTEGER,
  salary_max    INTEGER,
  currency      TEXT,
  posted_at     TEXT,                          -- a forrás szerinti közzététel
  fetched_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_extjobs_country ON external_jobs(country_code, fetched_at);
CREATE INDEX IF NOT EXISTS idx_extjobs_cat ON external_jobs(country_code, category, fetched_at);
