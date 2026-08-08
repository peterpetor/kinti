-- DE — KISIPAR, HETEDIK KÖR: a 42 új vezetéknév a GELBESEITEN-en — 2026-08-08
--
-- A hatodik körben 42 orthográfiailag egyértelmű magyar vezetéknévvel bővült a
-- szűrő elfogadó listája. Ezeket a neveket a gelbeseiten.de-n SOHA nem
-- kérdeztem le — az külön adatbázis, tehát elvileg új halmaz.
--
-- ⚠️ A MÉRÉS AZT MONDJA: EZ A FORRÁS KIMERÜLT.
--   60 lekérdezés → 580 nyers → 29 jelölt → 17 dedup után → 4 felvett cég.
-- Összevetésül ugyanez a 11880-on: 128 lekérdezés → 2056 nyers → 25 felvett.
-- A gelbeseiten tehát MAGÁRA A NÉVRE is kevés találatot ad (átlag 10 tétel
-- lekérdezésenként, a 11880 16-ja helyett), és amit ad, azt nagyrészt már
-- ismerjük: a 29 jelöltből 12 MÁR BENT VOLT.
--
-- ⚠️ 17 jelöltből 4 VÉGLEGESEN BEZÁRT (23,5%) — a legmagasabb arány az összes
-- eddigi körben. Ez is a forrás elöregedésére utal.
--
-- Következtetés a következő körnek: a gelbeseiten NÉV-tengelye lezárva. Ami
-- marad: a 11880 város-bontása az ÚJ nevekre, vagy egy harmadik cégjegyzék.
--
-- ⚠️ A magyar nyelvű kiszolgálás itt sincs ellenőrizve: NINCS ELLENŐRIZVE,
-- verified = 0. Koordináták Nominatimból, utca-szintűek.

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de7-malermeister-christian-anders-rigo-eifler', 'Malermeister Christian Anders & Rigo Eifler', 'festo', 'Szobafestő / Tapétázó', 'Sandstr. 65, 40878 Ratingen (West)', '+49 2102 5796393', 'Szobafestés, mázolás Ratingen környékén.', '["Német"]', 51.2980894, 6.8349652, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-gelbeseiten2-2026-08-08', 'DE', 'NW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de7-rigo-scharschmidt', 'Rigo Scharschmidt', 'gazvez', 'Víz-gáz szerelő', 'Alte Dorfstr. 59A, 09456 Annaberg-Buchholz (Geyersdorf)', '+49 3733 500480', 'Víz- és gázszerelés Annaberg-Buchholz környékén.', '["Német"]', 50.5868933, 13.0392979, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-gelbeseiten2-2026-08-08', 'DE', 'SN')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de7-fahrrad-graf-e-k', 'Fahrrad Graf e.K', 'kerekpar', 'Kerékpárszerviz', 'Zeppelinstr. 1, 78244 Gottmadingen', '+49 7731 62227', 'Kerékpárszerviz Gottmadingen környékén.', '["Német"]', 47.7362647, 8.7888816, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-gelbeseiten2-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de7-praxis-fur-podologie-ramona-herczeg', 'Praxis für Podologie Ramona Herczeg', 'pedikur', 'Pedikűr / Lábápolás', 'Sodener Str. 28, 61476 Kronberg im Taunus (Oberhöchstadt)', '+49 6173 9667640', 'Pedikűr és lábápolás Kronberg im Taunus környékén.', '["Német"]', 50.1813411, 8.5393754, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-gelbeseiten2-2026-08-08', 'DE', 'HE')
ON CONFLICT(id) DO NOTHING;
