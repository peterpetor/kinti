-- KISIPAR AZ OSM-BŐL, MÁSODIK KÖR: DE + CH — 2026-08-08
--
-- Az első kör (AT/NL/GB) után a hiányzó országok. A módszertan és a két mért
-- Overpass-csapda az `db/at-kisipar-osm-2026-08-08.sql` fejlécében van.
--
--   CH  10 nyers OSM-elem →  4 elérhetőséggel
--   DE 193 nyers OSM-elem → 124 elérhetőséggel
--   ES  HTTP 504 (kétszer) — a spanyol terület-lekérdezés következetesen
--       túl nehéz az Overpassnak; ez nem adathiány, hanem szolgáltatás-korlát.
--   128 → 8 jelölt → 6 dedup után → 3 felvett cég (DE 2, CH 1).
--
-- ⚠️⚠️ EZ A KÖR MÉRTE MEG, MENNYIT ÉR A SZÓHATÁROS SZŰRŐ: 128 találatból
-- 120-at elutasított, és MINDEGYIK részlánc-egyezés volt, nem magyar cég:
--   „Biroma" ← Biro          „Gilles"/„Achilles"/„Spilles" ← Illes
--   „Salvamoser" ← Vamos     „Pappe"/„Pappert"/„Papperts" ← Papp
--   „Farkasch" ← Farkas
-- Szóhatár nélkül MIND A 120 bekerült volna a szaknévsorba magyar cégként.
-- Az Overpass regexe ugyanis részláncra illeszt, tehát a forrás-oldali szűrés
-- ÖNMAGÁBAN SOSEM ELÉG.
--
-- ⚠️ A magyar nyelvű kiszolgálás itt sincs ellenőrizve: NINCS ELLENŐRIZVE,
-- verified = 0. Koordináták Nominatimból, utca-szintűek.

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('osmde-anton-kovacs-kunsttischlerei', 'Anton Kovacs Kunsttischlerei', 'asztalos', 'Asztalos', 'Potsdamer Straße 34, 37412 Herzberg am Harz', '+49 5521 6186', 'Asztalos- és bútormunkák Herzberg am Harz környékén.', '["Német"]', 51.6128929, 10.3169778, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-osm-kisipar2-2026-08-08', 'DE', 'NI')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('osmde-holzbau-molnar', 'Holzbau Molnar', 'asztalos', 'Asztalos', 'Jan-Kilian-Straße 6, 02627 Oberkotitz - Hornje Kotecy', '+49 1525 2009351', 'Asztalos- és bútormunkák Oberkotitz - Hornje Kotecy környékén.', '["Német"]', 51.1839533, 14.6194083, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-osm-kisipar2-2026-08-08', 'DE', 'SN')
ON CONFLICT(id) DO NOTHING;
