-- 0111 — A határidő-emlékeztetők PRO-hoz kötése (keep-alive lejárattal).
-- Az emlékeztetők PRO-funkciók: az asszisztens a PRO-paywall mögött van, így CSAK
-- aktív PRO-user tudja megnyitni és (újra)szinkronizálni. Minden szinkron friss
-- `expires_at`-et állít (now +40 nap); a cron a LEJÁRT sorokat kihagyja. Ha a PRO
-- lejár, a user elveszti a hozzáférést az asszisztenshez → nem frissül → az
-- emlékeztetők ~40 napon belül maguktól leállnak. A meglévő sorokat feltöltjük.
ALTER TABLE deadline_reminders ADD COLUMN expires_at TEXT;
UPDATE deadline_reminders SET expires_at = datetime('now', '+40 days');
