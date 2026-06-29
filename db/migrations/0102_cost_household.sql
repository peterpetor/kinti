-- 0102 — „Mennyit költesz?" háztartásméret-dimenzió: a benchmark mostantól az AZONOS
-- méretű háztartásokhoz hasonlít (pl. 4-fős → 4-fősök mediánja), fallbackkel ha kevés
-- az adat. A régi sorok household_size = NULL (csak régió-szinten számítanak).
ALTER TABLE cost_benchmarks ADD COLUMN household_size INTEGER;
CREATE INDEX IF NOT EXISTS idx_cost_benchmarks_size ON cost_benchmarks(country_code, canton_code, category, household_size);
