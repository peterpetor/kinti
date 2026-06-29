-- 0103 — „Kiemelt Állás" 30-napos lejárata. A job-kiemelés (status='featured') a
-- fizetéstől 30 napig él; a featured_until lejárta után egy napi cron visszaállítja
-- 'active'-ra. A régi (lejárat nélküli) kiemelt jobok featured_until = NULL → azokat
-- a cron nem érinti (csak a NEM-null + lejárt sorokat).
ALTER TABLE jobs ADD COLUMN featured_until TEXT;
CREATE INDEX IF NOT EXISTS idx_jobs_featured_until ON jobs(featured_until);
