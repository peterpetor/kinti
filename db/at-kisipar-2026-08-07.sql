-- AT — MINDENNAPI KISIPARI SZAKMÁK: 7 új tétel — 2026-08-07
--
-- A német és svájci kör osztrák futtatása. FORRÁS: herold.at Aranyoldalak,
-- a keresőmező hajtásából kiderült URL-lel: /gelbe-seiten/suche/?term=<szó>
--
-- ⚠️⚠️ AZ OSZTRÁK FORRÁS A LEGGYENGÉBB A HÁROMBÓL, és érdemes tudni, miért:
-- 40 magyar keresztnév 1026 nyers tételt adott, de ezek TÖBBSÉGE
-- "Nicht verifiziert", SZAKMA-BESOROLÁS NÉLKÜL — puszta név + lakcím.
-- Ilyen tételt nem lehet kategorizálni, és magánszemély is lehet mögötte.
-- Használható jelölt csak ott maradt, ahol a SZAKMA a CÉGNÉVBEN szerepel
-- ("Malermeister", "Ofenbau", "Elektroinstallation", "Gasthaus").
-- Hozam: 1026 nyers -> 9 jelölt -> 8 Maps-hitelesített -> 7 új (1 már bent volt).
--
-- ⚠️ SAJÁT MÉRÉSI HIBA, amit javítani kellett: a telefon-kiszedő regexem a
-- CÍM számjegyeit is telefonnak nézte ("Ignacz Zoltan" -> tel "43/1 3061",
-- valójában "Bahnstraße 43/1 3061 Ollersbach"). Osztrák számnál a +43 előtagot
-- kell megkövetelni, nem tetszőleges számjegy-sorozatot.
--
-- ⚠️ ORSZÁG-SPECIFIKUS HAMIS POZITÍV: a "Gabor" NÉMET CIPŐMÁRKA. Négy
-- Gabor Outlet/Shop és egy Haarstudio Gabor jött be miatta — egyik sem magyar.
--
-- ⭐ A DEDUP HÁROM KULCSA MEGINT DOLGOZOTT: a "Malermeister Imre Nagy"
-- (Altheim) MÁR BENT VOLT — cím ÉS telefon alapján egyaránt egyezett.
--
-- ⭐ KERESZT-EGYEZÉS: Czigler Gyula villanyszerelőjét (Martinstraße 45, 1180
-- Wien) a legelső, egészen más módszerű Google Maps-próbám is felhozta.
--
-- ⚠️ A magyar nyelvű kiszolgálás itt sincs ellenőrizve: verified = 0.
--
-- Koordináták Nominatimból, mind a 7 utca-szintű. Tartomány-kód
-- irányítószám-tartományból (a 6700 fölötti 6-os Vorarlberg, alatta Tirol).

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('at-kfz-kalman', 'KFZ-KALMAN', 'autoszer', 'Autószerelő', 'Gurkgasse 14, 1140 Wien', '+43 664 3577499', 'Autószerviz Wien környékén. · kfz-kal.at', '["Magyar","Német"]', 48.1950117, 16.3106691, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-at-cegjegyzek-2026-08', 'AT', 'W')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('at-burggasthof-kecskes-imre', 'Burggasthof — Kecskés Imre', 'etterem', 'Étterem', 'Neunkirchnerstraße 6, 2620 Natschbach-Loipersbach', '+43 699 12366394', 'Étterem Natschbach-Loipersbach környékén.', '["Magyar","Német"]', 47.7120371, 16.0979397, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-at-cegjegyzek-2026-08', 'AT', 'NOE')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('at-gasthaus-wieselmuhle-bogdan-attila', 'Gasthaus Wieselmühle — Bogdán Attila', 'etterem', 'Étterem', '4645 Grünau im Almtal', '+43 7616 8250', 'Étterem Grünau im Almtal környékén.', '["Magyar","Német"]', 47.8507103, 13.9628189, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-at-cegjegyzek-2026-08', 'AT', 'OOE')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('at-unicorn-restaurant-vitanyi-zsolt', 'Unicorn Restaurant — Vitányi Zsolt', 'etterem', 'Étterem', 'Tschengla 3, 6707 Bürserberg', '+43 676 9051001', 'Étterem Bürserberg környékén. · unicorn-buerserberg.at', '["Magyar","Német"]', 47.1462107, 9.7620744, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-at-cegjegyzek-2026-08', 'AT', 'VBG')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('at-bela-gmbh-maler-bodenlegermeister', 'BELA GmbH Maler & Bodenlegermeister', 'festo', 'Szobafestő / Tapétázó', 'Günserstraße 51, 7441 Pilgersdorf', '+43 2616 7693', 'Szobafestés, mázolás, padlóburkolás Pilgersdorf környékén. · bela.co.at', '["Magyar","Német"]', 47.4335699, 16.3538512, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-at-cegjegyzek-2026-08', 'AT', 'BGL')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('at-gk-ofenbau-karpati-gabor', 'GK Ofenbau — Kárpáti Gábor', 'kandalloepites', 'Kandallóépítés / Kályhás', 'Trattmannsberg 3, 5230 Mattighofen', '+43 676 7162832', 'Cserépkályha- és kandallóépítés Mattighofen környékén. · gk-ofenbau.at', '["Magyar","Német"]', 48.0914741, 13.1509401, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-at-cegjegyzek-2026-08', 'AT', 'SBG')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('at-elektroinstallationsnotdienst-gyula-czigler', 'Elektroinstallationsnotdienst Gyula Czigler', 'villany', 'Villanyszerelő', 'Martinstraße 45, 1180 Wien', '+43 660 3190004', 'Villanyszerelés és hibaelhárítás Wien környékén. · elektro-czigler.at', '["Magyar","Német"]', 48.2219594, 16.3412591, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-at-cegjegyzek-2026-08', 'AT', 'W')
ON CONFLICT(id) DO NOTHING;
