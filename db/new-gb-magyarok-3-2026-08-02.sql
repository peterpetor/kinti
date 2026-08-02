-- ÚJ GB tételek — magyarok.co.uk, 3. kör — 2026-08-02
-- 11 további kategória → 43 jelölt → 32 új → 21 ellenőrzésre → 10 címmel → 4 bekerült.
--
-- ⚠️ AMIT KIHAGYTAM:
--  • Cleansisters — a Maps TELJESEN MÁS címen (Witney OX29, nem London E6):
--    az másik vállalkozás, nem a jegyzékbeli.
--  • Emersons Green NHS Treatment Centre — NHS-intézmény, nem magyar vállalkozás
--    (ugyanaz az elv, amiért konzulátust sem veszünk fel).
--  • 11 mobil-alapú tétel cím nélkül (költöztetés, csomagszállítás, takarítás).
--
-- ⚠️ Győrfi Anna: a jegyzékben 6 Bessborough Place, a Mapsen 344-354 Gray's Inn
--   Road — a rendelő KÖLTÖZÖTT. A frissebb (Maps) címet tároljuk.

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('gb-imp-haemorrhoid-clinic-london', 'Haemorrhoid Clinic — London', 'orvos', 'Orvos', '6 Bendall Mews, London NW1 6SN', '+44 20 3129 5383', 'Magyarul is elérhető proktológiai magánrendelő Londonban.', '["Magyar"]', 47.3769, 8.5417, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'GB', NULL)
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('gb-imp-gyorfi-anna-pszichoterapeuta-london', 'Győrfi Anna — pszichoterapeuta, London', 'pszichologus', 'Pszichológus / Coach', '344-354 Gray''s Inn Road, London WC1X 8BP', '+44 7704 223777', 'Magyar pszichoterapeuta londoni rendelője.', '["Magyar"]', 47.3769, 8.5417, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'GB', NULL)
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('gb-imp-barancsi-boroka-london', 'Barancsi Boróka — London', 'pszichologus', 'Pszichológus / Coach', '89 Fleet Street, London EC4Y 1DH', '+44 7715 424249', 'Magyar terapeuta rendelője a londoni Cityben.', '["Magyar"]', 47.3769, 8.5417, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'GB', NULL)
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
