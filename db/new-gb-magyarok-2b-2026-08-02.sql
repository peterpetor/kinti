-- ÚJ GB tételek — magyarok.co.uk, 2. kör (szolgáltatók) — 2026-08-02
--
-- 24 új jelöltből 6 ment be: azok, amiknek UTCASZINTŰ CÍMÜK is van.
-- ⚠️ A többi 18 mobil-alapú egyéni vállalkozó (költöztetés, masszázs,
-- fotózás) — van telefonjuk, de nincs telephelyük. Cím nélkül a térképen
-- félrevezetők lennének (városközépre esnének), ezért kimaradtak; ha később
-- kell, külön kategóriaként/jelöléssel érdemes felvenni őket.
--
-- ÚJ KATEGÓRIA-LEFEDETTSÉG GB-ben: informatikus (3), fotós, festő — ezekben
-- eddig NULLA tétel volt.

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('gb-imp-painter-decorator', 'Painter & Decorator', 'festo', 'Szobafestő', '6 Lansbury Avenue, Romford, Essex RM3 7PD', '+44 7960568766', 'Magyar festő-mázoló, szobafestés és lakberendezés Romfordban.', '["Magyar"]', 47.3769, 8.5417, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'GB', NULL)
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('gb-imp-acs-it-solution-pc-laptop-szerviz', 'ACS IT SOLUTION – PC/LAPTOP SZERVIZ', 'it', 'Informatikus', '3 Church Lane, Great Doddington, Wellingborough NN29 7TG', '+44 7732995972', 'Magyar számítógép- és laptopszerviz Northamptonshire-ben.', '["Magyar"]', 46.8499, 9.5329, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'GB', 'GR')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('gb-imp-ga-repair-services-g-andras', 'GA REPAIR SERVICES – G ANDRAS', 'it', 'Informatikus', '10 Christchurch Avenue, Wembley, London HA3 8NA', '+44 7769995116', 'Magyar számítógép- és készülékjavítás Wembley-ben.', '["Magyar"]', 46.8499, 9.5329, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'GB', 'GR')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('gb-imp-laptop-szerviz-london', 'Laptop Szerviz London', 'it', 'Informatikus', '65 Eagle Road, Wembley, London HA0 4SL', '+44 7400 449905', 'Magyar laptopszerviz Londonban (Wembley).', '["Magyar"]', 47.3769, 8.5417, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'GB', NULL)
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('gb-imp-dr-lozsadi-dora', 'Dr. Lozsadi Dóra', 'orvos', 'Orvos', 'St George''s Hospital, Blackshaw Road, London SW17 0QT', '+44 8455561352', 'Magyar neurológus a londoni St George''s Hospitalban.', '["Magyar"]', 47.3769, 8.5417, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'GB', NULL)
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
