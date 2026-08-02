-- Chimney Cake Marbella — kürtőskalács-sütöde — 2026-08-02
-- 3. célzott ES-kör: 120 lekérdezés (20 új város) → 67 azonosított hely → 2 magyar
-- jelölt → 1 új (a Hungaro Market a DEDUP-ellenőrzésen fennakadt, már bent volt).
-- ⚠️ ORSZÁG-SZIVÁRGÁS ismét: OLASZORSZÁG, KOLUMBIA és maga BUDAPEST is bejött
-- a találatok közé — a cím országát minden tételnél ellenőrizni kell.

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('es-imp-chimney-cake-marbella', 'Chimney Cake Marbella', 'cukrasz', 'Cukrász / Torták', 'Calle Sevillano 23, 29602 Marbella, Málaga', '+34 669 11 65 63', 'Kürtőskalács-sütöde Marbellában.', '["Magyar"]', 47.3769, 8.5417, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'ES', NULL)
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
