-- DE — MINDENNAPI KISIPARI SZAKMÁK: 56 új tétel — 2026-08-07
--
-- MIÉRT: egy kategória-audit szerint a szaknévsor a fehérgalléros szakmákban
-- erős (orvos 311, ügyvéd 182, fogorvos 177), a mindennapi kisiparban viszont
-- SZINTE ÜRES volt mind a 6 országban. Tizenhat kategória állt NULLÁN, köztük
-- a tetőfedő, burkoló, parkettás, taxis, kárpitos, temetkezés, ékszerész,
-- kerékpárszerviz és a gipszkartonos.
--
-- ⭐ ÚJ, MŰKÖDŐ MÓDSZER: MAGYAR KERESZTNÉV a nemzeti cégjegyzékben.
-- A gelbeseiten.de országos szabad szavas keresője 50 magyar keresztnévre
-- 1246 nyers tételt adott — TELJES CÍMMEL, TELEFONNAL és szakma-besorolással,
-- egyetlen lekérdezés/név mellett.
--
-- ⚠️ AMI NEM MŰKÖDÖTT (mérve, ne ismételd): a Google Maps „magyar <szakma>
-- <város>" keresés. 10 lekérdezés → 64 találat → 2 valódi jelölt. A Maps a
-- magyar szót elnyeli. A lángos-módszer azért működik ételre, mert azt a
-- vállalkozó a cégérére írja; a szerelő viszont NÉMETÜL hirdet a német
-- ügyfélnek. A magyar szó a névben csak fogyasztói terméknél jel.
--
-- SZŰRÉS — KÉT FÜGGETLEN MAGYAR JEL kellett (a keresztnév önmagában kevés:
-- az „Attila" török is, a „Bela”/„Aron” német és szláv is). A vezetéknév- és a
-- keresztnév-találat nem lehet UGYANAZ a szó, különben egy „Wiechmann Sandor”
-- ugyanannyi pontot kapna, mint egy „Kovács Zoltán”.
--
-- ⚠️ HITELESÍTÉS GOOGLE MAPS-EN, mert az Aranyoldalak BENT TARTJA a megszűnt
-- cégeket. 120 jelöltből:
--     53 + 3   megerősítve (a névnek is egyeznie kellett)
--      7       VÉGLEGESEN BEZÁRT — mind pontos névtalálat volt
--     17       a Maps MÁS céget hozott a címen (egy olasz étterem egy
--              szerelő címére, egy török burkoló egy magyar címére)
--     43       a Maps egyáltalán nem ismeri (kis egyéni vállalkozó) — KIHAGYVA
--
-- ⚠️ A KONTROLL-TÉTELEK NÉLKÜL A MÉRÉS NEM HIHETŐ: 5 ismerten élő saját tételt
-- tettem a halmazba. Négy közülük helyesen jött vissza — és egy (Gaststätte
-- Flügelrad) BEZÁRTKÉNT, vagyis a saját adatbázisunkban van egy halott tétel.
--
-- ⚠️ A MAGYAR NYELVŰ KISZOLGÁLÁS NINCS ELLENŐRIZVE. A bizonyíték: magyar
-- vezetéknév + magyar keresztnév egy német cégjegyzékben, és élő Maps-tétel.
-- Ezért verified = 0, és a felhasználók a „Javíts rajta” úton pontosíthatnak.
--
-- Koordináták Nominatimból (55 utca-szintű, 1 város-szintű). Házszámot SOHA
-- nem tippeltünk.

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-emizi-bau-lajos-gabor', 'EMIZI-Bau Lajos Gabor', 'tetofedo', 'Tetőfedő / Ács', 'Sulpkestr. 30, 44269 Dortmund', '+49 1575 8668190', 'Tetőfedő és ács munkák Dortmund környékén.', '["Magyar","Német"]', 51.4827047, 7.5279696, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'NW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-gabor-demeter-dachdecker', 'Gabor Demeter Dachdecker', 'tetofedo', 'Tetőfedő / Ács', 'Hildburgweg 10, 22529 Hamburg', '+49 172 5647076', 'Tetőfedő és ács munkák Hamburg környékén.', '["Magyar","Német"]', 53.606956, 9.9409947, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'HH')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-gergely-jancsi-dachdeckerei-gmbh', 'Gergely Jancsi Dachdeckerei GmbH', 'tetofedo', 'Tetőfedő / Ács', 'Vereinstr. 2, 30175 Hannover', '+49 511 673888', 'Tetőfedő és ács munkák Hannover környékén.', '["Magyar","Német"]', 52.3742166, 9.7579598, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'NI')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-balazs-dachdecker', 'Balazs Dachdecker', 'tetofedo', 'Tetőfedő / Ács', 'Fruchtmarktstr. 37/39, 66482 Zweibrücken', '+49 1577 8604300', 'Tetőfedő és ács munkák Zweibrücken környékén.', '["Magyar","Német"]', 49.2457695, 7.3641721, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'RP')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-timar-andrei-csaba', 'Timar Andrei-Csaba', 'burkolo', 'Burkoló / Csempéző', 'Friedrich-Ebert-Str. 41, 76437 Rastatt', '+49 7222 789195', 'Csempézés, burkolás Rastatt környékén.', '["Magyar","Német"]', 48.8474005, 8.2071899, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-degel-tibor-fliesenarbeiten', 'Degel Tibor Fliesenarbeiten', 'burkolo', 'Burkoló / Csempéző', 'Brennender Berg Str. 3, 66125 Saarbrücken', '+49 174 3156037', 'Csempézés, burkolás Saarbrücken környékén.', '["Magyar","Német"]', 49.2827104, 7.0462253, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'SL')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-kaulak-miklos', 'Kaulak Miklos', 'burkolo', 'Burkoló / Csempéző', 'Bayerwaldstr. 7, 93073 Neutraubling', '+49 1516 6001708', 'Csempézés, burkolás Neutraubling környékén.', '["Magyar","Német"]', 48.9862534, 12.1981164, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-fliesenwerkstatt-marton-gmbh', 'Fliesenwerkstatt Marton GmbH', 'burkolo', 'Burkoló / Csempéző', '87474 Buchenberg', '+49 171 1766533', 'Csempézés, burkolás Buchenberg környékén.', '["Magyar","Német"]', 47.7074545, 10.1951715, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-istvan-durku-bodenleger-fliesenleger-trockenbau', 'Istvan Durku Bodenleger - Fliesenleger - Trockenbau', 'burkolo', 'Burkoló / Csempéző', 'Riedgaustr. 7b, 81673 München', '+49 89 37073727', 'Csempézés, burkolás München környékén.', '["Magyar","Német"]', 48.131943, 11.6182983, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-a-s-parkett-inh-attila-szeremy', 'A.S. Parkett Inh. Attila Szeremy', 'parkettazas', 'Padlóburkolás / Parkettázás', 'Germaniastr. 74, 46236 Bottrop', '+49 178 5192999', 'Parketta- és padlóburkolás Bottrop környékén.', '["Magyar","Német"]', 51.5244967, 6.9370769, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'NW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-parkett-palic-zoltan-palic', 'Parkett Palic - Zoltan Palic', 'parkettazas', 'Padlóburkolás / Parkettázás', 'Auf der Worth 12C, 38302 Wolfenbüttel', '+49 160 8307838', 'Parketta- és padlóburkolás Wolfenbüttel környékén.', '["Magyar","Német"]', 52.1971559, 10.5879112, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'NI')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-sandor-bacso-taxiunternehmer', 'Sandor Bacso Taxiunternehmer', 'taxis', 'Taxis / Sofőr', 'Barkhausenstr. 6, 27568 Bremerhaven', '+49 1514 6555224', 'Taxi és személyszállítás Bremerhaven környékén.', '["Magyar","Német"]', 53.5477786, 8.5718221, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'HB')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-markovics-imre-linda-taxiunternehmen', 'Markovics Imre, Linda Taxiunternehmen', 'taxis', 'Taxis / Sofőr', 'Schillerstr. 3, 97769 Bad Brückenau', '+49 9741 2204', 'Taxi és személyszállítás Bad Brückenau környékén.', '["Magyar","Német"]', 50.3036733, 9.7783367, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-gabor-taxi-taxiunternehmen', 'Gabor Taxi Taxiunternehmen', 'taxis', 'Taxis / Sofőr', 'Freiherr-vom-Stein-Str. 28, 61440 Oberursel', '+49 6171 971865', 'Taxi és személyszállítás Oberursel környékén.', '["Magyar","Német"]', 50.2134648, 8.5592712, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'HE')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-bela-taxiunternehmen', 'Bela Taxiunternehmen', 'taxis', 'Taxis / Sofőr', 'Hinterm Wall 1, 33181 Bad Wünnenberg', '+49 2953 9644600', 'Taxi és személyszállítás Bad Wünnenberg környékén.', '["Magyar","Német"]', 51.5124444, 8.6951714, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'NW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-nagy-attila-josef-polsterei', 'Nagy Attila Josef Polsterei', 'karpitos', 'Kárpitos', 'Gewerbestr. 4, 69198 Schriesheim', '+49 6220 913587', 'Bútorkárpitozás Schriesheim környékén.', '["Magyar","Német"]', 49.4869014, 8.7380582, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-bestattungsunternehmen-heimburge-gyula-hosszu-gm', 'Bestattungsunternehmen & Heimbürge Gyula Hosszú GmbH', 'temetkezes', 'Temetkezés', 'Hainstr. 23, 09212 Limbach-Oberfrohna', '+49 3722 92319', 'Temetkezési szolgáltatás Limbach-Oberfrohna környékén.', '["Magyar","Német"]', 50.866508, 12.7491571, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'SN')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-bestattungsinstitut-helt-janos', 'Bestattungsinstitut Helt Janos', 'temetkezes', 'Temetkezés', 'Bahnhofsallee 35, 99098 Erfurt', '+49 36203 60301', 'Temetkezési szolgáltatás Erfurt környékén.', '["Magyar","Német"]', 50.9964444, 11.1399886, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'TH')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-bartalis-sandor-trockenbau', 'Bartalis Sandor Trockenbau', 'fuggesztett_menyezet', 'Álmennyezet / Gipszkarton', 'Moosstr. 17, 84032 Altdorf', '+49 1516 3652156', 'Gipszkarton- és álmennyezet-szerelés Altdorf környékén.', '["Magyar","Német"]', 48.5499978, 12.0995711, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-lepeda-laszlo-galerie-u-werkstatt', 'Lepeda Laszlo Galerie u. Werkstatt', 'ekszer', 'Ékszerész / Órás', 'Hasenbergstr. 38B, 70176 Stuttgart', '+49 711 6157761', 'Ékszerkészítés és -javítás Stuttgart környékén.', '["Magyar","Német"]', 48.7727358, 9.1605048, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-lepeda-laszlo-goldschmiede', 'Lepeda Laszlo Goldschmiede', 'ekszer', 'Ékszerész / Órás', 'Böblinger Str. 11, 71088 Holzgerlingen', '+49 7031 607720', 'Ékszerkészítés és -javítás Holzgerlingen környékén.', '["Magyar","Német"]', 48.6403329, 9.0114652, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-forster-attila', 'Förster Attila', 'kerekpar', 'Kerékpárszerviz', 'Weldenstr. 15, 82515 Wolfratshausen', '+49 8171 4880719', 'Kerékpárok javítása és szervize Wolfratshausen környékén.', '["Magyar","Német"]', 47.9026018, 11.4436346, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-bergschmiede-bau-schlosserei-jozsef-doczi-sandst', 'Bergschmiede-Bau-Schlosserei Jozsef Doczi Sandstrahlarbeiten', 'lakatos', 'Lakatos', 'Himmelfahrtsgasse 34, 09599 Freiberg', '+49 3731 33252', 'Lakatos- és fémszerkezeti munkák Freiberg környékén.', '["Magyar","Német"]', 50.921701, 13.3665199, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'SN')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-rabek-zoltan-sanitarinstallationen', 'Rabek Zoltan Sanitärinstallationen', 'gazvez', 'Víz-gáz szerelő', 'Homburger Landstr. 692, 60437 Frankfurt am Main', '+49 69 502908', 'Víz- és gázszerelés Frankfurt am Main környékén.', '["Magyar","Német"]', 50.1874835, 8.6667, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'HE')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-sztankovics-janos-elektromeister', 'Sztankovics Janos Elektromeister', 'villany', 'Villanyszerelő', '15848 Beeskow', '+49 3366 20523', 'Villanyszerelés Beeskow környékén.', '["Magyar","Német"]', 52.166127, 14.2311233, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'BB')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-attila-trenka-elektrotechnik-elektroreparatur', 'Attila Trenka Elektrotechnik Elektroreparatur', 'villany', 'Villanyszerelő', 'Mörikestr. 1, 71739 Oberriexingen', '+49 176 84803321', 'Villanyszerelés Oberriexingen környékén.', '["Magyar","Német"]', 48.9277675, 9.0262388, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-tolmacsi-janos-elektro', 'Tolmácsi János Elektro', 'villany', 'Villanyszerelő', 'Auf dem Hügel 30, 53121 Bonn', '+49 228 6203913', 'Villanyszerelés Bonn környékén.', '["Magyar","Német"]', 50.7319744, 7.0690256, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'NW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-biro-csaba-malermeister', 'Biro Csaba Malermeister', 'festo', 'Szobafestő / Tapétázó', 'Hofheimer Str. 7, 97437 Haßfurt', '+49 9521 959688', 'Szobafestés, mázolás, tapétázás Haßfurt környékén.', '["Magyar","Német"]', 50.0339519, 10.5137154, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-fekete-imre', 'Fekete Imre', 'festo', 'Szobafestő / Tapétázó', 'Reußstr. 2, 93333 Neustadt a.d.Donau', '+49 1575 7839284', 'Szobafestés, mázolás, tapétázás Neustadt a.d.Donau környékén.', '["Magyar","Német"]', 48.8074997, 11.763825, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-herma-tibor-malerbetrieb', 'Herma Tibor Malerbetrieb', 'festo', 'Szobafestő / Tapétázó', 'Dresdener Str. 8, 94060 Pocking', '+49 1512 0100468', 'Szobafestés, mázolás, tapétázás Pocking környékén.', '["Magyar","Német"]', 48.3952659, 13.3210074, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-warsany-gabor-tischler', 'Warsany Gabor Tischler', 'asztalos', 'Asztalos', 'Veilchenweg 3, 16567 Mühlenbeck', '+49 33056 20835', 'Asztalosmunkák, bútor és beépítés Mühlenbeck környékén.', '["Magyar","Német"]', 52.6632632, 13.3750473, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'BB')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-lajos-hornok-industrielle-holzgestellfertigung', 'Lajos Hornok Industrielle Holzgestellfertigung', 'asztalos', 'Asztalos', 'Fröndenberger Str. 22, 04746 Hartha', '+49 34328 373000', 'Asztalosmunkák, bútor és beépítés Hartha környékén.', '["Magyar","Német"]', 51.0940124, 12.9631366, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'SN')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-imre-bodi-bau', 'Imre Bodi Bau', 'kőműves', 'Kőműves / Betonozó', 'Wurzner Str. 125, 04318 Leipzig', '+49 1514 5801744', 'Kőműves- és betonozási munkák Leipzig környékén.', '["Magyar","Német"]', 51.3439243, 12.424235, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'SN')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-istvan-potyondi-reinigungsservice', 'Istvan Potyondi Reinigungsservice', 'takarito', 'Takarítás', 'Hauptstr. 8, 04758 Liebschützberg', '+49 1573 2975251', 'Épülettakarítás Liebschützberg környékén.', '["Magyar","Német"]', 51.3659447, 13.1456077, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'SN')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-kovacs-zoltan', 'Kovacs Zoltan', 'hazaszerkeszto', 'Házmester', 'Käthe-Kollwitz-Weg 6, 40724 Hilden', '+49 1514 5873831', 'Házmesteri és karbantartási szolgáltatás Hilden környékén.', '["Magyar","Német"]', 51.1685641, 6.9777619, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'NW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-api-hausmeister-eszenyi-csaba', 'Api-Hausmeister Eszenyi Csaba', 'hazaszerkeszto', 'Házmester', 'Alte Eppelheimer Str. 25, 69115 Heidelberg', '+49 177 9633141', 'Házmesteri és karbantartási szolgáltatás Heidelberg környékén.', '["Magyar","Német"]', 49.4059903, 8.6773495, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-ferencz-jozsef-attila', 'Ferencz Jozsef Attila', 'kertesz', 'Kertészet', 'Ebenwieser Str. 14, 93152 Nittendorf', '+49 1516 3409492', 'Kertépítés és kertgondozás Nittendorf környékén.', '["Magyar","Német"]', 49.0317632, 11.9906657, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-marton-nagy-gartenbau', 'Marton Nagy Gartenbau', 'kertesz', 'Kertészet', 'Wiesbadener Str. 167, 61462 Königstein im Taunus', '+49 6174 21035', 'Kertépítés és kertgondozás Königstein im Taunus környékén.', '["Magyar","Német"]', 50.1713764, 8.4562267, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'HE')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-vajda-sandor', 'Vajda Sandor', 'futas', 'Fuvarozás', 'Alte Reichenbacher Str. 32, 08529 Plauen', '+49 1516 3030195', 'Fuvarozás és szállítás Plauen környékén.', '["Magyar","Német"]', 50.4940167, 12.1593658, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'SN')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-lakos-sandor-transporte', 'Lakos Sandor Transporte', 'futas', 'Fuvarozás', 'Anton-Schade-Weg 19, 59757 Arnsberg', '+49 2932 81930', 'Fuvarozás és szállítás Arnsberg környékén.', '["Magyar","Német"]', 51.4585031, 7.9371961, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'NW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-zeiner-attila-internationale-transporte', 'Zeiner, Attila Internationale Transporte', 'futas', 'Fuvarozás', 'Nauener Str. 12, 70597 Stuttgart', '+49 711 7674310', 'Fuvarozás és szállítás Stuttgart környékén.', '["Magyar","Német"]', 48.7337651, 9.1800958, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-kinga-kiss-mobile-fusspflege', 'Kinga Kiss mobile Fußpflege', 'pedikur', 'Pedikűr / Lábápolás', 'Bauerbachstrasse 13, 63179 Obertshausen', '+49 178 4959193', 'Lábápolás, pedikűr Obertshausen környékén.', '["Magyar","Német"]', 50.0752839, 8.8664429, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'HE')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-hand-fuss-marton', 'Hand & Fuß Marton', 'pedikur', 'Pedikűr / Lábápolás', 'C 2 19, 68159 Mannheim', '+49 621 27818', 'Lábápolás, pedikűr Mannheim környékén.', '["Magyar","Német"]', 49.4949702, 8.4528104, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-zsiro-katalin-fusspflege', 'Zsiro Katalin Fußpflege', 'pedikur', 'Pedikűr / Lábápolás', 'Langgasse 12, 50259 Pulheim', '+49 2234 209866', 'Lábápolás, pedikűr Pulheim környékén.', '["Magyar","Német"]', 50.9617309, 6.7802486, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'NW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-hirsch-zsuzsanna', 'Hirsch Zsuzsanna', 'pedikur', 'Pedikűr / Lábápolás', 'Oberlandstr. 101, 98724 Lauscha', '+49 36702 21607', 'Lábápolás, pedikűr Lauscha környékén.', '["Magyar","Német"]', 50.4817811, 11.1551729, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'TH')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-reiche-ildiko', 'Reiche Ildiko', 'pedikur', 'Pedikűr / Lábápolás', 'Rudolf-Breitscheid-Str. 33, 07747 Jena', '+49 3641 336235', 'Lábápolás, pedikűr Jena környékén.', '["Magyar","Német"]', 50.8803844, 11.6266616, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'TH')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-orosz-zsolt-raumausstattung', 'Orosz Zsolt Raumausstattung', 'lakberendezes', 'Belsőépítészet', 'Karlsbader Str. 21, 35764 Sinn', '+49 176 62061214', 'Belsőépítészet és lakberendezés Sinn környékén.', '["Magyar","Német"]', 50.6494684, 8.3378463, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'HE')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-oly-chris-gyula-innendesign', 'Oly Chris Gyula Innendesign', 'lakberendezes', 'Belsőépítészet', 'Steinbuschstr. 20, 01683 Nossen', '+49 35242 509500', 'Belsőépítészet és lakberendezés Nossen környékén.', '["Magyar","Német"]', 51.0529563, 13.2937856, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'SN')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-janosov-zsolt-zjs-hausrenovierung-zjs-hausrenovi', 'Janosov Zsolt ZJS- HAUSRENOVIERUNG, ZJS- HAUSRENOVIERUNG', 'lakasfelujitas', 'Lakásfelújítás / Kivitelezés', 'Am Bauernschlag 21, 74585 Rot am See', '+49 7958 926646', 'Lakásfelújítás és kivitelezés Rot am See környékén.', '["Magyar","Német"]', 49.2925877, 10.113583, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-kiss-attila-kfz-meisterbetrieb', 'Kiss Attila KFZ-Meisterbetrieb', 'autoszer', 'Autószerelő', 'Darmstädter Str. 80, 64380 Roßdorf', '+49 6154 608842', 'Autószerviz Roßdorf környékén.', '["Magyar","Német"]', 49.8619879, 8.7443005, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'HE')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-nagy-sandor', 'Nagy Sandor', 'autoszer', 'Autószerelő', 'Holzhauser Str. 3, 84524 Neuötting', '+49 8671 71241', 'Autószerviz Neuötting környékén.', '["Magyar","Német"]', 48.2426283, 12.6724132, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-jozsef-toth-rt-fahrzeugtechnik', 'Jozsef Toth RT Fahrzeugtechnik', 'autoszer', 'Autószerelő', 'Milbertshofener Str. 31, 80807 München', '+49 89 32794301', 'Autószerviz München környékén.', '["Magyar","Német"]', 48.184806, 11.5709697, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-hargittay-attila-fahrschule', 'Hargittay Attila Fahrschule', 'gepijarmu_oktato', 'Autósiskola / Oktató', 'Untergasse 18, 55590 Meisenheim', '+49 6753 2471', 'Autósiskola, vezetéstanítás Meisenheim környékén.', '["Magyar","Német"]', 49.7061894, 7.6724826, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'RP')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-kolozsi-tibor-mobelpolsterei-auto-u-bootsattlere', 'Kolozsi Tibor Möbelpolsterei Auto- u. Bootsattlerei', 'karpitos', 'Kárpitos', 'Basler Landstr. 45, 79111 Freiburg im Breisgau', '0761 4 53 58 60', 'Bútorkárpitozás Freiburg im Breisgau környékén.', '["Magyar","Német"]', 47.982111, 7.8022686, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-penzes-csaba-hausmeisterdienste', 'Penzes Csaba Hausmeisterdienste', 'hazaszerkeszto', 'Házmester', 'Schwalbenstr. 9, 63263 Neu-Isenburg', '0157 81 51 71 78', 'Házmesteri és karbantartási szolgáltatás Neu-Isenburg környékén.', '["Magyar","Német"]', 50.0585663, 8.7562284, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'HE')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-temesvari-csaba', 'Temesvari Csaba', 'karosszeria', 'Karosszérialakatos', 'Ziegelstr. 26, 03149 Forst', '03562 69 73 25', 'Karosszériajavítás és horpadás-kiszedés Forst környékén.', '["Magyar","Német"]', 51.7491412, 14.6313689, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-cegjegyzek-2026-08', 'DE', 'BB')
ON CONFLICT(id) DO NOTHING;
