-- 0082 — country_code az Iránytű (benchmark) tábláihoz (CH/AT szétválasztás).
-- A meglévő svájci adatok 'CH'-ra esnek (DEFAULT). Az osztrák beküldések/seed 'AT'.
-- Egy felhasználó (ip_hash) országonként KÜLÖN béradatot adhat meg.

ALTER TABLE salary_benchmarks ADD COLUMN country_code TEXT NOT NULL DEFAULT 'CH';
ALTER TABLE rent_benchmarks   ADD COLUMN country_code TEXT NOT NULL DEFAULT 'CH';

CREATE INDEX IF NOT EXISTS idx_salary_benchmarks_country ON salary_benchmarks (country_code);
CREATE INDEX IF NOT EXISTS idx_rent_benchmarks_country   ON rent_benchmarks (country_code);
