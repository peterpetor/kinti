-- db/seed-purge-us-jobs.sql — a tévesen bekerült EGYESÜLT ÁLLAMOK-beli
-- álláshirdetések törlése (2026-07-31).
--
-- ⚠️ MI TÖRTÉNT: a Jooble GLOBÁLIS végpontja (`jooble.org/api/…`) a holland
-- keresés `location: "Nederland"` paraméterére megtalálta **Nederland, Texas**
-- városát. Eredmény: a holland Jooble-lista 100%-a délkelet-texasi állás lett
-- (Beaumont, Port Arthur, Port Neches, Groves, Bridge City, Orange…), 149
-- hirdetés — hollandiai magyaroknak kínálva.
--
-- A gyökérokot az ország-specifikus Jooble-aldomain javítja (lib/jooble.ts),
-- a második védvonal a `isOutsideCountryScope` amerikai-hely felismerése
-- (lib/region-resolve.ts). Ez a fájl a MÁR BENT LÉVŐ sorokat takarítja.
--
--   wrangler d1 execute kinti-db --remote --file=./db/seed-purge-us-jobs.sql
--
-- ⚠️ A minta SZŰK és éles adaton ellenőrzött: a teljes táblában mindössze KÉT
-- „, XX" végződés fordult elő — `, TX` (149 sor, hibás) és `, UK` (13 sor,
-- jogos). Ezért csak a tagállam-kódos végződésre törlünk, és az AR/NE kód
-- KIMARAD, mert svájci kanton-rövidítés is (Appenzell Ausserrhoden, Neuchâtel).

DELETE FROM external_jobs
 WHERE upper(trim(substr(location, -2))) IN (
   'AL','AK','AZ','CA','CO','CT','DC','FL','GA','HI','IA','ID','IL',
   'IN','KS','KY','LA','MA','MD','ME','MI','MN','MO','MS','MT','NC',
   'ND','NH','NJ','NM','NV','NY','OH','OK','OR','PA','RI','SC','SD',
   'TN','TX','UT','VA','VT','WA','WI','WV','WY'
 )
   AND location LIKE '%, __';
