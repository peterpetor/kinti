-- db/migrations/0065_jobs_legal_company.sql
--
-- Feketemunka-kockázat csökkentése az álláshirdetéseknél:
--   1) jobs.legal_attested — a feladó kötelező nyilatkozata, hogy a munkát
--      bejelenti (AHV), legális foglalkoztatás.
--   2) employers.company_uid — opcionális svájci cég-azonosító (UID, pl.
--      CHE-123.456.789) a "Hiteles cég" igazoláshoz.
--   3) employers.verified — admin által ellenőrzött, valódi cég (badge).

ALTER TABLE jobs ADD COLUMN legal_attested INTEGER DEFAULT 0;

ALTER TABLE employers ADD COLUMN company_uid TEXT;
ALTER TABLE employers ADD COLUMN verified INTEGER DEFAULT 0;
