-- db/seed-viewed-deadend-contacts.sql — a TÉNYLEGESEN MEGNÉZETT zsákutca-adatlapok
-- elérhetőségének pótlása (2026-07-31).
--
-- ⚠️ MIÉRT EZ A CÉLCSOPORT: a globális kontakthiány 11,4%, DE a `view_count`-tal
-- súlyozva a megnyitások ~40%-a zsákutca — a sokat kattintott egyesületek,
-- iskolák és praxisok azok, amelyeknél nincs elérhetőség. 269 tétel vaktában
-- pótlása helyett ezért a 17 MEGNÉZETT zsákutcával kezdtem; ebből 13 megoldva.
--
--   wrangler d1 execute kinti-db --remote --file=./db/seed-viewed-deadend-contacts.sql

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. „Web: …" PRÓZA → ` · ` SZEGMENS (7 sor)
--    A megjelenítő (lib/contact-links.ts) az utolsó ` · ` szegmenst olvassa
--    weboldalként. Ezekben a sorokban a cím a MONDATBAN állt („… Web: x.ch"),
--    ezért nyers szövegként jelent meg, gomb nélkül. Mind a 7 domain élő (200).
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE businesses SET blurb = 'Magyar háziorvosi praxis Obergösgenben, magyarul beszélő orvosokkal. · hausarztpraxis-obergoesgen.ch'
 WHERE id = 'biz-csiky-strauss-obergoesgen';
UPDATE businesses SET blurb = 'Magyar pszichoterapeuta és tanácsadás Zürichben. · psy-therapy.ch'
 WHERE id = 'biz-lilla-futaki-pszichologus';
UPDATE businesses SET blurb = 'Magyar pszichológus Zürichben. · pszichologus-zurich.ch'
 WHERE id = 'biz-papp-reka-pszichologus';
UPDATE businesses SET blurb = 'Magyar pszichoterápia és tanácsadás Zürichben. · psychotherapie-fidy.ch'
 WHERE id = 'biz-fidy-pszichoterapia';
UPDATE businesses SET blurb = 'Magyar pszichológus Siebnenben (magyar/német/angol). · findedeinenweg.ch'
 WHERE id = 'biz-szollosi-gabriella-pszichologus';
UPDATE businesses SET blurb = 'Magyar nyelvű könyvelés, adóbevallás, BVG/AHV ügyintézés Arbonban (Thurgau). · banita.ch'
 WHERE id = 'biz-baan-anita';
UPDATE businesses SET blurb = 'Magyar–svájci ügyvéd a német nyelvű kantonokban (és HU/AT/DE/LI ügyek). · illesugyved.com'
 WHERE id = 'biz-illes-klara-ugyved';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. HIÁNYZÓ TELEFONSZÁMOK — mind a vállalkozás SAJÁT oldaláról vagy hivatalos
--    jegyzékből. A feltétel benne marad, hogy időközbeni kézi javítást soha ne
--    írjunk felül.
-- ─────────────────────────────────────────────────────────────────────────────

-- Baán Anita (Arbon, TG) — a legtöbbet megnézett zsákutca (4 megnyitás). banita.ch
UPDATE businesses SET phone = '+41 76 264 20 28'
 WHERE id = 'biz-baan-anita' AND (phone IS NULL OR trim(phone) = '');

-- Car-Experts GmbH (Salzburg) — herold.at / firmenabc.at, saját oldal: carexperts.at
UPDATE businesses SET phone = '+43 662 664269'
 WHERE id = 'at-imp-car-experts-gmbh' AND (phone IS NULL OR trim(phone) = '');
UPDATE businesses SET blurb = 'Autószerviz Salzburgban. Általános javítás, diagnosztika, karbantartás. · carexperts.at'
 WHERE id = 'at-imp-car-experts-gmbh';

-- Lenhardt Elisabeth (Amstetten) — magyarul is tanácsad (berater.at).
-- ⚠️ Weboldal SZÁNDÉKOSAN NEM kerül be: a weisehandeln.at domain NXDOMAIN,
-- és így a rajta lévő office@weisehandeln.at cím is halott. Csak a telefon.
UPDATE businesses SET phone = '+43 664 7938280'
 WHERE id = 'at-biz3-lenhardt-elisabeth-uzleti-tanacsado' AND (phone IS NULL OR trim(phone) = '');

-- Kuchenhaus Annamelie (Luzern) — kuchenhaus.ch
UPDATE businesses SET phone = '+41 41 544 98 98'
 WHERE id = 'biz-annamelie-luzern' AND (phone IS NULL OR trim(phone) = '');
UPDATE businesses SET blurb = 'Magyar cukrászda Luzernben: Dobos-torta, Somlói, Zserbó és további klasszikusok. · kuchenhaus.ch'
 WHERE id = 'biz-annamelie-luzern';

-- Hausarztpraxis Obergösgen (Dr. Csiky-Strauss) — a praxis impresszumából.
UPDATE businesses SET phone = '+41 62 295 30 50'
 WHERE id = 'biz-csiky-strauss-obergoesgen' AND (phone IS NULL OR trim(phone) = '');

-- Petrányi Renáta, hiteles fordító (Sirnach, TG) — petranyi.ch, bírósági nyilvántartás.
UPDATE businesses SET phone = '+41 79 651 32 59'
 WHERE id = 'biz-petranyi-renata-fordito' AND (phone IS NULL OR trim(phone) = '');
UPDATE businesses SET blurb = 'Hiteles magyar–német fordítás és tolmácsolás (Sirnach, bírósági nyilvántartásban). · petranyi.ch'
 WHERE id = 'biz-petranyi-renata-fordito';

-- Kinderschutz-Zentrum Liezen — MAGYARUL is fogad (a Volkshilfe leírása szerint).
UPDATE businesses SET phone = '+43 3612 21002'
 WHERE id = 'at-biz3-kinderschutz-zentrum-liezen-beratungsstelle' AND (phone IS NULL OR trim(phone) = '');
UPDATE businesses SET blurb = 'Gyermekvédelmi tanácsadó központ, magyar nyelven is. · kinderschutz-zentrum.com'
 WHERE id = 'at-biz3-kinderschutz-zentrum-liezen-beratungsstelle' AND (blurb IS NULL OR trim(blurb) = '');

-- Dr. Szántai Krisztina (Bischofshofen) — ÖVS-tagjegyzék, saját oldal.
UPDATE businesses SET phone = '+43 660 7168376'
 WHERE id = 'at-biz3-szantai-krisztina-coach' AND (phone IS NULL OR trim(phone) = '');
UPDATE businesses SET blurb = 'Szupervízió, coaching és életvezetési tanácsadás magyarul, németül, angolul. · krisztinaszantai.com'
 WHERE id = 'at-biz3-szantai-krisztina-coach' AND (blurb IS NULL OR trim(blurb) = '');

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. SZERVEZETEK — telefonjuk nincs, de van saját oldaluk / e-mailjük
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE businesses SET blurb = 'Német-magyar társaság · Münster · muenster.org/ungarn'
 WHERE id = 'de-deutsch-ungarische-gesellschaft-munster';
UPDATE businesses SET blurb = 'Magyar diákszervezet · Wien · mde.hu'
 WHERE id = 'at-ausztriai-magyar-diakok-egyesulete';
UPDATE businesses SET blurb = 'Magyar iskola / óvoda · Felső-Ausztria (Wels) · magyariskola.wels@gmx.at'
 WHERE id = 'at-felso-ausztriai-hetvegi-magyar-ovoda-es-iskola';
UPDATE businesses SET blurb = 'Magyar diák / akadémiai · Innsbruck · info@imeasz.at'
 WHERE id = 'at-innsbrucki-magyar-egyetemistak-es-akademikusok-szovetsege';

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. KIVEZETÉS — amit nem pótolni, hanem elrejteni kell
-- ─────────────────────────────────────────────────────────────────────────────

-- „Magyaros Étterem" (Moosstraße 133, 5020 Salzburg) = UGYANAZ a hely, mint a
-- `osmbiz2-at-schachlwirt` (Schachlwirt, Familie Horvath, magyar-osztrák konyha),
-- csak a CSV-import generikus néven vitte fel, elérhetőség nélkül. A Schachlwirt
-- a valódi név + telefonszám, az marad.
UPDATE businesses SET hidden = 1 WHERE id = 'at-imp-magyaros-etterem';

-- „Piroska – Ungarische Spezialitäten" (Zürich) — a cégjegyzékből 2012-07-13-án
-- TÖRÖLVE üzletbezárás miatt (Sandra Szatmari Bonyai egyéni cége); a
-- ungarnweine.ch domain is halott. 14 éve nem működik.
UPDATE businesses SET hidden = 1 WHERE id = 'biz-piroska-zurich';
