-- CH — KISIPAR, MÁSODIK KÖR: 90 ÚJ név a search.ch-n — 2026-08-08
--
-- ⚠️⚠️ EZ A FÁJL ELSŐSORBAN EGY MÉRÉS: mindössze 2 új cég.
--
-- Az első svájci kör után KÉT irányban lehetett folytatni, és MINDKETTŐT
-- megmértem:
--
--   (a) MÉLYEBB LAPOZÁS ugyanazokra a nevekre → NULLA új jelölt.
--       2133 → 3633 nyers tétel, a jelöltek száma maradt 26. A mélyebb oldalak
--       gyakorlatilag csak magánszemélyeket tartalmaznak.
--
--   (b) ÚJ NEVEK (ez a kör) → 90 lekérdezés, 2176 nyers, 4 jelölt, 2 felvett.
--
-- Vagyis Svájcban nem a lekérdezések száma a korlát, hanem a POPULÁCIÓ: a
-- magyar kisiparos-réteg egyszerűen kicsi, és amit a telefonkönyv üzletként
-- jelöl, azt már megtaláltuk. 1488 nyers tételből megint 1488 mínusz 4 esett ki
-- magánszemélyként vagy szakma-jelölés nélkül.
--
-- ⚠️ A CH NÉV-TENGELY EZZEL LEZÁRVA, összesen 16 tétellel (14 + 2). További
-- svájci bővüléshez MÁS forrás kell — a local.ch 403-at ad, a moneyhouse/zefix
-- cégjegyzék pedig szakma-besorolás és telefon nélkül tárol.
--
-- A magánszemély-szűrés, a `pos` lapozó-paraméter és a kanton-kód készen
-- jövetele azonos az első körrel — ld. `db/ch-kisipar-searchch-2026-08-08.sql`.
--
-- ⚠️ A magyar nyelvű kiszolgálás itt sincs ellenőrizve: NINCS ELLENŐRIZVE,
-- verified = 0. Koordináták Nominatimból, utca-szintűek.

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('ch3-rigo-holz-gmbh', 'Rigo Holz GmbH', 'asztalos', 'Asztalos', 'Gasse 1, 7303 Mastrils', '+41 81 322 72 58', 'Asztalos- és bútormunkák Mastrils környékén.', '["Német"]', 46.9679988, 9.5431464, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-ch-searchch2-2026-08-08', 'CH', 'GR')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('ch3-studio-di-architettura-sebastian-rigo', 'Studio di Architettura Sebastian Rigo', 'lakberendezes', 'Belsőépítészet', 'in Brïèe da Sóra 20, 6672 Gordevio', '+41 79 381 28 87', 'Belsőépítészet és lakberendezés Gordevio környékén.', '["Olasz"]', 46.2279486, 8.7445294, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-ch-searchch2-2026-08-08', 'CH', 'TI')
ON CONFLICT(id) DO NOTHING;
