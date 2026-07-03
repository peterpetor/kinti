-- 0114 — a „Ki költözött melléd?" jelenlét-funkció kivezetése (2026-07-03).
--
-- A user döntése: nulla-adat mellett a társadalmi-bizonyíték kártya az
-- ürességet reklámozta (összesen 2 ping volt, mindkettő AT). A teljes kód
-- (oldal + api + kártya + repo) törölve; a tábla is ejthető — a 2 sor anonim
-- ping volt, nem user-adat. A presence-cities.ts VÁROS-LISTA megmarad (az
-- esemény- és keresek-űrlapok használják), az NEM ehhez a táblához tartozik.
-- A 0091/0092/0097 migráció-fájlok történelmi okból maradnak.

DROP TABLE IF EXISTS presence_pings;
