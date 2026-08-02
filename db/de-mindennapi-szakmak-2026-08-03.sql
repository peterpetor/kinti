-- DE — MINDENNAPI SZAKMÁK: 16 új kisiparos/szerelő — 2026-08-03
--
-- ⚠️ MIÉRT EZ A KÖR: egy kategória-audit megmutatta, hogy a szaknévsor a
-- „fehérgalléros" szakmákban erős (orvos 314, ügyvéd 183, fogorvos 178), a
-- MINDENNAPI kisipari szakmákban viszont szinte üres volt mind a 6 országban:
--   vízvezeték-szerelő 0 · lakatos 0 · asztalos 0 · tetőfedő 0 · klíma 0 ·
--   gumiszerviz 0 · kerékpárszerelő 0 · villanyszerelő 2 · költöztetés 1 ·
--   kőműves 3 · festő 5 · takarító 5
-- Pedig a felhasználó életében ezek a leggyakoribb, legsürgetőbb igények.
--
-- FORRÁS: nemetorszagi-magyarok.de/cimtar szakma-oldalai (a memóriában
-- dokumentált legjobb DE-forrás; korábban főleg a fehérgalléros kategóriákra
-- volt kiaknázva, a kisipari oldalai NEM).
--
-- ⚠️ A FORRÁS MEGBÍZHATÓSÁGA MÉRVE: 4 tétel telefonszáma PONTOSAN egyezett a
-- Google Maps-szel (SB-Kfztechnik, Orti-Car, Sacal, Auto74) — ez ugyanaz a
-- kereszt-ellenőrzés, ami a HCHS-listánál is 6/6-ot adott. Egyik jelölt sem
-- volt BEZÁRT.
--
-- ⚠️ KIHAGYVA (elérhetőség nélkül, tehát zsákutcát csinálna): Botondbau
-- (Regensburg), Sulyok-Pál László, Mészáros László, Hamvas Gábor, Szigeti
-- Ernő, Csombordi Zoltán, Ilyes Robet, Boross Zsolt, „balo.tomi",
-- „Kerékpár javítás" (München) — mind csak név + város.
-- ⚠️ KIHAGYVA (más profil): Fischer Personalservice — MUNKAERŐ-KÖZVETÍTŐ, nem
-- vízvezeték-szerelő; a kategóriaoldalon csak azért szerepel, mert szerelőket
-- közvetít. Félrevezető lenne szerelőként listázni.
-- ⚠️ KIHAGYVA (gyenge): „HUNOR és a Tücsök" (Neufahrn) — kerékpárszerelő LENNE
-- az első tételünk ebben a kategóriában, DE magyarországi (+36) telefon, a Maps
-- nem ismeri, és egyszerre hirdet autómentést, fotózást és költöztetést is.
-- ⚠️ Az `auto74.de` domain NEM oldódik fel — a weboldalt nem írjuk be, a
-- (Maps-szel egyező) telefon marad.
--
-- Koordináták Nominatimból; ahol nincs utcacím (mozgó kisiparos), ott
-- város-szintű koordináta + város-szintű cím — ez a kisiparosoknál helyes,
-- mert a szolgáltatás a helyszínre megy.

------------------------------------------------------------------ AUTÓSZERELŐ

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-terhes-zoltan-kfz-rohrmoos', 'Dipl. Ing. Terhes Zoltán — autószerviz', 'autoszer', 'Autószerelő', 'Durchsamsried 3, 85244 Röhrmoos', '+49 159 06150690', 'Magyar autószerelő Dachau és Röhrmoos környékén.', '["Magyar","Német"]', 48.330021, 11.500738, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-trades', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-takacs-laszlo-kfz-wallersdorf', 'Takács László KFZ-Meisterwerkstatt', 'autoszer', 'Autószerelő', 'Robert-Bosch-Straße 6, 94522 Wallersdorf', '+49 176 24765118', 'Magyar autószerelő mesterműhely Dingolfing–Wallersdorf térségében.', '["Magyar","Német"]', 48.740309, 12.739105, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-trades', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-sb-kfztechnik-geisenfeld', 'SB-Kfztechnik — magyar autószerviz', 'autoszer', 'Autószerelő', 'Hatzmühlstraße 30, 85290 Geisenfeld', '+49 8452 7367816', 'Magyar autószerviz Geisenfeldben. · sb-kfztechnik.de', '["Magyar","Német"]', 48.684207, 11.613403, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-trades', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-autoklinik-warngau', 'AutoKlinik Kfz-Meisterbetrieb', 'autoszer', 'Autószerelő', 'Warngau (Landkreis Miesbach)', '+49 157 57441432', 'Magyar autószerelő mesterműhely Warngauban.', '["Magyar","Német"]', 47.819046, 11.730831, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-trades', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-orti-car-altdorf', 'Orti-Car — autószerviz és gumiszerviz', 'autoszer', 'Autószerelő', 'Moosstraße 28/A, 84032 Altdorf', '+49 176 24051383', 'Magyar autó- és gumiszerviz Landshut mellett.', '["Magyar","Német"]', 48.545742, 12.100924, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-trades', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-sacal-karosszeria-rastatt', 'Sacal Zoltán — karosszériaműhely', 'karosszeria', 'Karosszéria', 'Im Steingestell 45, 76437 Rastatt', '+49 7222 989292', 'Magyar karosszéria- és fényezőműhely Rastattban.', '["Magyar","Német"]', 48.858457, 8.204045, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-trades', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-auto74-hockenheim', 'Auto74 KFZ-Werkstatt — Rövid Csaba', 'autoszer', 'Autószerelő', 'Neustadter Straße 20, 68766 Hockenheim', '+49 176 46642249', 'Magyar autószerviz Hockenheimben.', '["Magyar","Német"]', 49.333740, 8.531335, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-trades', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

----------------------------------------------------------------------- FESTŐ

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-muller-mihaly-festo-stuttgart', 'Müller Mihály — festő és tapétázó', 'festo', 'Festő', 'Stuttgart és környéke (kiszállással)', '+49 152 31867478', 'Magyar festő-tapétázó Stuttgart térségében.', '["Magyar","Német"]', 48.778449, 9.180013, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-trades', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-bsm-bau-geislingen', 'BSM Bau — Balázs Márton, festő-tapétázó', 'festo', 'Festő', 'Geislingen an der Steige és környéke', '+49 179 8117813', 'Magyar festő-tapétázó Geislingen térségében.', '["Magyar","Német"]', 48.623040, 9.835670, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-trades', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-palos-norbert-festo-schneeberg', 'Palos Norbert — festő és burkoló', 'festo', 'Festő', 'Schachthofplatz, 08289 Schneeberg', '+49 157 74124768', 'Magyar festő és burkoló az Érchegység térségében.', '["Magyar","Német"]', 50.595069, 12.641701, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-trades', 'DE', 'SN')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-veres-gabor-festo-hildesheim', 'Veres Gábor — festő és tapétázó', 'festo', 'Festő', 'Hauptstraße 31, Hildesheim', '+49 172 9347449', 'Magyar festő-tapétázó Hildesheimben.', '["Magyar","Német"]', 52.152719, 9.951808, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-trades', 'DE', 'NI')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-peter-gbr-festo-stuttgart', 'Peter GbR — festő és tapétázó', 'festo', 'Festő', 'Stuttgart és környéke (kiszállással)', '+49 151 71685309', 'Magyar festő-tapétázó Stuttgart térségében.', '["Magyar","Német"]', 48.778449, 9.180013, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-trades', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

---------------------------------------------------------------- VILLANYSZERELŐ

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-szili-zelenak-elektro-bad-herrenalb', 'Szili & Zelenak Elektrotechnik GbR', 'villany', 'Villanyszerelő', 'Bernbach, 76332 Bad Herrenalb', '+49 157 55543114', 'Magyar villanyszerelő Bad Herrenalb és Karlsruhe térségében.', '["Magyar","Német"]', 48.824020, 8.415490, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-trades', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-bernath-levente-villany-karlsruhe', 'Bernáth Levente — villanyszerelő', 'villany', 'Villanyszerelő', 'Karlsruhe és környéke (kiszállással)', '+49 151 64189151', 'Magyar villanyszerelő Karlsruhe térségében.', '["Magyar","Német"]', 49.006870, 8.403420, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-trades', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

--------------------------------------------------------- ASZTALOS / FELÚJÍTÁS

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-szanyi-balazs-asztalos-merseburg', 'Szanyi Balázs — asztalos, egyedi bútor', 'asztalos', 'Asztalos', 'Halle–Merseburg térsége', NULL, 'Magyar asztalos, egyedi bútorkészítés Halle és Merseburg térségében. · szanyibutor.hu', '["Magyar","Német"]', 51.356441, 11.996148, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-trades', 'DE', 'ST')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-pg-haustechnik-frankfurt', 'PG Haustechnik — lakásfelújítás', 'lakasfelujitas', 'Lakásfelújítás', 'Frankfurt am Main és környéke', '+49 157 88724366', 'Magyar lakásfelújítás Frankfurtban: gipszkarton, burkolás, parketta, kőműves- és asztalosmunka.', '["Magyar","Német"]', 50.110644, 8.682092, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-trades', 'DE', 'HE')
ON CONFLICT(id) DO NOTHING;
