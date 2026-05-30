-- 0048_benchmark_alerts.sql
-- Email értesítések béradatok változásáról

CREATE TABLE IF NOT EXISTS benchmark_alerts (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  industry TEXT NOT NULL,
  canton_code TEXT NOT NULL DEFAULT 'all',
  exp_bucket TEXT NOT NULL DEFAULT 'all',   -- '0–2 év' | '3–5 év' | '5+ év' | 'all'
  last_avg_chf INTEGER,                      -- utolsó ismert átlag (±10% küszöbhöz)
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Egy email-cím + iparág + kanton kombináció csak egyszer szerepelhet
CREATE UNIQUE INDEX IF NOT EXISTS idx_benchmark_alerts_unique
  ON benchmark_alerts(email, industry, canton_code);
