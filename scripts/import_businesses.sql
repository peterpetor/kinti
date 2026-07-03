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
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-ilona-stuberl', 'Ilona Stüberl', 'etterem', 'Étterem', 'Bräunerstraße 2, 1010 Wien', NULL, 'Bécs egyik legrégebbi (1957 óta működő) magyar étterme a belváros szívében. Klasszikus magyar konyha. · ilonastueberl.at', '["Magyar"]', 48.2084093, 16.3692787, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'W')
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
INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES ('at-imp-bizta-biztositas-ausztria', 'BiztA – Biztosítás Ausztria', 'biztositas', 'Biztosítás', 'Hauptplatz 11, 7400 Oberwart', NULL, 'Magyar nyelvű biztosítási tanácsadás és ügyintézés Ausztriában (Wiener Städtische képviselet). · bizta.at', '["Magyar"]', 47.2875151, 16.2138587, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'csv-import', 'AT', 'BGL')
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
