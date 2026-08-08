-- DE — KISIPAR, HATODIK KÖR: 128 ÚJ név a 11880-on — 2026-08-08
--
-- Az ötödik kör tanulsága szerint nem több VÁROST, hanem több NEVET kellett
-- hozzátenni. 128 eddig nem kérdezett vezeték- és keresztnév:
--   128 lekérdezés → 2056 nyers → 97 jelölt → 87 dedup után → 25 felvett cég.
--
-- ⚠️⚠️ EBBEN A KÖRBEN EGY NÉMA MÓDSZER-HIBA DERÜLT KI. Az első szűrés 2056
-- nyers tételből mindössze 33 jelöltet adott (az előző kör 2089-ből 242-t).
-- Nem a forrás merült ki: a LEKÉRDEZETT NEVEK FELE NEM SZEREPELT A SZŰRŐ
-- elfogadó listáján, tehát a saját találataimat dobtam el. Semmi nem jelezte —
-- csak gyengébb hozamnak látszott.
--
-- **A keresőszónak és az elfogadó névlistának EGYÜTT kell mozognia.** Ha új
-- névre keresel, ELŐBB nézd meg, hogy a `filter-hu-vezeteknev.mjs` SZIGORU
-- vagy KETES listáján rajta van-e.
--
-- A listát 42 orthográfiailag egyértelmű magyar vezetéknévvel bővítettem
-- (`cs`/`sz`/`zs`/`gy`/`cz` írásmód: Csiszár, Kaszás, Zsoldos, Győri, Lőrincz),
-- a kétes alakokat SZÁNDÉKOSAN kihagyva: a Simon, Major, Márton, Antal, Máté,
-- Urbán németül is gyakori családnév, azokra a puszta névtalálat nem bizonyíték.
-- Ugyanaz a nyers adat így 33 helyett 97 jelöltet adott.
--
-- ⚠️ A hitelesítés itt is keményen szűrt: 87-ből 34 volt egyértelmű és nyitva,
-- 5 véglegesen bezárt, és a két-szűrős egyezésen 25 ment át.
--
-- A módszertan, a szabad szövegű szakma-illesztés és a magánszemély-sáv
-- kihagyása azonos a negyedik körrel — ld.
-- `db/de-kisipar-11880-2026-08-08.sql` fejlécét.
--
-- ⚠️ A magyar nyelvű kiszolgálás itt sincs ellenőrizve: NINCS ELLENŐRIZVE,
-- verified = 0.
--
-- Koordináták Nominatimból, mind utca-szintű.

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de6-klaudia-magyar-goldschmiedemeisterin', 'Klaudia Magyar - Goldschmiedemeisterin', 'ekszer', 'Ékszerész / Órás', 'Lütticher Str. 107 52074 Aachen', '+49 241 7019869', 'Ékszerkészítés és -javítás Aachen környékén.', '["Német"]', 50.7643277, 6.0709566, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880u-2026-08-08', 'DE', 'NW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de6-magyar-bau-gbr', 'Magyar Bau GbR', 'kőműves', 'Kőműves / Betonozó', 'Landsberger Str. 146 80687 München (Schwanthalerhöhe-Laim)', '+49 89 55002750', 'Kőműves- és építőipari munkák München környékén.', '["Német"]', 48.1405517, 11.5308836, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880u-2026-08-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de6-tischlerei-rigo-neumann', 'Tischlerei Rigo Neumann', 'asztalos', 'Asztalos', 'Schlüterstr. 20 14558 Nuthetal (Bergholz-Rehbrücke)', '+49 171 8255332', 'Asztalos- és bútormunkák Nuthetal környékén.', '["Német"]', 52.3359395, 13.096378, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880u-2026-08-08', 'DE', 'BB')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de6-rigo-theuermeister', 'Rigo Theuermeister', 'autoszer', 'Autószerelő', 'Osterfelder Str. 8 06682 Teuchern', '+49 34443 62540', 'Autójavítás és -szerviz Teuchern környékén.', '["Német"]', 51.1151992, 12.0234341, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880u-2026-08-08', 'DE', 'ST')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de6-fliesen-rigo', 'Fliesen Rigo', 'burkolo', 'Burkoló / Csempéző', 'Steinern-Kreuz-Weg 7 b 55246 Mainz-Kostheim (Kostheim)', '+49 6134 64571', 'Csempézés, burkolás Mainz-Kostheim környékén.', '["Német"]', 50.0069783, 8.3083476, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880u-2026-08-08', 'DE', 'RP')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de6-hans-ujvari-stuckateurmeister', 'Hans Ujvari Stuckateurmeister', 'festo', 'Szobafestő / Tapétázó', 'Kollwitzstr. 2 72636 Frickenhausen (Linsenhofen)', '+49 7025 5113', 'Szobafestés, mázolás Frickenhausen környékén.', '["Német"]', 48.5828118, 9.3719226, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880u-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de6-trockenbau-halasz', 'Trockenbau Halasz', 'fuggesztett_menyezet', 'Álmennyezet / Gipszkarton', 'Herzog-Johann-Str. 5 55469 Simmern', '+49 176 72344114', 'Gipszkarton- és álmennyezet-szerelés Simmern környékén.', '["Német"]', 49.9813305, 7.5137642, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880u-2026-08-08', 'DE', 'RP')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de6-kardos-trockenbau-hausmeisterservice-egbr', 'Kardos Trockenbau & Hausmeisterservice eGbR', 'fuggesztett_menyezet', 'Álmennyezet / Gipszkarton', 'Schmitzinger Str. 68 79761 Waldshut-Tiengen (Waldshut)', '+49 172 7454065', 'Gipszkarton- és álmennyezet-szerelés Waldshut-Tiengen környékén.', '["Német"]', 47.634921, 8.2094354, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880u-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de6-rs-lichtelemente-bauservice-dienstleistungen', 'RS Lichtelemente, Bauservice & Dienstleistungen', 'fuggesztett_menyezet', 'Álmennyezet / Gipszkarton', 'Hauptstr. 121 09249 Taura', '+49 174 3177424', 'Gipszkarton- és álmennyezet-szerelés Taura környékén.', '["Német"]', 50.9183975, 12.843533, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880u-2026-08-08', 'DE', 'SN')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de6-dienstleistungen-ferencz-trockenbau-gartenpfle', 'Dienstleistungen Ferencz - Trockenbau |Gartenpflege |', 'fuggesztett_menyezet', 'Álmennyezet / Gipszkarton', 'Wilflinger Str. 11 72511 Bingen bei Sigmaringen (Hitzkofen)', '+49 1525 8728045', 'Gipszkarton- és álmennyezet-szerelés Bingen bei Sigmaringen környékén.', '["Német"]', 48.1056471, 9.2914611, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880u-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de6-miami-drive-fahrschule-inh-rigo-voss', 'Miami Drive Fahrschule Inh. Rigo Voß', 'gepijarmu_oktato', 'Autósiskola / Oktató', 'Steindamm 57 25337 Elmshorn', '+49 4121 428864', 'Autósiskola Elmshorn környékén.', '["Német"]', 53.7520394, 9.6669116, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880u-2026-08-08', 'DE', 'SH')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de6-vago-gmbh', 'VaGo GmbH', 'kertesz', 'Kertészet', 'Hanauer Landstr. 485 60386 Frankfurt (Fechenheim)', '+49 69 49085775', 'Kertészet és kertfenntartás Frankfurt környékén.', '["Német"]', 50.1288352, 8.7552222, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880u-2026-08-08', 'DE', 'HE')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de6-deak-kalte-klima-luftungstechnik-gmbh-co-kg', 'Deak Kälte Klima Lüftungstechnik GmbH& Co. KG', 'klima', 'Klíma / Fűtés', 'Feldstr. 12 36381 Schlüchtern', '+49 6661 6005223', 'Fűtés- és klímaszerelés Schlüchtern környékén.', '["Német"]', 50.3525104, 9.5291621, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880u-2026-08-08', 'DE', 'HE')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de6-rigo-moller', 'Rigo Möller', 'klima', 'Klíma / Fűtés', 'Hauptstr. 48 98634 Oberweid', '+49 36946 26160', 'Fűtés- és klímaszerelés Oberweid környékén.', '["Német"]', 50.5947719, 10.0639061, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880u-2026-08-08', 'DE', 'TH')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de6-rigo-schroder', 'Rigo Schröder', 'klima', 'Klíma / Fűtés', 'Porschendorfer Str. 13 01796 Pirna (Liebethal)', '+49 3501 460838', 'Fűtés- és klímaszerelés Pirna környékén.', '["Német"]', 50.9991608, 13.9612002, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880u-2026-08-08', 'DE', 'SN')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de6-csonka-therm-frastechnik-fur-fussbodenheizung', 'Csonka Therm - Frästechnik für Fußbodenheizung', 'klima', 'Klíma / Fűtés', 'Auf der Weismark 1 54294 Trier (Weismark-Feyen)', '+49 176 96719337', 'Fűtés- és klímaszerelés Trier környékén.', '["Német"]', 49.7365198, 6.637705, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880u-2026-08-08', 'DE', 'RP')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de6-parkett-und-bodenbelage-rm-parkett', 'Parkett und Bodenbeläge RM-PARKETT', 'lakasfelujitas', 'Lakásfelújítás / Kivitelezés', 'Oberer Grund 9 98596 Brotterode-Trusetal (Laudenbach)', '+49 36840 87150', 'Lakásfelújítás és kivitelezés Brotterode-Trusetal környékén.', '["Német"]', 50.8031984, 10.4135457, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880u-2026-08-08', 'DE', 'TH')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de6-bauservice-wrase', 'Bauservice Wrase', 'lakasfelujitas', 'Lakásfelújítás / Kivitelezés', 'Dellbusch 303 42279 Wuppertal (Oberbarmen)', '+49 202 8707928', 'Lakásfelújítás és kivitelezés Wuppertal környékén.', '["Német"]', 51.3007501, 7.2133975, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880u-2026-08-08', 'DE', 'NW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de6-rigo-gmbh', 'RIGO GmbH', 'lakatos', 'Lakatos', 'Einsteinstr. 9 74372 Sersheim', '+49 7042 83180', 'Lakatos- és zárszerelő munkák Sersheim környékén.', '["Német"]', 48.9557175, 9.004584, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880u-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de6-jurgen-ujvari-metallbauermeister', 'Jürgen Ujvari Metallbauermeister', 'lakatos', 'Lakatos', 'Nikolaus-Müller-Str. 2 75015 Bretten', '+49 7252 6606', 'Lakatos- és zárszerelő munkák Bretten környékén.', '["Német"]', 49.0308921, 8.7135084, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880u-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de6-paschi-parkett-dielen-fussbodenstudio', 'Paschi-Parkett & Dielen Fußbodenstudio', 'parkettazas', 'Padlóburkolás / Parkettázás', 'Bauernberg 1 17219 Möllenhagen (Bauernberg)', '+49 162 4706005', 'Parketta- és padlóburkolás Möllenhagen környékén.', '["Német"]', 53.5531873, 12.9348762, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880u-2026-08-08', 'DE', 'MV')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de6-rigo-riemann-gala-bau', 'Rigo Riemann GaLa-Bau', 'terkovezes', 'Térkövezés / Útépítés', 'Am Steinhaus 7 49134 Wallenhorst (Rulle)', '+49 5407 819477', 'Térkövezés és útépítés Wallenhorst környékén.', '["Német"]', 52.3491415, 8.0693298, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880u-2026-08-08', 'DE', 'NI')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de6-walter-dachdeckerei-spenglerei', 'Walter Dachdeckerei & Spenglerei', 'tetofedo', 'Tetőfedő / Ács', 'Weinbergstr. 28 85386 Eching (Ottenburg)', '+49 179 2949735', 'Tetőfedés és ácsmunka Eching környékén.', '["Német"]', 48.3179891, 11.5952295, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880u-2026-08-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de6-rigo-mayer-elektro-gmbh', 'Rigo Mayer Elektro GmbH', 'villany', 'Villanyszerelő', 'Marbacher Weg 70 74321 Bietigheim-Bissingen (Bissingen)', '+49 7142 989290', 'Villanyszerelés Bietigheim-Bissingen környékén.', '["Német"]', 48.9397399, 9.1237556, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880u-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de6-zambo-gmbh', 'Zambo GmbH', 'villany', 'Villanyszerelő', 'Industriestr. 18 42551 Velbert (Mitte)', '+49 2051 989028', 'Villanyszerelés Velbert környékén.', '["Német"]', 51.3398972, 7.0610387, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880u-2026-08-08', 'DE', 'NW')
ON CONFLICT(id) DO NOTHING;
