-- ÚJ GB tételek — CÉLZOTT Maps-keresés magyar üzlettípus-szavakkal — 2026-08-02
--
-- 120 lekérdezés (20 város × 6 magyar üzlettípus-szó) → 86 azonosított hely →
-- 14 valóban magyar jelölt → 3 új (a többi MÁR BENT VOLT: a korábbi GB-körök
-- alaposak voltak — Paprika Store ×3, Langos Boys, Tekerch, Langos Factory stb.).
--
-- ⚠️ ORSZÁG-SZIVÁRGÁS A TALÁLATOKBAN: a Maps ROSSZ ORSZÁGBÓL is hozott (Goldener
-- Bär → NÉMETORSZÁG, Kurtos Academy → SZLOVÉNIA). A cím országát MINDIG ellenőrizd.
-- Más nemzet üzletei is bejöttek a 'chimney cake' szóra (KÖZLE = török,
-- Traditional Romanian = román, The Italian Shop = olasz) — kiszűrve.

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('gb-imp-homeland-hungarian-food', 'Homeland — Hungarian Food', 'elelmiszer', 'Élelmiszerbolt', 'Unit 3, Nottingham NG10 5AD', '+44 7568 212592', 'Magyar élelmiszerbolt Nottinghamben.', '["Magyar"]', 47.3769, 8.5417, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'GB', NULL)
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('gb-imp-hungarian-traditional-food', 'Hungarian Traditional Food', 'etterem', 'Étterem', '9A Lands Lane, Leeds LS1 6AW', '+44 7587 991317', 'Magyar hagyományos ételek Leeds belvárosában.', '["Magyar"]', 47.3769, 8.5417, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'GB', NULL)
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('gb-imp-kurtoskalacs-luton-dunstable', 'Kurtoskalacs Luton-Dunstable', 'cukrasz', 'Cukrász / Torták', '511 Leagrave High Street, Luton LU4 0TH', '+44 7435 874072', 'Kürtőskalács-sütöde Lutonban.', '["Magyar"]', 47.3769, 8.5417, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'GB', NULL)
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
