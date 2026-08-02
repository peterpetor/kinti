-- Frissesség: 11 magyar katolikus közösség kivezetése + 1 telefon-pótlás — 2026-08-03
--
-- ⚠️ MIÉRT: a szaknévsorban 14 „Magyar Katolikus Közösség — <város>" tétel volt.
-- A HIVATALOS angliai magyar főlelkészség (Magyarok Nagyasszonya, Szent István
-- Ház) szerint MA ÖT helyen van magyar nyelvű szentmise: London, South Croydon,
-- Luton, Bristol, Cambridge. A másik 11 város EGYIKEN SINCS RAJTA.
--
-- A BIZONYÍTÉK (négy egymástól független szál, mind ugyanoda mutat):
--   1. szentistvanhaz.org/miserend — csak az 5 helyszín
--   2. korosiprogram.hu tudástár-cikk (FÜGGETLEN forrás) — ugyanaz az 5
--   3. az egyetlen forrás, ami valaha felsorolta az északi helyszíneket, **2014-es**
--      (12 éves) — akkor Fülöp Menyhért rochdale-i plébános látta el őket
--   4. szúrópróba kettőre: St Malachy (Manchester) és St Elizabeth of Hungary
--      (Litherland) — SEMMI nyoma jelenlegi magyar misének
--
-- ⚠️ HAMIS JEL, amire a seed valószínűleg ráépült: a „St Elizabeth of Hungary"
-- (Litherland) csak egy templom VÉDŐSZENTJE — Árpád-házi Szent Erzsébet gyakori
-- katolikus titulus világszerte —, NEM magyar közösség bizonyítéka.
--
-- BELSŐ KONZISZTENCIA-JEL: a 3 megmaradó tételnek (Cambridge, Luton, South
-- Croydon) a blurbjében OTT VAN a szentistvanhaz.org/miserend link, a 11-nek
-- NINCS. A seedelő tehát maga is csak az 5-ös listát tudta alátámasztani.
--
-- FELHASZNÁLÓI KÁR, amit ez okozna: mind a 11 tételnek NULLA elérhetősége van,
-- vagyis a user nem tud rákérdezni — csak elmenni a templomhoz egy misére, ami
-- nincs. Ez AKTÍV kár, rosszabb, mint az üres találat.
-- Megtekintés-szám: mind a 14 tételen 0 — senki nem nyitotta meg őket.
--
-- ⚠️ A `verified=1` / `last_verified_at=2026-07-31` NEM cáfolat: az egy TÖMEGES
-- bélyegzés volt (db/stamp-verified-2026-07-31.sql), nem tételenkénti ellenőrzés.
--
-- hidden=1, SOHA nem DELETE. VISSZAVONÁS egyetlen paranccsal:
--   UPDATE businesses SET hidden=0 WHERE id LIKE 'gb-magyar-katolikus-kozosseg-%';
--
-- ⚠️ EXPLICIT ID-LISTA, nem névminta szerinti tömeges rejtés (ld. a
-- business-dedup szabály: névmintára SOHA ne rejts tömegesen).

UPDATE businesses SET hidden = 1, updated_at = datetime('now')
WHERE id IN (
  'gb-magyar-katolikus-kozosseg-birmingham',
  'gb-magyar-katolikus-kozosseg-bolton',
  'gb-magyar-katolikus-kozosseg-derby',
  'gb-magyar-katolikus-kozosseg-leeds',
  'gb-magyar-katolikus-kozosseg-liverpool',
  'gb-magyar-katolikus-kozosseg-manchester',
  'gb-magyar-katolikus-kozosseg-nottingham',
  'gb-magyar-katolikus-kozosseg-rochdale',
  'gb-magyar-katolikus-kozosseg-sheffield',
  'gb-magyar-katolikus-kozosseg-southport',
  'gb-magyar-katolikus-kozosseg-wolverhampton'
);

-- Elérhetőség-pótlás: a Maps a PONTOS címen (141 Chorley Old Rd, BL1 3BD)
-- „Sopron Offlicence 24x7" néven hozza — ugyanaz az üzlet, más cégér-alak.
-- ⚠️ Ugyanebben a körben KÉT telefont SZÁNDÉKOSAN NEM írtam be, mert a
-- helyszíné volt, nem a magyar vállalkozásé: a doncasteri „Neil's Cheese Board"
-- (egy sajtos ugyanazon a piaci standhelyen) és a carlisle-i „The Market Hall"
-- (maga a piaccsarnok, önkormányzati szám).
UPDATE businesses SET phone = '+44 7767 404119', updated_at = datetime('now')
WHERE id = 'gb-sopron-off-licence-magyar-termekek-bolton' AND phone IS NULL;
