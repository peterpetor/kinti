-- DE — MINDENNAPI SZAKMÁK, 2. kör: lakatos és gipszkartonos — 2026-08-03
--
-- A `nemetorszagi-magyarok.de/cimtar` TELJES kategórialistáját kiolvastam a lap
-- HTML-jéből (a `/szolgaltatas` index 404, a sitemap hiányos — a `/cimtar` lap
-- href-jeit kellett kigyűjteni). Így kerültek elő azok a kisipari aloldalak,
-- amiket az 1. kör nem érintett: `csempezo-parkettazo`, `gipszkartonozo`,
-- `kulcsmasolo`, `csotisztitas`, `szallito-koltozteto`, `szabo`, `babysitter`.
--
-- ⭐ Ez nyitja meg a `lakatos` kategóriát: eddig MIND A 6 ORSZÁGBAN 0 volt.
--
-- ⚠️ KIHAGYVA — a burkoló-oldal legjobb tétele (TIBI-Fliesenleger, Bad
-- Liebenzell) MÁR BENT VAN `kőműves` kategóriában. ⚠️ A forrás a
-- `tibi-fliesenleger.de` weboldalt adja hozzá, DE az a domain NEM oldódik fel
-- (000) — jó, hogy a meglévő tételünk blurbjében nem szerepel; nem is írjuk be.
--
-- ⚠️ KIHAGYVA — NEMZETKÖZI KÖLTÖZTETŐK: „Kovács János e.v." (+36 70) és
-- „Franko-Teher Kft" (+36 20 / +36 1) MAGYARORSZÁGI cégek, amik HU–DE viszony-
-- latban költöztetnek. A szaknévsor a CÉLORSZÁGBAN működő magyar vállalkozásokat
-- listázza (vö. Hunparcel Ltd = brit cég a GB-listán). Ugyanazt a döntést
-- követem, amit a holland kör hozott a fuvarozókra.
--
-- ⚠️ KIHAGYVA — elérhetőség nélkül: Botondbau, Csombordi Zoltán, Hamvas Gábor,
-- Haus Sanierung, Ilyes Robet.
--
-- Koordináták Nominatimból (város-szint — mindkettő kiszállással dolgozó
-- kisiparos, telefonnal; ld. everyday-trades-gap: kisiparosnál ez elfogadható).

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-pozbai-peter-kulcsmasolo-augsburg', 'Pozbai Péter — kulcsmásolás és csőtisztítás', 'lakatos', 'Lakatos', 'Augsburg és környéke (kiszállással)', '+49 177 1753276', 'Magyar kulcsmásoló és csőtisztító Augsburgban.', '["Magyar","Német"]', 48.369034, 10.897952, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-trades', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-hajdu-roland-gipszkarton-munchen', 'Hajdu Roland — gipszkartonozó', 'lakasfelujitas', 'Lakásfelújítás', 'München és környéke (kiszállással)', '+49 176 32898360', 'Magyar gipszkartonos és szárazépítő Münchenben.', '["Magyar","Német"]', 48.137108, 11.575382, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-trades', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;
