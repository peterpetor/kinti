-- 0135: Albérlet-börze régió-mező (kanton / tartomány / provincia) — a
-- hirdetés régióra szűrhető (user-kérés 2026-07-16). Nullable: a régi sorok
-- és a régiót nem választó feladók régió nélkül maradnak (a szűrő átugorja).
ALTER TABLE kinti_housing_listings ADD COLUMN region_code TEXT;
CREATE INDEX IF NOT EXISTS idx_housing_region
  ON kinti_housing_listings(country, region_code, is_active);
