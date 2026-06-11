-- db/migrations/0064_worker_canton_category.sql
--
-- Strukturált kanton + szakma a munkavállalói profilokhoz, hogy a munkáltató
-- a jelölt-böngészőben kantonra és szakmára is tudjon szűrni. Mindkettő
-- NULLABLE (a meglévő profilok NULL-t kapnak → "összes" alatt jelennek meg).

ALTER TABLE worker_profiles ADD COLUMN canton_code TEXT;  -- lib/cantons.ts
ALTER TABLE worker_profiles ADD COLUMN category TEXT;      -- lib/job-categories.ts

CREATE INDEX IF NOT EXISTS idx_worker_profiles_canton ON worker_profiles(canton_code);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_category ON worker_profiles(category);
