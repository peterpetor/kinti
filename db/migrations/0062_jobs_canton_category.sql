-- db/migrations/0062_jobs_canton_category.sql
--
-- Strukturált kanton + szakma az álláshirdetésekhez, hogy a kereső kantonra
-- és szakmára is tudjon szűrni (eddig csak szabad-szöveges `location` volt).
--
-- Mindkét oszlop NULLABLE: a meglévő hirdetések NULL-t kapnak (a kereső
-- "összes kanton / összes szakma" alatt jeleníti meg őket).

ALTER TABLE jobs ADD COLUMN canton_code TEXT;  -- 2-betűs ISO kanton-kód (lib/cantons.ts)
ALTER TABLE jobs ADD COLUMN category TEXT;      -- szakma-id (lib/job-categories.ts)

CREATE INDEX IF NOT EXISTS idx_jobs_canton ON jobs(canton_code);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
