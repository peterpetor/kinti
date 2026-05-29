-- ===========================================================================
-- 0032_anonymize_names — teljes névmezők kiürítése (Reddit-stílusú váltás).
--
-- A user-facing nevek mostantól AUTO-GENERÁLT handle-ek (pl. "VidámPék_42")
-- amiket a kliens deriválja a rekord id-jéből. Semmilyen név-bemenetet nem
-- kérünk be többé, és a meglevő tárolt nevek is kiürülnek.
--
-- A `NOT NULL` korlátozást nem szüntetjük meg (SQLite ALTER limitációk),
-- helyette üres stringre ('') állítjuk. Az app-réteg az üres stringet "use
-- handle" jelzéseként értelmezi.
-- ===========================================================================

UPDATE rides SET poster_name = '' WHERE poster_name IS NOT NULL;
UPDATE reviews SET reviewer_name = '' WHERE reviewer_name IS NOT NULL;
UPDATE bulletin_posts SET poster = '' WHERE poster IS NOT NULL;
