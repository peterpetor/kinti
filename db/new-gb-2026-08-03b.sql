-- GB — magyar nyelvű SZOLGÁLTATÁS-szavas Maps-felderítés eredménye, 2026-08-03
--
-- 120 lekérdezés (15 ANGOL város × 8 magyar szolgáltatás-szó: fodrász, körmös,
-- kozmetikus, masszázs, autószerelő, pékség, cukrászda, étterem)
-- → 155 nyers találat → 19 magyar jelölt → **1 új tétel**.
--
-- ⚠️⚠️ FONTOS MÓDSZERTANI KÜLÖNBSÉG a mai KORÁBBI körhöz képest:
-- a magyar ÉTEL-szavak (langos, kürtőskalács) JÓL működtek (567 találat → 31
-- jelölt), a magyar SZOLGÁLTATÁS-szavak viszont SÚLYOS ORSZÁG-SZIVÁRGÁST adnak.
-- Ok: a „langos" olyan termékszó, amit a KÜLFÖLDÖN élő magyar vállalkozó tesz a
-- cégnevébe; a „magyar fodrász" viszont olyan kifejezés, ami MAGYARORSZÁGON
-- illeszkedik cégnevekre — ezért a Maps hazaesik.
--
-- A 19 jelöltből 8 MAGYARORSZÁGI vagy OSZTRÁK volt, a címről azonnal látszott:
--   Bethlen Gábor u. 19 / Kisfaludy u. 40 / Erdély u. 65 (+36 52) /
--   Doberdó u. / Október 6. u. 5  → Magyarország
--   Bräunerstraße 2 (Ilona Stüberl) / Gersthofer Str. 140 (Piroschka) → BÉCS
--   (mindkettő MÁR BENT VAN a szaknévsorban AT-tételként!)
--
-- ⚠️ A LEGALATTOMOSABB: „London Beauty Pro — A PROFESSZIONÁLIS KOREAI
-- KOZMETIKUMOK SZAKÉRTŐJE" — a cégNÉVBEN ott van a „London", a valódi címe
-- viszont **Budapest, Arany János u. 15**. A cégnévben szereplő városnév SEMMIT
-- nem bizonyít; mindig a CÍM dönt.
--
-- KIHAGYVA: „Hungry Huns" (Maltby St, London SE1 3PB, +44 7576 286568,
-- instagram.com/hungryhuns23) — a Maps IDEIGLENESEN ZÁRVA jelzést ad rá.
-- Jó jövőbeli lead: ha egy későbbi kör nyitva találja, felvehető.

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('gb-brasserie-transylvania-london', 'Brasserie Transylvania — Erdélyi Étterem, London', 'etterem', 'Étterem', '353 Green Lanes, Harringay, London N4 1DZ', '+44 20 8802 0866', 'Erdélyi és magyar konyha Haringey-ben. · facebook.com/brasserietransylvania', '["Magyar","Angol"]', 51.576176, -0.098857, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-gb-org', 'GB', 'LDN')
ON CONFLICT(id) DO NOTHING;
