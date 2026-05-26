-- Migration 0009: Add canton_code to bulletin_drafts and bulletin_posts
ALTER TABLE bulletin_drafts ADD COLUMN canton_code TEXT;
ALTER TABLE bulletin_posts ADD COLUMN canton_code TEXT;
