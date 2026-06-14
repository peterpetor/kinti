-- ===========================================================================
-- 0071_events_canton — kanton-mező az eseményekhez (push-célzás megbízhatóbb)
--
-- Eddig az esemény-push a `venue` szövegből próbálta kitalálni a kantont
-- (cantonFromAddress). Ez a mező lehetővé teszi a megbízható tárolást: az
-- iCal-sync a feed location-jéből kitölti; ha üres, a push visszaesik a
-- venue-parse-ra. A generált megemlékezések országosak → NULL (= mindenki).
-- ===========================================================================

ALTER TABLE events ADD COLUMN canton_code TEXT;
