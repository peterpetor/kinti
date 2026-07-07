-- 0118 — Régió-kód a külső (API-ból aggregált) álláshirdetésekhez.
-- Eddig az external_jobs csak country_code-ot tárolt → a régió-szűrő (kanton /
-- Bundesland / provincia) NEM működött rájuk (mind „egész országra" látszott).
-- A canton_code a location/area szövegből feloldott régió (lib/region-resolve.ts);
-- a szinkron (job-sync) tölti, a régi sorokat backfill pótolja. NULL = nem
-- feloldható (csak városnév) → a sor a régiótól függetlenül látszik, mint eddig.
ALTER TABLE external_jobs ADD COLUMN canton_code TEXT;
CREATE INDEX IF NOT EXISTS idx_extjobs_region ON external_jobs(country_code, canton_code, fetched_at);
