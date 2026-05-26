-- ===========================================================================
-- 0008_bulletin_price  —  strukturált ár-mező a hirdetésekhez.
--
-- Eddig az ár csak a szabad-szöveges `meta` mezőben volt (pl. „Zürich · 1980
-- CHF / hó"), így nem lehetett ár szerint rendezni. Ez a strukturált, opcionális
-- `price` (egész CHF). Ahol nincs értelme (Állás, Keresek, Ingyen), ott NULL —
-- a rendezésnél az ár nélküliek a végére kerülnek.
-- ===========================================================================

ALTER TABLE bulletin_drafts ADD COLUMN price INTEGER;
ALTER TABLE bulletin_posts  ADD COLUMN price INTEGER;
