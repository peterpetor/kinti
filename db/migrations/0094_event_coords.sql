-- 0094 — események a térképen: lat/lng a precíz/város-szintű pinhez. A meglévő
-- feed- és seed-események lat/lng-je NULL marad (csak régió-szintű); a felhasználó
-- által beküldött események kapnak koordinátát. A moderáció a meglévő úton megy
-- (moderation_status: 0 = beérkezett, 1 = jóváhagyva).
ALTER TABLE events ADD COLUMN lat REAL;
ALTER TABLE events ADD COLUMN lng REAL;
