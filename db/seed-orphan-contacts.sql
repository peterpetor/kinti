-- db/seed-orphan-contacts.sql — elérhetőség-pótlás azoknak, akik a
-- weboldal-audit után teljes zsákutcává váltak (2026-07-31).
--
-- A 872 hirdetett weboldal ellenőrzése után 95 halott linket vágtunk le; 11 cég
-- emiatt maradt MINDEN elérhetőség nélkül. Ez a fájl azt az 5-öt pótolja, amit
-- FÜGGETLEN forrásból sikerült megerősíteni.
--
--   wrangler d1 execute kinti-db --remote --file=./db/seed-orphan-contacts.sql
--
-- ⚠️ VISSZATÉRŐ CSAPDA ebben a körben: a keresőmotorok GYORSÍTÓTÁRAZOTT
-- találatai olyan weboldalakat hirdettek, amelyek domainje már NEM LÉTEZIK
-- (paprikaandmore.at, paprikajancsi.com, ungarikumdelikatesse.de,
-- dug-stuttgart.de, ungarischewelt.com, ungvh.com — mind NXDOMAIN).
-- Ezért MINDEN talált címet DNS-szinten ellenőriztem, és csak a telefonszámot
-- vittem fel ott, ahol a weboldal halott.

-- Bánfai Erika (Bécs 1. kerület) — saját oldal ÉL (kosmetikhauthaar.at).
UPDATE businesses SET phone = '+43 660 365 7903'
 WHERE id = 'at-imp-banfai-erika' AND (phone IS NULL OR trim(phone) = '');
UPDATE businesses SET blurb = 'Kozmetikus és hajgyógyász, arckezelések, testkezelések, hajápolás Bécs 1. kerületében. · kosmetikhauthaar.at'
 WHERE id = 'at-imp-banfai-erika';

-- Paprikajancsi Étterem (Büchlberg) — ⚠️ a paprikajancsi.com domain NXDOMAIN,
-- csak a telefon megy fel. A számot négy független címtár adja (11880, cylex,
-- Yelp, passauer-land.de), és a Yelp „Ungarisch" kategóriában tartja.
UPDATE businesses SET phone = '+49 8505 918789'
 WHERE id = 'de-imp-paprikajancsi-etterem' AND (phone IS NULL OR trim(phone) = '');

-- Ungarikum Delikatesse (Metten) — ⚠️ az ungarikumdelikatesse.de NXDOMAIN.
UPDATE businesses SET phone = '+49 1516 3137000'
 WHERE id = 'de-nmde-ungarikum-delikatesse-magyar-bolt-metten' AND (phone IS NULL OR trim(phone) = '');

-- Ungarn-Service (Stutensee-Staffort) — az ungarnservice.de ÉL (301).
UPDATE businesses SET phone = '+49 7249 5059873'
 WHERE id = 'de-nmde-ungarnservice' AND (phone IS NULL OR trim(phone) = '');
UPDATE businesses SET blurb = 'Magyar bolt / élelmiszer · Stutensee-Staffort · ungarnservice.de'
 WHERE id = 'de-nmde-ungarnservice';

-- Hamburgi Magyarok Közössége — saját egyesületi oldal ÉL.
UPDATE businesses SET blurb = 'Magyar közösség · Hamburg · hamburgi-magyarok-ev.de'
 WHERE id = 'de-hamburgi-magyarok-kozossege';

-- ⚠️ NEM PÓTOLTAM (dokumentálva a következő körnek):
--   • Deutsch-Ungarische Gesellschaft Stuttgart — az egyetlen talált szám a
--     gerlingeni VÁROSHÁZÁÉ (a társaság ott van bejegyezve). Egy városháza-
--     központot megadni „a magyar társaság telefonja"-ként félrevezető.
--   • Ungarische Welt — a bolt láthatóan ELKÖLTÖZÖTT Nittenauból
--     BURGLENGENFELDBE (Marktplatz 17); a nálunk tárolt cím tehát elavult, a
--     domainje pedig NXDOMAIN. Cím-javítás + kontakt EGY forrásból nem elég.
--   • Paprika and More (Bregenz), Zelizi Petra (Stuttgart), Magyar
--     Egyetemisták és Öregdiákok Klubja (Graz), Hannoveri Magyar Egyesület —
--     nincs élő, ellenőrizhető publikus elérhetőség.
