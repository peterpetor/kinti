-- CH — MINDENNAPI KISIPARI SZAKMÁK: 14 új tétel — 2026-08-07
--
-- A német kör (db/de-kisipar-2026-08-07.sql) módszerének svájci futtatása.
-- FORRÁS: search.ch (svájci telefonkönyv), 40 magyar keresztnévre, országosan.
--
-- ⚠️⚠️ A search.ch TELEFONKÖNYV, tehát MAGÁNSZEMÉLYEKET is listáz: 1235 sorból
-- csak 206 volt cég. Magánlakcímet és magánszámot SOHA nem viszünk be a
-- szaknévsorba — a szűrő a találati kártya data-entrytype="Business" attribútuma.
--
-- ⚠️ ORSZÁG-SPECIFIKUS HAMIS POZITÍVOK, amiket kézzel kellett kiszórni:
--   "Norbert"  — teljesen szokványos német/svájci keresztnév (5 találat)
--   "REKA"     — ismert SVÁJCI MÁRKA (Schweizer Reisekasse): REKA Services AG,
--                Garage Reka, Reka Automobile — egyik sem magyar
--   "Bela"     — német és szláv névként is él
--
-- HITELESÍTÉS Google Maps-en, ugyanúgy mint a német körben. 22 jelöltből
-- 14 megerősítve, 1 véglegesen bezárt (Katalin's Beauty Bar), 7-et a Maps nem
-- ismer. A rövidebb kulcsú újrapróbálás CH-ban NEM segített (1/7, és az az egy
-- is MÁS cég volt: "Zsolt Mezö" helyett "EM Bodenbeläge AG").
--
-- ⭐ FÜGGETLEN VISSZAIGAZOLÁS: a Maps két tételt TELJES MAGYAR ÉKEZETTEL hoz
-- vissza — "Laszlo Csako GmbH" -> "László Csákó GmbH", "Sándor Clean Solution".
-- Ez erősebb jel, mint a puszta névalapú következtetés.
--
-- ⚠️ A magyar nyelvű kiszolgálás itt sincs ellenőrizve: verified = 0.
--
-- Koordináták Nominatimból, mind a 14 utca-szintű. A kanton a cím végi
-- rövidítésből, ahol nincs, irányítószám-tartományból.

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('ch-sola-massage-bela-feher', 'SOLA Massage Béla Fehér', 'masszazs', 'Masszázs', 'Einsiedlerstrasse 21, 8834 Schindellegi SZ', '+41 76 746 40 11', 'Egészség- és sportmasszázs Schindellegi környékén.', '["Magyar","Német"]', 47.169616, 8.7178587, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-ch-cegjegyzek-2026-08', 'CH', 'SZ')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('ch-reka-wein-mehr', 'Réka wein&mehr', 'etterem', 'Étterem', 'Gerbergasse 1, 9220 Bischofszell TG', '+41 76 683 11 84', 'Étterem és borkereskedés Bischofszell környékén.', '["Magyar","Német"]', 47.4934936, 9.24157, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-ch-cegjegyzek-2026-08', 'CH', 'TG')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('ch-gabor-tunde-maler-und-trockenbau-gmbh', 'Gabor&Tünde Maler und Trockenbau GmbH', 'festo', 'Szobafestő / Tapétázó', 'Chamerstrasse 72B, 6300 Zug', '+41 77 937 31 61', 'Szobafestés, mázolás, tapétázás Zug környékén.', '["Magyar","Német"]', 47.1766654, 8.5011493, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-ch-cegjegyzek-2026-08', 'CH', 'ZG')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('ch-kantor-janos', 'Kantor, Janos', 'festo', 'Szobafestő / Tapétázó', 'Luzernerstrasse 109, 6014 Luzern', '+41 41 250 52 72', 'Szobafestés, mázolás, tapétázás Luzern környékén.', '["Magyar","Német"]', 47.0505398, 8.2701995, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-ch-cegjegyzek-2026-08', 'CH', 'LU')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('ch-horvath-laszlo', 'Horvath, Laszlo', 'gepijarmu_oktato', 'Autósiskola / Oktató', 'Brunnmattstrasse 12, 6048 Horw LU', '+41 79 448 01 12', 'Autósiskola, vezetéstanítás Horw környékén.', '["Magyar","Német"]', 47.0142258, 8.3092904, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-ch-cegjegyzek-2026-08', 'CH', 'LU')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('ch-ambrus-gartenpflege', 'Ambrus Gartenpflege', 'kertesz', 'Kertészet', 'Lächlerstrasse 59, 8634 Hombrechtikon ZH', '+41 76 237 28 90', 'Kertgondozás Hombrechtikon környékén.', '["Magyar","Német"]', 47.2491471, 8.7575011, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-ch-cegjegyzek-2026-08', 'CH', 'ZH')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('ch-visiontrans-by-balazs-zsolnai-umzug-entsorgung', 'Visiontrans by Balazs Zsolnai', 'koltoztetes', 'Költöztetés', 'Fahrbachweg 8C, 5444 Künten AG', '+41 79 170 30 51', 'Költöztetés és lomtalanítás Künten környékén.', '["Magyar","Német"]', 47.3880036, 8.3325333, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-ch-cegjegyzek-2026-08', 'CH', 'AG')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('ch-k-model-art-inh-attila-kasza', 'K-MODEL ART inh. ATTILA KASZA', 'lakasfelujitas', 'Lakásfelújítás / Kivitelezés', 'Floraweg 7, 8200 Schaffhausen', '+41 77 406 72 39', 'Lakásfelújítás és átépítés Schaffhausen környékén.', '["Magyar","Német"]', 47.7106424, 8.6289104, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-ch-cegjegyzek-2026-08', 'CH', 'SH')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('ch-laszlo-csako-gmbh', 'Laszlo Csako GmbH', 'lakatos', 'Lakatos', 'Eisenbahnstrasse 14, 3360 Herzogenbuchsee BE', '+41 32 682 56 74', 'Precíziós fémmegmunkálás, köszörülés Herzogenbuchsee környékén.', '["Magyar","Német"]', 47.1959489, 7.706305, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-ch-cegjegyzek-2026-08', 'CH', 'BE')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('ch-csernay-katalin', 'Csernay, Katalin', 'pedikur', 'Pedikűr / Lábápolás', 'Rathausgasse 9, 5000 Aarau AG', '+41 76 391 19 00', 'Lábápolás, podológia Aarau környékén.', '["Magyar","Német"]', 47.39308, 8.043568, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-ch-cegjegyzek-2026-08', 'CH', 'AG')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('ch-sandor-clean-solution', 'Sándor Clean Solution', 'takarito', 'Takarítás', 'Erlenweg 1, 6417 Sattel SZ', '+41 76 204 85 76', 'Épülettakarítás Sattel környékén.', '["Magyar","Német"]', 47.074996, 8.6321857, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-ch-cegjegyzek-2026-08', 'CH', 'SZ')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('ch-adriana-reinigung-inh-wajkai-istvan-szabolcs', 'Adriana Reinigung Inh. Wajkai Istvan Szabolcs', 'takarito', 'Takarítás', 'Sonnhaldenstrasse 11, 4950 Huttwil BE', '+41 62 962 06 00', 'Épülettakarítás Huttwil környékén.', '["Magyar","Német"]', 47.1160129, 7.8466846, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-ch-cegjegyzek-2026-08', 'CH', 'BE')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('ch-rm-miklos-gmbh', 'RM Miklos GmbH', 'takarito', 'Takarítás', 'Rössligasse 32, 4125 Riehen BS', '+41 61 534 80 19', 'Épülettakarítás Riehen környékén.', '["Magyar","Német"]', 47.5857549, 7.6523817, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-ch-cegjegyzek-2026-08', 'CH', 'BS')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('ch-taxis-sandor-sarl', 'Taxis Sandor Sàrl', 'taxis', 'Taxis / Sofőr', 'Promenade de Castellane 14, 1110 Morges VD', '+41 21 801 71 12', 'Taxi és személyszállítás Morges környékén.', '["Magyar","Német"]', 46.5114283, 6.494999, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-ch-cegjegyzek-2026-08', 'CH', 'VD')
ON CONFLICT(id) DO NOTHING;
