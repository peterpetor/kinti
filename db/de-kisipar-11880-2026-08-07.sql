-- DE — KISIPAR, MÁSODIK FORRÁS: 15 új tétel + 1 elavult elrejtése — 2026-08-07
--
-- Ez a kör NEM új módszer, hanem a de-kisipar-2026-08-07.sql módszerének
-- futtatása egy MÁSODIK, FÜGGETLEN német cégjegyzéken: 11880.com.
--   11880.com/suche/<szó>/deutschland   (87 magyar keresztnév, 2082 nyers tétel)
--
-- ⚠️ MIÉRT KELLETT MÁSODIK FORRÁS: a gelbeseiten.de keresztnév-módszer
-- TELÍTŐDÖTT. 47 további keresztnév és 72 város-bontás 1454 új nyers tételt
-- adott, abból mindössze 2 új jelöltet. A 11880 ugyanazzal a névkészlettel
-- 72 jelöltet hozott — tehát valóban külön adatbázis, nem ugyanaz újracsomagolva.
--
-- ⚠️ A 11880 ADATA TÚLNYOMÓRÉSZT KATALÓGUS-GYŰJTÉS: 69 jelöltből mindössze
-- EGYNÉL volt „Vom Inhaber bestätigt" jelzés. Ezért a Maps-hitelesítés itt is
-- kötelező volt — és keményen szűrt: 69-ből 45-öt a Maps egyáltalán nem ismer
-- (jellemzően egyszemélyes padlóburkolók, takarítók), 4-nél más cég ült a
-- címen, 4 bezárt. Maradt 16, abból 15 került be (lásd lentebb a 16.-at).
--
-- ⚠️⚠️ RÉSZLÁNC-CSAPDA, ami majdnem hibás tételt vitt be: a német
-- „reinigung" (takarítás) RÉSZLÁNCKÉNT benne van a „Vereinigung" (egyesület)
-- szóban. Emiatt a „Szent Erzsébet Magyar Katolikus Egyházközség — Sonstige
-- religiöse Vereinigung" TAKARÍTÓCÉGKÉNT minősült. Kézi átnézésen kiesett; a
-- szakma-mintákhoz SZÓHATÁR kell. A felhasználó kifejezetten kérte, hogy ne
-- templom és egyesület kerüljön be, hanem valódi mindennapi kisipar.
--
-- ⚠️ A városra szűkített gelbeseiten-keresés TÁVOLSÁG-utótagot ragaszt a
-- címhez („67346 Speyer 483 km") — tisztítani kell, mielőtt adatbázisba megy.
--
-- KONTROLL: 5 ismerten létező saját tétel is bekerült a mérésbe. Három
-- egyértelműen feloldódott, kettő ÉLŐNEK bizonyult — a mérés tehát hitelt
-- érdemel. A másik kettő BEZÁRTKÉNT jött vissza, és ez valódi lelet:
--   • „Restaurant Blockhaus" (Creglingen) — a címen ma „Frankenbruzzler´s
--     Blockhaus" van, az is zárva. Ez a tételünk MÁR rejtve volt.
--   • „Ungarische spezialitäten, Linsengericht" — pontos névtalálat, VÉGLEGESEN
--     BEZÁRT, és nálunk MÉG LÁTSZOTT. Ez a fájl rejti el.
-- ⚠️ A kontroll-válogatásba TEDD BELE a `hidden IS NOT 1` szűrőt — kétszer is
-- belefutottam, hogy már elrejtett tétel került a kontrollok közé.
--
-- ⚠️ A magyar nyelvű kiszolgálás itt sincs ellenőrizve: verified = 0.
--
-- Koordináták Nominatimból, mind a 15 utca-szintű.

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de2-antal-zoltan-schlosserei-gmbh', 'Antal Zoltan Schlosserei GmbH', 'lakatos', 'Lakatos', 'Eichenstr. 2, 83083 Riedering', '+49 8036 908120', 'Lakatos- és fémmegmunkálási munkák Riedering környékén.', '["Magyar","Német"]', 47.8341341, 12.1782436, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de2-zoltan-kis-marton-fliesenleger', 'Zoltan Kis-Marton Fliesenleger', 'burkolo', 'Burkoló / Csempéző', 'Pähler Str. 25, 82399 Raisting', '+49 1511 5848102', 'Csempézés, burkolás Raisting környékén.', '["Magyar","Német"]', 47.9120933, 11.115235, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de2-zoltan-takacs-fliesenverlegung', 'Zoltan Takacs Fliesenverlegung', 'burkolo', 'Burkoló / Csempéző', 'Baumschulweg 7, 86911 Dießen', '+49 8807 214889', 'Csempézés, burkolás Dießen környékén.', '["Magyar","Német"]', 47.9514665, 11.0915579, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de2-tibor-balogh-hausservice', 'Tibor Balogh, Hausservice', 'parkettazas', 'Padlóburkolás / Parkettázás', 'Bieberner Str. 4, 55469 Nannhausen', '+49 162 4796180', 'Parketta- és padlóburkolás Nannhausen környékén.', '["Magyar","Német"]', 49.975074, 7.4781782, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08', 'DE', 'RP')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de2-bodenbelage-ferenc-toth', 'Bodenbeläge Ferenc Toth', 'parkettazas', 'Padlóburkolás / Parkettázás', 'Lingnerallee 3, 01069 Dresden', '+49 172 1429617', 'Parketta- és padlóburkolás Dresden környékén.', '["Magyar","Német"]', 51.0469868, 13.7465869, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08', 'DE', 'SN')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de2-arpad-somogyi-soma-und-sohn-trockenbau-gbr', 'Árpád Somogyi Soma und Sohn Trockenbau GBR', 'fuggesztett_menyezet', 'Álmennyezet / Gipszkarton', 'Rotwandweg 14, 82024 Taufkirchen', '+49 1525 1881212', 'Gipszkarton- és álmennyezet-szerelés Taufkirchen környékén.', '["Magyar","Német"]', 48.0325351, 11.6197223, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de2-zsolt-sandor', 'Zsolt. Sándor', 'festo', 'Szobafestő / Tapétázó', 'Auf der Schanz 5 a, 65321 Heidenrod', '+49 1514 6962482', 'Szobafestés, mázolás, tapétázás Heidenrod környékén.', '["Magyar","Német"]', 50.1607832, 7.9162342, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08', 'DE', 'HE')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de2-szabo-janos-hausmeisterdienst', 'Szabo Janos Hausmeisterdienst', 'hazaszerkeszto', 'Házmester', 'Dörholt 758, 48727 Billerbeck', '+49 176 34688267', 'Házmesteri és karbantartási szolgáltatás Billerbeck környékén.', '["Magyar","Német"]', 51.9642863, 7.330698, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08', 'DE', 'NW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de2-jozsef-balogh', 'Jozsef Balogh', 'parkettazas', 'Padlóburkolás / Parkettázás', 'Vogelherdstr. 1, 91086 Aurachtal', '+49 176 32030572', 'Parketta- és padlóburkolás Aurachtal környékén.', '["Magyar","Német"]', 49.5760759, 10.8622068, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de2-csongor-nagy-bodenverlegung', 'Csongor Nagy Bodenverlegung', 'parkettazas', 'Padlóburkolás / Parkettázás', 'Carl-Goerdeler-Allee 23, 56470 Bad Marienberg', '+49 160 96864210', 'Parketta- és padlóburkolás Bad Marienberg környékén.', '["Magyar","Német"]', 50.6391412, 7.9370393, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08', 'DE', 'RP')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de2-gartenbau-denes-denes-meszaros', 'Gartenbau Dénes - Dénes Mészáros', 'kertesz', 'Kertészet', 'Normannenweg 8, 88090 Immenstaad', '+49 1525 9093450', 'Kertépítés és kertgondozás Immenstaad környékén.', '["Magyar","Német"]', 47.6688238, 9.382094, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de2-molnar-erzsebet-schneidereien', 'Molnar Erzsebet Schneidereien', 'varrono', 'Varrónő', 'Hauptstr. 17, 91099 Poxdorf', '+49 9199 6953706', 'Ruhajavítás, szabás-varrás Poxdorf környékén.', '["Magyar","Német"]', 49.6652627, 11.0726367, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de2-gulyas-beata-anderungsschneiderei', 'Gulyas Beata Änderungsschneiderei', 'varrono', 'Varrónő', 'Bahnhofstr. 14, 86316 Friedberg', '+49 821 2594326', 'Ruhajavítás, szabás-varrás Friedberg környékén.', '["Magyar","Német"]', 48.3539344, 10.9799516, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de2-gal-jeno-bauservice', 'Gal Jeno Bauservice', 'asztalos', 'Asztalos', 'Beimerstetter Str. 29, 89081 Ulm', '01575 1 59 62 07', 'Asztalosmunkák, bútor és beépítés Ulm környékén.', '["Magyar","Német"]', 48.447043, 9.9855727, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de2-taxibetrieb-laszlo-krauss', 'Taxibetrieb Laszlo Krauß', 'taxis', 'Taxis / Sofőr', 'Graf-Keller-Str. 12, 99817 Eisenach', '+49 171 5642911', 'Taxi és személyszállítás Eisenach környékén.', '["Magyar","Német"]', 50.984584, 10.3215234, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-11880-2026-08', 'DE', 'TH')
ON CONFLICT(id) DO NOTHING;

-- ─────────────────────────────────────────── ELAVULT TÉTEL ELREJTÉSE
-- A Google Maps VÉGLEGESEN BEZÁRTKÉNT jelöli, pontos név- és címtalálattal,
-- két külön lekérdezési formával megerősítve. hidden = 1, SOHA nem DELETE.
UPDATE businesses SET hidden = 1
WHERE id = 'de-nmde-ungarische-spezialitaten-linsengericht';

-- ─────────────────────────────────────── UTÓLAGOS JAVÍTÁS
-- Az első alkalmazáskor két sorban NULL maradt a `category_label`, mert a két
-- gelbeseiten-eredetű tétel más mezőnevet használt a köztes állományban. Az
-- INSERT-ek fent már javítva, de az `ON CONFLICT DO NOTHING` a MÁR beszúrt
-- sorokat nem frissíti — ezért kell ez a két UPDATE.
-- ⚠️ Üres kategória-címke a felhasználónak üres feliratként jelenne meg.
UPDATE businesses SET category_label = 'Varrónő'
WHERE id = 'de2-gulyas-beata-anderungsschneiderei' AND category_label IS NULL;
UPDATE businesses SET category_label = 'Asztalos'
WHERE id = 'de2-gal-jeno-bauservice' AND category_label IS NULL;
