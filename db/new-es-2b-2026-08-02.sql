-- ÚJ ES tételek — célzott keresés, 2. kör — 2026-08-02
-- 80 lekérdezés (20 város × 4 spanyol-magyar szakma-szó) → 7 találat → 2 új.
-- ⚠️ Kihagyva: Pastelería Frajaron (Torrevieja) és Restaurante del Este
-- (Valencia) — a Maps-oldalukon NINCS magyar jel, pozitív bizonyíték nélkül nem.

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('es-imp-el-hungaro-hair-stylist-barcelona', 'El Húngaro Hair Stylist — Barcelona', 'fodrasz', 'Fodrász', 'Carrer de València 377, Eixample, 08013 Barcelona', '+34 722 56 00 53', 'Magyar fodrász Barcelona Eixample negyedében.', '["Magyar"]', 47.3769, 8.5417, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'ES', NULL)
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
