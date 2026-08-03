-- TELEFON-ALAPÚ DEDUP-AUDIT: 8 duplikátum zárása — 2026-08-03
--
-- ⚠️⚠️ EBBŐL HETET ÉN HOZTAM LÉTRE MA, ugyanebben a munkamenetben.
-- A mai német kisipari körben (`de-mindennapi-szakmak-2026-08-03.sql`) a
-- dedup-ellenőrzésem NÉVMINTÁKRA ment — és az AUTÓSZERELŐ-neveket kihagytam
-- belőle. Csak Szili, Bernáth, Szanyi, Haustechnik, Fischer, Früvald, Szigeti,
-- Botondbau és Frankó nevére kérdeztem rá; Terhes, Takács, Orti-Car, Sacal,
-- Auto74, SB-Kfztechnik és Veres nevére NEM.
--
-- ⭐ AMI FELFEDTE: a TELEFONSZÁM. Sem a név, sem a cím nem fogta volna meg őket:
--   • a nevek eltérő írásmódúak („Takacs Laszlo – KFZ Meisterwerkstatt" vs
--     „Takács László KFZ-Meisterwerkstatt")
--   • a címek is eltérnek írásmódban („Robert Bosch Str. 6" vs
--     „Robert-Bosch-Straße 6"; „Moosstraße 28A" vs „Moosstraße 28/A")
--   • a telefonszám viszont UGYANAZ — csak más tagolással
--     (+49 17624 051383 vs +49 176 24051383)
--
-- ⇒ SZABÁLY: minden import után futtatni kell egy TELEFON-ALAPÚ dedup-ellenőrzést
--   is, SZÁMJEGYRE NORMALIZÁLVA. A név- és cím-alapú dedup nem helyettesíti.
--
-- A teljes audit 1840 telefonos tételből 45 megosztott számot talált. A többi
-- 37 LEGITIM: közös rendelő/ügyvédi iroda (két orvos egy praxisban, ügyvédek egy
-- kamarában), vagy egy cég két telephelye. Azokhoz NEM nyúlunk.
--
-- MELYIKET TARTJUK MEG: a RÉGEBBI, `csv-import` forrású tételt — az van benne a
-- `businesses.csv`-ben (tehát egy jövőbeli import újra létrehozná), és
-- részletesebb a leírása. A MAI (`seed-de-trades`) példányokat rejtjük, és
-- átvisszük róluk, ami jobb volt bennük.

------------------------------------------- A MAI DUPLIKÁTUMAIM ELREJTÉSE
UPDATE businesses SET hidden = 1, updated_at = datetime('now') WHERE id IN (
  'de-terhes-zoltan-kfz-rohrmoos',
  'de-takacs-laszlo-kfz-wallersdorf',
  'de-sb-kfztechnik-geisenfeld',
  'de-orti-car-altdorf',
  'de-sacal-karosszeria-rastatt',
  'de-auto74-hockenheim',
  'de-veres-gabor-festo-hildesheim'
);

------------------------------- AMI JOBB VOLT A MAI PÉLDÁNYBAN → ÁTVISSZÜK
-- Weboldal (a megmaradó tételen nem volt):
UPDATE businesses SET
  blurb = 'Magyar autószerelő műhely München közelében. Általános szerviz, diagnosztika, TÜV-ra felkészítés. · sb-kfztechnik.de',
  updated_at = datetime('now')
WHERE id = 'de-imp-sb-kfztechnik';

-- Pontosabb kategória: a karosszériaműhely nem általános autószerelő.
UPDATE businesses SET category_id = 'karosszeria', category_label = 'Karosszéria', updated_at = datetime('now')
WHERE id = 'de-imp-sacal-zoltan-karosseriewerkstatt';

-- ⚠️ TELEFON-TAGOLÁS JAVÍTÁSA. A megmaradó tételeken az előhívó elcsúszott
-- (+49 17624 051383 helyett +49 176 24051383 a helyes) — ugyanaz a hibaosztály,
-- ami a Majsai-duplikátumot is elfedte. A SZÁMJEGYEK azonosak, csak a tagolás
-- volt rossz; ez a kijelzést és a tárcsázhatóságot rontja.
UPDATE businesses SET phone = '+49 176 24051383', updated_at = datetime('now')
  WHERE id = 'de-imp-orti-car-kfz-und-reifenservice';
UPDATE businesses SET phone = '+49 176 46642249', updated_at = datetime('now')
  WHERE id = 'de-imp-rovid-csaba-auto74-kfz-werkstatt';
UPDATE businesses SET phone = '+49 176 24765118', updated_at = datetime('now')
  WHERE id = 'de-imp-takacs-laszlo-kfz-meisterwerkstatt';
UPDATE businesses SET phone = '+49 159 06150690', updated_at = datetime('now')
  WHERE id = 'de-imp-terhes-zoltan-kfz-meisterbetrieb';

--------------------------------------------- RÉGEBBI DUPLIKÁTUM (nem mai)
-- „Ungarische Delikatessen" (seed-osm-biz3, leírás NÉLKÜL) és „Ungarische
-- Delikatessen Kassel" (csv-import, leírással) — azonos cím (Frankfurter Str.
-- 75, 34121 Kassel) és azonos telefon. A leírással rendelkezőt tartjuk meg.
-- ⚠️ NEM tévesztendő össze a „Ungarische Delikatessen – Schvart Andrea és
-- Robert" tétellel: az MÁS város (Grafing bei München) és MÁS telefon.
UPDATE businesses SET hidden = 1, updated_at = datetime('now')
WHERE id = 'osmbiz3-de-ungarische-delikatessen';
