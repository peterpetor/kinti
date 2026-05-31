-- ===========================================================================
-- 0050_drop_bulletin — a Piac / Hirdetőtábla (apróhirdetés) modul eltávolítása.
--
-- A teljes hirdetés-rendszer megszűnt (frontend + API + repo réteg törölve).
-- Itt dobjuk a már éles adatbázisban létező táblákat, hogy ott se maradjon nyoma.
-- Idempotens DROP IF EXISTS — friss adatbázison (ahol a táblák már nem jönnek
-- létre) egyszerű no-op.
-- ===========================================================================

DROP TABLE IF EXISTS bulletin_contact_log;
DROP TABLE IF EXISTS bulletin_drafts;
DROP TABLE IF EXISTS bulletin_posts;
DROP TABLE IF EXISTS bulletin_kinds;
