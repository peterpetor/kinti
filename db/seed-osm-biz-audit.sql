-- db/seed-osm-biz-audit.sql — a `seed-osm-biz*` forrás TELJES kézi auditja (2026-07-31).
--
-- Ez a forrás annak idején OSM-ből, a NÉV alapján címkézett „magyar" vállalkozást
-- (`cuisine=hungarian` tag / magyaros hangzású név). A 44 élő tétel MINDEGYIKÉT
-- egyenként ellenőriztem — saját weboldal, helyi turisztikai jegyzék, sajtó —,
-- és 10 tételről bizonyosodott be, hogy NEM való a szaknévsorba.
--
--   wrangler d1 execute kinti-db --remote --file=./db/seed-osm-biz-audit.sql
--
-- ⚠️ MINDEN elrejtés KONKRÉT azonosítóra megy, sose névmintára: a múltkori
-- körben egy `name LIKE 'Paprika%'` minta elkapta volna a zürichi
-- „Paprika Shop Feinkost aus Ungarn"-t, ami VALÓDI magyar bolt.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. HAMIS POZITÍVOK — nincs magyar kötődés (a saját oldaluk mondja ki)
-- ─────────────────────────────────────────────────────────────────────────────

-- Altes Landgut Werdenich (Deutsch Jahrndorf, AT) — a Werdenich CSALÁD osztrák
-- vidéki fogadója, „regionale, saisonale Küche". A magyar határ mellett van,
-- de ettől még nem magyar. Forrás: landgut-werdenich.at
UPDATE businesses SET hidden = 1 WHERE id = 'osmbiz2-at-altes-landgut-werdenich';

-- Dorf.Wirt (Dorf an der Pram, AT) — „Familie Bischof", osztrák Hausmannskost.
-- Forrás: dorfer-wirt.at
UPDATE businesses SET hidden = 1 WHERE id = 'osmbiz2-at-dorf-wirt';

-- 4 Jahreszeiten (Meißen, DE) — szász „Hausmacher Spezialitäten"; a menü angol
-- és OROSZ fordítással, magyarral nem. Forrás: 4jahreszeiten-meissen.de
UPDATE businesses SET hidden = 1 WHERE id = 'osmbiz4-de-4-jahreszeiten';

-- Gasthof Klix (Großdubrau, DE) — „gutbürgerliche deutsche Küche" + pizza.
-- Forrás: gasthofklix.de
UPDATE businesses SET hidden = 1 WHERE id = 'osmbiz4-de-gasthof-klix';

-- Gasthaus Krone (Vaihingen an der Enz-Roßwag, DE) — SVÁB és TÖRÖK konyha
-- (oszmán tál, köfte, mezze). A blurb weboldala ráadásul 404.
UPDATE businesses SET hidden = 1 WHERE id = 'osmbiz4-de-gasthaus-krone';

-- WVF Clubrestaurant (Friedrichshafen, DE) — vitorlásklub étterme, bodeni
-- halspecialitásokkal; az EGYETLEN „magyar" jel az üzemeltető VEZETÉKNEVE
-- (Franz Császár). ⚠️ A névből sosem elég következtetni.
UPDATE businesses SET hidden = 1 WHERE id = 'osmbiz4-de-wvf-clubrestaurant';

-- Paprika (Lampertheim, DE) — valójában „Paprika Pizza & Grill Haus": pizza,
-- döner, grill. Ez már a HARMADIK „Paprika" nevű nem-magyar étterem a listán.
UPDATE businesses SET hidden = 1 WHERE id = 'osmbiz3-de-paprika';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. MEGSZŰNT / GAZDÁT CSERÉLT — valaha magyar volt, ma már nem
-- ─────────────────────────────────────────────────────────────────────────────

-- Boros-Ratskeller (Bad Mergentheim, DE) — a Boros család német-magyar étterme.
-- Két független jel a bezárásra: a Yelp „GESCHLOSSEN" (2026. július), és a
-- boros-ratskeller.de névszervere elérhetetlen (DNS SERVFAIL / „No Reachable
-- Authority"). Friss, pozitív forrás nincs.
UPDATE businesses SET hidden = 1 WHERE id = 'osmbiz5-de-boros-ratskeller';

-- Restaurant Blockhaus (Creglingen, DE) — szintén Boros-érdekeltség volt.
-- Ma „FrankenBruzzler's Blockhaus", Patrick és Annika Hartl vezetésével, FRANK
-- konyhával; a régi blockhaus-creglingen.de domain NXDOMAIN.
UPDATE businesses SET hidden = 1 WHERE id = 'osmbiz4-de-restaurant-blockhaus';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. NEM IGAZOLHATÓ — se magyar kötődés, se bármilyen elérhetőség
-- ─────────────────────────────────────────────────────────────────────────────

-- Gulaschtopf (Stuttgart-Zuffenhausen, DE) — se weboldal, se megerősíthető
-- telefonszám, se étlap, se vélemény; egyetlen címtár állítja, hogy magyar.
-- A név önmagában NÉMET szó — ld. a múltkor elrejtett „Gulaschkanone"-t, ami
-- általános német konyhának bizonyult. Zsákutca-adatlap: inkább ne legyen.
UPDATE businesses SET hidden = 1 WHERE id = 'osmbiz4-de-gulaschtopf';

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. HALOTT WEBOLDALAK a megmaradó (valódi) tételeknél
-- ─────────────────────────────────────────────────────────────────────────────

-- Piroschka (Berlin) — az étterem MŰKÖDIK (telefon él, friss címtár-adatok),
-- csak a piroschka.net domain járt le. A halott linket levágjuk, a telefon marad.
UPDATE businesses SET blurb = 'Magyar étterem · Berlin'
 WHERE id = 'osmbiz-de-piroschka-berlin';

-- Café Lehmann (Kreischa) — a .de halott, a .com él ugyanazzal a tartalommal.
UPDATE businesses SET blurb = 'cafe-lehmann-kreischa.com'
 WHERE id = 'osmbiz4-de-cafe-lehmann';

-- Restaurant Am Steiger (Freital) — a balaton-gastro-service.de már NEM létezik
-- (NXDOMAIN); az étterem saját oldala amsteiger.de, és él.
UPDATE businesses SET blurb = 'amsteiger.de'
 WHERE id = 'osmbiz4-de-restaurant-am-steiger';

-- Bakos Lángos (Chemnitz) — a blurbben KÉTSZER szerepelt ugyanaz a cím.
UPDATE businesses SET blurb = 'www.bakos-langos.de'
 WHERE id = 'osmbiz4-de-bakos-langos';

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. HIÁNYZÓ ELÉRHETŐSÉGEK PÓTLÁSA (mind saját oldalról / hivatalos jegyzékből)
-- ─────────────────────────────────────────────────────────────────────────────

-- Muskatnuss (Bad Mitterndorf, AT) — magyar ételek és magyar borok.
UPDATE businesses SET phone = '+43 650 7701374'
 WHERE id = 'osmbiz2-at-muskatnuss' AND (phone IS NULL OR trim(phone) = '');

-- Bakos Lángos (Chemnitz, DE) — magyar street food.
UPDATE businesses SET phone = '+49 176 21232807'
 WHERE id = 'osmbiz4-de-bakos-langos' AND (phone IS NULL OR trim(phone) = '');

-- K & K Gasthaus (Salach, DE) — „Ungarisch-Österreichische Küche" (kunstundknoedel.de).
UPDATE businesses SET phone = '+49 7162 8069563'
 WHERE id = 'osmbiz4-de-k-k-gasthaus' AND (phone IS NULL OR trim(phone) = '');
UPDATE businesses SET blurb = 'www.kunstundknoedel.de'
 WHERE id = 'osmbiz4-de-k-k-gasthaus' AND (blurb IS NULL OR blurb NOT LIKE '% · %.%');

-- Steakhaus Palmengarten (Sigmaringen, DE) — magyar specialitások a grill mellé.
UPDATE businesses SET phone = '+49 7571 7296688'
 WHERE id = 'osmbiz4-de-steakhaus-palmengarten' AND (phone IS NULL OR trim(phone) = '');

-- Budapest Bagel Berlin — a lánc saját oldala.
UPDATE businesses SET blurb = 'www.budapestbagel.com'
 WHERE id = 'osmbiz3-de-budapest-bagel-berlin' AND (blurb IS NULL OR trim(blurb) = '');

-- Pusta-Stube (Bremen) — saját oldal a meglévő leírás mellé.
UPDATE businesses SET blurb = 'Magyar étterem · Bremen · www.pusta-stube.de'
 WHERE id = 'osmbiz5-de-pusta-stube';
