-- ÚJ tételek — 2026-08-02
--   ES: KÜRTŐS & COFFEE (kürtőskalács-sütöde, Málaga belváros)
--   GB: Budapest Cafe (magyar étterem/kávézó, Bristol Clifton)
--
-- ⚠️⚠️ CSAK EZ A KÉT INSERT MEHET KI. A teljes scripts/import_businesses.sql
-- `ON CONFLICT(id) DO UPDATE SET ... blurb=excluded.blurb, phone=excluded.phone`
-- záradékkal megy MINDEN csv-import forrású cégre — vagyis VISSZACSINÁLNÁ a ma
-- D1-ben pótolt 16 elérhetőséget, mert a CSV-ben azok a mezők üresek.
-- Ha valaha a TELJES importot futtatod, ELŐBB írd vissza a kontaktokat a CSV-be.

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('es-imp-kurtos-coffee-kurtoskalacs-malaga', 'KÜRTŐS & COFFEE — kürtőskalács, Málaga', 'cukrasz', 'Cukrász / Torták', 'Calle Calderón de la Barca 2, Distrito Centro, 29005 Málaga', NULL, 'Kürtőskalács-sütöde és kávézó Málaga belvárosában. · www.instagram.com/kurtoscoffee', '["Magyar"]', 47.3769, 8.5417, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'ES', NULL)
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('gb-imp-budapest-cafe-bristol', 'Budapest Cafe — Bristol', 'etterem', 'Étterem', '58 Alma Vale Road, Clifton, Bristol BS8 2HS', '+44 7475 384539', 'Magyar étterem és kávézó Bristol Clifton negyedében. · budapestcafe.co.uk', '["Magyar"]', 47.3769, 8.5417, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'GB', NULL)
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
