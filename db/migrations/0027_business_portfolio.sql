-- ===========================================================================
-- 0027_business_portfolio.sql — Vizuális Portfólió a Szaknévsorhoz
--
-- JSON tömb a képek R2 kulcsaival: '["b-1.jpg", "b-2.jpg"]'
-- ===========================================================================

ALTER TABLE businesses ADD COLUMN gallery_keys TEXT;
