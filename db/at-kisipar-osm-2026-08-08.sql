-- KISIPAR AZ OPENSTREETMAPBŐL — 2026-08-08
--
-- ⭐ MIÉRT EZ AZ IRÁNY: Ausztriában MIND A NÉGY megpróbált cégjegyzék zárva van
-- (mérve ezen a napon): `herold.at` fejetlen böngészővel nem kereshető,
-- `firmen.wko.at` 403, `firmenabc.at` 429 majd 404, `cylex.at` 403. Az OSM
-- viszont nyílt, és a kisiparra KÜLÖN címke-családja van: `craft=*`. Ez új
-- tengely — a korábbi OSM-aratások éttermet kerestek (`cuisine=hungarian`).
--
-- ⚠️⚠️ KÉT NÉMA HIBA, amit csak KONTROLL-MÉRÉSSEL lehetett megfogni:
--
--   1. ÉKEZETES NÉV A REGEXBEN = NULLA TALÁLAT AZ EGÉSZ LEKÉRDEZÉSRE. Ha a
--      névlistában szerepel a „Szabó" vagy „Kovács", az Overpass nem hibát ad,
--      hanem ÜRES eredményt. Ugyanaz a lekérdezés ékezet nélkül 13 elemet adott.
--      A `,i` kapcsoló kis-nagybetűre süket, ékezetre NEM.
--   2. A `craft` és a `shop` ág EGY unióban HTTP 504-re fut; külön kérésként
--      másodpercek alatt lefut mindkettő.
--
-- Enélkül a kör „nincs magyar kisiparos az OSM-ben" következtetéssel zárult
-- volna. A kontroll egy ismerten létező lekérdezés volt (`craft=carpenter` AT).
-- ⚠️ Mellékesen: User-Agent nélkül az Overpass HTTP 406-ot ad.
--
-- MÉRLEG: AT 25 nyers OSM-elem, NL 6, GB 8 → 23 elérhetőséggel → 13 jelölt
-- → 12 dedup után → 4 felvett cég (AT 3, GB 1). CH és ES 504-re futott.
--
-- ⚠️ AZ OSM `craft` LEFEDETTSÉGE VÉKONY, és a találatok nagy része nem
-- rés-szakma (`photographer`, `winery`, `sawmill`, `oil_mill`). A név-egyezés
-- ráadásul RÉSZLÁNCRA is illeszt („Nagy" a „Nagyder"-ben), ezért a
-- hitelesség-szűrő szóhatárral dolgozik — 23-ból 10-et így ejtett ki.
--
-- ⭐ A MAPS-HITELESÍTÉS ITT ADATOT IS PÓTOLT: a „Tischlerei Nemeth" az OSM-ben
-- telefon nélkül szerepelt, a Maps-tétel viszont megadta. Enélkül a tétel
-- elérhetőség nélkül, zsákutcaként került volna be.
--
-- ⚠️ A magyar nyelvű kiszolgálás itt sincs ellenőrizve: NINCS ELLENŐRIZVE,
-- verified = 0. Koordináták Nominatimból, utca-szintűek.

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('osmat-biro-sonnenluk-e-u', 'Biro Sonnenluk e.U', 'arnyekolastechnika', 'Árnyékolástechnika / Redőny', 'Hauptstraße 70, 2452 Mannersdorf am Leithagebirge', '02168 68608', 'Árnyékolástechnika és redőny Mannersdorf am Leithagebirge környékén.', '["Német"]', 47.9747539, 16.6069328, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-osm-kisipar-2026-08-08', 'AT', 'NOE')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('osmat-tischlerei-nemeth', 'tischlerei NEMETH', 'asztalos', 'Asztalos', 'Bundesstraße 7, 7441 Deutsch Gerisdorf', '0664 4015703', 'Asztalos- és bútormunkák Deutsch Gerisdorf környékén.', '["Német"]', 47.416068, 16.367675, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-osm-kisipar-2026-08-08', 'AT', 'BGL')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('osmat-autohaus-erich-horvath-andau', 'Autohaus Erich Horvath | Andau', 'autoszer', 'Autószerelő', 'Ödenburgerstraße 72, 7163 Andau', '02176 2346', 'Autójavítás és -szerviz Andau környékén.', '["Német"]', 47.7735844, 17.0196627, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-osm-kisipar-2026-08-08', 'AT', 'BGL')
ON CONFLICT(id) DO NOTHING;
