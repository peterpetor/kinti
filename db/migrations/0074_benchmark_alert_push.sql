-- 0074 — benchmark-riasztás push-csatorna.
-- A feliratkozás eddig csak email volt; bevezetjük a push_endpoint-ot (a böngésző
-- meglévő push-feliratkozása). Egy sor lehet email-alapú VAGY push-alapú.
-- Tábla-újraépítés: email NULL-ozhatóvá tétele + push_endpoint + részleges unique-ok.
ALTER TABLE benchmark_alerts RENAME TO benchmark_alerts_old;

CREATE TABLE benchmark_alerts (
  id TEXT PRIMARY KEY,
  email TEXT,                   -- NULL, ha push-alapú
  push_endpoint TEXT,           -- NULL, ha email-alapú
  industry TEXT NOT NULL,
  canton_code TEXT NOT NULL DEFAULT 'all',
  exp_bucket TEXT NOT NULL DEFAULT 'all',
  last_avg_chf INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO benchmark_alerts (id, email, push_endpoint, industry, canton_code, exp_bucket, last_avg_chf, created_at, updated_at)
  SELECT id, email, NULL, industry, canton_code, exp_bucket, last_avg_chf, created_at, updated_at FROM benchmark_alerts_old;

DROP TABLE benchmark_alerts_old;

-- Egy email / push-endpoint + iparág + kanton kombináció csak egyszer (részleges unique).
CREATE UNIQUE INDEX idx_benchmark_alerts_email ON benchmark_alerts(email, industry, canton_code) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX idx_benchmark_alerts_push ON benchmark_alerts(push_endpoint, industry, canton_code) WHERE push_endpoint IS NOT NULL;
