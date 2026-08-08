-- CH — KISIPAR: 14 tétel a search.ch-ról — 2026-08-08
--
-- A német név-tengely learatása után Svájc a legnagyobb rés (401 tétel, a
-- kisipar gyakorlatilag nulla). A cégjegyzékek viszont zárva vannak:
--   local.ch  → HTTP 403 (bot-védelem, mindkét kereső-útvonalon)
--   herold.at / firmen.wko.at / firmenabc.at → AT-ra sem járható
-- Marad a search.ch. Az viszont TELEFONKÖNYV, nem cégjegyzék.
--
-- ⚠️⚠️ EZÉRT A MAGÁNSZEMÉLY-SZŰRÉS KÉT FÜGGETLEN JELRE ÉPÜL, és mindkettő kell:
--   1. van szakma-megjelölés (`.tel-categories`) — magánszemélynél NINCS
--   2. `data-entrytype="Business"` a telefonszám-linken
-- Mérve: „Dr Perrelet-Szabo Isabelle" (magánszemély) egyiket sem hordozza, a
-- „Szabo Haustechnik" mindkettőt. A teljes körben 2133 nyers tételből
-- 1775 magánszemély/jelöletlen esett ki — a szűrő végzi a munka nagyját.
-- Magánszemély lakcíme és telefonja SOHA nem kerülhet a szaknévsorba.
--
--   90 lekérdezés × 5 oldal → 2133 nyers → 26 jelölt → 19 dedup után
--   → 14 felvett cég.
--
-- ⭐ A SVÁJCI ADAT MINŐSÉGE ÉRZÉKELHETŐEN JOBB a németnél: 19 jelöltből 16 volt
-- egyértelmű és nyitva, és NULLA véglegesen bezárt. Összevetésül a német
-- körökben ez 8-24% volt.
--
-- ⭐ A KANTON-KÓD KÉSZEN JÖN a forrásból (`.region`), tehát itt NINCS
-- irányítószám → régió térkép. Épp az a lépés okozott két mért hibát a német
-- oldalon (Zweibrücken, Lindau).
--
-- ⚠️ A LAPOZÓ PARAMÉTER `pos`, nem `start`/`page`/`pageNumber`: a másik három
-- NÉMÁN ugyanazt az első oldalt adja vissza, tehát a futás többször aratja le
-- ugyanazt a 10 tételt, és nagyobb találatszámot jelent, mint amennyi valóban
-- van. A „Mehr" gomb sem lapoz — az egy menü.
--
-- ⚠️ SVÁJC NEM EGYNYELVŰ. A `languages` mező a KANTON szerint kap Francia
-- (GE/VD/NE/JU/FR/VS) vagy Olasz (TI) értéket — egy genfi szakembernél a
-- „Német" egyszerűen valótlan. A vegyes kantonok a többségi nyelv szerint
-- vannak besorolva, mert tétel-szinten nincs jobb adatunk.
--
-- ⚠️ A magyar nyelvű kiszolgálás itt sincs ellenőrizve: NINCS ELLENŐRIZVE,
-- verified = 0. „Magyar" csak akkor kerül a nyelvek közé, ha a cégnévben
-- magyar KERESZTNÉV is van.
--
-- Koordináták Nominatimból, mind utca-szintű.

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('ch2-takacs-partner-ag', 'Takacs + Partner AG', 'asztalos', 'Asztalos', 'Madetswilerstrasse 39, 8332 Russikon', '+41 44 954 07 66', 'Asztalos- és bútormunkák Russikon környékén.', '["Német"]', 47.3978938, 8.7801938, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-ch-searchch-2026-08-08', 'CH', 'ZH')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('ch2-szabo-serge', 'Szabo Serge', 'festo', 'Szobafestő / Tapétázó', 'Route de Jussy 290, 1254 Jussy', '+41 79 251 18 03', 'Szobafestés, mázolás Jussy környékén.', '["Francia"]', 46.2349098, 6.2619389, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-ch-searchch-2026-08-08', 'CH', 'GE')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('ch2-racz-petin-malerei', 'Rácz-Petin Malerei', 'festo', 'Szobafestő / Tapétázó', 'Wislenstrasse 5, 9467 Frümsen', '+41 79 601 62 45', 'Szobafestés, mázolás Frümsen környékén.', '["Német"]', 47.2428158, 9.4689788, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-ch-searchch-2026-08-08', 'CH', 'SG')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('ch2-malergeschaft-rash', 'Malergeschäft Rash', 'festo', 'Szobafestő / Tapétázó', 'Kesselweg 17, 4410 Liestal', '+41 61 921 00 33', 'Szobafestés, mázolás Liestal környékén.', '["Német"]', 47.4939721, 7.7264928, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-ch-searchch-2026-08-08', 'CH', 'BL')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('ch2-maler-matyas-gmbh', 'Maler Matyas GmbH', 'festo', 'Szobafestő / Tapétázó', 'Burgstrasse 75, 8610 Uster', '+41 44 941 08 17', 'Szobafestés, mázolás Uster környékén.', '["Német"]', 47.3411389, 8.7262018, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-ch-searchch-2026-08-08', 'CH', 'ZH')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('ch2-varga-constructions-sarl', 'Varga Constructions Sàrl', 'gazvez', 'Víz-gáz szerelő', 'Rue des Sapins 3, 2610 St-Imier', '+41 79 125 99 08', 'Víz- és gázszerelés St-Imier környékén.', '["Német"]', 47.1542379, 7.0041726, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-ch-searchch-2026-08-08', 'CH', 'BE')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('ch2-woehrle-nagy-gmbh', 'Woehrle & Nagy GmbH', 'gazvez', 'Víz-gáz szerelő', 'Dürrenmattweg 54, 4123 Allschwil', '+41 61 481 45 37', 'Víz- és gázszerelés Allschwil környékén.', '["Német"]', 47.5538662, 7.549856, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-ch-searchch-2026-08-08', 'CH', 'BL')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('ch2-gartenpflege-szabo', 'Gartenpflege Szabo', 'kertesz', 'Kertészet', 'Oberwilerstrasse 34, 4107 Ettingen', '+41 61 402 16 64', 'Kertészet és kertfenntartás Ettingen környékén.', '["Német"]', 47.4874021, 7.5515675, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-ch-searchch-2026-08-08', 'CH', 'BL')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('ch2-kurszentrum-der-kundenschlosserei-b-nagy-metal', 'Kurszentrum der Kundenschlosserei B. Nagy Metallbau', 'lakatos', 'Lakatos', 'Bärenmattenstrasse 10, 4434 Hölstein', '+41 76 604 87 05', 'Lakatos- és zárszerelő munkák Hölstein környékén.', '["Német"]', 47.4407493, 7.7633719, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-ch-searchch-2026-08-08', 'CH', 'BL')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('ch2-balogh-design', 'balogh Design', 'lakberendezes', 'Belsőépítészet', 'Walchstrasse 15, 3073 Gümligen', '+41 79 768 73 04', 'Belsőépítészet és lakberendezés Gümligen környékén.', '["Német"]', 46.9367003, 7.5124612, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-ch-searchch-2026-08-08', 'CH', 'BE')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('ch2-manikure-massage-fusspflege-a-nagy', 'Maniküre Massage Fusspflege A. Nagy', 'pedikur', 'Pedikűr / Lábápolás', 'Steinbühlweg 56, 4123 Allschwil', '+41 76 326 08 35', 'Pedikűr és lábápolás Allschwil környékén.', '["Német"]', 47.5495344, 7.5536741, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-ch-searchch-2026-08-08', 'CH', 'BL')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('ch2-bognar-reinigungen-gmbh', 'Bognar Reinigungen GmbH', 'takarito', 'Takarítás', 'Eptingerstrasse 41, 4132 Muttenz', '+41 61 811 54 20', 'Takarítás és épülettisztítás Muttenz környékén.', '["Német"]', 47.5279529, 7.6532304, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-ch-searchch-2026-08-08', 'CH', 'BL')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('ch2-horvath-bestattungen-gmbh', 'Horvath Bestattungen GmbH', 'temetkezes', 'Temetkezés', 'Unterer Mattenweg 11, 3920 Zermatt', '+41 27 967 51 61', 'Temetkezési szolgáltatás Zermatt környékén.', '["Francia"]', 46.024265, 7.7505076, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-ch-searchch-2026-08-08', 'CH', 'VS')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('ch2-schneiderei-saboo', 'Schneiderei SABOO', 'varrono', 'Varrónő', 'Heinrich-Federerstrasse 4, 9500 Wil', '+41 76 719 37 13', 'Ruhajavítás és -igazítás Wil környékén.', '["Német"]', 47.4571734, 9.0516547, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-ch-searchch-2026-08-08', 'CH', 'SG')
ON CONFLICT(id) DO NOTHING;
