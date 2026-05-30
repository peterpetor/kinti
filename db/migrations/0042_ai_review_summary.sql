-- ===========================================================================
-- 0042_ai_review_summary  —  AI-generált vélemény-összegzés cache-eléséhez.
--
-- A Szaknévsor profil-oldalain (sok véleményű vállalkozóknál) megjelenik egy
-- 3-4 mondatos magyar összegzés. A számítás cron- vagy lazy-trigger alapján
-- történik; itt csak a kész szöveget tároljuk + invalidálási metaadatot.
--
-- Re-generálás akkor: ha a `review_count_at_generation` < jelenlegi reviews.count
-- ÉS jelentős változás (delta ≥ 3), vagy ha 30 napnál régebbi a `generated_at`.
-- ===========================================================================

ALTER TABLE businesses ADD COLUMN ai_review_summary TEXT;
ALTER TABLE businesses ADD COLUMN ai_review_summary_at TEXT;
ALTER TABLE businesses ADD COLUMN ai_review_summary_count INTEGER NOT NULL DEFAULT 0;
