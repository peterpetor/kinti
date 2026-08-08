-- CH — KISIPAR AZ OSM-BŐL: 1 tétel — 2026-08-08
--
-- Ugyanaz a kör, mint a `db/de-kisipar-osm-2026-08-08.sql` — a módszertan és a
-- szóhatáros szűrő mérése ott van leírva.
--
-- ⚠️ AZ OSM NEM AD KANTON-KÓDOT (a search.ch igen). Ezt a tételt ezért kézzel,
-- ellenőrzött irányítószám alapján soroltam be: 8880 Walenstadt → St. Gallen.
-- Ne tippelj kantont: a régiószűrő némán elnyeli a hibás tételt.
--
-- ⚠️ A magyar nyelvű kiszolgálás itt sincs ellenőrizve: NINCS ELLENŐRIZVE,
-- verified = 0. Koordináta Nominatimból, utca-szintű.

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('osmch-cafe-varga', 'Café Varga', 'pek', 'Pék', 'Rathausplatz 5, 8880 Walenstadt', '+41 81 735 20 20', 'Pékség Walenstadt környékén.', '["Német"]', 47.1241365, 9.3151534, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-osm-kisipar2-2026-08-08', 'CH', 'SG')
ON CONFLICT(id) DO NOTHING;
