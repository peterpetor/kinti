-- ===========================================================================
-- 0044_admin_moderation  —  Admin kézi tartalom-moderáció a 4 magas-rizikójú
-- típusra: hirdetés, vélemény, vállalkozás, esemény.
--
-- Minden új beküldés `moderation_status = 0` (pending) állapotba kerül.
-- Az admin a kezelőben elfogadja (1 = approved) vagy elutasítja (2 = rejected).
-- A publikus query-k csak az `1`-eseket adják vissza.
--
-- A meglévő `bulletin_posts.is_pending` (= email-confirmation status) MEGMARAD;
-- az új moderation_status ezt KIEGÉSZÍTI (admin-szintű kapu).
--
-- Az auto-publikáló típusok (spontán találkozó, hofladen, akciók) változatlanok
-- maradnak — azoknál nincs admin-moderation.
-- ===========================================================================

-- Állapot:
--   0 = pending  (vár admin-jóváhagyásra; alapértelmezett új beküldésnél)
--   1 = approved (admin elfogadta; publikus)
--   2 = rejected (admin elutasította; nem publikus, audit-célra megmarad)

ALTER TABLE bulletin_posts ADD COLUMN moderation_status INTEGER NOT NULL DEFAULT 0;
ALTER TABLE reviews ADD COLUMN moderation_status INTEGER NOT NULL DEFAULT 0;
ALTER TABLE businesses ADD COLUMN moderation_status INTEGER NOT NULL DEFAULT 0;
ALTER TABLE events ADD COLUMN moderation_status INTEGER NOT NULL DEFAULT 0;

-- Az admin-döntés időbélyege + döntő admin user-id (audit-trail).
ALTER TABLE bulletin_posts ADD COLUMN moderation_decision_at TEXT;
ALTER TABLE bulletin_posts ADD COLUMN moderation_decided_by TEXT;
ALTER TABLE reviews ADD COLUMN moderation_decision_at TEXT;
ALTER TABLE reviews ADD COLUMN moderation_decided_by TEXT;
ALTER TABLE businesses ADD COLUMN moderation_decision_at TEXT;
ALTER TABLE businesses ADD COLUMN moderation_decided_by TEXT;
ALTER TABLE events ADD COLUMN moderation_decision_at TEXT;
ALTER TABLE events ADD COLUMN moderation_decided_by TEXT;

-- Hatékony admin-queue-lekérdezés:
CREATE INDEX IF NOT EXISTS idx_bulletin_posts_mod ON bulletin_posts(moderation_status);
CREATE INDEX IF NOT EXISTS idx_reviews_mod ON reviews(moderation_status);
CREATE INDEX IF NOT EXISTS idx_businesses_mod ON businesses(moderation_status);
CREATE INDEX IF NOT EXISTS idx_events_mod ON events(moderation_status);

-- A MIGRÁCIÓ IDŐPONTJÁBAN MÁR LÉTEZŐ rekordok mind APPROVED-ká válnak — különben
-- a meglévő publikus tartalom hirtelen eltűnne. Az új beküldés default 0 (pending).
UPDATE bulletin_posts SET moderation_status = 1 WHERE moderation_status = 0;
UPDATE reviews SET moderation_status = 1 WHERE moderation_status = 0;
UPDATE businesses SET moderation_status = 1 WHERE moderation_status = 0;
UPDATE events SET moderation_status = 1 WHERE moderation_status = 0;
