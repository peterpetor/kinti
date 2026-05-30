-- 0047_anonymous_benchmarks.sql
-- Anonim bér- és lakbér iránytű adatai

CREATE TABLE IF NOT EXISTS salary_benchmarks (
  id TEXT PRIMARY KEY,
  canton_code TEXT NOT NULL,
  industry TEXT NOT NULL,
  years_experience INTEGER NOT NULL,
  gross_salary_chf INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  ip_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rent_benchmarks (
  id TEXT PRIMARY KEY,
  canton_code TEXT NOT NULL,
  rooms REAL NOT NULL,
  rent_chf INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  ip_hash TEXT NOT NULL
);

-- Indexek az aggregációs lekérdezések gyorsítására
CREATE INDEX IF NOT EXISTS idx_salary_benchmarks_canton ON salary_benchmarks(canton_code);
CREATE INDEX IF NOT EXISTS idx_salary_benchmarks_industry ON salary_benchmarks(industry);
CREATE INDEX IF NOT EXISTS idx_rent_benchmarks_canton ON rent_benchmarks(canton_code);
