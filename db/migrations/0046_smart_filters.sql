-- Okos kategória szűrők (pl. évjárat autóknál, méret bútoroknál)
ALTER TABLE bulletin_posts ADD COLUMN smart_filters TEXT;
ALTER TABLE bulletin_drafts ADD COLUMN smart_filters TEXT;
