-- Migration 0013: Add working_hours and social_links to businesses
ALTER TABLE businesses ADD COLUMN working_hours TEXT;
ALTER TABLE businesses ADD COLUMN social_links TEXT;
