-- db/seed-osm-contacts.sql — AUTOGENERÁLT (scripts/apply-osm-contacts.mjs).
-- 1) Hiányzó elérhetőségek pótlása OpenStreetMap-ből (Nominatim extratags),
--    SZIGORÚ egyeztetés után: 150 m-en belüli POI + TOKEN-SZINTŰ névegyezés.
-- 2) Négy TÉVESEN magyarként listázott tétel elrejtése (ld. lentebb).
--    wrangler d1 execute kinti-db --remote --file=./db/seed-osm-contacts.sql

-- === 1) Elérhetőség-pótlás ===
-- Budapest (CH) ← OSM „Budapest", 0 m, jaccard
UPDATE businesses SET phone = '+41 26 664 09 30' WHERE id = 'osmbiz-ch-budapest-estavayer' AND (phone IS NULL OR trim(phone) = '');

-- Piroschka (DE) ← OSM „Piroschka", 0 m, jaccard
UPDATE businesses SET phone = '+49 30 7727018' WHERE id = 'osmbiz-de-piroschka-berlin' AND (phone IS NULL OR trim(phone) = '');
UPDATE businesses SET blurb = COALESCE(blurb, '') || ' · ' || 'www.piroschka.net' WHERE id = 'osmbiz-de-piroschka-berlin' AND (blurb IS NULL OR blurb NOT LIKE '% · %.%');

-- PS Autoservice (AT) ← OSM „PS-Autoservice", 5 m, jaccard
UPDATE businesses SET phone = '+43 2682 62110' WHERE id = 'at-imp-ps-autoservice' AND (phone IS NULL OR trim(phone) = '');

-- Hammberger-Hof Restaurant (DE) ← OSM „Hammberger Hof", 0 m, jaccard
UPDATE businesses SET phone = '+49 7266 911388' WHERE id = 'de-imp-hammberger-hof-restaurant' AND (phone IS NULL OR trim(phone) = '');
UPDATE businesses SET blurb = COALESCE(blurb, '') || ' · ' || 'www.hammberger-hof.de' WHERE id = 'de-imp-hammberger-hof-restaurant' AND (blurb IS NULL OR blurb NOT LIKE '% · %.%');

-- Bakos Lángos (DE) ← OSM „Bakos Lángos", 0 m, jaccard
UPDATE businesses SET blurb = COALESCE(blurb, '') || ' · ' || 'www.bakos-langos.de' WHERE id = 'osmbiz4-de-bakos-langos' AND (blurb IS NULL OR blurb NOT LIKE '% · %.%');

-- Hungarica Exzellent (DE) ← OSM „Hungarica Exzellent", 11 m, jaccard
UPDATE businesses SET blurb = COALESCE(blurb, '') || ' · ' || 'www.restauranthungarica-excellent.com' WHERE id = 'de-biz3-hungarica-exzellent' AND (blurb IS NULL OR blurb NOT LIKE '% · %.%');

-- Lakoma (DE) ← OSM „Lakoma", 26 m, jaccard
UPDATE businesses SET phone = '+49 3946 5197481' WHERE id = 'de-biz3-lakoma' AND (phone IS NULL OR trim(phone) = '');
UPDATE businesses SET blurb = COALESCE(blurb, '') || ' · ' || 'lakomarestaurant.de' WHERE id = 'de-biz3-lakoma' AND (blurb IS NULL OR blurb NOT LIKE '% · %.%');

-- kiz augarten – Kindermedizinisches Zentrum (AT) ← OSM „Kiz Augarten", 13 m, subset
UPDATE businesses SET phone = '+43 1 2160919' WHERE id = 'at-biz3-kiz-augarten-kindermedizinisches-zentrum' AND (phone IS NULL OR trim(phone) = '');
UPDATE businesses SET blurb = COALESCE(blurb, '') || ' · ' || 'kizaugarten.at' WHERE id = 'at-biz3-kiz-augarten-kindermedizinisches-zentrum' AND (blurb IS NULL OR blurb NOT LIKE '% · %.%');


-- === 2) TÉVESEN magyarként listázott tételek elrejtése ===
--
-- Mind a régi `seed-osm-biz` OSM-név-gyűjtésből, ami a névben szereplő
-- „Paprika"/„Gulasch" szó alapján címkézett „Magyar étterem"-nek. A memória ezt
-- a csapdát dokumentálja: a „paprika" INDIAI éttermeket hoz, a „Gulaschkanone"
-- pedig egy ÁLTALÁNOS NÉMET tábori-konyha fogalom.
--
-- ⚠️ CSAK az EGYENKÉNT, forrásból ellenőrzött tételek — pl. a „Paprika Shop
-- Feinkost aus Ungarn" (Zürich) SZÁNDÉKOSAN MARAD: az VALÓDI magyar bolt.

-- Paprika — Brahmsstrasse 22, 8003 Zürich
--   → AOZ (Zürich város) női munkaintegrációs étterme: afgán/afrikai/arab/ázsiai/indiai/svájci/tibeti/török konyha — NEM magyar
UPDATE businesses SET hidden = 1 WHERE id = 'osmbiz-ch-paprika-zurich' AND claimed = 0;

-- Paprika In & Out — Rue de Flandres 2, 2000 Neuchâtel
--   → INDIAI étterem (a saját paprika-food.ch oldaluk: „authentic Indian cuisine", Zahid Khan séf) — NEM magyar
UPDATE businesses SET hidden = 1 WHERE id = 'osmbiz-ch-paprika-inout-neuchatel' AND claimed = 0;

-- Paprika — Rue de l'Evole 39, 2000 Neuchâtel
--   → INDIAI étterem (a saját paprika-food.ch oldaluk: „authentic Indian cuisine", Zahid Khan séf) — NEM magyar
UPDATE businesses SET hidden = 1 WHERE id = 'osmbiz-ch-paprika-evole-neuchatel' AND claimed = 0;

-- Gulaschkanone am Eilandkreisel — Gablenzer Straße 95, 02953 Bad Muskau
--   → ÁLTALÁNOS NÉMET konyha (Erbsen mit Sauerkraut, Lausitzer Linsensuppe, Wurstgulasch) — NEM magyar
UPDATE businesses SET hidden = 1 WHERE id = 'osmbiz4-de-gulaschkanone-am-eilandkreisel' AND claimed = 0;
