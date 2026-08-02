-- ÚJ GB tételek a magyarok.co.uk közösségi cégjegyzékből — 2026-08-02
--
-- FORRÁS: magyarok.co.uk/directory — brit magyar közösségi cégjegyzék.
-- 23 tételéből 17 volt új nálunk; ebből 7 ment be.
--
-- ⚠️ AMIT KIHAGYTAM ÉS MIÉRT: háromnál a Google Maps MÁS NEVET ad ugyanarra a
-- címre (ABC Dentistry→Twelve Dental, Dr Erdélyi→mydentist lánc, Dr Bátorfi→
-- London Dental Implant). A név-változás ugyanazon a címen GAZDACSERE-jel, és
-- azzal a magyar kötődés is elszállhat — pozitív bizonyíték nélkül nem veszem
-- fel. Továbbá 7 tételt a Maps egyáltalán nem erősített meg (mobil-alapú
-- egyéni vállalkozók, akik nem POI-k) — azok később, külön ellenőrzéssel.
--
-- ⚠️ CSAK EZEK az INSERT-ek mennek ki, a TELJES import NEM (az UPSERT-elné a
-- blurb/phone mezőket minden csv-import forrású cégnél).

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('gb-imp-goulash-magyar-etterem-aberdeen', 'Goulash — magyar étterem, Aberdeen', 'etterem', 'Étterem', '17 Adelphi, Aberdeen AB11 5BL', '+44 1224 210530', 'Magyar étterem Aberdeen belvárosában.', '["Magyar"]', 47.3769, 8.5417, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'GB', NULL)
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('gb-imp-belfastabc-magyar-elelmiszerbolt', 'BelfastABC — magyar élelmiszerbolt', 'elelmiszer', 'Élelmiszerbolt', '100 Great Victoria Street, Belfast BT2 7BE', '+44 28 9043 4123', 'Magyar és kelet-európai élelmiszerbolt Belfast központjában.', '["Magyar"]', 47.3769, 8.5417, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'GB', NULL)
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('gb-imp-smile-dental-care-clinic-worcester', 'Smile Dental Care Clinic — Worcester', 'fogorvos', 'Fogorvos', '1 Bromyard Road, St John''s, Worcester WR2 5BS', '+44 1905 422530', 'Magyarul is elérhető fogászati rendelő Worcesterben.', '["Magyar"]', 47.3769, 8.5417, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'GB', NULL)
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('gb-imp-dove-dental-cambridge', 'Dove Dental — Cambridge', 'fogorvos', 'Fogorvos', '114 Regent Street, Cambridge CB2 1DP', '+44 1223 324524', 'Magyarul is elérhető fogászati rendelő Cambridge központjában.', '["Magyar"]', 47.3769, 8.5417, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'GB', NULL)
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('gb-imp-forest-ray-fogaszat-london-bloomsbury', 'Forest & Ray — fogászat, London Bloomsbury', 'fogorvos', 'Fogorvos', '8F Gilbert Place, Bloomsbury, London WC1A 2JD', '+44 20 8124 6138', 'Magyar vezetésű fogászati rendelő London Bloomsbury negyedében.', '["Magyar"]', 47.3769, 8.5417, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'GB', NULL)
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('gb-imp-implantcenter-dentistry-london', 'Implantcenter Dentistry — London', 'fogorvos', 'Fogorvos', '71 Gray''s Inn Road, London WC1X 8TR', '+44 20 3411 9910', 'Magyar fogászati implantátum-központ londoni rendelője.', '["Magyar"]', 47.3769, 8.5417, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'GB', NULL)
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('gb-imp-archway-dental-group-london', 'Archway Dental Group — London', 'fogorvos', 'Fogorvos', '34 St John''s Way, Archway, London N19 3RR', '+44 20 7272 6818', 'Magyarul is elérhető fogászati rendelő London Archway negyedében.', '["Magyar"]', 47.3769, 8.5417, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'GB', NULL)
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
