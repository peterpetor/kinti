-- db/seed-precise.sql — VALÓDI magyar szervezetek PONTOS (házszám-szintű) címmel.
-- Minden cím hivatalos forrásból, és Nominatim-mal házszám-szintre ELLENŐRIZVE
-- (a lat/lng a geokódolt, precíz koordináta). Nulla kitalált adat.
-- Alkalmazás:  printf 'y\n' | wrangler d1 execute kinti-db --remote --file=./db/seed-precise.sql

INSERT OR IGNORE INTO categories (id, label, glyph, sort_order) VALUES ('magyar-kozosseg', 'Magyar közösség / egyesület', '🇭🇺', 900);

-- ===== ÚJ, precíz-címes szervezetek (moderation_status=1, claimed=0) =====

-- AT — Collegium Hungaricum Wien (Liszt Intézet)
INSERT OR IGNORE INTO businesses (id, name, category_id, category_label, address, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, source, country_code, canton_code)
VALUES ('precise-at-collegium-hungaricum-wien', 'Collegium Hungaricum Wien (Liszt Intézet)', 'magyar-kozosseg', 'Kulturális intézet', 'Hollandstraße 4, 1020 Wien', 'Magyar kulturális intézet · Bécs · culture.hu/de/wien', '["Magyar"]', 48.2149394, 16.3764072, 50, 50, 0, 0, 0, 0, 1, 0, 0, 'seed-precise', 'AT', 'W');

-- CH — Zürichi Magyar Misszió
INSERT OR IGNORE INTO businesses (id, name, category_id, category_label, address, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, source, country_code, canton_code)
VALUES ('precise-ch-zurichi-magyar-misszio', 'Zürichi Magyar Misszió', 'magyar-kozosseg', 'Magyar misszió', 'Winterthurerstrasse 135, 8057 Zürich', 'Magyar közösségi és lelki misszió · Zürich · magyar-misszio.ch', '["Magyar"]', 47.3943760, 8.5447762, 50, 50, 0, 0, 0, 0, 1, 0, 0, 'seed-precise', 'CH', 'ZH');

-- NL — Magyar katolikus szentmise, Hága (Heilige Familiekerk)
INSERT OR IGNORE INTO businesses (id, name, category_id, category_label, address, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, source, country_code, canton_code)
VALUES ('precise-nl-szentmise-haga', 'Magyar katolikus szentmise – Hága', 'magyar-kozosseg', 'Katolikus szentmise', 'Kamperfoelieplein 29, 2563 HX Den Haag', 'Heilige Familiekerk · magyar nyelvű katolikus szentmise · Hága', '["Magyar"]', 52.0724831, 4.2679469, 50, 50, 0, 0, 0, 0, 1, 0, 0, 'seed-precise', 'NL', 'ZH');

-- DE — Magyar katolikus szentmise-helyek (Münster–Hildesheim–Osnabrück–Paderborn Misszió, ungmis.de)
INSERT OR IGNORE INTO businesses (id, name, category_id, category_label, address, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, source, country_code, canton_code)
VALUES ('precise-de-szentmise-menden', 'Magyar katolikus szentmise – Menden', 'magyar-kozosseg', 'Katolikus szentmise', 'An der Heilig-Kreuz-Kirche 9, 58706 Menden', 'Szent Kereszt templom · Magyar Katolikus Misszió · ungmis.de', '["Magyar"]', 51.4312316, 7.8052627, 50, 50, 0, 0, 0, 0, 1, 0, 0, 'seed-precise', 'DE', 'NW');
INSERT OR IGNORE INTO businesses (id, name, category_id, category_label, address, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, source, country_code, canton_code)
VALUES ('precise-de-szentmise-dortmund', 'Magyar katolikus szentmise – Dortmund', 'magyar-kozosseg', 'Katolikus szentmise', 'Rabenstraße 18, 44143 Dortmund', 'Szent Meinolfus templom · Magyar Katolikus Misszió · ungmis.de', '["Magyar"]', 51.5193155, 7.5247729, 50, 50, 0, 0, 0, 0, 1, 0, 0, 'seed-precise', 'DE', 'NW');
INSERT OR IGNORE INTO businesses (id, name, category_id, category_label, address, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, source, country_code, canton_code)
VALUES ('precise-de-szentmise-marl', 'Magyar katolikus szentmise – Marl', 'magyar-kozosseg', 'Katolikus szentmise', 'Hervester Straße 57, 45768 Marl', 'Mária-kórház kápolnája · Magyar Katolikus Misszió · ungmis.de', '["Magyar"]', 51.6523795, 7.0839609, 50, 50, 0, 0, 0, 0, 1, 0, 0, 'seed-precise', 'DE', 'NW');
INSERT OR IGNORE INTO businesses (id, name, category_id, category_label, address, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, source, country_code, canton_code)
VALUES ('precise-de-szentmise-bielefeld', 'Magyar katolikus szentmise – Bielefeld', 'magyar-kozosseg', 'Katolikus szentmise', 'Josefstraße 14a, 33602 Bielefeld', 'Szent József templom · Magyar Katolikus Misszió · ungmis.de', '["Magyar"]', 52.0318078, 8.5413368, 50, 50, 0, 0, 0, 0, 1, 0, 0, 'seed-precise', 'DE', 'NW');
INSERT OR IGNORE INTO businesses (id, name, category_id, category_label, address, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, source, country_code, canton_code)
VALUES ('precise-de-szentmise-neukirchen-vluyn', 'Magyar katolikus szentmise – Neukirchen-Vluyn', 'magyar-kozosseg', 'Katolikus szentmise', 'Vluyner Nordring 60, 47506 Neukirchen-Vluyn', 'Szent Antal templom · Magyar Katolikus Misszió · ungmis.de', '["Magyar"]', 51.4418846, 6.5348887, 50, 50, 0, 0, 0, 0, 1, 0, 0, 'seed-precise', 'DE', 'NW');
INSERT OR IGNORE INTO businesses (id, name, category_id, category_label, address, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, source, country_code, canton_code)
VALUES ('precise-de-szentmise-osnabruck', 'Magyar katolikus szentmise – Osnabrück', 'magyar-kozosseg', 'Katolikus szentmise', 'Knappsbrink 50, 49080 Osnabrück', 'Szent Pius templom · Magyar Katolikus Misszió · ungmis.de', '["Magyar"]', 52.2575272, 8.0397004, 50, 50, 0, 0, 0, 0, 1, 0, 0, 'seed-precise', 'DE', 'NI');
INSERT OR IGNORE INTO businesses (id, name, category_id, category_label, address, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, source, country_code, canton_code)
VALUES ('precise-de-szentmise-hannover', 'Magyar katolikus szentmise – Hannover', 'magyar-kozosseg', 'Katolikus szentmise', 'Stöckener Straße 43, 30419 Hannover', 'Szent Adalbert templom · Magyar Katolikus Misszió · ungmis.de', '["Magyar"]', 52.3988241, 9.6701788, 50, 50, 0, 0, 0, 0, 1, 0, 0, 'seed-precise', 'DE', 'NI');
INSERT OR IGNORE INTO businesses (id, name, category_id, category_label, address, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, source, country_code, canton_code)
VALUES ('precise-de-szentmise-bocholt', 'Magyar katolikus szentmise – Bocholt', 'magyar-kozosseg', 'Katolikus szentmise', 'Breslauer Straße 24, 46397 Bocholt', 'Szent Pál templom · Magyar Katolikus Misszió · ungmis.de', '["Magyar"]', 51.8390409, 6.6417943, 50, 50, 0, 0, 0, 0, 1, 0, 0, 'seed-precise', 'DE', 'NW');
INSERT OR IGNORE INTO businesses (id, name, category_id, category_label, address, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, source, country_code, canton_code)
VALUES ('precise-de-szentmise-munster', 'Magyar katolikus szentmise – Münster', 'magyar-kozosseg', 'Katolikus szentmise', 'Elbestraße 7, 48145 Münster', 'Pius templom · Magyar Katolikus Misszió · ungmis.de', '["Magyar"]', 51.9694633, 7.6578588, 50, 50, 0, 0, 0, 0, 1, 0, 0, 'seed-precise', 'DE', 'NW');

-- ===== MEGLÉVŐ (város-szintű) bejegyzés PONTOSÍTÁSA precíz címre =====
UPDATE businesses SET address = 'Dorotheenstraße 12, 10117 Berlin', lat = 52.5194238, lng = 13.3944978, updated_at = datetime('now')
 WHERE name = 'Collegium Hungaricum Berlin (Liszt Intézet)';
