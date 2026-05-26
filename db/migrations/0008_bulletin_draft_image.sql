-- ===========================================================================
-- 0008_bulletin_draft_image  —  image_key oszlop hozzáadása a bulletin_drafts-hoz.
--
-- Lehetővé teszi hirdetések képének ideiglenes tárolását a megerősítés előtt.
-- ===========================================================================

ALTER TABLE bulletin_drafts ADD COLUMN image_key TEXT;
