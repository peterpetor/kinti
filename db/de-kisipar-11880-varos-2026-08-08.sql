-- DE — KISIPAR, ÖTÖDIK KÖR: a 11880 VÁROS-bontása — 2026-08-08
--
-- ⚠️ MIÉRT KELLETT: a negyedik körben MINDEN országos lekérdezés pontosan 50
-- találatnál vágódott le. Ez nem kimerülés, hanem KORLÁT — a maradék csak
-- város-szűkítéssel érhető el (`/suche/Szabo/berlin`).
--   12 vezetéknév × 15 nagyváros = 180 lekérdezés → 1078 nyers → 210 jelölt
--   → 139 dedup után → 22 elfogadott → 20 felvett cég.
--
-- ⚠️ A HOZAM ÉRZÉKELHETŐEN GYENGÉBB, mint az országos körben (73 felvett 242
-- jelöltből = 30%, itt 22 a 139-ből = 16%). Az ok mérhető: a város-bontás
-- ugyanazt a nagyvárosi törzset hozza vissza más vágásban, ezért a dedup
-- sokkal többet szűrt (210-ből 71-et). A módszer tehát MŰKÖDIK, de a
-- következő kör ne további városokat tegyen hozzá, hanem ÚJ NEVEKET.
--
-- ⚠️ KÉT tétel geokódolhatatlan címmel esett ki, és mindkettő ugyanaz a minta:
-- a cím EMELETET/ÉPÜLETET is tartalmaz („Gollierstr. 70 /Haus C 3.OG"), vagy
-- a település nevébe ágyazott megkülönböztetőt („Bergheim bei Neuburg an der
-- Donau"). A Nominatim mindkettőn nullát ad. Nem tippelünk koordinátát.
--
-- A módszertan, a szűrők és a két-szűrős Maps-hitelesítés azonos a negyedik
-- körrel — ld. `db/de-kisipar-11880-2026-08-08.sql` fejlécét.
--
-- ⚠️ A magyar nyelvű kiszolgálás itt sincs ellenőrizve: NINCS ELLENŐRIZVE,
-- verified = 0.
--
-- Koordináták Nominatimból, mind utca-szintű.

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de5-katalin-szabo-fusspflege', 'Katalin Szabo Fußpflege', 'pedikur', 'Pedikűr / Lábápolás', 'Plittersdorfer Str. 135 53173 Bonn (Plittersdorf)', '+49 176 20561145', 'Pedikűr és lábápolás Bonn környékén.', '["Magyar","Német"]', 50.6959035, 7.1622969, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880v-2026-08-08', 'DE', 'NW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de5-fusspflegestudio-beata-horvath', 'Fußpflegestudio Beata Horvath', 'pedikur', 'Pedikűr / Lábápolás', 'Uhlandstr. 11 53424 Remagen', '+49 176 62084308', 'Pedikűr és lábápolás Remagen környékén.', '["Magyar","Német"]', 50.575182, 7.2433497, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880v-2026-08-08', 'DE', 'NW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de5-istvan-nemeth', 'Istvan Nemeth', 'autoszer', 'Autószerelő', 'Bahnhofstr. 13 01623 Lommatzsch', '+49 35241 80823', 'Autójavítás és -szerviz Lommatzsch környékén.', '["Magyar","Német"]', 51.1922294, 13.3141771, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880v-2026-08-08', 'DE', 'SN')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de5-tibor-varga', 'Tibor Varga', 'autoszer', 'Autószerelő', 'Hermann-Löns-Str. 11 83071 Stephanskirchen (Haidholzen)', '+49 8036 9594', 'Autójavítás és -szerviz Stephanskirchen környékén.', '["Magyar","Német"]', 47.8596921, 12.174233, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880v-2026-08-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de5-holzel-und-toth-uhren-schmuck', 'Hölzel und Toth Uhren Schmuck', 'ekszer', 'Ékszerész / Órás', 'Dresdner Str. 5 01844 Neustadt, Sachsen, Neustadt, Sachsen', '+49 3596 503004', 'Ékszerkészítés és -javítás Neustadt, Sachsen, Neustadt, Sachsen környékén.', '["Német"]', 51.0259187, 14.2136105, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880v-2026-08-08', 'DE', 'SN')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de5-malermeister-robert-molnar', 'Malermeister Robert Molnár', 'festo', 'Szobafestő / Tapétázó', 'Hauptstr. 14 82387 Antdorf', '+49 1522 4177168', 'Szobafestés, mázolás Antdorf környékén.', '["Német"]', 47.7499885, 11.3082805, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880v-2026-08-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de5-petra-horvath-kurierdienst', 'Petra Horvath Kurierdienst', 'futar', 'Futárszolgálat', 'Am Kautzgrund 3 36103 Flieden', '+49 6655 9099514', 'Futárszolgálat Flieden környékén.', '["Német"]', 50.4080929, 9.5548709, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880v-2026-08-08', 'DE', 'HE')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de5-a-papp-installateur-heizungsbaumeister', 'A. Papp Installateur & Heizungsbaumeister', 'gazvez', 'Víz-gáz szerelő', 'Bullenstedt 36 06408 Ilberstedt (Bullenstedt)', '+49 176 66554484', 'Víz- és gázszerelés Ilberstedt környékén.', '["Német"]', 51.7945087, 11.6729883, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880v-2026-08-08', 'DE', 'ST')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de5-vt-kernbohrungen-betonschneiden-tamas-varga', 'VT KERNBOHRUNGEN BETONSCHNEIDEN Tamas Varga', 'hazaszerkeszto', 'Házmester', 'Ketteltor 8 97837 Erlenbach bei Marktheidenfeld', '+49 172 3843394', 'Házmesteri és gondnoki szolgáltatás Erlenbach bei Marktheidenfeld környékén.', '["Német"]', 49.8223183, 9.6305631, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880v-2026-08-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de5-molnar-luftungs-klimatechnik-ug', 'Molnar Lüftungs-& Klimatechnik UG', 'klima', 'Klíma / Fűtés', 'Goslarer Weg 12 22453 Hamburg (Niendorf)', '+49 176 75927230', 'Fűtés- és klímaszerelés Hamburg környékén.', '["Német"]', 53.6361811, 9.9456622, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880v-2026-08-08', 'DE', 'HH')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de5-monika-szabo-wellnesbehandlungen', 'Monika Szabo Wellnesbehandlungen', 'pedikur', 'Pedikűr / Lábápolás', 'Strickerweg 12 73329 Kuchen', '+49 172 6432250', 'Pedikűr és lábápolás Kuchen környékén.', '["Német"]', 48.6448243, 9.7930076, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880v-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de5-kosmetikstudio-varga', 'Kosmetikstudio Varga', 'pedikur', 'Pedikűr / Lábápolás', 'Goethestr. 1 50259 Pulheim', '+49 2238 7359', 'Pedikűr és lábápolás Pulheim környékén.', '["Német"]', 50.9972523, 6.8124692, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880v-2026-08-08', 'DE', 'NW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de5-nagelstudio-varga', 'Nagelstudio Varga', 'pedikur', 'Pedikűr / Lábápolás', 'Jahnstr. 47 64347 Griesheim', '+49 6155 880286', 'Pedikűr és lábápolás Griesheim környékén.', '["Német"]', 49.8585358, 8.5799232, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880v-2026-08-08', 'DE', 'HE')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de5-mobile-fusspflege-molnar', 'Mobile Fusspflege Molnar', 'pedikur', 'Pedikűr / Lábápolás', 'Am Neuwiesenberg 28 64372 Ober-Ramstadt (Ober Modau)', '+49 1523 4564616', 'Pedikűr és lábápolás Ober-Ramstadt környékén.', '["Német"]', 49.7920956, 8.7379925, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880v-2026-08-08', 'DE', 'HE')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de5-fahrzeuguberfuhrungen-toth', 'Fahrzeugüberführungen Tóth', 'szallitmanyozo', 'Szállítmányozó / Speditőr', 'Mozartstr. 34 06862 Dessau-Roßlau (Roßlau)', '+49 172 5394066', 'Szállítmányozás Dessau-Roßlau környékén.', '["Német"]', 51.8925214, 12.2713589, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880v-2026-08-08', 'DE', 'ST')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de5-textilreinigung-kuhnel-inhaber-matthias-toth', 'Textilreinigung Kühnel, Inhaber: Matthias Toth', 'takarito', 'Takarítás', 'Zehistaer Str. 42 01796 Pirna', '+49 3501 446152', 'Takarítás és épülettisztítás Pirna környékén.', '["Német"]', 50.9477192, 13.9317366, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880v-2026-08-08', 'DE', 'SN')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de5-varga-reiniger-auto-komplett-innenreinigung-vo', 'Varga Reiniger Auto Komplett Innenreinigung vor Ort', 'takarito', 'Takarítás', 'Brainkofer Str. 7 73527 Schwäbisch Gmünd (Herlikofen)', '+49 1514 6860591', 'Takarítás és épülettisztítás Schwäbisch Gmünd környékén.', '["Német"]', 48.82135, 9.8475008, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880v-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de5-varga-service', 'VARGA Service', 'terkovezes', 'Térkövezés / Útépítés', 'Katharinenstr. 4 83278 Traunstein', '+49 861 9861110', 'Térkövezés és útépítés Traunstein környékén.', '["Német"]', 47.8676913, 12.6428353, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880v-2026-08-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de5-angelika-szabo', 'Angelika Szabo', 'varrono', 'Varrónő', 'Martersgässle 11 74613 Öhringen', '+49 7941 648356', 'Ruhajavítás és -igazítás Öhringen környékén.', '["Német"]', 49.2008715, 9.501116, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880v-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de5-elektroservice-papp', 'Elektroservice PAPP', 'villany', 'Villanyszerelő', 'Keplerstr. 13 72644 Oberboihingen', '+49 7022 2050139', 'Villanyszerelés Oberboihingen környékén.', '["Német"]', 48.6461333, 9.3617148, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880v-2026-08-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;
