-- DE — KISIPAR, NEGYEDIK KÖR: a 11880.com NÉV-keresése — 2026-08-08
--
-- ⭐ MI AZ ÚJ: a harmadik kör a gelbeseiten.de-t kérdezte magyar VEZETÉKNÉVRE.
-- Ez a kör ugyanazt a névkészletet (55 vezetéknév + 28 keresztnév) a MÁSIK
-- német cégjegyzéken futtatja. A 11880 sűrűbb: 150 nyers tételből 36 jelölt
-- jött ki, szemben a gelbeseiten 1731/93 arányával — mert a 11880 keresője
-- NÉV-központú, a gelbeseiten inkább szakma-központú.
--   83 lekérdezés → 2089 nyers tétel → 269 jelölt → 242 dedup után.
--
-- ⚠️⚠️ A SZAKMA ITT SZABAD SZÖVEG, NEM TAXONÓMIA. A gelbeseiten „Dachdeckereien"-t
-- ad, a 11880 viszont ilyet: „Landschaftsbau, Garten- und Landschaftspflege &
-- Fensterreinigung". Kulcsszóra kell illeszteni, és a német összetett szavak
-- egymásba érnek — a minták ezért a LEGSPECIFIKUSABBTÓL haladnak, az első
-- találat nyer (`scripts/filter-hu-11880.mjs`):
--   • „Fensterreinigung" (ablaktisztítás) tartalmazza a „Fenster"-t → ablakos lenne
--   • „Autolackiererei" tartalmazza a „lackier"-t → szobafestő lenne
--   • „Vereinigung" (egyesület) tartalmazza a „reinigung"-ot → takarítócég lenne
--     (ez utóbbi VALÓS hiba volt: egy magyar egyházközség 2026-08-07-én)
--
-- ⚠️ MAGÁNSZEMÉLYEK: a 11880 külön sávot kínál („Es wurden auch N
-- Personeneinträge … gefunden"). Ez NEM cég, és magánszemély lakcíme/telefonja
-- soha nem kerülhet a szaknévsorba. A szűrő kihagyja.
--
-- ⚠️ A cím a találati listán duplikálja a települést („…, 06108 Halle
-- (Altstadt), Halle") — tisztítani kell, mielőtt a felhasználó elé kerül.
--
-- ⚠️⚠️ A MAPS-TALÁLAT ÖNMAGÁBAN NEM BIZONYÍTÉK — ugyanaz a két-szűrős
-- kiértékelés fut, mint a harmadik körben (`scripts/verify-strict-match.mjs`):
-- elfogadás csak akkor, ha a TELEFON számjegyre egyezik, VAGY a cím házszámig
-- egyezik ÉS van közös megkülönböztető név-token.
--
-- ⚠️ A magyar nyelvű kiszolgálás itt sincs ellenőrizve: NINCS ELLENŐRIZVE,
-- verified = 0. A `languages` csak akkor kap „Magyar"-t, ha a cégnévben magyar
-- KERESZTNÉV is van — a puszta vezetéknév második generációt is jelenthet.
--
-- ⚠️ AMI NEM MŰKÖDÖTT: a hitelesítő korábban CSAK a ciklus után írt fájlt, így
-- egy megszakadt futás mindent elvesztett. Most soronként ment és folytatható.
--
-- Koordináták Nominatimból, mind utca-szintű.

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-kfz-werkstatt-und-reifenservice-balogh', 'Kfz- Werkstatt und Reifenservice Balogh', 'autoszer', 'Autószerelő', 'Dietweg 2 78056 Villingen-Schwenningen (Weigheim)', '+49 7425 3300178', 'Autójavítás és -szerviz Villingen-Schwenningen környékén.', '["Német"]', 48.0581213, 8.611449, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-kunstmaler-laszlo-horvath-wandmalerei-und', 'Kunstmaler László Horváth - Wandmalerei und', 'festo', 'Szobafestő / Tapétázó', 'Hirtenweg 2 34128 Kassel (Harleshausen)', '+49 176 24211021', 'Szobafestés, mázolás Kassel környékén.', '["Magyar","Német"]', 51.3376933, 9.4380559, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'HE')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-laszlo-szabo-trockenbau', 'Laszlo Szabo TrockenBau', 'fuggesztett_menyezet', 'Álmennyezet / Gipszkarton', 'Ursulasrieder Str. 27 87437 Kempten (Ursulasried)', '+49 1514 5403937', 'Gipszkarton- és álmennyezet-szerelés Kempten környékén.', '["Magyar","Német"]', 47.7527723, 10.3188044, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-klimatechnik-laszlo-juhasz', 'Klimatechnik - Laszlo Juhasz', 'klima', 'Klíma / Fűtés', 'Marienweg 6 74182 Obersulm (Willsbach)', '+49 172 9574745', 'Fűtés- és klímaszerelés Obersulm környékén.', '["Magyar","Német"]', 49.1313829, 9.357438, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-szabo-sonnenschutz', 'Szabo Sonnenschutz', 'arnyekolastechnika', 'Árnyékolástechnika / Redőny', 'Birkenstr. 21 74626 Bretzfeld (Schwabbach)', '+49 7946 9439365', 'Árnyékolástechnika és redőny Bretzfeld környékén.', '["Német"]', 49.1840897, 9.3898761, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-oliver-molnar-rolladen-sonnenschutz', 'Oliver Molnar Rolladen & Sonnenschutz', 'arnyekolastechnika', 'Árnyékolástechnika / Redőny', 'Alter Weg 63 63110 Rodgau (Jügesheim)', '+49 6106 646850', 'Árnyékolástechnika és redőny Rodgau környékén.', '["Német"]', 50.0277263, 8.8750711, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'HE')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-eu-fenster-alex-takacs', 'EU-Fenster Alex Takács', 'arnyekolastechnika', 'Árnyékolástechnika / Redőny', 'Lennigstr. 42 56330 Kobern-Gondorf (Kobern)', '+49 2607 9743218', 'Árnyékolástechnika és redőny Kobern-Gondorf környékén.', '["Német"]', 50.3129304, 7.4585475, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'RP')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-nemeth-holzmontagen', 'Nemeth Holzmontagen', 'asztalos', 'Asztalos', 'Bachstr. 17 71546 Aspach (Allmersbach am Weinberg)', '+49 179 2123016', 'Asztalos- és bútormunkák Aspach környékén.', '["Német"]', 48.990793, 9.3963342, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-matyas-tischlerei', 'MATYAS TISCHLEREI', 'asztalos', 'Asztalos', 'Bussardstr. 3 44357 Dortmund (Oestrich)', '(0231) 331727', 'Asztalos- és bútormunkák Dortmund környékén.', '["Német"]', 51.5703155, 7.3717976, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'NW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-ralf-g-w-kovacs', 'Ralf G.W. Kovacs', 'autoszer', 'Autószerelő', 'Dahlhauser Str. 103 45279 Essen (Horst)', '+49 201 8159367', 'Autójavítás és -szerviz Essen környékén.', '["Német"]', 51.4400957, 7.093187, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'NW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-auto-molnar-kfz-werkstatt', 'Auto-Molnar KFZ-Werkstatt', 'autoszer', 'Autószerelő', 'Ringstr. 83 /2 70736 Fellbach', '+49 711 588686', 'Autójavítás és -szerviz Fellbach környékén.', '["Német"]', 48.8229144, 9.2856523, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-auto-molnar-kfz-werkstatt-2', 'Auto-Molnar KFZ-Werkstatt', 'autoszer', 'Autószerelő', 'Ringstr. 83 70736 Fellbach', '+49 711 588686', 'Autójavítás és -szerviz Fellbach környékén.', '["Német"]', 48.8229152, 9.2859229, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-huk-coburg-versicherung-camelia-nadia-feher-in', 'HUK-COBURG Versicherung Camelia Nadia Feher in Bad', 'autoszer', 'Autószerelő', 'Kirchplatz 4 07356 Bad Lobenstein', '+49 174 1481852', 'Autójavítás és -szerviz Bad Lobenstein környékén.', '["Német"]', 50.4480844, 11.6393503, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'TH')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-star-tankstelle', 'star Tankstelle', 'autoszer', 'Autószerelő', 'Siebeneicker Str. 170 42553 Velbert (Neviges)', '+49 2053 420811', 'Autójavítás és -szerviz Velbert környékén.', '["Német"]', 51.308544, 7.107136, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'NW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-szanto-automobile', 'Szanto Automobile', 'autoszer', 'Autószerelő', 'Norderneystr. 2 51377 Leverkusen (Manfort)', '+49 214 31491330', 'Autójavítás és -szerviz Leverkusen környékén.', '["Német"]', 51.0306697, 7.0109805, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'NW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-firma-nimrod-toth', 'Firma Nimrod Toth', 'burkolo', 'Burkoló / Csempéző', 'Im Heimgarten 19 90547 Stein (Deutenbach)', '+49 176 94494014', 'Csempézés, burkolás Stein környékén.', '["Német"]', 49.3993455, 11.0204529, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-varga-company-baumontage-gmbh', 'Varga Company Baumontage Gmbh', 'burkolo', 'Burkoló / Csempéző', 'Rainweg 10 35083 Wetter, Hessen (Unterrosphe), Wetter, Hessen', '(0162) 9261015', 'Csempézés, burkolás Wetter, Hessen , Wetter, Hessen környékén.', '["Német"]', 50.8907473, 8.7748494, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'HE')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-bauservice-nagy', 'Bauservice Nagy', 'burkolo', 'Burkoló / Csempéző', 'Lohrmannstr. 20 01237 Dresden (Reick)', '+49 173 7632811', 'Csempézés, burkolás Dresden környékén.', '["Német"]', 51.018376, 13.7886886, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'SN')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-ihr-fliesen-ass', 'Ihr-Fliesen-Ass', 'burkolo', 'Burkoló / Csempéző', 'Uhlandstr. 12 72820 Sonnenbühl (Undingen)', '+49 7128 7759847', 'Csempézés, burkolás Sonnenbühl környékén.', '["Német"]', 48.3897165, 9.1817087, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-fliesenleger-kocsis', 'Fliesenleger Kocsis', 'burkolo', 'Burkoló / Csempéző', 'Auf dem Herrengraben 2 37242 Bad Sooden-Allendorf', '+49 1515 5862986', 'Csempézés, burkolás Bad Sooden-Allendorf környékén.', '["Német"]', 51.2666503, 9.9646499, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'NI')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-e-k-sanitatshaus-gmbh', 'e&k Sanitätshaus GmbH', 'cipesz', 'Cipész / Kulcsmásoló', 'Karl-Herbster-Str. 7 79539 Lörrach', '+49 7621 167770', 'Cipőjavítás Lörrach környékén.', '["Német"]', 47.6222897, 7.6693046, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-farkas-maler', 'Farkas Maler', 'festo', 'Szobafestő / Tapétázó', 'St.-Vitus-Str. 10 85232 Bergkirchen (Günding)', '+49 8131 371785', 'Szobafestés, mázolás Bergkirchen környékén.', '["Német"]', 48.2555167, 11.3952618, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-a-kiraly', 'A. Kiraly', 'festo', 'Szobafestő / Tapétázó', 'Unterstruth 39 35418 Buseck (Großen Buseck)', '+49 6408 3126', 'Szobafestés, mázolás Buseck környékén.', '["Német"]', 50.6034891, 8.7780124, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'HE')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-ferienwohnung-borbely', 'Ferienwohnung Borbély', 'festo', 'Szobafestő / Tapétázó', 'Waltersberg 28 71540 Murrhardt', '+49 7192 5709', 'Szobafestés, mázolás Murrhardt környékén.', '["Német"]', 48.9669577, 9.5615515, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-fliesenleger-kovacs-innovativer-innenausbau-kr', 'Fliesenleger Kovacs Innovativer Innenausbau - Krisztian', 'fuggesztett_menyezet', 'Álmennyezet / Gipszkarton', 'Rehstr. 43 58089 Hagen (Wehringhausen)', '+49 176 36931128', 'Gipszkarton- és álmennyezet-szerelés Hagen környékén.', '["Magyar","Német"]', 51.3493703, 7.4494981, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'NW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-farkas-montageservice', 'Farkas Montageservice', 'fuggesztett_menyezet', 'Álmennyezet / Gipszkarton', 'Maximinstr. 47 66763 Dillingen (Pachten)', '+49 162 6207594', 'Gipszkarton- és álmennyezet-szerelés Dillingen környékén.', '["Német"]', 49.3550691, 6.712069, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'SL')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-molnar-haus-und-kanal-service', 'Molnar Haus und Kanal Service', 'gazvez', 'Víz-gáz szerelő', 'Forststr. 6 74865 Neckarzimmern', '+49 1525 7173429', 'Víz- és gázszerelés Neckarzimmern környékén.', '["Német"]', 49.324787, 9.1350479, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-farkas-kuchen-und-service', 'Farkas Küchen und Service', 'gazvez', 'Víz-gáz szerelő', 'Güterhofstr. 10 01445 Radebeul', '+49 351 85099477', 'Víz- és gázszerelés Radebeul környékén.', '["Német"]', 51.1084547, 13.6242929, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'SN')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-dirk-nagy', 'Dirk Nagy', 'gepijarmu_oktato', 'Autósiskola / Oktató', 'Burgstr. 33 35708 Haiger', '+49 2773 919454', 'Autósiskola Haiger környékén.', '["Német"]', 50.741441, 8.2032401, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'HE')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-immobilien-nagy', 'Immobilien Nagy', 'hazaszerkeszto', 'Házmester', 'Wiesenweg 3 83646 Wackersberg', '+49 8041 71248', 'Házmesteri és gondnoki szolgáltatás Wackersberg környékén.', '["Német"]', 47.737698, 11.5479948, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-mw-design-gmbh-stefan-matyas-ralf-wiegener', 'MW - Design GmbH. Stefan Matyas / Ralf Wiegener', 'karosszeria', 'Karosszérialakatos', 'Zunftstr. 10 50374 Erftstadt (Lechenich)', '+49 2235 9599662', 'Karosszéria-javítás Erftstadt környékén.', '["Német"]', 50.7980515, 6.781539, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'NW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-sndor-toth-garten-und-landschaftsbau', 'Sndor Toth Garten- und Landschaftsbau', 'kertesz', 'Kertészet', 'Kiebitzstr. 23 85716 Unterschleißheim (Hollern)', '+49 89 88900669', 'Kertészet és kertfenntartás Unterschleißheim környékén.', '["Német"]', 48.2811751, 11.5884076, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-gartnerei-nemeth-mario', 'Gärtnerei Nemeth Mario', 'kertesz', 'Kertészet', 'Holzstr. 37 B 08412 Werdau', '+49 3761 81189', 'Kertészet és kertfenntartás Werdau környékén.', '["Német"]', 50.7317489, 12.3630294, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'SN')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-varga-haus-gartenservice', 'Varga Haus & Gartenservice', 'kertesz', 'Kertészet', 'Lerchenweg 6 91171 Greding', '+49 170 4316790', 'Kertészet és kertfenntartás Greding környékén.', '["Német"]', 49.0419201, 11.3643905, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-gartenhausservice-vincze-roland', 'Gartenhausservice-Vincze Roland', 'kertesz', 'Kertészet', 'Taunusstr. 22 66113 Saarbrücken (Malstatt)', '+49 160 2401718', 'Kertészet és kertfenntartás Saarbrücken környékén.', '["Német"]', 49.248225, 6.970722, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'SL')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-ervin-pasztor-gartenarbeiten', 'Ervin Pasztor Gartenarbeiten', 'kertesz', 'Kertészet', 'Eichenweg 35 72770 Reutlingen (Ohmenhausen)', '+49 7121 372793', 'Kertészet és kertfenntartás Reutlingen környékén.', '["Német"]', 48.4725584, 9.1301232, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-braun-toth-absaugtechnik-gmbh', 'Braun&Toth Absaugtechnik GmbH', 'klima', 'Klíma / Fűtés', 'Im Bruch 18 63897 Miltenberg', '+49 9371 97320', 'Fűtés- és klímaszerelés Miltenberg környékén.', '["Német"]', 49.7059851, 9.2246615, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'HE')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-heizung-luftung-sanitar-molnar', 'Heizung Lüftung Sanitär - Molnar', 'klima', 'Klíma / Fűtés', 'Ellenbeek 21 42489 Wülfrath', '+49 2058 9781586', 'Fűtés- és klímaszerelés Wülfrath környékén.', '["Német"]', 51.2838204, 7.0557461, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'NW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-rudolf-pasztor-gmbh-sanitarinstallation-heizun', 'Rudolf Pasztor GmbH Sanitärinstallation - Heizung - Gas', 'klima', 'Klíma / Fűtés', 'Am Anger 24 86564 Brunnen (Hohenried)', '+49 8454 3573', 'Fűtés- és klímaszerelés Brunnen környékén.', '["Német"]', 48.6341998, 11.3576342, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-bognar-design-eventdekoration', 'Bognar Design Eventdekoration', 'lakasfelujitas', 'Lakásfelújítás / Kivitelezés', 'Auf Kohl 2 72336 Balingen (Frommern)', '+49 1525 2770330', 'Lakásfelújítás és kivitelezés Balingen környékén.', '["Német"]', 48.2510444, 8.8640537, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-szanto-kaiser-gmbh', 'Szántó-Kaiser GmbH', 'lakasfelujitas', 'Lakásfelújítás / Kivitelezés', '73066 Uhingen', '+49 7161 3048106', 'Lakásfelújítás és kivitelezés Uhingen környékén.', '["Német"]', 48.7215995, 9.5660255, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-kovacs-ingenieurburo-fur-tragwerksplanung', 'Kovacs Ingenieurbüro für Tragwerksplanung', 'lakatos', 'Lakatos', 'Firmianstr. 10 94032 Passau (Haidenhof-Nord)', '+49 851 20936023', 'Lakatos- és zárszerelő munkák Passau környékén.', '["Német"]', 48.5719524, 13.4528076, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-gelanderbau-molnar', 'Geländerbau Molnar', 'lakatos', 'Lakatos', 'Birkenstr. 18 94469 Deggendorf (Natternberg)', '+49 991 3201674', 'Lakatos- és zárszerelő munkák Deggendorf környékén.', '["Német"]', 48.8220925, 12.9139281, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-papp-cnc-technik', 'Papp CNC Technik', 'lakatos', 'Lakatos', 'Zeisigweg 4 73340 Amstetten', '+49 7331 7585', 'Lakatos- és zárszerelő munkák Amstetten környékén.', '["Német"]', 48.5847112, 9.8705091, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-gabriel-takacs', 'Gabriel Takacs', 'lakatos', 'Lakatos', 'Hindenburgstr. 4 72631 Aichtal (Grötzingen)', '+49 7127 50816', 'Lakatos- és zárszerelő munkák Aichtal környékén.', '["Német"]', 48.6251173, 9.2639074, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-schweisserei-zsigmond', 'Schweißerei Zsigmond', 'lakatos', 'Lakatos', 'Flurstr. 28 85402 Kranzberg', '+49 170 6026189', 'Lakatos- és zárszerelő munkák Kranzberg környékén.', '["Magyar","Német"]', 48.4087821, 11.5992036, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-matyas', 'Matyas', 'lakatos', 'Lakatos', 'Killwies 78247 Hilzingen', '+49 7731 790779', 'Lakatos- és zárszerelő munkák Hilzingen környékén.', '["Német"]', 47.7589755, 8.7827112, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-niki-szilagyi-interior-architecture', 'niki szilagyi interior architecture', 'lakberendezes', 'Belsőépítészet', 'Sendlinger-Tor-Platz 10 80336 München (Altstadt-Lehel)', '+49 89 26949280', 'Belsőépítészet és lakberendezés München környékén.', '["Német"]', 48.1340323, 11.5667279, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-md-trockenbau', 'MD Trockenbau', 'nyilaszaros', 'Nyílászáró / Ablak-ajtó', 'Flößaustr. 47 90763 Fürth (Südstadt)', '+49 162 4750616', 'Nyílászáró-beépítés Fürth környékén.', '["Német"]', 49.4615338, 10.9893254, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-parkett-balogh', 'Parkett Balogh', 'parkettazas', 'Padlóburkolás / Parkettázás', 'Sudetenlandstr. 7 95478 Kemnath', '+49 170 2244929', 'Parketta- és padlóburkolás Kemnath környékén.', '["Német"]', 49.8742184, 11.8874163, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-fachpraxis-fur-podologie-nemeth', 'Fachpraxis für Podologie Nemeth', 'pedikur', 'Pedikűr / Lábápolás', 'Sülldorfer Landstr. 166 22589 Hamburg (Sülldorf)', '+49 40 868485', 'Pedikűr és lábápolás Hamburg környékén.', '["Német"]', 53.5798677, 9.8012757, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'HH')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-sabine-nemeth', 'Sabine Nemeth', 'pedikur', 'Pedikűr / Lábápolás', 'Tonndorfer Weg 28 22149 Hamburg (Rahlstedt)', '+49 40 664404', 'Pedikűr és lábápolás Hamburg környékén.', '["Német"]', 53.5958696, 10.140809, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'HH')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-praxis-fur-podologie-vanessa-kelemen', 'Praxis für Podologie - Vanessa Kelemen', 'pedikur', 'Pedikűr / Lábápolás', 'Dietlinger Str. 19 75179 Pforzheim (Brötzingen)', '+49 176 46755032', 'Pedikűr és lábápolás Pforzheim környékén.', '["Német"]', 48.8902722, 8.6643303, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-albin-horvath-bautenschutz', 'Albín Horváth Bautenschutz', 'szigetelo', 'Víz- és hőszigetelő', 'Summerstr. 25 82211 Herrsching', '+49 170 1692188', 'Víz- és hőszigetelés Herrsching környékén.', '["Német"]', 47.9930962, 11.1709007, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-hausmeisterservice-toth', 'Hausmeisterservice Toth', 'takarito', 'Takarítás', 'Buchenlandstr. 25 85368 Moosburg', '(01512) 8880931', 'Takarítás és épülettisztítás Moosburg környékén.', '["Német"]', 48.4801486, 11.9437197, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-textilpflege-toth', 'Textilpflege Toth', 'takarito', 'Takarítás', 'Breitscheidstr. 78 01237 Dresden (Leuben)', '+49 351 20502810', 'Takarítás és épülettisztítás Dresden környékén.', '["Német"]', 51.0089889, 13.813789, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'SN')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-horvath-rundumhilfe', 'Horvath Rundumhilfe', 'takarito', 'Takarítás', 'Leißstr. 1 83620 Feldkirchen-Westerham (Feldolling)', '+49 177 2461735', 'Takarítás és épülettisztítás Feldkirchen-Westerham környékén.', '["Német"]', 47.8961994, 11.8460133, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-molnar-dienstleistungen', 'Molnar Dienstleistungen', 'takarito', 'Takarítás', 'Kochersteinsfelder Str. 39 74239 Hardthausen (Lampoldshausen)', '+49 1511 7288518', 'Takarítás és épülettisztítás Hardthausen környékén.', '["Német"]', 49.2639465, 9.3999524, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-eni-clean-gebaudereinigung', 'Eni Clean Gebäudereinigung', 'takarito', 'Takarítás', 'Saarburger Str. 25 54329 Konz (Könen)', '+49 162 5946615', 'Takarítás és épülettisztítás Konz környékén.', '["Német"]', 49.6797482, 6.5538463, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'RP')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-ely-ulian-nagy-gebaude-reinigen-ug', 'Ely & Ulian Nagy Gebäude reinigen UG', 'takarito', 'Takarítás', 'Butterhof 8 71083 Herrenberg (Affstätt)', '+49 172 6762522', 'Takarítás és épülettisztítás Herrenberg környékén.', '["Német"]', 48.6078365, 8.8611514, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-balogh-reinigung', 'Balogh Reinigung', 'takarito', 'Takarítás', 'Rheinische Str. 90 44137 Dortmund (Mitte)', '+49 163 3975173', 'Takarítás és épülettisztítás Dortmund környékén.', '["Német"]', 51.5133233, 7.4408262, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'NW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-gebaudereinigung-ludwigsburg-balogh', 'Gebäudereinigung Ludwigsburg Balogh', 'takarito', 'Takarítás', 'Christofstr. 10 71686 Remseck (Aldingen)', '+49 711 6458985', 'Takarítás és épülettisztítás Remseck környékén.', '["Német"]', 48.8661075, 9.2515734, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-papp-s-seniorenhilfe', 'Papp´s Seniorenhilfe', 'takarito', 'Takarítás', 'Pfeffinger Str. 149 72461 Albstadt (Tailfingen)', '+49 7432 6058868', 'Takarítás és épülettisztítás Albstadt környékén.', '["Német"]', 48.2502147, 8.9997687, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-meszaros-dienstleistungen', 'Meszaros Dienstleistungen', 'takarito', 'Takarítás', 'Ladenburger Weg 69121 Heidelberg (Handschuhsheim)', '+49 6221 400414', 'Takarítás és épülettisztítás Heidelberg környékén.', '["Német"]', 49.433762, 8.6665378, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-kelemen-gebaudereinigung', 'Kelemen Gebäudereinigung', 'takarito', 'Takarítás', 'Eichenrain 10 71737 Kirchberg an der Murr (Neuhof)', '+49 7144 8196207', 'Takarítás és épülettisztítás Kirchberg an der Murr környékén.', '["Német"]', 48.9363099, 9.3253313, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-t-f-bestattungshaus-tamara-pinter', 'T & F - Bestattungshaus Tamara Pintér', 'temetkezes', 'Temetkezés', 'Franz-Spiller-Platz 4 06679 Hohenmölsen', '+49 34441 22360', 'Temetkezési szolgáltatás Hohenmölsen környékén.', '["Német"]', 51.1561074, 12.0951315, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'ST')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-horvath-tief-und-strassenbau-e-k', 'Horvath Tief- und Strassenbau e.K', 'terkovezes', 'Térkövezés / Útépítés', 'Mittelwegring 11 76751 Jockgrim', '+49 7271 5085420', 'Térkövezés és útépítés Jockgrim környékén.', '["Német"]', 49.0817019, 8.2656714, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-nagy-l-l-gbr-levente-nagy-levente-banyas', 'Nagy L&L GbR Levente Nagy & Levente Banyas', 'terkovezes', 'Térkövezés / Útépítés', 'Flecken 7 39264 Lindau, Anhalt (Lindau), Lindau, Anhalt', '+49 172 4168856', 'Térkövezés és útépítés Lindau, Anhalt , Lindau, Anhalt környékén.', '["Magyar","Német"]', 52.038883, 12.1048135, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'ST')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-balazs-dachdeckerei-abbruch-service-ug', 'BALAZS Dachdeckerei & Abbruch Service UG', 'tetofedo', 'Tetőfedő / Ács', 'Oesterheidestr. 14 44892 Bochum (Langendreer)', '+49 1578 1140651', 'Tetőfedés és ácsmunka Bochum környékén.', '["Magyar","Német"]', 51.4811614, 7.3302948, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'NW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-dachdeckerei-balazs', 'Dachdeckerei Balazs', 'tetofedo', 'Tetőfedő / Ács', 'Dorfstr. 2 38154 Königslutter (Bornum)', '+49 176 24676727', 'Tetőfedés és ácsmunka Königslutter környékén.', '["Magyar","Német"]', 52.257594, 10.752077, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'NI')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-jeans-shop-balazs-warza', 'Jeans-Shop Balazs-warza', 'varrono', 'Varrónő', 'Fridolin-Holzer-Str. 8 88171 Weiler-Simmerberg (Weiler)', '+49 8387 924858', 'Ruhajavítás és -igazítás Weiler-Simmerberg környékén.', '["Magyar","Német"]', 47.5828382, 9.9163333, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-elektro-kelemen', 'Elektro Kelemen', 'villany', 'Villanyszerelő', 'Wöschhalde 2 78052 Villingen-Schwenningen (Villingen)', '+49 176 14656816', 'Villanyszerelés Villingen-Schwenningen környékén.', '["Német"]', 48.0850777, 8.4619848, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de4-c-l-s-elektrotechnik-inhaber-jurgen-hajdu-e-k', 'C.L.S. ELEKTROTECHNIK INHABER JÜRGEN HAJDU E.K', 'villany', 'Villanyszerelő', 'Ackerstr. 80 40233 Düsseldorf (Flingern Nord)', '+49 172 2103161', 'Villanyszerelés Düsseldorf környékén.', '["Német"]', 51.2272806, 6.8004388, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08-08', 'DE', 'NW')
ON CONFLICT(id) DO NOTHING;
