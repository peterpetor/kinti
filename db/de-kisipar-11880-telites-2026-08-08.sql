-- DE — KISIPAR, NYOLCADIK KÖR: a 11880 NÉV-TENGELYE IS KIMERÜLT — 2026-08-08
--
-- ⚠️⚠️ EZ A FÁJL ELSŐSORBAN EGY MÉRÉS, nem bővítés: EGYETLEN új cég.
--
-- A hetedik kör után megnéztem, mely lekérdezések ütköztek a 11880 50-es
-- találat-korlátjába a hatodik körben (21 ilyen volt), és CSAK azokat bontottam
-- városra, amelyeket a szűrő el is fogad. A kétes vezetéknevek (Antal, Barta,
-- Simon, Major, Urbán) hiába vágódtak le: azokat a szűrő magyar keresztnév
-- nélkül úgyis elveti, tehát a plusz találat nem termelne jelöltet.
--
--   12 név × 15 nagyváros = 180 lekérdezés → 3021 nyers → 27 jelölt
--   → 10 dedup után → 1 felvett cég.
--
-- A 27 jelöltből 17 MÁR BENT VOLT. Vagyis a város-bontás ezen a ponton már
-- gyakorlatilag a saját korábbi találatainkat hozza vissza.
--
-- ## Hol tart a DE név-tengely (mind a hat kör összevetve)
--
--   gelbeseiten országos (keresztnév)   →  56 cég
--   11880 országos (keresztnév)         →  15 cég
--   gelbeseiten országos (vezetéknév)   →  33 cég
--   11880 országos (mindkettő)          →  73 cég   ⭐ legjobb
--   11880 város-bontás (régi nevek)     →  22 cég
--   11880 országos (128 új név)         →  25 cég
--   gelbeseiten (42 új vezetéknév)      →   4 cég   ← kimerült
--   11880 város-bontás (levágott nevek) →   1 cég   ← kimerült
--
-- Következtetés: a NÉV-tengely Németországra le van aratva. További bővüléshez
-- MÁS TENGELY kell — harmadik cégjegyzék, más ország, vagy nem-név alapú jel.
--
-- ⚠️ ÚJ GEOKÓD-MINTA, amit ez a kör hozott: az „OT" (Ortsteil) a házszám és az
-- irányítószám KÖZÖTT állhat („Ascherslebener Str. 16 OT 06467 Hoym"), és a
-- Nominatim ettől nullát ad. A generátor most ezt is levágja.
--
-- ⚠️ A magyar nyelvű kiszolgálás itt sincs ellenőrizve: NINCS ELLENŐRIZVE,
-- verified = 0.

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de8-rigo-paulin', 'Rigo Paulin', 'fuggesztett_menyezet', 'Álmennyezet / Gipszkarton', 'Ascherslebener Str. 16 OT 06467 Hoym (Hoym)', '+49 176 41064622', 'Gipszkarton- és álmennyezet-szerelés Hoym környékén.', '["Német"]', 51.7860128, 11.3219006, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880w-2026-08-08', 'DE', 'ST')
ON CONFLICT(id) DO NOTHING;
