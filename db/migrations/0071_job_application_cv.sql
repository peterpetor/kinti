-- 0071_job_application_cv.sql
-- Egykattintásos jelentkezés: a jelölt mentett CV-jének R2-kulcsa a pályázathoz.
-- A worker_profiles.cv_key pillanatkép-másolata a jelentkezés idejéből (ha a
-- jelölt később lecseréli a profil-CV-t, a beadott pályázat CV-je megmarad).

ALTER TABLE job_applications ADD COLUMN cv_key TEXT;
