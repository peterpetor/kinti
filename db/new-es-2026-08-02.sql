-- ÚJ ES tételek — CÉLZOTT Maps-keresés — 2026-08-02
--
-- ⭐ A MÓDSZER, AMI ES-BEN BEVÁLT: nem „hungarian <szakma> <város>" (az a
-- kategória összes találatát adja), hanem EGYÉRTELMŰEN MAGYAR ÜZLETTÍPUS-SZÓ:
-- langos / kürtőskalács / goulash / magyar bolt / tienda hungara — 16 spanyol
-- városra. Ezek a szavak nem adnak zajt, mert maga a szó magyar.
-- 96 lekérdezés → 6 valódi találat, ebből 5 új (a Pastelería Húngara már bent).
--
-- Két tételnek nincs telefonja (Chimney Tenerife, Roquetas de Mar) — pontos
-- címük viszont van, tehát megtalálhatók; a kontakt később pótolható.

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('es-imp-langos-benidorm-magyar-langos', 'Langos Benidorm — magyar lángos', 'etterem', 'Étterem', 'Calle de Martinez Oriola 5, 03501 Benidorm, Alicante', '+34 642 90 03 19', 'Magyar lángos és utcai étel Benidorm központjában.', '["Magyar"]', 47.3769, 8.5417, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'ES', NULL)
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('es-imp-chimenea-roll-kurtoskalacs-barcelona', 'Chimenea Roll — kürtőskalács, Barcelona', 'cukrasz', 'Cukrász / Torták', 'Gran Via de les Corts Catalanes 428, Eixample, 08015 Barcelona', '+34 697 62 87 83', 'Kürtőskalács-sütöde Barcelona Eixample negyedében.', '["Magyar"]', 47.3769, 8.5417, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'ES', NULL)
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('es-imp-chimney-tenerife-kurtoskalacs', 'Chimney Tenerife — kürtőskalács', 'cukrasz', 'Cukrász / Torták', 'Avenida de la Constitución 29, 38530 Candelaria, Santa Cruz de Tenerife', NULL, 'Kürtőskalács-sütöde Tenerifén, Candelariában.', '["Magyar"]', 47.3769, 8.5417, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'ES', NULL)
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('es-imp-natural-hungarian-magyar-termekek-gran-canaria', 'Natural Hungarian — magyar termékek, Gran Canaria', 'elelmiszer', 'Élelmiszerbolt', 'Pasaje Guayre, 35415 Cardones, Las Palmas (Gran Canaria)', '+34 640 99 93 52', 'Magyar élelmiszer és termékek Gran Canarián.', '["Magyar"]', 47.3769, 8.5417, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'ES', NULL)
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('es-imp-kurtoskalacs-pastel-chimenea-roquetas-de-mar', 'Kürtöskalács Pastel Chimenea — Roquetas de Mar', 'cukrasz', 'Cukrász / Torták', 'Avenida de Playa Serena 3, 04740 Roquetas de Mar, Almería', NULL, 'Kürtőskalács-sütöde Roquetas de Marban, Almería tartományban.', '["Magyar"]', 47.3769, 8.5417, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'ES', NULL)
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
