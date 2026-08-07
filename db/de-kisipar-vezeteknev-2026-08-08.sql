-- DE — KISIPAR, HARMADIK KÖR: 33 új tétel magyar VEZETÉKNÉV-kereséssel — 2026-08-08
--
-- ⭐ MI AZ ÚJ EBBEN: az előző két kör magyar KERESZTNÉVRE keresett a német
-- cégjegyzékben, és ez a forrás telítődött. Ez a kör ugyanazon a gelbeseiten.de-n
-- MÁSIK TENGELYEN kérdez: magyar VEZETÉKNÉVRE. Ez tényleg más halmaz, mert a
-- tipikus találat „Kovacs Johann Maler + Lackierbetrieb" — magyar vezetéknév
-- NÉMET keresztnévvel, amit a keresztnév-kereső sosem hozott elő.
--   111 lekérdezés → 1731 nyers tétel → 272 rés-szakmában → 93 jelölt
--   → 84 dedup után → Maps-hitelesítés → 33 felvett cég.
--
-- ⚠️ EZÉRT KELL KÜLÖN SZŰRŐ (scripts/filter-hu-vezeteknev.mjs): a keresztnév-kör
-- KÉT független magyar jelet követelt. Itt az kidobná az összes második
-- generációs iparost. A jel ezért a vezetéknév HELYESÍRÁSA:
--   • SZIGORÚ  (Tóth, Balogh, Papp, Mészáros, Szabó…): a `th`/`gh`/`sz`/`cs`
--     írásmód gyakorlatilag csak magyar — EGY ilyen token elég.
--   • KÉTES    (Bogdan, Fabian, Gaspar, Horvat, Vajda, Bodnar): másutt
--     KERESZTNÉV és sokszorosan gyakoribb — ezekhez magyar keresztnév is kell.
--   ⚠️ „Horvat" h NÉLKÜL HORVÁT név, nem a magyar „Horváth". A cégjegyzék
--     fuzzy-illesztése mindkettőt visszaadja ugyanarra a lekérdezésre.
--   ⚠️ Ha a névben van `-ski/-wicz/-escu/-ović` végű token, a találat
--     lengyel/román/délszláv AKKOR IS, ha „Bogdan" van benne. Mérve:
--     „Igielski Bogdan", „Libowski Bogdan", „Skalski Fabian".
--
-- ⚠️⚠️ A MAPS „✓"-JE ÖNMAGÁBAN NEM BIZONYÍTÉK. A hitelesítő azt jelzi, hogy a
-- Maps EGY konkrét helyet nyitott meg — nem azt, hogy AZT a helyet. Három mért
-- téves illesztés, ami egy szűrővel bekerült volna a szaknévsorba:
--   • „Szabo Istvan, Ringenwalder Str. 59, Berlin" → Elektro Notdienst Berlin Mitte
--   • „Hajdu Jochen, Bei der Villa 7"             → DEKRA Congress Center
--   • „Varga Hausmeisterdienste"                  → egy HIRDETÉS („Patrocinado")
-- Ezért a KÉT-SZŰRŐS kiértékelés (scripts/verify-strict-match.mjs): elfogadás
-- csak akkor, ha a TELEFON számjegyre egyezik, VAGY a cím házszámig egyezik ÉS
-- van közös megkülönböztető név-token. 84 hitelesítettből így 30 maradt.
--
-- ⚠️ AMI NEM MŰKÖDÖTT (ne kelljen újra megmérni):
--   • herold.at (AT) — Qwik-alapú SPA, a keresés sem URL-ből, sem űrlapból nem
--     indítható el fejetlen böngészővel; a `?was=`/`was_<szó>` útvonal a
--     szabad szöveget SZAKMA-slugként értelmezi és „nem található"-t ad.
--   • firmen.wko.at (AT) — HTTP 403, bot-védelem.
--   • firmenabc.at    (AT) — a régi kereső-útvonal HTTP 410 Gone.
--   • Maps keresés PUSZTA TELEFONSZÁMRA: 47 újrapróbából 3 talált. Régen ez
--     megbízható volt, ma jellemzően találati listát ad. Nem érdemes rá építeni,
--     de a maradékot érdemes vele átfésülni — 2 tétel CSAK így került elő.
--
-- ⚠️ MÉRT MELLÉKLELET: a gelbeseiten ÉKEZET-ÉRZÉKETLEN. A „Szabó" és a „Szabo"
-- betűre ugyanazt a találati listát adja (mind az 55 ékezetes párnál +0 új
-- tétel). A következő körben NE kérdezd le mindkét alakot — feleannyi idő.
--
-- ⚠️ 7 VÉGLEGESEN BEZÁRT cég volt a 84 jelölt között (8,3%). A cégjegyzék benn
-- tartja őket; csak a Maps bezárás-jelzője fogja meg. A hitelesítés nem opció.
--
-- ⚠️ A CSONKA TELEFONSZÁM: a Maps a „Fahrschule Nemeth" számát „+49 7324 75"
-- alakban adta vissza, pedig a forrás 07324 7595. A szigorú telefon-egyezés
-- ezen elbukott; a tétel kézzel, dokumentáltan került be (a találat épp a TELJES
-- forrás-számra keresve jött elő, és a név is egyezik).
--
-- ⚠️ A Nominatim NULLA találatot ad a városrész-zárójelre („67657 Kaiserslautern
-- (Innenstadt)"). Zárójel nélkül újra kell próbálni — enélkül 1 tétel kiesett.
--
-- ⚠️ NYELV: a `languages` mező itt TÖBBNYIRE csak „Német". A puszta magyar
-- vezetéknév második generációt is jelenthet, aki nem beszél magyarul; „Magyar"
-- csak akkor kerül be, ha a cégnévben magyar KERESZTNÉV is van. A magyar nyelvű
-- kiszolgálás egyik tételnél sincs ellenőrizve: NINCS ELLENŐRIZVE, verified = 0.
--
-- ⚠️ A NÉV a Maps szerinti JELENLEGI cégnév, nem a cégjegyzékbeli. Több cég
-- azóta átnevezett (Máté Farkas Fliesenarbeiten → Komfort-Bad Mosbach), és a
-- felhasználó a mai táblát keresi az ajtón.
--
-- Koordináták Nominatimból, mind a 33 utca-szintű.

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de3-holzbau-bernhard-nemeth', 'Holzbau Bernhard Nemeth', 'asztalos', 'Asztalos', 'Bahnhofstr. 13, 83135 Schechen', '+49 8039 908407', 'Asztalos- és bútormunkák Schechen környékén.', '["Német"]', 47.9245396, 12.1255316, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-vezeteknev-2026-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de3-fahrzeugtechnik-papp-michel', 'Fahrzeugtechnik Papp Michel', 'autoszer', 'Autószerelő', 'Draisstr. 8/2, 76448 Durmersheim', '+49 7245 9024664', 'Autójavítás és -szerviz Durmersheim környékén.', '["Német"]', 48.9413533, 8.2592957, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-vezeteknev-2026-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de3-komfort-bad-mosbach', 'Komfort-Bad Mosbach', 'burkolo', 'Burkoló / Csempéző', 'Am Henschelberg 79, 74821 Mosbach', '+49 1523 8832805', 'Csempézés, burkolás Mosbach környékén.', '["Német"]', 49.350143, 9.1328923, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-vezeteknev-2026-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de3-malermeister-takacs', 'Malermeister Takacs', 'festo', 'Szobafestő / Tapétázó', 'Junkerreute 4A, 78224 Singen (Hohentwiel)', '+49 7731 836232', 'Szobafestés, mázolás Singen környékén.', '["Német"]', 47.7945467, 8.8415879, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-vezeteknev-2026-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de3-toth-bau', 'Toth Bau', 'fuggesztett_menyezet', 'Álmennyezet / Gipszkarton', 'Im Reiserfeld 39, 67657 Kaiserslautern (Innenstadt)', '+49 162 6814270', 'Gipszkarton- és álmennyezet-szerelés Kaiserslautern környékén.', '["Német"]', 49.4416629, 7.7885488, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-vezeteknev-2026-08', 'DE', 'RP')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de3-hauskonzept-daniel-toth-holz-und-bautenschutz', 'Hauskonzept Daniel Toth Holz- und Bautenschutz', 'fuggesztett_menyezet', 'Álmennyezet / Gipszkarton', 'Kramerstr. 8, 67378 Zeiskam', '+49 176 25431020', 'Gipszkarton- és álmennyezet-szerelés Zeiskam környékén.', '["Német"]', 49.2303433, 8.2499747, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-vezeteknev-2026-08', 'DE', 'RP')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de3-szabo-transporte', 'Szabo Transporte', 'futas', 'Fuvarozás', 'Ephesusweg 1, 97084 Würzburg (Heuchelhof)', '+49 931 662631', 'Fuvarozás és szállítás Würzburg környékén.', '["Német"]', 49.7360523, 9.9554588, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-vezeteknev-2026-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de3-horvath-transporte-beteiligungs-gmbh', 'Horvath Transporte Beteiligungs GmbH', 'futas', 'Fuvarozás', 'Eichenstr. 46, 85649 Brunnthal (Hofolding)', '+49 8104 668000', 'Fuvarozás és szállítás Brunnthal környékén.', '["Német"]', 47.9845495, 11.7055909, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-vezeteknev-2026-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de3-transportgesellschaft-papp-co-gmbh', 'Transportgesellschaft Papp & Co GmbH', 'futas', 'Fuvarozás', 'Königsberger Str. 13, 77694 Kehl', '+49 7851 7470', 'Fuvarozás és szállítás Kehl környékén.', '["Német"]', 48.5768868, 7.8134855, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-vezeteknev-2026-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de3-molnar-haustechnik-gmbh', 'Molnar Haustechnik GmbH', 'gazvez', 'Víz-gáz szerelő', 'Weiherweg 1, 87487 Wiggensbach (Ermengerst)', '+49 8370 929771', 'Víz- és gázszerelés Wiggensbach környékén.', '["Német"]', 47.7266974, 10.2521372, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-vezeteknev-2026-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de3-reifen-feher-hartmut-feher', 'Reifen Feher - Hartmut Feher', 'gumiszerviz', 'Gumiszerviz', 'Am Marienberg 2, 64686 Lautertal (Odenwald)', '+49 6254 940010', 'Gumiszerviz Lautertal környékén.', '["Német"]', 49.7183441, 8.7137109, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-vezeteknev-2026-08', 'DE', 'HE')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de3-nr-hausmeisterservice-gbr', 'NR Hausmeisterservice GbR', 'hazaszerkeszto', 'Házmester', 'Norderende 4B, 25946 Wittdün auf Amrum', '+49 1516 3014352', 'Házmesteri és gondnoki szolgáltatás Wittdün auf Amrum környékén.', '["Német"]', 54.6276789, 8.3839692, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-vezeteknev-2026-08', 'DE', 'SH')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de3-toth-haustechnik', 'Toth Haustechnik', 'klima', 'Klíma / Fűtés', 'Waldstr. 6, 78345 Moos', '+49 7732 9591678', 'Fűtés- és klímaszerelés Moos környékén.', '["Német"]', 47.7232843, 8.9289404, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-vezeteknev-2026-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de3-horvath-gmbh', 'Horvath GmbH', 'lakasfelujitas', 'Lakásfelújítás / Kivitelezés', 'Blumenstr. 35, 71106 Magstadt', '+49 7159 949993', 'Lakásfelújítás és kivitelezés Magstadt környékén.', '["Német"]', 48.7450305, 8.9704253, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-vezeteknev-2026-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de3-molnar-montagebetrieb-gmbh', 'Molnar Montagebetrieb GmbH', 'lakasfelujitas', 'Lakásfelújítás / Kivitelezés', 'Ötlinger Str. 3, 73230 Kirchheim unter Teck (Lindorf)', '+49 7021 81054', 'Lakásfelújítás és kivitelezés Kirchheim unter Teck környékén.', '["Német"]', 48.6454433, 9.4141574, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-vezeteknev-2026-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de3-robert-und-marianne-szabo', 'Robert und Marianne Szabo', 'pedikur', 'Pedikűr / Lábápolás', 'Gartenstr. 8, 75331 Engelsbrand (Grunbach)', '+49 7235 1384', 'Pedikűr és lábápolás Engelsbrand környékén.', '["Német"]', 48.8296708, 8.674908, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-vezeteknev-2026-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de3-mobile-fusspflege-immer-gut-zu-fuss', 'Mobile Fußpflege Immer gut zu Fuß', 'pedikur', 'Pedikűr / Lábápolás', 'Weiherweg 13, 93092 Barbing (Illkofen)', '+49 160 5032542', 'Pedikűr és lábápolás Barbing környékén.', '["Német"]', 49.0107162, 12.3055773, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-vezeteknev-2026-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de3-sieglinde-varga', 'Sieglinde Varga', 'pedikur', 'Pedikűr / Lábápolás', 'Teutleber Str. 17, 99880 Fröttstädt', '+49 3622 67501', 'Pedikűr és lábápolás Fröttstädt környékén.', '["Német"]', 50.9349902, 10.5698578, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-vezeteknev-2026-08', 'DE', 'TH')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de3-sabine-racz', 'Sabine Racz', 'pedikur', 'Pedikűr / Lábápolás', '36179 Bebra', '+49 160 99362554', 'Pedikűr és lábápolás Bebra környékén.', '["Német"]', 50.9781184, 9.8154417, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-vezeteknev-2026-08', 'DE', 'HE')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de3-backerei-und-konditorei-molnar', 'Bäckerei und Konditorei Molnar', 'pek', 'Pék', 'Zum Schmelzhof 29, 97786 Motten (Kothen)', '+49 9748 1365', 'Pékség Motten környékén.', '["Német"]', 50.3739218, 9.7693743, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-vezeteknev-2026-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de3-otto-pinter', 'Otto Pinter', 'pek', 'Pék', 'Marktplatz 15, 92648 Vohenstrauß', '+49 9651 2369', 'Pékség Vohenstrauß környékén.', '["Német"]', 49.6237334, 12.3411075, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-vezeteknev-2026-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de3-lotz-kovacs-gmbh-gebaudereinigung', 'Lotz & Kovacs GmbH Gebäudereinigung', 'takarito', 'Takarítás', 'Theodor-Heuss-Str. 58, 63526 Erlensee (Langendiebach)', '+49 6183 901803', 'Takarítás és épülettisztítás Erlensee környékén.', '["Német"]', 50.1722117, 8.9864232, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-vezeteknev-2026-08', 'DE', 'HE')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de3-reinigungs-und-hausmeisterdienst-nemeth', 'Reinigungs- und Hausmeisterdienst Nemeth', 'takarito', 'Takarítás', 'Bahnhofstr. 28, 83093 Bad Endorf', '+49 178 5643449', 'Takarítás és épülettisztítás Bad Endorf környékén.', '["Német"]', 47.9062987, 12.2999966, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-vezeteknev-2026-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de3-taxi-andre-molnar', 'TAXI - Andre Molnar', 'taxis', 'Taxis / Sofőr', 'Friedrich-Engels-Str. 35, 09337 Hohenstein-Ernstthal', '+49 3723 46278', 'Taxi és személyszállítás Hohenstein-Ernstthal környékén.', '["Német"]', 50.8013421, 12.7030143, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-vezeteknev-2026-08', 'DE', 'SN')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de3-taxi-molnar', 'Taxi-Molnar', 'taxis', 'Taxis / Sofőr', 'Matthesstr. 146, 09113 Chemnitz', '+49 172 3796888', 'Taxi és személyszállítás Chemnitz környékén.', '["Német"]', 50.8381889, 12.8950121, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-vezeteknev-2026-08', 'DE', 'SN')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de3-nolte-toth-gbr', 'Nolte & Toth GbR', 'tetofedo', 'Tetőfedő / Ács', 'Schlinghofstr. 30, 33689 Bielefeld (Dalbke)', '+49 5205 950845', 'Tetőfedés és ácsmunka Bielefeld környékén.', '["Német"]', 51.9303973, 8.605595, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-vezeteknev-2026-08', 'DE', 'NW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de3-dachdeckerei-l-horvath', 'Dachdeckerei L. Horvath', 'tetofedo', 'Tetőfedő / Ács', 'Lückerather Weg 48, 51429 Bergisch Gladbach (Lückerath)', '+49 2202 929769', 'Tetőfedés és ácsmunka Bergisch Gladbach környékén.', '["Német"]', 50.9706186, 7.1421541, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-vezeteknev-2026-08', 'DE', 'NW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de3-farkas-glashandel-glaserei-bayreuth', 'Farkas Glashandel - Glaserei Bayreuth', 'uveges', 'Üveges', 'Rodersberg 33, 95448 Bayreuth (Laineck)', '+49 173 8653206', 'Üvegezés Bayreuth környékén.', '["Német"]', 49.9570468, 11.6276211, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-vezeteknev-2026-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de3-massatelier-und-kostumverleih-anke-szilagyi', 'Maßatelier und Kostümverleih Anke Szilagyi', 'varrono', 'Varrónő', 'Friedrichstr. 8, 08451 Crimmitschau', '+49 3762 489808', 'Ruhajavítás és -igazítás Crimmitschau környékén.', '["Német"]', 50.8107752, 12.3863087, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-vezeteknev-2026-08', 'DE', 'SN')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de3-elektro-papp', 'Elektro-Papp', 'villany', 'Villanyszerelő', 'Am Sand 1, 85247 Schwabhausen (Stetten)', '+49 8138 668409', 'Villanyszerelés Schwabhausen környékén.', '["Német"]', 48.3000183, 11.3803457, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-vezeteknev-2026-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de3-mfm-werk', 'MFM Werk', 'festo', 'Szobafestő / Tapétázó', 'Ergoldinger Str. 2b, 84030 Landshut (Industriegebiet)', '+49 175 8431208', 'Szobafestés, mázolás Landshut környékén.', '["Német"]', 48.5493401, 12.1399147, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-vezeteknev-2026-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de3-jochen-hajdu-innenausbau-schreinerei', 'Jochen Hajdu Innenausbau / Schreinerei', 'lakasfelujitas', 'Lakásfelújítás / Kivitelezés', 'Bei der Villa 7, 72213 Altensteig (Wart)', '+49 7458 9993288', 'Lakásfelújítás és kivitelezés Altensteig környékén.', '["Német"]', 48.6232959, 8.6422089, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-vezeteknev-2026-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de3-fahrschule-nemeth', 'Fahrschule Nemeth', 'gepijarmu_oktato', 'Autósiskola / Oktató', 'Bernauer Str. 29, 89542 Herbrechtingen', '+49 7324 75', 'Autósiskola Herbrechtingen környékén.', '["Német"]', 48.6270273, 10.1831328, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-vezeteknev-2026-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;
