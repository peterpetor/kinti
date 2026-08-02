-- A `szepseg` KATEGÓRIA-ALIAS HIBA javítása — 2026-08-02
--
-- ⚠️ A CSV-import a `szepseg` értéket NÉMÁN ELDOBTA: a CSV-ben az ALIAS
-- `kozmetikus`, a `szepseg` a DB-oldali kategória-ID. Két tétel emiatt
-- egyszerűen nem került be, hibaüzenet nélkül — ugyanaz a hibaosztály, amit a
-- runbook az `elelmiszer`/`autoszer` aliasokra dokumentál.
--
-- TANULSÁG: import után MINDIG vesd össze a várt és a tényleges darabszámot
-- ORSZÁGONKÉNT — a szkript kimenete kiírja, és a néma eldobás csak így látszik.

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('gb-imp-piercings-by-vesty-belfast', 'Piercings by Vesty — Belfast', 'szepseg', 'Kozmetikus', '24 Rosemary Street, Belfast BT1 1QD', '+44 7702 777688', 'Magyar piercing- és testékszer-stúdió Belfast belvárosában.', '["Magyar"]', 47.3769, 8.5417, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'GB', NULL)
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('es-imp-akos-clinica-medico-estetica-valencia', 'ÁKOS Clínica Médico Estética — Valencia', 'szepseg', 'Kozmetikus', 'Carrer de Rascanya 26, Campanar, 46015 Valencia', '+34 660 84 15 26', 'Magyar vezetésű esztétikai orvosi rendelő Valenciában.', '["Magyar"]', 47.3769, 8.5417, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'ES', NULL)
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
