-- GB — KISIPAR AZ OPENSTREETMAPBŐL: 1 tétel — 2026-08-08
--
-- Ugyanaz a kör, mint az `db/at-kisipar-osm-2026-08-08.sql` — a módszertan és a
-- két mért Overpass-csapda ott van leírva.
--
-- ⚠️⚠️ CSAK ANGLIA. A szaknévsor GB-ága kizárólag angliai tételt fogad el;
-- skót, walesi és észak-ír bejegyzés TILOS, mert a régiószűrő némán elnyelné.
-- Ez a tétel londoni (W5 1UP), a régiókód kézzel ellenőrizve: LDN.
--
-- ⚠️ A magyar nyelvű kiszolgálás itt sincs ellenőrizve: NINCS ELLENŐRIZVE,
-- verified = 0. Koordináta Nominatimból, utca-szintű.

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('osmgb-thomas-nagy-ltd', 'Thomas Nagy LTD', 'villany', 'Villanyszerelő', 'West Gate Unit 3, W5 1UP London', '+44 800 011 2876', 'Villanyszerelés a környék környékén.', '["Angol"]', 51.5315751, -0.2999144, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-osm-kisipar-2026-08-08', 'GB', 'LDN')
ON CONFLICT(id) DO NOTHING;
