-- scripts/import_businesses.sql — AUTOGENERÁLT (prepare-business-import.mjs). NE szerkeszd kézzel.
-- Valódi magyar szakemberek (CH/AT/DE/NL), per-cég kategóriával, jóváhagyva (moderation_status=1),
-- átvehető (claimed=0). UPSERT: a meglévő (nem-claimolt, csv-import) sorok cím/koordináta/blurb
-- mezői frissülnek — a tulaj által átvett sorokat NEM írja felül.
-- Élesítés: wrangler d1 execute kinti-db --remote --file=scripts/import_businesses.sql

-- Élelmiszer-kategória (a /magyarbolt kivezetésekor a döntés: a boltok a szaknévsorban kereshetők)
INSERT OR IGNORE INTO categories (id, label, glyph, sort_order) VALUES ('elelmiszer', 'Élelmiszerbolt', '🛒', 900);

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('ch-imp-turi-zsuzsanna', 'Túri Zsuzsanna', 'fodrasz', 'Fodrász', 'Mittlere Mühlestrasse 3, 8598 Bottighofen', NULL, 'Női és férfi hajvágás, festés, több éves tapasztalattal svájci magyaroknak. · turizsuzsanna.com', '["Magyar"]', 47.638879, 9.205483, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'CH', 'TG')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('ch-imp-zahnarzt-in-ungarn-vitalcenter', 'Zahnarzt in Ungarn / VitalCenter', 'fogorvos', 'Fogorvos', 'Schaffhauserstrasse 75, 8057 Zürich', NULL, 'Konzultáció és utógondozás Zürichben, nagyobb kezelések Budapesten. · vitalcenter-zh.ch', '["Magyar"]', 47.3925999, 8.5386969, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'CH', 'ZH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('nl-imp-lassus-tandartsen', 'Lassus Tandartsen', 'fogorvos', 'Fogorvos', 'Keizersgracht 132', '+31 20 471 3137', 'Expatokra fókuszáló többnyelvű fogászati klinika Amszterdamban. · www.lassustandartsen.nl', '["Magyar"]', 52.3651768, 4.90686, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'NL', 'NH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-dr-csingar-peter', 'Dr. Csingár Péter', 'ugyved', 'Ügyvéd', 'Münchener Str. 30, 83022 Rosenheim', '+49 176 85 997004', 'Munkajog és szociális jog Münchenben és Rosenheimben. Magyar és német ügyvéd. · rechtsanwalt-csingar.de', '["Magyar"]', 47.8537151, 12.1227562, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BY')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-rechtsanwaltskanzlei-visnyei', 'Rechtsanwaltskanzlei Visnyei', 'ugyved', 'Ügyvéd', 'Münchnerstraße 18, 85774 Unterföhring', '+49 89 923 368 00', 'Társasági jog, munkajog, közlekedési jog és öröklési jog magyarul Münchennél. · ra-visnyei.de', '["Magyar"]', 48.1817871, 11.6329124, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BY')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-optitax-trade-kft', 'Optitax Trade Kft.', 'konyveles', 'Könyvelés', 'Bettinastr. 30, 60325 Frankfurt am Main', '+36 30 997 6135', 'Vállalkozások könyvelése, bérszámfejtése, adótanácsadás Németországban, magyaroknak. · optitax.eu', '["Magyar"]', 50.1116014, 8.6600523, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'HE')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-dr-neumann-michael-es-dr-neumann-etelka', 'Dr. Neumann Michael és Dr. Neumann Etelka', 'nogyogyasz', 'Nőgyógyász / Szülész', 'Hofstattgasse 17/3 (18. ker)', NULL, 'Magyar nyelvű nőgyógyászati magánrendelés Bécs 18. kerületében. · frauenarzt-neumann.at', '["Magyar"]', 48.2286442, 16.3389532, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-dr-rosta-klara-ph-d', 'Dr. Rosta Klára (Ph.D.)', 'nogyogyasz', 'Nőgyógyász / Szülész', 'Pelikangasse 4/3 (9. ker)', NULL, 'Nőgyógyászati magánrendelés (Wahlarzt) magyar pácienseknek is. · klararosta.com', '["Magyar"]', 48.2157005, 16.3482312, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-dr-lehner-gyorgy', 'Dr. Lehner György', 'nogyogyasz', 'Nőgyógyász / Szülész', 'Auhofstraße 189 (13. ker)', NULL, 'St. Josef Krankenhaus mellett rendelő magyar nőgyógyász. · gynaekologie-lehner.at', '["Magyar"]', 48.1943519, 16.2629505, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-frank-automento', 'Frank Autómentő', 'autoszer', 'Autószerelő', 'Mobil', '+436601234567', '0-24 autómentés, defektjavítás, helyszíni gyorssegély Bécs és környékén. · frankautomento.hu', '["Magyar"]', 48.2082, 16.3738, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-dentailor-dental-team', 'Dentailor Dental Team', 'fogorvos', 'Fogorvos', 'Radetzkyplatz 2, 1030 Wien', NULL, 'Magyar-osztrák fogászat Bécsben és Sopronban. Implantológia, esztétikai fogászat. · dentailor.at', '["Magyar"]', 48.2108075, 16.3897393, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-mag-anita-weichberger', 'Mag. Anita Weichberger', 'pszichologus', 'Pszichológus / Coach', 'Wehlistraße 131-143/18/3, 1020 Wien', NULL, 'Klinikai szakpszichológus és pszichoterapeuta. Migráció, beilleszkedés, meddőség. · psychologin-weichberger.at', '["Magyar"]', 48.2272304, 16.4019987, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-kovacs-zsofia', 'Kovács Zsófia', 'pszichologus', 'Pszichológus / Coach', 'Ramperstorffergasse 8-12/1/25, 1050 Wien', NULL, 'Pszichológus és pszichoanalitikus, felnőttek és gyerekek számára magyarul. · zsofia-kovacs.at', '["Magyar"]', 48.1851051, 16.3602833, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-mag-roberta-borsos', 'Mag. Roberta Borsos', 'pszichologus', 'Pszichológus / Coach', 'Zimmermannplatz 4/27, 1090 Wien', NULL, 'Pszichoterapeuta, viselkedésterápia magyarul Bécsben. · praxis-borsos.com', '["Magyar"]', 48.217135, 16.3438929, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-erika-eidlitz', 'Erika Eidlitz', 'pszichologus', 'Pszichológus / Coach', 'Linzerstr. 373, 14. ker', NULL, 'Szorongásos és depressziós zavarok, kapcsolati nehézségek kezelése magyarul. · psychotherapie-1140.at', '["Magyar"]', 48.2011991, 16.2635403, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-vidonyi-eszter', 'Vidonyi Eszter', 'pszichologus', 'Pszichológus / Coach', 'Volkertplatz 5/27, 1020 Wien', NULL, 'Klinikai szakpszichológus és pszichoterapeuta, gyerekekkel és felnőttekkel. · klin-psy-prax.at', '["Magyar"]', 48.2225972, 16.3864344, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-dr-dajka-daniel', 'Dr. Dajka Dániel', 'ugyved', 'Ügyvéd', 'Berliner Allee 170, 13088 Berlin', '+49 30 814 553 810', 'Munkajog, ingatlanjog, közlekedési jog, internetjog — magyaroknak Berlinben. · rechtsanwalt-dajka.de', '["Magyar"]', 52.5532408, 13.4675394, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BE')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-sule-law-firm', 'Süle Law Firm', 'ugyved', 'Ügyvéd', 'Scharnweberstraße 9, 15537 Erkner', '+49 3362 509 7737', 'IP-jog, adatvédelem, IT- és médiajog. Magyar-német ügyvédi iroda Berlinnél. · sulelaw.com', '["Magyar"]', 52.4271489, 13.7602009, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BE')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-dr-mercz-agnes', 'Dr. Mercz Ágnes', 'ugyved', 'Ügyvéd', 'Karl-Blum-Allee 123, 65929 Frankfurt-Höchst', '+49 157 5638 4372', 'Munkajog, cégjog, közlekedési jog, ingatlanjog magyarul Frankfurtban. · ra-mercz.de', '["Magyar"]', 50.1147762, 8.5512656, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'HE')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-bo-merei', 'Bo Mérei', 'pszichologus', 'Pszichológus / Coach', 'Tempelhofer Berg 7D', NULL, 'Magyar pszichológiai tanácsadás és coaching Berlinben. · bomerei.com', '["Magyar"]', 52.4881707, 13.3885213, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BE')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('nl-imp-magyar-konyvelohaz', 'Magyar Könyvelőház', 'konyveles', 'Könyvelés', 'Kleiweg 185A, Rotterdam', '+31 623167808', 'ZZP/BV alapítás, áfa-bevallás, bérszámfejtés, adótanácsadás magyaroknak Hollandiában. · magyarkonyvelohaz.nl', '["Magyar"]', 51.9454085, 4.4737573, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'NL', 'ZH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('nl-imp-margit-administratie', 'Margit Administratie', 'konyveles', 'Könyvelés', '''s-Gravelandseweg 258, 3125 BK Schiedam', NULL, '28+ éves tapasztalat egyéni vállalkozók könyvelésében és adóbevallásában magyarul. · margitadministratie.nl', '["Magyar"]', 51.9340929, 4.4000036, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'NL', 'ZH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('nl-imp-dr-katalin-balint', 'Dr. Katalin Bálint', 'pszichologus', 'Pszichológus / Coach', 'Sarphatistraat 14, 1017 WS Amsterdam', NULL, 'Egyéni és párterápia magyarul Amszterdamban. · magyarpszichologus.nl', '["Magyar"]', 52.3598563, 4.9025575, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'NL', 'NH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('nl-imp-bernat-viktoria', 'Bernát Viktória', 'pszichologus', 'Pszichológus / Coach', 'Oude Ebbingestraat 79 c, 9712 HG Groningen', NULL, 'Magyar pszichológus Amszterdamban, személyes és online konzultáció. · rise-and-harmonise.com', '["Magyar"]', 53.2215262, 6.5658974, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'NL', 'NH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('nl-imp-fuzi-virag', 'Füzi Virág', 'pszichologus', 'Pszichológus / Coach', 'Nieuwegracht 29, 3512 LD Utrecht', NULL, 'Pszichológus Utrechtben, személyesen és online elérhető magyaroknak. · viragfuzi.com', '["Magyar"]', 52.0888011, 5.124078, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'NL', 'UT')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('nl-imp-morocz-agnes', 'Mórocz Ágnes', 'pszichologus', 'Pszichológus / Coach', 'Morsweg 44, 2312AE Leiden', NULL, 'Tanácsadó szakpszichológus és terapeuta magyarul Hollandiában. · psycholeiden.com', '["Magyar"]', 52.1610101, 4.4792482, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'NL', 'ZH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('nl-imp-erdody-nagy-edit', 'Erdődy-Nagy Edit', 'pszichologus', 'Pszichológus / Coach', 'Hollandia', NULL, 'Pszichoterápiás szolgáltatások magyar nyelven Hollandiában. · pszichologus.nl', '["Magyar"]', 52.13, 5.29, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'NL', NULL)
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-dr-eniko-jozsa', 'Dr. Enikő Jozsa', 'orvos', 'Háziorvos', 'Mariahilferstraße 64/9, 1070 Wien', '+43 699 127 317 18', 'Magyar háziorvos Bécs 7. kerületében. Általános orvosi ellátás, megelőzés, akut kezelés. · www.dr-jozsa.at', '["Magyar"]', 48.1998864, 16.3544176, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-dr-andrea-dudas', 'Dr. Andrea Dudás', 'orvos', 'Háziorvos', 'Breitenfurter Straße 479/4/1, 1230 Wien', '+43 1 8884142', 'Általános orvos Bécs 23. kerületében. Kassaarzt, magyarul, angolul és olaszul is rendel. · www.dr-dudas.at', '["Magyar"]', 48.137333, 16.256648, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-dr-csutak-rozalia', 'Dr. Csutak Rozália', 'gyermekorvos', 'Gyermekorvos', 'Liniengasse 2B/3, 1060 Wien', '+43 1 597 25 65', 'Magyar gyermek- és ifjúsági orvos Bécs 6. kerületében. Kassaarzt és privát betegeket is fogad. · www.kindermed1060.at', '["Magyar"]', 48.1931616, 16.3462038, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-dr-emese-szent-ivanyi', 'Dr. Emese Szent-Iványi', 'gyermekorvos', 'Gyermekorvos', 'Hahngasse 27, 1090 Wien', '+43 664 35 60 349', 'Gyermek- és ifjúsággyógyász Bécs 9. kerületében. Magyarul, németül, angolul és románul rendel. · www.kinderpraxisserviten4tel.at', '["Magyar"]', 48.2217905, 16.3650836, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-huszti-david', 'Huszti Dávid', 'fordito', 'Fordító', 'Delsenbachgasse 7–11/3/8, 1110 Wien', NULL, 'Diplomás szakfordító és tolmács (Bécsi Egyetem), Universitas Austria tag. Jogi, gazdasági fordítás. · fordit.hu', '["Magyar"]', 48.1791643, 16.4148639, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-simonfay-translations', 'Simonfay Translations', 'fordito', 'Fordító', 'Museumstraße 5/19, 1070 Wien', NULL, 'Bírósági tolmácsolás és hiteles fordítás magyarul, EU-szerte elfogadott minősítéssel. · simonfay-translation.at', '["Magyar"]', 48.2062243, 16.3565939, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-translatorday', 'TranslaTorday', 'fordito', 'Fordító', 'Am langen Felde 24/1/16, 1220 Wien', NULL, 'Szakfordítás, tolmácsolás, konferencia-tolmácsolás és nyelvi tréningek magyarul Bécsben. · translatorday.at', '["Magyar"]', 48.2495699, 16.4477539, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-fejer-team', 'Fejér Team', 'fordito', 'Fordító', 'Konrad-Zuse-Platz 8, 81829 München', NULL, 'Konferencia- és szakfordítói csapat Münchenben (AIIC, VKD, BDÜ tag). Nagyprojektek specialistái. · hunlingua.de', '["Magyar"]', 48.1374794, 11.6892295, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BY')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-piroschka-das-ungarische-restaurant', 'Piroschka – Das ungarische Restaurant', 'etterem', 'Étterem', 'Gersthofer Straße 140, 1180 Wien', '+43 676 9106487', 'Klasszikus magyar étterem Bécs 18. kerületében. Gulyás, pörkölt, rántott húsok, palacsinta — csütörtöktől vasárnapig nyitva. · www.piroschka.at', '["Magyar"]', 48.2377606, 16.3219242, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-budapest-bistro', 'Budapest Bistro', 'etterem', 'Étterem', 'Pilgramgasse 10, 1050 Wien', NULL, 'Magyar bisztró Bécs 5. kerületében, egész napos reggeli és magyar fogásokkal. · budapestbistro.at', '["Magyar"]', 48.1920233, 16.3569452, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-magnolia-kosmetik-szalkai-zsanett', 'Magnolia Kosmetik – Szálkai Zsanett', 'szepseg', 'Kozmetikus', 'Nussdorfer Straße 42-44, 1090 Wien', NULL, 'Személyre szabott bőrápolás, klasszikus arckezelések és férfi kozmetika magyarul Bécsben. · magnoliakosmetik.at', '["Magyar"]', 48.2266626, 16.3554843, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-banfai-erika', 'Bánfai Erika', 'szepseg', 'Kozmetikus', 'Ledererhof 7/4/4, 1010 Wien', NULL, 'Kozmetikus és hajgyógyász, arckezelések, testkezelések, hajápolás Bécs 1. kerületében. · kosmetik-haut-haar.at', '["Magyar"]', 48.2117923, 16.3687524, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-viktoriatraining-kovacs-viktoria', 'Viktoriatraining – Kovács Viktória', 'szemelyi_edzo', 'Személyi edző', 'Schönbrunner Straße 201, 1120 Wien', NULL, 'Erőnléti edzések és rúdtánc Bécsben, magyarul. Személyi edzés, kiscsoportos foglalkozások. · www.viktoriatraining.at', '["Magyar"]', 48.1849776, 16.3364878, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-bizta-biztositas-ausztria', 'BiztA – Biztosítás Ausztria', 'biztositas', 'Biztosítás', 'Hauptplatz 11, 7400 Oberwart', NULL, 'Magyar nyelvű biztosítási tanácsadás és ügyintézés Ausztriában (Wiener Städtische képviselet). · bizta.at', '["Magyar"]', 47.2875151, 16.2138587, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-pannonfinanz', 'Pannonfinanz', 'biztositas', 'Biztosítás', 'Bahnhof Straße 82/6, 7443 Rattersdorf', '+43 664 200 3234', 'Nyugdíj, hitel és biztosítási ügyek intézése Ausztriában élő magyaroknak, online is. · pannonfinanz.at', '["Magyar"]', 47.4109107, 16.5007483, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'BGL')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('nl-imp-the-taste-of-hungary', 'The Taste of Hungary', 'elelmiszer', 'Élelmiszerbolt', 'Kreekweg 8 N, 3133 AZ Vlaardingen', NULL, 'Magyar élelmiszerek és termékek online boltja, Hollandia-szerte szállít. · thetasteofhungary.nl', '["Magyar"]', 51.8997747, 4.3298864, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'NL', 'ZH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('nl-imp-hunbox', 'HunBox', 'elelmiszer', 'Élelmiszerbolt', 'Neckerdijk 2f, 1441 GX Purmerend', NULL, 'Magyar élelmiszer-webshop Hollandiában élő magyaroknak. · hunbox.nl', '["Magyar"]', 52.5102965, 4.9437413, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'NL', 'NH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-dr-vizvari-fruzsina', 'Dr. Vizvári Fruzsina', 'allatorvos', 'Állatorvos', 'Hetzendorfer Str. 75, 1120 Wien', NULL, 'Magyar állatorvos Bécs 12. kerületében. Kisállatrendelő, általános és megelőző állatorvoslás. · www.tierordination-hetzendorf.at', '["Magyar"]', 48.1666742, 16.3106519, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-dr-bernadette-vago', 'Dr. Bernadette Vago', 'borgyogyasz', 'Bőrgyógyász', 'Rotenhofgasse 14, 1100 Wien', NULL, 'Magyar bőrgyógyász Bécs 10. kerületében. Lipödéma, vénás betegségek, dermatológia specialista. · vago.at', '["Magyar"]', 48.1740775, 16.3751312, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-dr-gabor-bali', 'Dr. Gábor Bali', 'borgyogyasz', 'Bőrgyógyász', 'Karl-Popper-Straße 8 / Top 203, 1100 Wien', NULL, 'Magyar bőrgyógyász és allergológus Bécs főpályaudvarnál. Dermatológia, klinikai immunológia. · derma-wien.at', '["Magyar"]', 48.1857299, 16.3800251, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('ch-imp-dr-med-phd-arpad-farkas', 'Dr. med. PhD. Árpád Farkas', 'borgyogyasz', 'Bőrgyógyász', 'Schaffhauserstrasse 99, 8152 Glattbrugg', NULL, 'Magyar bőrgyógyász Zürich mellett, németül, angolul és magyarul is rendel. · hautarzt-glattbrugg.ch', '["Magyar"]', 47.4329961, 8.5641416, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'CH', 'ZH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-dr-istvan-salamon', 'Dr. István Salamon', 'termeszetgyogyasz', 'Természetgyógyász', 'Währingerstraße 153/13, 1180 Wien', '+43 699 119 89 167', 'Osteopata, általános orvos, manuális medicina és akupunktúra Bécsben és Hollabrunban. · istvansalamon.at', '["Magyar"]', 48.2284121, 16.3344022, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-becsingatlan-com', 'Becsingatlan.com', 'ingatlan', 'Ingatlan', 'Brahmsplatz 7/Top 12, 1040 Wien', NULL, 'Magyar nyelvű ingatlanközvetítés és befektetési tanácsadás Bécsben, helyi szakértőkkel. · becsingatlan.com', '["Magyar"]', 48.1941248, 16.3692006, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-dr-csehi-alisa-leila', 'Dr. Csehi-Alisa Leila', 'ugyved', 'Ügyvéd', 'Gonzagagasse 14/10, 1010 Wien', '+43 1 533 36 95', 'Ingatlanjog, társasági jog és ausztriai ügyintézés magyar nyelven Bécsben. · csehi-alisa.at', '["Magyar"]', 48.2159953, 16.3697093, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-mf-beauty-emi-s-frisur', 'MF Beauty – Emi''s Frisur', 'fodrasz', 'Fodrász', 'Geusaugasse 7, 1030 Wien', '+43 660 73 85 076', 'Fodrász és szépségszalon Bécs 3. kerületében, ahol magyarul is kiszolgálják a vendégeket. Vágás, festés, styling. · mf-beauty.at', '["Magyar"]', 48.2065199, 16.3895321, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-akos-polgar-hairstylist', 'Ákos Polgár Hairstylist', 'fodrasz', 'Fodrász', 'Kirchengasse 27, 1070 Wien', NULL, 'Magyar fodrász Bécs 7. kerületében. Modern hajvágások, balayage és airtouch festés, női és férfi frizurák.', '["Magyar"]', 48.2029313, 16.3513126, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-salon-de-beaute-revesz-kovacs-anita', 'Salon de Beauté – Révész-Kovács Anita', 'fodrasz', 'Fodrász', 'Breitenfurter Straße 372, 1230 Wien', '+43 670 506 6164', 'Magyar tulajdonú szépségszalon Bécs 23. kerületében (Liesing). Hajvágás, körmök, arckezelés, masszázs. · salondebeaute.wien', '["Magyar"]', 48.1373134, 16.2783405, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-zoltan-bolla-cenk-zerdeli-friseur', 'Zoltan Bolla – Cenk Zerdeli Friseur', 'fodrasz', 'Fodrász', 'Uhlandstraße 52, 10719 Berlin', '+49 176 81214142', 'Magyar fodrász Berlinben (Wilmersdorf). Precíz vágások, festések, balayage — magyarul, németül és angolul. · www.cenkzerdeli.de', '["Magyar"]', 52.4963497, 13.3238692, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BE')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('nl-imp-kris-kraz-kapper-krisztian', 'Kris-kraz kapper – Krisztián', 'fodrasz', 'Fodrász', 'Tweede Hugo de Grootstraat 5h, 1057 BK Amsterdam', '+31 6 46115737', 'Magyar fodrász Amszterdamban. Texturált vágások, balayage, highlights. Online foglalás Treatwellen és Freshán.', '["Magyar"]', 52.3741006, 4.8745743, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'NL', 'NH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-budapest-restaurant-munchen', 'Budapest Restaurant München', 'etterem', 'Étterem', 'Einsteinstraße 119, 81675 München', '+49 176 21709768', 'Magyar specialitások és nemzetközi konyha Münchenben. Hétfőtől szombatig nyitva 11:00-tól. · budapest-restaurant.hupont.hu', '["Magyar"]', 48.1361501, 11.607609, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BY')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-family-langos', 'Family Lángos', 'etterem', 'Étterem', 'Lerchenauer Straße 160, 80935 München', '+49 163 9139746', 'Autentikus lángos és kürtőskalács München északi részén. Magyar street food klasszikus, rendszeres nyitva tartással. · www.facebook.com/familylangos', '["Magyar"]', 48.1927301, 11.5496678, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BY')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('ch-imp-toth-s-chimney-cake-kurtoskalacs', 'Toth''s Chimney Cake – Kürtőskalács', 'pek', 'Pékség', 'Rindermarkt 5, 8001 Zürich', NULL, 'Friss, tradicionális kürtőskalács Zürich óvárosában (Rindermarkt 5). Szerdától vasárnapig nyitva. · tothschimneycake.ch', '["Magyar"]', 47.3724091, 8.5441847, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'CH', 'ZH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('nl-imp-overtone-bistro-hungarian-touch', 'Overtone Bistro – Hungarian Touch', 'etterem', 'Étterem', 'Overtoom 503H, 1054 LH Amsterdam', NULL, 'Amsterdam egyetlen magyar érintettségű bisztrója, ahol magyar ízeket hoznak el helyi alapanyagokból. Szerdától vasárnapig nyitva. · overtonebistro.nl', '["Magyar"]', 52.3676, 4.9041, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'NL', 'NH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-budapest-bagel-wien', 'Budapest Bagel Wien', 'pek', 'Pékség', 'Lilienbrunngasse 3, 1020 Wien', NULL, 'Budapest inspirálta bagel pékség Bécs 2. kerületében, mindennap friss pékárukkal.', '["Magyar"]', 48.2135588, 16.3774929, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-hair-style-team-csilla', 'Hair & Style Team Csilla', 'fodrasz', 'Fodrász', 'Maria-Kuhn-Gasse 6, 1100 Wien', '+43 1 945 91 87', 'Magyar fodrász Bécs 10. kerületében (Wienerberg City). Kedd-szombat nyitva. Vágás, festés, teljes fodrász-szolgáltatás. · www.hairstyle-csilla.at', '["Magyar"]', 48.1681428, 16.3440465, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-dull-hairdressers-dominik-dull', 'Dull Hairdressers – Dominik Dull', 'fodrasz', 'Fodrász', 'St. Peter Hauptstraße 61/1. OG/36, 8042 Graz', NULL, 'Magyarul is beszélő fodrász Grazban. Precíz vágások, festések, modern frizurák. Online foglalás Treatwellen.', '["Magyar"]', 47.0707, 15.4395, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'STM')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-haarstudio-alex-rudi', 'Haarstudio Alex Rudi', 'fodrasz', 'Fodrász', 'Urfahr, Linz', NULL, 'Magyar fodrász Linzben (Urfahr). Balayage, hajfestés, vágás — magyarul, németül és angolul. Trammal könnyen elérhető. · www.hairstudioalexrudi.com', '["Magyar"]', 48.3069, 14.2858, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'OOE')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-puszta-hutte-koln', 'Puszta-Hütte Köln', 'etterem', 'Étterem', 'Fleischmengergasse 57, 50676 Köln', '+49 221 239471', '1948 óta működő legendás kölni gulyásozó. Kizárólag friss gulyást szolgálnak fel, hétfőtől szombatig 10-20 óráig nyitva. · www.pusztahuette.de', '["Magyar"]', 50.9350841, 6.9487088, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'NW')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-hungarium-international', 'Hungarium International', 'etterem', 'Étterem', 'Robert-Bosch-Str. 58, 63225 Langen', '+49 6103 756925', 'Magyar specialitásokat (gulyás, schnitzel, palacsinta) kínáló étterem Frankfurt repülőtér közelében. Hetente minden nap nyitva.', '["Magyar"]', 50.0072588, 8.6567045, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'HE')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-korschtalklause-bei-zsolt', 'Körschtalklause bei Zsolt', 'etterem', 'Étterem', 'Rolf-Brack-Straße 4, 73760 Scharnhausen', '+49 172 4053136', 'Stuttgarti magyarok kedvelt találkozóhelye. Zsolt budapesti séf tradicionális és modern magyar konyhát kínál. Szerdától vasárnapig nyitva. · www.koerschtalklause.de', '["Magyar"]', 48.7067895, 9.2684241, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BW')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-attila-hairdesign', 'Attila Hairdesign', 'fodrasz', 'Fodrász', 'Vaihinger Str. 42, 70567 Stuttgart', '+49 711 710561', 'Prémium fodrász szalon Stuttgart-Möhringenben. Intercoiffure-tag, La Biosthetique termékek, kedd-szombat nyitva. · www.attila-hairdesign.com', '["Magyar"]', 48.7281914, 9.1460125, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BW')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-malermeister-jekosz-e-u', 'Malermeister Jekosz e.U.', 'festo', 'Szobafestő', 'Harlacherweg 6/3/3, 1220 Wien', '+43 676 340 5528', 'Magyar festőmester Bécs 22. kerületében. Festés, tapétázás, felújítás — hétfőtől péntekig 7-18 óra. · www.malermeister-jekosz.at', '["Magyar"]', 48.2349455, 16.4456332, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-reinigungs-kommando-rko', 'Reinigungs Kommando (RKO)', 'takarito', 'Takarítás', 'Gürtelstraße 100, 1060 Wien', '+43 690 10021841', 'Magyar alapítású takarítócég Bécsben. Lakás-, iroda-, ablak- és költözés utáni takarítás egész Kelet-Ausztriában. · www.reinigungskommando.at', '["Magyar"]', 48.2082, 16.3738, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-bling-bling-premium-reinigung', 'Bling Bling Premium Reinigung', 'takarito', 'Takarítás', 'Floridsdorfer Hauptstraße 1, 1210 Wien', NULL, 'Prémium takarítószolgáltatás Bécsben, magyarul is elérhető ügyfélszolgálattal. Lakás, iroda, alapos takarítás. · www.bling-bling.at', '["Magyar"]', 48.2532423, 16.3932677, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-viz-gaz-futes-szigeti-janos', 'Víz-Gáz-Fűtés – Szigeti János', 'gazvez', 'Víz-gáz szerelő', 'Hernalser Gürtel 2/19, 1080 Wien', NULL, 'Magyar vízvezeték-, gáz- és fűtésszerelő Bécsben. Hibaelhárítás, szerelés, karbantartás — magyarul intézve.', '["Magyar"]', 48.2135886, 16.3404637, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-autotom-kfz-werkstatt', 'AutoTom – KFZ Werkstatt', 'autoszer', 'Autószerelő', 'Gehaplatz 7-9 / Tor 2, 2111 Tresdorf', '+43 664 215 15 16', 'Magyar autószerelő és motormentő Bécs közelében (Floridsdorf ~15 perc). Szerviz, javítás, műszaki vizsga (Pickerl). H-Cs 7-17. · www.autotom.at', '["Magyar"]', 48.2082, 16.3738, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-peko-bau-gmbh', 'Peko-Bau GmbH', 'kőműves', 'Kőműves', 'Klostermanngasse 8/1, 1230 Wien', '+43 664 639 1062', 'Magyar kőműves és burkoló cég Bécsben. Hidegburkolás, csempézés, felújítás, gipszkarton, festés — magyarul is. · www.pekobau.at', '["Magyar"]', 48.1423676, 16.2958883, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-e-m-puskar-maler-fliesenleger', 'E & M Puskar – Maler & Fliesenleger', 'festo', 'Szobafestő', 'Arnulfstraße 99, 80634 München', '+49 170 8073950', 'Magyar festő és burkoló vállalkozás Münchenben. Festés, csempézés, parketta, vakolás, komplett lakásfelújítás. · www.puskar.de', '["Magyar"]', 48.1467616, 11.5308531, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BY')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-sb-kfztechnik', 'SB-Kfztechnik', 'autoszer', 'Autószerelő', 'Hatzmühlstr. 30, 85290 Geisenfeld', '+49 8452 7367816', 'Magyar autószerelő műhely München közelében. Általános szerviz, diagnosztika, TÜV-ra felkészítés, javítás. · www.sb-kfztechnik.de', '["Magyar"]', 48.1351, 11.582, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BY')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-auto-klassik-kiraly-karosszeria', 'Auto Klassik Kiraly – Karosszéria', 'autoszer', 'Autószerelő', 'Emeranstraße 45, 85622 Feldkirchen', '+49 89 99895580', 'Magyar autószerelő és karosszériajavító München közelében. Baleset utáni javítás, fényezés, biztosítási ügyintézés. · www.autokiraly.de', '["Magyar"]', 48.1503907, 11.736731, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BY')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-garden-sopron-tamarix-gartenbau', 'Garden Sopron – Tamarix Gartenbau', 'kertesz', 'Kertész', 'Fabriksgelände 17, 7011 Siegendorf', '+43 660 819 6162', 'Magyar kertgondozó és kerttervező cég Burgenlandban. Bécs és környéke — kertépítés, gyepszőnyeg, öntözés, fűnyírás. · gardensopron.eu', '["Magyar"]', 47.769662, 16.531544, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('ch-imp-zahnarztpraxis-magyar', 'Zahnarztpraxis Magyar', 'fogorvos', 'Fogorvos', 'Staubstrasse 4, 8038 Zürich', '+41 44 482 77 55', 'Magyar fogászati praxis Zürichben. Általános fogászat és fogpótlás hétfőtől péntekig, Kassenpatienten is fogadva. · www.zahnarzt-magyar.ch', '["Magyar"]', 47.3474728, 8.5323317, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'CH', 'ZH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-dr-szalantzy-andreas-zahnarzt', 'Dr. Szalantzy Andreas – Zahnarzt', 'fogorvos', 'Fogorvos', 'Bäckerstraße 1, 81241 München', '+49 89 881139', 'Magyar fogorvos Münchenben (Pasing-Obermenzing). Általános fogászat, preventív kezelések magyarul is.', '["Magyar"]', 48.1483073, 11.4620861, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BY')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-kulin-haas-zahnarzte', 'Kulin & Haas Zahnärzte', 'fogorvos', 'Fogorvos', 'Harburger Rathausstraße 29, 21073 Hamburg', '+49 40 770588', 'Magyar fogász páros Hamburgban (Harburg). Melinda Kulin & Enikő Haas — fogászati ellátás magyarul is, hétfőtől péntekig. · www.haas-kulin.de', '["Magyar"]', 53.4597412, 9.9811452, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'HH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-dent-elite-fogaszat', 'DENT ELITE – Fogászat', 'fogorvos', 'Fogorvos', 'Favoritenstraße 48, 1040 Wien', '+43 676 615 8021', 'Magyar nyelvű fogászati rendelő Bécsben. Általános fogászat, fogpótlás, esztétikai kezelések — két helyszín (1040 és 1150 ker.). · www.dentelite.at', '["Magyar"]', 48.1896725, 16.3719817, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-dr-med-dent-ferenc-vellai', 'Dr. med. dent. Ferenc Vellai', 'fogorvos', 'Fogorvos', 'Hohe Weide 17c, 20259 Hamburg', NULL, 'Magyar fogorvos Hamburgban (Eimsbüttel). Fogászati ellátás, konzultáció magyaroknak is.', '["Magyar"]', 53.5706668, 9.9648478, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'HH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-identica-kiraly-kfz-rohrbach', 'IDENTICA Kiraly – Kfz Rohrbach', 'autoszer', 'Autószerelő', 'Lilienthalstr. 9, 85296 Rohrbach', '+49 8442 953355', 'Magyar autókarosszéria-javító és fényező műhely München közelében. Komplett kárügyintézés biztosítóval. · www.autokiraly.de', '["Magyar"]', 48.6085978, 11.5797819, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BY')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-dr-dezso-sztankay-zahnarzt', 'Dr. Dezső Sztankay – Zahnarzt', 'fogorvos', 'Fogorvos', 'Bundesallee 92, 12161 Berlin', NULL, 'Magyar fogorvos Berlinben (Friedenau). Magyarul is fogad — általános fogászat, online időpontfoglalás Doctolibon. · www.doctolib.de', '["Magyar"]', 52.4672318, 13.3279955, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BE')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-dr-erika-devenyi-zahnarzt', 'Dr. Erika Dévényi – Zahnarzt', 'fogorvos', 'Fogorvos', 'Meißauergasse 15/5/1, 1220 Wien', '+43 1 203 3191', 'Magyar fogorvos Bécs 22. kerületében (Donaustadt). Általános fogászat, fogpótlás, implantológia. · www.zahnarzt-ordination.at', '["Magyar"]', 48.248494, 16.4397818, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-dr-endre-steger-zahnarzt', 'Dr. Endre Steger – Zahnarzt', 'fogorvos', 'Fogorvos', 'Ottakringer Straße 196/2/3, 1160 Wien', '+43 1 485 4989', 'Magyar fogorvos Bécs 16. kerületében (Ottakring). Általános fogászat, preventív kezelések.', '["Magyar"]', 48.2137862, 16.3114438, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-gamovex-magyar-felujitas-munchenben', 'Gamovex – Magyar felújítás Münchenben', 'lakasfelujitas', 'Felújítás / Kivitelezés', 'Leopoldstraße 244, 80807 München', NULL, 'Magyar felújítócsapat Münchenben. Festés, burkolás, gipszkarton, komplett lakásfelújítás — írásos ajánlattal. · www.gamovex-handwerker.com', '["Magyar"]', 48.1805959, 11.5854595, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BY')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-bitubau-munchen', 'Bitubau München', 'kőműves', 'Kőműves', 'Frasdorfer Straße 20, 81549 München', NULL, 'Magyar kőműves és felújítóvállalat müncheni irodával. Magasépítés, belsőépítészet, ipari és lakóépület-felújítás. · www.bitubau.com', '["Magyar"]', 48.1014779, 11.5910487, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BY')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-dr-eniko-jozsa-hausarzt', 'Dr. Enikő Józsa – Hausarzt', 'orvos', 'Orvos', 'Mariahilfer Straße 64/9, 1070 Wien', '+43 699 127 317 18', 'Magyar háziorvos Bécs 7. kerületében (Mariahilf). Általános orvosi ellátás magyarul — bejelentkezés telefonon. · www.dr-jozsa.at', '["Magyar"]', 48.1998864, 16.3544176, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-dr-tamas-csaky-pallavicini-arzt', 'Dr. Tamás Csáky-Pallavicini – Arzt', 'orvos', 'Orvos', 'Praterstraße 25A/3, 1020 Wien', '+43 1 40 80 120', 'Magyar háziorvos Bécs 2. kerületében (Leopoldstadt). Belgyógyászat, általános orvoslás, szűrővizsgálatok. · www.pallavicini.at', '["Magyar"]', 48.2142644, 16.3836669, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-dr-miklos-marton-allgemeinmedizin', 'Dr. Miklós Márton – Allgemeinmedizin', 'orvos', 'Orvos', 'Barmherzigengasse 17/5/3, 1030 Wien', '+43 1 907 32 22', 'Magyar háziorvos Bécs 3. kerületében (Landstraße). Általános és belgyógyászati ellátás.', '["Magyar"]', 48.1959556, 16.3943555, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-dr-med-venczel-hausarztpraxis', 'Dr. med. Venczel – Hausarztpraxis', 'orvos', 'Orvos', 'Adelheidstraße 23, 80798 München', '+49 89 2729460', 'Magyar orvos Münchenben (Maxvorstadt). Általános és belgyógyászat, megelőző orvoslás — magyarul is. · www.drs-venczel.com', '["Magyar"]', 48.1581261, 11.5674984, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BY')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-dr-med-laszlo-varga-allgemeinmedizin', 'Dr. med. Laszlo Varga – Allgemeinmedizin', 'orvos', 'Orvos', 'Isartorplatz 6, 80331 München', NULL, 'Magyar háziorvos München belvárosában. Online időpontfoglalás Doctolibon, általános orvosi ellátás.', '["Magyar"]', 48.1339349, 11.5834332, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BY')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-dr-csehi-alisa-leila-rechtsanwalt', 'Dr. Csehi-Alisa Leila – Rechtsanwalt', 'ugyved', 'Ügyvéd', 'Gonzagagasse 14/10, 1010 Wien', '+43 699 1713 8712', 'Magyar ügyvéd Bécs 1. kerületében. Munkajog, tartózkodási jog, migrációs jog — magyarul, németül, angolul. · www.csehi-alisa.at', '["Magyar"]', 48.2159953, 16.3697093, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-dr-gabriella-peterfy-rechtsanwaltin', 'Dr. Gabriella Péterfy – Rechtsanwältin', 'ugyved', 'Ügyvéd', 'Mariahilferstraße 123, 1060 Wien', '+43 1 236 36 39', 'Magyar ügyvéd Bécs 6. kerületében. Polgári jog, ingatlan, üzleti jog, osztrák-magyar ügyek — teljes körű képviselet. · www.peterfy-law.com', '["Magyar"]', 48.1955738, 16.3410033, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-attila-visnyei-rechtsanwalt-munchen', 'Attila Visnyei – Rechtsanwalt München', 'ugyved', 'Ügyvéd', 'Münchner Straße 18, 85774 Unterföhring', '+49 89 923 368', 'Magyar ügyvéd Münchenben. Munkajog, kártérítési jog, bevándorlási ügyek — magyarul és németül. · www.visnyei.de', '["Magyar"]', 48.1817871, 11.6329124, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BY')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-dr-istvan-szabados-dsc-legal-berlin', 'Dr. Istvan Szabados – DSC Legal Berlin', 'ugyved', 'Ügyvéd', 'Behrenstraße 36, 10117 Berlin', '+49 30 889 294 40', 'Magyar ügyvéd Berlinben (Mitte). Kereskedelmi jog, társasági jog, M&A, EU-jog — magyarul és angolul is. · www.dsc-legal.com', '["Magyar"]', 52.5157429, 13.393565, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BE')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-daniel-dajka-rechtsanwalt-berlin', 'Daniel Dajka – Rechtsanwalt Berlin', 'ugyved', 'Ügyvéd', 'Friedrichstraße 94, 10117 Berlin', '+49 30 81 45 53 810', 'Magyar ügyvéd Berlinben. Polgári jog, büntetőjog, lakásjog, munkajog — magyarul is intézhető. · www.rechtsanwalt-dajka.de', '["Magyar"]', 52.5192054, 13.3891065, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BE')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('nl-imp-nagy-tibor-law-firm-amsterdam', 'Nagy Tibor Law Firm – Amsterdam', 'ugyved', 'Ügyvéd', 'Henriette Roland Holsthof 55, 1382 SJ Weesp', '+36 20 938 3087', 'Magyar e-ügyvédi iroda Amszterdam közelében. Holland, magyar és EU-jog, cégalapítás, ingatlan, bevándorlás. · www.hungarian-e-lawyer.eu', '["Magyar"]', 52.3148571, 5.0361042, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'NL', 'NH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-bock-kus-steuerberatung-wien', 'Böck & Kus – Steuerberatung Wien', 'konyveles', 'Könyvelés', 'Hietzinger Kai 67/4, 1130 Wien', '+43 1 877 26 41', 'Magyar ügyfeleket is fogadó bécsi könyvelő iroda. Adótanácsadás, könyvelés, cégalapítás, éves mérleg. · www.boeck-kus.at', '["Magyar"]', 48.1909038, 16.2865281, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-dr-norbert-schnabl-partner', 'Dr. Norbert Schnabl & Partner', 'konyveles', 'Könyvelés', 'Hummelgasse 14, 1130 Wien', '+43 1 877 08 44', 'Osztrák-magyar adótanácsadó iroda Bécsben. Magyar- és Ausztria-közeli ügyekben különös tapasztalat. · www.schnabl.co.at', '["Magyar"]', 48.1804795, 16.2815986, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-csizmazia-anett-konyveles-munchen', 'Csizmazia Anett – Könyvelés München', 'konyveles', 'Könyvelés', 'Münchner Straße 18, 85774 Unterföhring', '+49 89 923 368 10', 'Magyar könyvelő és adótanácsadó Münchenben. Könyvelés, adóbevallás, bérszámfejtés, cégalapítás magyarul. · www.konyveles.de', '["Magyar"]', 48.1817871, 11.6329124, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BY')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('nl-imp-tomas-auto-garage-ridderkerk', 'Tomas Auto Garage – Ridderkerk', 'autoszer', 'Autószerelő', 'Pottenbakker Straat 4-6, 2984 AT Ridderkerk', '+31 6 15233316', 'Magyar autószerelő Hollandiában. APK-vizsga, javítás, diagnosztika, motorfelújítás — magyarul is intézhető. · www.tomasautogaragebedrijf.nl', '["Magyar"]', 51.8778594, 4.6132298, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'NL', 'ZH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('nl-imp-auto-arts-bv-alkmaar', 'Auto Arts BV – Alkmaar', 'autoszer', 'Autószerelő', 'De Volger 12, 1483 GA De Rijp', '+31 6 84633287', 'Magyar autószerelő Hollandiában (Alkmaar közelében). Karbantartás, APK, diagnosztika, használt autó értékesítés. · hu.autoarts.nl', '["Magyar"]', 52.5501031, 4.8463237, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'NL', 'NH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('ch-imp-car-garage-zurich-magyar-szerviz', 'Car-Garage Zürich – Magyar szerviz', 'autoszer', 'Autószerelő', 'Bremgarterstrasse 94, 8967 Widen', NULL, 'Magyar autószerelő Zürich közelében. Szerviz, gumicsere, MFK-vizsga, baleseti javítás — 10+ éves tapasztalat. · www.car-garage.ch', '["Magyar"]', 47.3618319, 8.3554803, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'CH', 'ZH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-mag-tunde-szentgroti-pszichologus', 'Mag. Tünde Szentgróti – Pszichológus', 'pszichologus', 'Pszichológus / Coach', 'Universitätsstraße 8/4A, 1090 Wien', '+43 699 1130 1120', 'Magyar klinikai szakpszichológus Bécsben (9. ker.). Egyéni és párterápia magyarul és németül, online konzultáció is. · www.szentgroti.com', '["Magyar"]', 48.2145389, 16.3563867, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-dr-laszlo-benedek-pszichiater', 'Dr. László Benedek – Pszichiáter', 'pszichologus', 'Pszichológus / Coach', 'Wurmbstraße 50/22, 1120 Wien', '+43 676 673 9389', 'Magyar pszichiáter és pszichoterapeuta Bécsben (Meidling). Időpont: hétfőn 10-12 és 14-16 óra között. · www.ungarischer-psychiater.at', '["Magyar"]', 48.1723152, 16.3321848, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-erika-eidlitz-pszichoterapeuta', 'Erika Eidlitz – Pszichoterapeuta', 'pszichologus', 'Pszichológus / Coach', 'Linzer Straße 373, 1140 Wien', '+43 650 32 33 650', 'Magyar pszichoterapeuta és tanácsadó Bécsben (Penzing). Egyéni terápia, párterápia, online ülések is. · www.psychotherapie-eidlitz.at', '["Magyar"]', 48.2011991, 16.2635403, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-dr-borbala-balazs-psychotherapie-munchen', 'Dr. Borbála Balázs – Psychotherapie München', 'pszichologus', 'Pszichológus / Coach', 'Klenzestraße 13, 80469 München', '+49 89 961 183 69', 'Magyar pszichológiai pszichoterapeuta Münchenben (Au-Haidhausen). Biztosítóval szerződésben, egyéni terápia. · www.psychotherapie-balazs.de', '["Magyar"]', 48.1331629, 11.5786697, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BY')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-boroka-sielski-heilpraktikerin-berlin', 'Bóróka Sielski – Heilpraktikerin Berlin', 'pszichologus', 'Pszichológus / Coach', 'Solmsstraße 36, 10961 Berlin', NULL, 'Magyar pszichológiai tanácsadó Berlinben (Kreuzberg). Egyéni és párterápia, stresszkezelés, életvezetési tanácsadás.', '["Magyar"]', 52.4908184, 13.3926455, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BE')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('ch-imp-dr-iur-anett-iltanen-iraz-zurich', 'Dr. iur. Anett Iltanen – IRAZ Zürich', 'ugyved', 'Ügyvéd', 'Bellerivestrasse 2, 8008 Zürich', '+41 43 536 13 33', 'Magyar és svájci jogász Zürichben. Kereskedelmi, családi, öröklési, ingatlan- és bevándorlási jog — svájci-magyar ügyek. · www.iraz.ch', '["Magyar"]', 47.361258, 8.5478749, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'CH', 'ZH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-dr-andrea-dudas-hausarzt-wien', 'Dr. Andrea Dudás – Hausarzt Wien', 'orvos', 'Orvos', 'Breitenfurter Straße 479/4/1, 1230 Wien', '+43 1 888 41 42', 'Magyar háziorvos Bécs 23. kerületében (Liesing). Általános orvosi ellátás, szűrővizsgálatok, beutalók. · www.dr-dudas.at', '["Magyar"]', 48.137333, 16.256648, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-praxis-dr-reka-felkai-munchen', 'Praxis Dr. Reka Felkai – München', 'orvos', 'Orvos', 'Weißenburger Straße 10, 81667 München', NULL, 'Magyar orvos Münchenben (Haidhausen). Általános orvosi ellátás, időpontfoglalás a rendelőn keresztül.', '["Magyar"]', 48.1283746, 11.5955076, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BY')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-dr-univ-budapest-yvonne-kieffer', 'Dr. (Univ. Budapest) Yvonne Kieffer', 'orvos', 'Orvos', 'Lindwurmstraße 203, 80337 München', '+49 89 746 91 03', 'Magyar képzettségű háziorvos Münchenben (Sendling). Általános orvoslás, belgyógyászat.', '["Magyar"]', 48.1219952, 11.5442177, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BY')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-paul-magyar-gmbh-installateur', 'Paul Magyar GmbH – Installateur', 'gazvez', 'Víz-gáz szerelő', 'Nordwestbahnstraße 75, 1200 Wien', '+43 1 332 90 46', 'Víz-, gáz- és fűtésszerelő cég Bécsben (20. ker.). Szerelés, javítás, thermosztát-csere, biztosítóval is. · www.paulmagyar.at', '["Magyar"]', 48.232153, 16.3774766, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-hetesi-tibor-viz-gaz-futes', 'Hetesi Tibor – Viz-Gaz-Futes', 'gazvez', 'Víz-gáz szerelő', 'Liebenberggasse 1, 1010 Wien', '+43 1 512 78 70', 'Magyar vízszerelő Bécs 1. kerületében. Víz-, gáz- és fűtésszerelési munkák — azonnali hibaelhárítás is.', '["Magyar"]', 48.2063122, 16.3774169, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-mediphysio-wien-veronika-puljic', 'Mediphysio Wien – Veronika Puljic', 'gyogytornasz', 'Fizioterapeuta', 'Billrothstraße 4, 1190 Wien', '+43 1 589 72 7310', 'Magyar fizioterapeuta Bécsben (Döbling). Ortopéd-, neurológiai rehab, Schroth-terápia — H-Sz 7-20, Szo 8-18. · www.mediphysio.at', '["Magyar"]', 48.2430291, 16.3473792, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-relax-fit-physiotherapie-wien', 'Relax-fit Physiotherapie Wien', 'gyogytornasz', 'Fizioterapeuta', 'Fichtnergasse 22/1, 1130 Wien', '+43 1 957 49 67', 'Magyar fizioterapeuta Bécs 13. kerületében (Hietzing). Mozgásterápia, masszázs, rehabilitáció magyarul. · www.relaxfit.at', '["Magyar"]', 48.1853054, 16.2881884, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('nl-imp-kris-kraz-kapper-krisztian-x', 'Kris-kraz kapper – Krisztián', 'fodrasz', 'Fodrász', 'Tweede Hugo de Grootstraat 5h, 1052 LC Amsterdam', NULL, 'Magyar fodrász Amszterdamban (Westerpark). 9 éves tapasztalat — balayage, melír, rövid textúrált frizurák.', '["Magyar"]', 52.3741006, 4.8745743, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'NL', 'NH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('nl-imp-skinparadise-beauty-salon', 'SkinParadise Beauty Salon', 'szepseg', 'Kozmetikus', 'Escamplaan 13, 2547 GA Den Haag', '+31 6 2718 9722', 'Magyar kozmetikus és szépségszalon Den Haagban. Arckezelések, szempilla, testápolás — magyaroknak ajánlott.', '["Magyar"]', 52.065337, 4.2783878, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'NL', 'ZH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-artisan-baker-gulya-istvan', 'Artisan Baker – Gulya István', 'pek', 'Pékség', 'Einbiglerweg 5, 60386 Frankfurt am Main', '+49 162 168 7717', 'Magyar kézműves pék Frankfurtban. Hagyományos kovászos kenyér, péksütemények — online rendelés is. · www.artisanbaker.eu', '["Magyar"]', 50.1201268, 8.7727656, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'HE')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-lifebalance-physio-wien', 'Lifebalance Physio Wien', 'gyogytornasz', 'Fizioterapeuta', 'Stumpergasse 13/6A/8, 1060 Wien', NULL, 'Magyar fizioterapeuta Bécs 6. kerületében (Mariahilf). Mozgásszervi rehab, sportfizikál — időpont e-mailben/WhatsApp-on. · www.lifebalancephysio.at', '["Magyar"]', 48.1924825, 16.3460033, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-lcm-reinigung-berlin', 'LCM Reinigung Berlin', 'takarito', 'Takarítás', 'Grünberger Straße 54, 10245 Berlin', NULL, 'Takarítócég Berlinben (Friedrichshain). Lakás- és irodatakarítás, végső takarítás, rendszeres bejárós takarítás. · www.lcmreinigung.de', '["Magyar"]', 52.5116165, 13.4555578, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BE')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-puszta-hutte-gulyas-koln', 'Puszta-Hütte – Gulyás Köln', 'etterem', 'Étterem', 'Fleischmengergasse 57, 50676 Köln', '+49 221 239471', 'Kölni intézmény 1948 óta. Egyetlen fogás: eredeti recept szerinti magyar gulyásleves — turista- és helyi kedvenc. · www.puszta-huette.de', '["Magyar"]', 50.9350841, 6.9487088, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'NW')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-konditorei-piroschka-stuttgart', 'Konditorei Piroschka Stuttgart', 'pek', 'Pékség', 'Gablenberger Hauptstraße 27, 70186 Stuttgart', '+49 711 90118202', 'Magyar cukrászda Stuttgartban. Hagyományos torták, sütemények, kávézó — napi friss készítmények. · www.piroschka-konditorei.de', '["Magyar"]', 48.7790429, 9.207553, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BW')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-timis-cafe-und-restaurant-stuttgart', 'TIMIS Café und Restaurant Stuttgart', 'etterem', 'Étterem', 'Goslarer Straße 79, 70499 Stuttgart', '+49 152 53761710', 'Magyar-osztrák-német konyha Stuttgartban (Weilimdorf). Pörkölt, paprikás csirke, napi menük és pékáru.', '["Magyar"]', 48.8162689, 9.1224025, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BW')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-liktors-club-restaurant-stuttgart', 'Liktors Club-Restaurant Stuttgart', 'etterem', 'Étterem', 'Kafkaweg 7, 70437 Stuttgart', '+49 162 919 8566', 'Magyar ételek Stuttgartban — rindsgulyás (pörkölt), brassói, szendvicsek. Összejövetelek, rendezvények. · www.liktors.de', '["Magyar"]', 48.8405711, 9.2158465, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BW')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-dr-zsofia-szirmak-psychotherapeutin', 'Dr. Zsófia Szirmák – Psychotherapeutin', 'pszichologus', 'Pszichológus / Coach', 'Gervinusstraße 22, 10629 Berlin', '+49 177 479 7182', 'Magyar pszichológiai pszichoterapeuta Berlinben (Charlottenburg). Egyéni terápia — bejelentkezés telefonon.', '["Magyar"]', 52.5024256, 13.297758, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BE')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('ch-imp-dr-iur-yvette-kovacs-rechtsanwaltin', 'Dr. iur. Yvette Kovacs – Rechtsanwältin', 'ugyved', 'Ügyvéd', 'Kempterstrasse 5, 8032 Zürich', '+41 44 381 55 22', 'Magyar-svájci ügyvéd Zürichben. Szerződési, családi, öröklési, védjegy- és kommunikációs jog — anyanyelvű (de/hu). · www.yvette-kovacs-rechtsanwaeltin.ch', '["Magyar"]', 47.3656799, 8.5676028, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'CH', 'ZH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('ch-imp-reka-papp-pszichologus-zurich', 'Réka Papp – Pszichológus Zürich', 'pszichologus', 'Pszichológus / Coach', 'Lavaterstrasse 75, 8002 Zürich', NULL, 'Magyar pszichológus Zürichben (Enge). Egyéni és családi tanácsadás, kifejezetten svájci magyaroknak. · www.pszichologus-zurich.ch', '["Magyar"]', 47.3608197, 8.5332165, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'CH', 'ZH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('nl-imp-magyar-konyvelohaz-rotterdam', 'Magyar Könyvelőház – Rotterdam', 'konyveles', 'Könyvelés', 'Soetendaalseweg 63a, 3036 EL Rotterdam', '+31 6 23167808', 'Magyar könyvelőiroda Rotterdamban. ZZP, VOF, BV alapítás, adóbevallás, bérszámfejtés — magyaroknak. · www.magyarkonyvelohaz.nl', '["Magyar"]', 51.9395842, 4.4821661, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'NL', 'ZH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('nl-imp-spajz-rotterdami-magyar-bolt', 'Spájz Rotterdami Magyar Bolt', 'elelmiszer', 'Élelmiszerbolt', 'Soetendaalseweg 63a, 3036 EL Rotterdam', '+31 6 23167808', 'Magyar élelmiszerbolt Rotterdamban. Hazai ízek: felvágottak, tejtermékek, füstölt áruk, szörpök, befőttek. · www.rotterdamimagyarbolt.com', '["Magyar"]', 51.9395842, 4.4821661, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'NL', 'ZH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-dr-victoria-yar-hausarztin-hamburg', 'Dr. Victoria Yar – Hausärztin Hamburg', 'orvos', 'Orvos', 'Hufnerstraße 101, 22305 Hamburg', '+49 40 6117010', 'Magyar képzettségű háziorvos Hamburgban (Barmbek-Süd). Általános orvoslás — Doctolibon is foglalható.', '["Magyar"]', 53.5893119, 10.0422814, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'HH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-edgar-zsolt-orban-hausarzt-dusseldorf', 'Edgar-Zsolt Orban – Hausarzt Düsseldorf', 'orvos', 'Orvos', 'Kölner Landstraße 170, 40591 Düsseldorf', '+49 211 762608', 'Magyar háziorvos Düsseldorfban. Általános orvoslás, szűrők, beutalók — magyarul, németül, angolul. · www.arzt-im-zentrum.de', '["Magyar"]', 51.188837, 6.8180673, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'NW')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-dr-anita-angela-posa-dusseldorf', 'Dr. Anita Angela Posa – Düsseldorf', 'orvos', 'Orvos', 'Berliner Allee 56, 40212 Düsseldorf', '+49 211 15866231', 'Magyar orvos Düsseldorf belvárosában. Általános és belgyógyászat, rendelési idő weboldalon. · www.praxisposa.de', '["Magyar"]', 51.2183107, 6.7823339, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'NW')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-paprika-weine-berlin', 'Paprika & Weine – Berlin', 'elelmiszer', 'Élelmiszerbolt', 'Samariterstraße 37, 10247 Berlin', '+49 157 70543424', 'Magyar bor- és élelmiszerspecialitás bolt Berlinben (Friedrichshain). Tokaji, Bull''s Blood, fűszerek, befőttek. · www.paprika-und-weine.de', '["Magyar"]', 52.515653, 13.4645666, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BE')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-borso-ungarische-speisekammer-berlin', 'Borsó – Ungarische Speisekammer Berlin', 'elelmiszer', 'Élelmiszerbolt', 'Wilmersdorfer Straße 152, 10585 Berlin', NULL, 'Magyar élelmiszerkülönlegességek Berlinben (Charlottenburg). Hazai ízek, tejtermékek, füstölt áruk, édességek.', '["Magyar"]', 52.5143993, 13.305028, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BE')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-nagy-ungarische-spezialitaten-berlin', 'Nagy – Ungarische Spezialitäten Berlin', 'elelmiszer', 'Élelmiszerbolt', 'Karl-Marx-Allee 112, 10243 Berlin', NULL, 'Magyar élelmiszer-különlegességek üzlete Berlinben (Friedrichshain). Felvágottak, tejtermékek, szörpök.', '["Magyar"]', 52.5162997, 13.4462945, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BE')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-leckerwerk-ungarische-feinkost-munchen', 'Leckerwerk – Ungarische Feinkost München', 'elelmiszer', 'Élelmiszerbolt', 'Siegfriedstraße 9, 80803 München', '+49 176 60801511', 'Magyar finomságok és catering Münchenben (Schwabing). Házi kolbász, lángos, gulyás — rendezvényekre is. · www.leckerwerk.eu', '["Magyar"]', 48.1628567, 11.584473, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BY')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-paprika-jancsi-ungarische-spezialitaten', 'Paprika Jancsi – Ungarische Spezialitäten', 'elelmiszer', 'Élelmiszerbolt', 'Klosterneuburger Straße 50, 1200 Wien', '+43 676 383 08 94', 'Magyar élelmiszer-különlegességek Bécsben (20. ker.). Fűszerek, befőttek, kolbász, tejtermékek, édességek.', '["Magyar"]', 48.2314177, 16.3666999, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-balaton-s-susse-ecke-wien', 'Balaton''s Süße Ecke Wien', 'elelmiszer', 'Élelmiszerbolt', 'Angeligasse 37, 1100 Wien', '+43 699 197 43 503', 'Magyar cukrászati különlegességek és élelmiszer Bécsben (10. ker.). Házi sütemények, befőttek, szörpök.', '["Magyar"]', 48.1705326, 16.3723071, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('ch-imp-dr-med-cseh-andreas-hno-basel', 'Dr. med. Cseh Andreas – HNO Basel', 'orvos', 'Orvos', 'Steinengraben 40, 4051 Basel', NULL, 'Magyar képzettségű fül-orr-gégész Baselben. Konzultáció, vizsgálat — előzetes időpont szükséges.', '["Magyar"]', 47.5534617, 7.5858029, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'CH', 'BS')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('ch-imp-dr-illes-klara-svajci-ugyved', 'Dr. Illés Klára – Svájci ügyvéd', 'ugyved', 'Ügyvéd', 'Svájc (mobil iroda)', '+41 79 660 5617', 'Magyar ügyvéd egész Svájcra. Tartózkodási engedély, munkajog, polgári jog, öröklési jog — mobilon elérhető. · www.illesugyved.com', '["Magyar"]', 47.3769, 8.5417, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'CH', 'ZH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-becsi-ingatlanok-becsingatlan-com', 'Bécsi Ingatlanok – becsingatlan.com', 'ingatlan', 'Ingatlan', 'Brahmsplatz 7/3/Top 12A, 1040 Wien', '+43 1 963 9900', 'Magyar ingatlanközvetítő Bécsben (4. ker.). Ingatlanvásárlás, bérbeadás, befektetési tanácsadás — magyarul. · www.becsingatlan.com', '["Magyar"]', 48.1941248, 16.3692006, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('nl-imp-remport-vastgoed-holland-ingatlan', 'Remport Vastgoed – Holland ingatlan', 'ingatlan', 'Ingatlan', 'Hollandia (mobil iroda)', '+31 6 57431907', 'Magyar ingatlanközvetítő Hollandiában. Lakásvásárlás, jelzáloghitel, jogi tanácsadás magyaroknak egész NL-ben. · www.remport.net', '["Magyar"]', 52.13, 5.29, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'NL', NULL)
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-katalin-meinhardt-steuerberaterin', 'Katalin Meinhardt – Steuerberaterin', 'konyveles', 'Könyvelés', 'Altkönigblick 87, 60437 Frankfurt am Main', '+49 6101 9956001', 'Magyar könyvelő és adótanácsadó Frankfurtban. Könyvelés, adóbevallás, cégköltség-elszámolás — magyarul is.', '["Magyar"]', 50.1884042, 8.6943244, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'HE')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-dr-nora-madai-ovb-wien', 'Dr. Nóra Madai – OVB Wien', 'ingatlan', 'Ingatlan', 'Franz-Josefs-Kai 53/1/15, 1010 Wien', '+43 677 61300910', 'Magyar ingatlan- és hitelügyintéző tanácsadó Bécsben (1. ker.). Befektetési ingatlanok, hitelfinanszírozás.', '["Magyar"]', 48.21615, 16.3712429, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-gasthaus-goldener-anker-heroldsberg', 'Gasthaus Goldener Anker – Heroldsberg', 'etterem', 'Étterem', 'Oberer Markt 19, 90562 Heroldsberg', '+49 911 5188719', 'Magyar ételeket kínáló vendéglő Nürnberg közelében. Gulyás, halászlé, töltött káposzta — magyar zene is.', '["Magyar"]', 49.5340886, 11.1580796, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BY')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-optitax-magyar-nemet-adotanacsadas', 'Optitax – Magyar-Német adótanácsadás', 'konyveles', 'Könyvelés', 'Online iroda, Németország egész területén', NULL, 'Magyar-német határokon átnyúló adótanácsadás. Cégalapítás, áfa, jövedelemadó, bérszámfejtés — online is. · www.optitax.eu', '["Magyar"]', 51.1, 10.4, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', NULL)
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-halasbau-gmbh-del-bajororszag', 'Halasbau GmbH – Dél-Bajorország', 'epitoipar', 'Építőipar', 'Halasbau GmbH, München és Bajorország', NULL, 'Magyar építőipari vállalat Bajorországban. Magas- és mélyépítés, projektmenedzsment — München környékén aktív. · www.halasbau.de', '["Magyar"]', 48.1351, 11.582, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BY')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-dr-agnes-sebestyen-zahnarzt-frankfurt', 'Dr. Ágnes Sebestyén – Zahnarzt Frankfurt', 'fogorvos', 'Fogorvos', 'Darmstädter Landstraße 199, 60598 Frankfurt am Main', '+49 69 68604800', 'Magyar fogorvos Frankfurtban (Sachsenhausen). Általános fogászat, fogpótlás, esztétikai kezelések.', '["Magyar"]', 50.0938701, 8.6913117, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'HE')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-dr-mathias-varnai-zahnarzt-frankfurt', 'Dr. Mathias Varnai – Zahnarzt Frankfurt', 'fogorvos', 'Fogorvos', 'Berger Straße 175, 60385 Frankfurt am Main', NULL, 'Magyar képzettségű (Budapest) fogorvos Frankfurtban (Bornheim). Általános fogászat, rendelési idő egyeztetéssel.', '["Magyar"]', 50.1254297, 8.7061668, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'HE')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-doc-marton-s-kleintierpraxis-berlin', 'Doc Marton''s – Kleintierpraxis Berlin', 'allatorvos', 'Állatorvos', 'Alt-Reinickendorf 37, 13407 Berlin', '+49 30 4953689', 'Magyar állatorvos Berlinben (Reinickendorf). Kisállat-gyógyászat, kutyák, macskák — H-P nyitva, időpont ajánlott. · www.tierarztberlin.com', '["Magyar"]', 52.5748895, 13.3512412, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BE')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-akos-polgar-hairstylist-wien', 'Ákos Polgár Hairstylist Wien', 'fodrasz', 'Fodrász', 'Kirchengasse 27, 1070 Wien', NULL, 'Magyar fodrász Bécs 7. kerületében (Neubau). Hajvágás, festés, styling — Treatwell-en kereshető.', '["Magyar"]', 48.2029313, 16.3513126, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-zoltan-bolla-friseursalon-berlin', 'Zoltan Bolla – Friseursalon Berlin', 'fodrasz', 'Fodrász', 'Uhlandstraße 52, 10719 Berlin', '+49 176 81214142', 'Magyar fodrász Berlinben (Wilmersdorf). Hajvágás, festés, különleges technikák — magyarul is foglalható.', '["Magyar"]', 52.4963497, 13.3238692, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BE')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('ch-imp-turi-zsuzsanna-friseursalon-zurich', 'Túri Zsuzsanna – Friseursalon Zürich', 'fodrasz', 'Fodrász', 'Mittlere Mühlestrasse 3, 8598 Bottighofen', '+41 78 631 43 13', 'Magyar fodrász Zürich közelében. Hajvágás, festés, balayage, alkalmi frizurák — online foglalás is. · www.turizsuzsa.ch', '["Magyar"]', 47.638879, 9.205483, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'CH', 'TG')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('ch-imp-fm-beauty-kozmetika-zurich', 'FM Beauty – Kozmetika Zürich', 'szepseg', 'Kozmetikus', 'Löwenstrasse 22, 8001 Zürich', '+41 76 483 85 92', 'Magyar kozmetikai szalon Zürich belvárosában. Arckezelések, szempilla, köröm, testápolás — WhatsApp-on is. · www.fmbeauty.ch', '["Magyar"]', 47.3740869, 8.5356686, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'CH', 'ZH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-dr-eva-domjan-rechtsanwaltin-graz', 'Dr. Eva Domjan – Rechtsanwältin Graz', 'ugyved', 'Ügyvéd', 'Steinbergstraße 56, 8052 Graz', '+43 316 689420', 'Magyar ügyvéd Grazban. Gazdasági, ingatlan, családi jog + hitelesített német-magyar bírósági tolmács. · www.domjan.at', '["Magyar"]', 47.0552289, 15.3731261, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'STM')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-tierordination-hetzendorf-wien', 'Tierordination Hetzendorf – Wien', 'allatorvos', 'Állatorvos', 'Hetzendorf körzet, 1130 Wien', NULL, 'Magyar állatorvos Bécsben. Kisállat-rendelő, állatfogászat, általános állatorvosi ellátás. · www.tierordination-hetzendorf.at', '["Magyar"]', 48.2082, 16.3738, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-dr-margoczi-magas-zahnarzt-linz', 'Dr. Margoczi & Magas – Zahnarzt Linz', 'fogorvos', 'Fogorvos', 'Goethestraße 7/Top 203, 4020 Linz', '+43 732 66 20 40', 'Magyar fogorvos praxis Linzben. Általános fogászat, fogpótlás — kasszás és magánbetegek, előzetes időpont szükséges. · www.zahnarztpraxismm.at', '["Magyar"]', 48.2966199, 14.293084, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'OOE')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-dr-biling-istvan-agnes-koln', 'Dr. Biling István & Ágnes – Köln', 'fogorvos', 'Fogorvos', 'Leuchterstraße 34, 51069 Köln', '+49 221 671 17776', 'Magyar fogorvos praxis Kölnben (Mülheim). Általános fogászat, fogpótlás — magyaroknak ajánlott.', '["Magyar"]', 50.9964208, 7.0410244, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'NW')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-dr-juhasz-eva-zahnarzt-dusseldorf', 'Dr. Juhász Éva – Zahnarzt Düsseldorf', 'fogorvos', 'Fogorvos', 'Ackerstraße 10, 40233 Düsseldorf', '+49 211 359343', 'Magyar fogorvos Düsseldorfban (Flingern-Nord). Általános fogászat, preventív kezelések.', '["Magyar"]', 51.2252376, 6.7967809, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'NW')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-dr-med-elisabeth-szorenyi-dusseldorf', 'Dr. med. Elisabeth Szörényi – Düsseldorf', 'orvos', 'Orvos', 'Graf-Adolf-Platz 3, 40213 Düsseldorf', '+49 211 381300', 'Magyar háziorvos és pszichoterapeuta Düsseldorf belvárosában. Általános orvoslás, pszichoszomatika.', '["Magyar"]', 51.2182839, 6.7759169, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'NW')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-dr-clara-janos-farkas-leverkusen', 'Dr. Clara & Janos Farkas – Leverkusen', 'orvos', 'Orvos', 'Felix-von-Roll-Straße 6, 51375 Leverkusen', '+49 214 56065', 'Magyar orvos praxis Leverkusenben (Köln közelében). Háziorvosi ellátás, szűrővizsgálatok.', '["Magyar"]', 51.0341123, 7.0455653, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'NW')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-dr-bitay-zsolt-ortoped-koln', 'Dr. Bitay Zsolt – Ortopéd Köln', 'orvos', 'Orvos', 'Merheimer Straße 221-223, 50733 Köln', NULL, 'Magyar ortopéd sebész Kölnben (Nippes). Mozgásszervi betegségek, sportortopédia — időpont szükséges.', '["Magyar"]', 50.9669681, 6.9471043, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'NW')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-dr-med-martha-weiss-koln', 'Dr. med. Martha Weiss – Köln', 'fogorvos', 'Fogorvos', 'Hohenstaufenring 53, 50674 Köln', NULL, 'Magyar fogorvos Köln belvárosában (Altstadt-Süd). Általános fogászat — időpont szükséges.', '["Magyar"]', 50.9327971, 6.9396524, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'NW')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-dr-semek-sandor-bergisch-gladbach', 'Dr. Semek Sándor – Bergisch Gladbach', 'fogorvos', 'Fogorvos', 'Hauptstraße 299, 51465 Bergisch Gladbach', NULL, 'Magyar fogorvos Bergisch Gladbachban (Köln közelében). Általános fogászat, fogpótlás, szuvas kezelés.', '["Magyar"]', 50.9919229, 7.1390313, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'NW')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('nl-imp-drs-eniko-hajas-pszichoterapeuta-utrecht', 'Drs. Enikő Hajas – Pszichoterapeuta Utrecht', 'pszichologus', 'Pszichológus / Coach', 'Johan Buziaulaan 41, 3584 ZT Utrecht', '+31 6 24512360', 'Magyar integratív pszichoterapeuta Utrechtben. Egyéni és párterápia — személyes és online konzultáció.', '["Magyar"]', 52.0868407, 5.1563247, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'NL', 'UT')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('nl-imp-gezonde-mooie-tanden-breda', 'Gezonde Mooie Tanden – Breda', 'fogorvos', 'Fogorvos', 'Molstraat 36, 4826 KA Breda', '+31 76 571 0011', 'Magyar fogszakértőt (Dr. Borsos Eszter) is foglalkoztató fogászati rendelő Bredában. Általános fogászat. · www.gezondemooietanden.nl', '["Magyar"]', 51.6061652, 4.787659, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'NL', 'NB')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('nl-imp-magyar-bolt-haga', 'Magyar Bolt Hága', 'elelmiszer', 'Élelmiszerbolt', 'Valkenboslaan 302, 2563 ED Den Haag', '+31 70 346 4474', 'Magyar élelmiszerbolt Den Haagban. Felvágottak, tejtermékek, füstölt áruk, befőttek, édességek — nagy választék. · www.magyarbolthaga.nl', '["Magyar"]', 52.0703922, 4.2757576, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'NL', 'ZH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-restaurant-hungary-linz', 'Restaurant Hungary – Linz', 'etterem', 'Étterem', 'Rainerstraße 12, 4020 Linz', '+43 732 661605', 'Magyar tematikájú étterem Linzben. Magyar ételek és közép-európai konyha — előfoglalás ajánlott.', '["Magyar"]', 48.297088, 14.2901704, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'OOE')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-berke-magyar-specialitasok-hannover', 'Berke Magyar Specialitások – Hannover', 'etterem', 'Étterem', 'Karmarschstraße 49, 30159 Hannover', '+49 152 51710195', 'Autentikus magyar ételek és különlegességek Hannoverben. Pörkölt, gulyás, kolbász — napi friss kínálat.', '["Magyar"]', 52.3702567, 9.736082, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'NI')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-erdelyi-bolt-dusseldorf', 'Erdélyi Bolt – Düsseldorf', 'elelmiszer', 'Élelmiszerbolt', 'Färberstraße 104, 40223 Düsseldorf', NULL, 'Erdélyi és magyar élelmiszer-különlegességek Düsseldorfban. Felvágottak, tejtermékek, füstölt áruk.', '["Magyar"]', 51.2086504, 6.7818226, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'NW')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-gmp-nord-audit-magyar-konyvelo-hamburg', 'GMP Nord Audit – Magyar könyvelő Hamburg', 'konyveles', 'Könyvelés', 'Tornesch, Hamburg körzete', '+49 40 5719 4360', 'Magyar nyelvű könyvelés és adótanácsadás Hamburg és Schleswig-Holstein területén — kifejezetten magyar ügyfeleknek. · www.gmp-nord-audit-gmbh.de', '["Magyar"]', 53.5511, 9.9937, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'HH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-paprika-am-ring-mannheim', 'Paprika am Ring – Mannheim', 'etterem', 'Étterem', 'U4, 13, 68161 Mannheim', NULL, 'Autentikus magyar és olasz konyha Mannheimben (belváros). Gulyás, lángos, paprikás schnitzel — helyi kedvenc. · www.paprika-am-ring.de', '["Magyar"]', 49.4917235, 8.4734902, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BW')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-varadi-csarda-leipzig', 'Váradi Csárda – Leipzig', 'etterem', 'Étterem', 'Arthur-Hoffmann-Straße 111, 04275 Leipzig', '+49 341 3081638', 'Hagyományos magyar csárda Lipcsében. Gulyás, pusztai szelet, lángos, élő zene — K-Szo ebéd és vacsora. · www.varadi-csarda.de', '["Magyar"]', 51.3183102, 12.3786634, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'SN')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-ungarn-ecke-innsbruck-markthalle', 'Ungarn Ecke – Innsbruck Markthalle', 'elelmiszer', 'Élelmiszerbolt', 'Herzog-Siegmund-Ufer 1-3, 6020 Innsbruck', '+43 660 508 93 52', 'Magyar élelmiszer-különlegességek Innsbruck Markthalle-ban. Szalámi, paprika, bor, édességek — Sze-P 7-12, Szo 7-13.', '["Magyar"]', 47.267186, 11.3895995, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'TIR')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-izes-magyar-feinkost-graz', 'Ízes Magyar Feinkost – Graz', 'elelmiszer', 'Élelmiszerbolt', 'Alte Poststraße 453, 8020 Graz', NULL, 'Magyar delikátesz bolt Grazban. Sonka, szalámi, kolbász — szombat-vasárnap 8:00–12:30.', '["Magyar"]', 47.0576823, 15.4151586, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'STM')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-molnar-auto-service-offenbach', 'Molnar Auto Service – Offenbach', 'autoszer', 'Autószerelő', 'Obere Grenzstraße 60, 63071 Offenbach am Main', '+49 69 37404820', 'Magyar autószerelő Offenbachban (Frankfurt közelében). Kfz-Meisterbetrieb — elektronika, motor, sebességváltó, fogasszíj. · www.molnarautoservice.de', '["Magyar"]', 50.0982599, 8.7861429, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'HE')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('nl-imp-tandartspraktijk-faunabuurt-almere', 'Tandartspraktijk Faunabuurt – Almere', 'fogorvos', 'Fogorvos', 'Almere, Faunabuurt', '+31 36 539 0000', 'Magyar fogszakértőt (Dr. Pocsai Dóra) foglalkoztató rendelő Almereben. Általános fogászat — hollandul és magyarul. · www.tandartspraktijkfaunabuurt.nl', '["Magyar"]', 52.3508, 5.2647, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'NL', 'FL')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-sb-kfztechnik-munchen-korzete', 'SB-Kfztechnik – München körzete', 'autoszer', 'Autószerelő', 'Geisenfeld, München és Bajorország körzete', '+49 8452 7367816', 'Magyar autószerelő Münchentől 50 km-re. Általános Kfz-javítás, diagnosztika, időpontfoglalás telefonon. · www.sb-kfztechnik.de', '["Magyar"]', 48.1351, 11.582, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BY')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-paprika-friends-berlin-hobrechtstr', 'Paprika & Friends – Berlin Hobrechtstr.', 'elelmiszer', 'Élelmiszerbolt', 'Hobrechtstraße 18, 12047 Berlin', NULL, 'Magyar bor- és élelmiszerspecialitás bolt Berlinben (Neukölln). Tokaji borok, paprikakrém, felvágottak, befőttek. · www.paprika-und-weine.de', '["Magyar"]', 52.4889746, 13.4268085, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BE')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-ladislav-anisic-abc-anwalte-hamburg', 'Ladislav Anisic – ABC-Anwälte Hamburg', 'ugyved', 'Ügyvéd', 'ABC-Straße 12, 20354 Hamburg', '+49 40 358 9486', 'Hamburgi ügyvédi iroda — Ladislav Anisic magyar nyelven is vállal jogi képviseletet. Polgári és kereskedelmi jog. · www.abc-anwaelte.de', '["Magyar"]', 53.554181, 9.9869754, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'HH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-schindhelm-rechtsanwalte-frankfurt', 'Schindhelm Rechtsanwälte Frankfurt', 'ugyved', 'Ügyvéd', 'Amelia-Mary-Earhart-Straße 7, 60549 Frankfurt', '+49 69 271 3775-0', 'Nemzetközi ügyvédi iroda Frankfurtban, Budapest-i irodával. Kereskedelmi, ingatlan, cégjog — magyar kapcsolat. · www.schindhelm.com', '["Magyar"]', 50.0547521, 8.5938955, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'HE')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-heima-kfz-reparatur-wien', 'Heima KFZ-Reparatur – Wien', 'autoszer', 'Autószerelő', 'Franzosengraben 5, 1030 Wien', '+43 1 798 97 79', 'Autószerviz Bécs 3. kerületében. Általános javítás, diagnosztika, §57a Pickerl-vizsgálat — megbízható, gyors. · www.heima-kfz.at', '["Magyar"]', 48.1896829, 16.4159535, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-eryil-kfz-werkstatt-wien', 'Eryil KFZ Werkstatt – Wien', 'autoszer', 'Autószerelő', 'Sturzgasse 2A, 1140 Wien', '+43 699 111 72 622', 'Autószerviz Bécs 14. kerületében (Penzing). Javítás, olajcsere, gumiszerelés, klímaszerelés — időpont ajánlott. · www.diekfzwerkstatt.at', '["Magyar"]', 48.1934894, 16.3159124, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('nl-imp-kozma-kamilla-expat-pszichologus-utrecht', 'Kozma Kamilla – Expat Pszichológus Utrecht', 'pszichologus', 'Pszichológus / Coach', 'Lucasbolwerk 6, 3521 CE Utrecht', NULL, 'Magyar pszichológus és párterapeuta Utrechtben/Goudában. Egyéni és párterápia — magyarul, angolul, lengyelül. · www.kamillakozma.com', '["Magyar"]', 52.0932973, 5.1261409, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'NL', 'UT')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-dr-katona-agnesne-zahnarzt-nurnberg', 'Dr. Katona Ágnesné – Zahnarzt Nürnberg', 'fogorvos', 'Fogorvos', 'Düsseldorfer Straße 45, 90425 Nürnberg', NULL, 'Magyar fogorvos Nürnbergben. Általános fogászat — előzetes időpont szükséges.', '["Magyar"]', 49.4693108, 11.0577631, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BY')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-zahnarztpraxis-torok-thumm-nurnberg', 'Zahnarztpraxis Török & Thumm – Nürnberg', 'fogorvos', 'Fogorvos', 'Nürnberg', NULL, 'Magyar fogszakértő (Dr. Melinda Török) Nürnbergben. Általános fogászat, fogpótlás — pontos cím weboldalon. · www.zahnarzt-toeroek-thumm.de', '["Magyar"]', 49.4521, 11.0767, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BY')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('ch-imp-cut-style', 'Cut & Style', 'fodrasz', 'Fodrász', 'Rathausgasse 4, 9320 Arbon', NULL, 'Coiffeur Arbonban. Hajvágás, hajápolás és styling kisebb településen, pontos cím alapján.', '["Magyar"]', 47.5151359, 9.4346519, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'CH', 'TG')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('ch-imp-coiffeur-hellobeauty-lilly-madero', 'Coiffeur Hellobeauty / Lilly Madero', 'fodrasz', 'Fodrász', 'Landquartstrasse 34, 9320 Arbon', NULL, 'Coiffeur Arbonban. Női és férfi fodrászszolgáltatás, szépségápolás és személyre szabott tanácsadás.', '["Magyar"]', 47.5085453, 9.4277461, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'CH', 'TG')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('ch-imp-impuls-coiffure', 'Impuls Coiffure', 'fodrasz', 'Fodrász', 'Hauptstrasse 1, 9320 Arbon', NULL, 'Coiffeur Arbonban. Hajvágás, styling és szépségápolási szolgáltatások.', '["Magyar"]', 47.5154504, 9.4362446, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'CH', 'TG')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('ch-imp-haargold-gmbh', 'Haargold GmbH', 'fodrasz', 'Fodrász', 'Bahnhofstrasse 40, 9320 Arbon', NULL, 'Coiffeur és hajápolási szolgáltatás Arbonban. Precíz vágások és modern frizurák.', '["Magyar"]', 47.511785, 9.4333698, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'CH', 'TG')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-der-autodoktor', 'Der Autodoktor', 'autoszer', 'Autószerelő', 'Lessinggasse 12, 2232 Deutsch-Wagram', NULL, 'Autószerviz Deutsch-Wagramban (Alsó-Ausztria, Bécs közelében). Általános javítás, karbantartás, diagnosztika.', '["Magyar"]', 48.3084604, 16.5672104, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'NOE')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-kfz-schimitz', 'KFZ Schimitz', 'autoszer', 'Autószerelő', 'Weinzierler Str. 30, 9220 Velden am Wörthersee', NULL, 'Autószerviz Veldenben (Wörthi-tó, Karintia). Javítás, karbantartás, gumiszerviz.', '["Magyar"]', 46.6159361, 14.004171, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'KTN')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-car-experts-gmbh', 'Car-Experts GmbH', 'autoszer', 'Autószerelő', 'Bachstraße 68, 5023 Salzburg', NULL, 'Autószerviz Salzburgban. Általános javítás, diagnosztika, karbantartás.', '["Magyar"]', 47.8237128, 13.0646859, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'SBG')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-ps-autoservice', 'PS Autoservice', 'autoszer', 'Autószerelő', 'Mattersburger Str. 5, 7000 Eisenstadt', NULL, 'Autószerviz Eisenstadtban (Burgenland). Javítás, karbantartás, műszaki vizsga.', '["Magyar"]', 47.8362392, 16.5245753, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'BGL')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-autowerkstatt-graz', 'Autowerkstatt Graz', 'autoszer', 'Autószerelő', 'Am Andritzbach 34, 8045 Graz', NULL, 'Autószerviz Grazban (Andritz). Általános javítás, diagnosztika, karbantartás.', '["Magyar"]', 47.1051399, 15.4150618, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'STM')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-oros-delikatessen', 'Oros Delikatessen', 'elelmiszer', 'Élelmiszerbolt', 'Wegscheider Str. 3, 4020 Linz', NULL, 'Magyar delikátesz és élelmiszerbolt Linzben. Hazai ízek, felvágottak, különlegességek.', '["Magyar"]', 48.2537766, 14.2801349, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'OOE')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-ungarischer-schmankerlmarkt', 'Ungarischer Schmankerlmarkt', 'elelmiszer', 'Élelmiszerbolt', 'Brixner Str. 1, 6020 Innsbruck', NULL, 'Magyar élelmiszer-különlegességek boltja Innsbruckban. Fűszerek, felvágottak, édességek.', '["Magyar"]', 47.2650154, 11.3993145, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'TIR')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-ungarischer-shop', 'Ungarischer Shop', 'elelmiszer', 'Élelmiszerbolt', 'Steiningerweg 24, 4600 Wels', NULL, 'Magyar élelmiszerbolt Welsben (Felső-Ausztria). Hazai ízek és termékek.', '["Magyar"]', 48.1678568, 14.0406736, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'OOE')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('de-imp-auto-merienn', 'Auto Merienn', 'autoszer', 'Autószerelő', 'Kolbermoorer Str. 12, 83026 Rosenheim', NULL, 'Autószerviz Rosenheimben (Bajorország). Általános javítás, karbantartás, diagnosztika.', '["Magyar"]', 47.8493672, 12.0876275, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'DE', 'BY')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-kfz-werkstatte-aslan', 'Kfz Werkstätte Aslan', 'autoszer', 'Autószerelő', 'Viaduktbögen 121/123, 6020 Innsbruck', NULL, 'Autószerviz Innsbruckban (viadukt-ívek). Javítás, karbantartás, diagnosztika.', '["Magyar"]', 47.2692, 11.4041, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'TIR')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('nl-imp-tamas-magyar-bolt', 'Tamás Magyar Bolt', 'elelmiszer', 'Élelmiszerbolt', 'Valkenboslaan 302, 2563 ED Den Haag', '+31 70 346 4474', 'Magyar élelmiszerbolt Den Haagban. Hazai ízek: felvágottak, tejtermékek, füstölt áruk, édességek. · www.magyarbolthaga.nl', '["Magyar"]', 52.0703922, 4.2757576, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'NL', 'ZH')
  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,
    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,
    category_label=excluded.category_label, canton_code=excluded.canton_code
  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';
