-- AT — MINDENNAPI SZAKMÁK: 2 magyar festőmester — 2026-08-03
--
-- MÓDSZER: magyar VEZETÉKNÉV + NÉMET szakmanév + Bécs a Google Mapsen
-- (72 lekérdezés: 12 vezetéknév × 6 szakma — Elektriker, Installateur, Maler,
-- Tischler, KFZ Werkstatt, Schlosser). Ez a CH/GB-ben bevált minta.
-- ⚠️ SZÁNDÉKOSAN NEM „ungarischer Elektriker" — a nemzetiség-jelzőt a Maps
-- figyelmen kívül hagyja (a memóriában többször mért tapasztalat).
--
-- Hozam: 497 nyers találat → 10 magyar jelölt → **2 felvehető tétel**.
--
-- ⚠️⚠️ ORSZÁG-SZIVÁRGÁS, HARMADSZOR EGY NAPON: a három legígéretesebbnek látszó
-- találat („Németh Autószerviz", „Farkas Autó", „Balogh Autószerviz" — mind
-- MAGYAR NEVŰ, ő/ű betűvel!) MAGYARORSZÁGON van:
--     Fő u. 135 / +36 20 …  ·  Fő u. 165 / +36 30 …  ·  Fenyő u. 52 / +36 99 …
-- A bécsi lekérdezésre a Maps magyarországi műhelyeket adott vissza.
-- **A TELEFON ORSZÁGHÍVÓJA a leggyorsabb árulkodó jel.**
--
-- ⚠️ A SZAKMA-lekérdezés MÁS SZAKMÁT is felhoz: az „Elektriker"/„Installateur"
-- keresésre egy urológus, egy orvos, egy ügyvéd és egy építész jött vissza
-- (mind magyar vezetéknévvel). A kategóriát a tétel VALÓDI profilja adja.
--
-- ⚠️ KIHAGYVA: Dr. Norbert Szabo urológus (Pelikangasse 4/3, 1090 Wien) —
-- valódi bécsi orvos magyar vezetéknévvel, DE a saját rendelői oldalán SEMMI
-- jel nincs magyar nyelvű ellátásra. A vezetéknév ÖNMAGÁBAN nem elég
-- (ld. a „Kiss"-csapda a filter-hu-candidates.mjs-ben) — inkább nincs tétel,
-- mint rossz.
--
-- Koordináták Nominatimból.

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('at-maler-toth-wien', 'MALER TOTH — Tóth András festőmester', 'festo', 'Festő', 'Albertgasse 5, 1080 Wien', '+43 664 4143103', 'Magyar festőmester Bécs 8. kerületében. · maler-toth.at', '["Magyar","Német"]', 48.208492, 16.343590, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-at-trades', 'AT', 'W')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('at-malermeister-nagy-imre-altheim', 'Malermeister Nagy Imre — festőmester', 'festo', 'Festő', 'Schatzdorferstraße 8, 4950 Altheim', '+43 660 7590085', 'Magyar festőmester Felső-Ausztriában, Altheimben.', '["Magyar","Német"]', 48.255611, 13.231479, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-at-trades', 'AT', 'OOE')
ON CONFLICT(id) DO NOTHING;
