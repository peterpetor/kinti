-- DE/AT — 2. kör: 4 új magyar bolt/lángosos + 1 cím-javítás — 2026-08-03
--
-- 96 lekérdezés (24 ÚJ város × 4 utcai-étel szó) → 387 találat → 13 magyar
-- jelölt → 4 új tétel. A `palinka` szót ebben a körben már NEM használtam:
-- az első körben mind a 11 találata magyarországi főzde volt.
--
-- ⚠️ KISZŰRVE:
--   • 4 BEZÁRT hely (Koncz Kürtös-Lángos, Restaurant HUNGARIKUM, Langos
--     Paradies, Ungarische Konditorei/Zürich)
--   • „Frau Dr. med. Kerstin Langosch" (Freiburg) — ORVOS. A terméknév itt is
--     VEZETÉKNÉV, ahogy az első körben a „Planungsgesellschaft Langos mbH".
--   • „Molnár's kürtőskalács" (Váci u. 31) — BUDAPEST, sokadszorra
--   • „Magyar bolt – Grafing" — már bent van
--
-- ⚠️⚠️ A TELEFON-DEDUP KÉT TÉTELT FOGOTT MEG, amit a név/cím nem:
--   1. „Fanni´s ungarische Feinkost" (Altmühlstraße 17, Kelheim) — MÁR BENT VAN
--      ugyanazzal a telefonnal (+49 170 9319007). Ráadásul a REJTETT „Betyár
--      Markt" is ezen a címen volt: a bolt neve kétszer változott.
--   2. „Paprika Market" — az új találat címe Alte Regensburger Str. **2**,
--      84030 ERGOLDING, a miénk Alte Regensburger Str. **60**, 84030 LANDSHUT.
--      Más házszám, más település — DE UGYANAZ A TELEFON (+49 871 14354601).
--      Vagyis nem új bolt: ELKÖLTÖZÖTT. Ezért nem felvétel, hanem CÍM-JAVÍTÁS.
--
-- Minden új tétel Maps-en ellenőrizve: nyitva, a cím DE/AT. Koordináták
-- Nominatimból, irányítószámmal.

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-manus-langos-bad-salzuflen', 'Manus Langos — Bad Salzuflen', 'etterem', 'Étterem', 'Otto-Hahn-Straße 47, 32108 Bad Salzuflen', '+49 176 55281984', 'Magyar lángos Bad Salzuflenben. · instagram.com/manus_langos', '["Magyar","Német"]', 52.065244, 8.751449, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-langos-dach', 'DE', 'NW'),
('de-magyar-bolt-hunderdorf', 'Magyar Bolt — Hunderdorf', 'elelmiszer', 'Élelmiszerbolt', 'Bahnhofstraße 3, 94336 Hunderdorf', '+49 9422 4029811', 'Magyar élelmiszerbolt Hunderdorfban (Alsó-Bajorország).', '["Magyar","Német"]', 48.942693, 12.728999, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-langos-dach', 'DE', 'BY'),
('de-hunikum-dingolfing', 'HUNikum — magyar élelmiszer, Dingolfing', 'elelmiszer', 'Élelmiszerbolt', 'Lederergasse 11, 84130 Dingolfing', '+49 8731 3973937', 'Magyar élelmiszerbolt Dingolfingban. · hunikum.de', '["Magyar","Német"]', 48.629964, 12.497033, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-langos-dach', 'DE', 'BY'),
('at-shortys-langos-wels', 'Shorty''s Langos — Wels', 'etterem', 'Étterem', 'Bauernstraße 43, 4600 Wels', NULL, 'Magyar lángos Welsben, a jégcsarnok mellett.', '["Magyar","Német"]', 48.147691, 14.012811, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-langos-dach', 'AT', 'OOE')
ON CONFLICT(id) DO NOTHING;

------------------------------------------------------------- CÍM-JAVÍTÁS
-- A Paprika Market ELKÖLTÖZÖTT: Landshut, Alte Regensburger Str. 60 →
-- Ergolding, Alte Regensburger Str. 2. A telefon változatlan, ez igazolja,
-- hogy ugyanaz a bolt. A név is pontosítva a Maps szerinti alakra.
UPDATE businesses SET
  name = 'Paprika Market — magyar élelmiszer, Ergolding',
  address = 'Alte Regensburger Straße 2, 84030 Ergolding',
  lat = 48.549411, lng = 12.160325,
  blurb = 'Magyar élelmiszerbolt Ergoldingban, Landshut mellett. · paprikamarket.de',
  updated_at = datetime('now')
WHERE id = (SELECT id FROM businesses WHERE name = 'Paprika Market Landshut' LIMIT 1);
