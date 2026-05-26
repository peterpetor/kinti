-- ===========================================================================
-- 0014_bulletin_expiry_warning  —  Hirdetés lejárati figyelmeztető és hosszabbítás.
-- ===========================================================================
ALTER TABLE bulletin_posts ADD COLUMN expiry_warning_sent INTEGER NOT NULL DEFAULT 0;
