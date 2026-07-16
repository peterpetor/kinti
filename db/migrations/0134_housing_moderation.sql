-- 0134: Albérlet-börze moderáció (user-döntés 2026-07-16: az instant publish
-- helyett a többi UGC-vertikálissal azonos, előzetes admin-jóváhagyás — a
-- generikus moderációs sor kezeli: repo-spam.ts / admin/moderation).
-- 0=pending, 1=approved, 2=rejected. Az is_active KÜLÖN kapcsoló marad
-- (DSA-jelentés / saját levétel) — publikusan csak az látszik, ahol MINDKETTŐ áll.
ALTER TABLE kinti_housing_listings ADD COLUMN moderation_status INTEGER NOT NULL DEFAULT 0;
ALTER TABLE kinti_housing_listings ADD COLUMN moderation_decision_at TEXT;
ALTER TABLE kinti_housing_listings ADD COLUMN moderation_decided_by TEXT;
