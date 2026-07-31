-- db/seed-dedup-2026-07-31.sql — cím-alapú duplikátum-átvizsgálás eredménye.
--
-- MÓDSZER: az élő 2353 címzett tétel „utca+házszám" kulcsra normalizálva
-- (ékezet-hajtás, `strasse|str|straße` → `str`, `gasse` → `gas`), országon
-- belül csoportosítva, majd CSAK az azonos KATEGÓRIÁJÚ csoportok átnézve.
-- 21 csoport jött ki, és a döntő többségük JOGOS: csoportpraxis, ügyvédi
-- irodaház (Schottenring 19/25 Wien), orvos-házaspárok (Király, Muth, Simon).
-- ⚠️ Ezeket NE vond össze — a felhasználó a konkrét szakembert keresi, és az
-- „Ugyanennél a praxisnál" szekció amúgy is összeköti őket.
--
-- ⚠️ A KULCS GYENGESÉGE, amit érdemes tudni: a várost NEM nézi, ezért a
-- „Benzstrasse 3, Frickenhausen" és a „Benzstrasse 3, Renningen" egy csoportba
-- került — pedig két külön bolt. Mindig nézd meg a teljes címet is.
--
--   wrangler d1 execute kinti-db --remote --file=./db/seed-dedup-2026-07-31.sql

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. VALÓDI DUPLIKÁTUM: Tortissimo (Baden AG)
-- ─────────────────────────────────────────────────────────────────────────────
-- Két tétel ugyanarra a címre (Obere Halde 34), eltérő irányítószámmal és
-- telefonnal. A cégjegyzék, a search.ch, a local.ch, a halde-baden.ch
-- kereskedelmi egyesület és a saját oldal EGYBEHANGZÓAN egy céget ad:
-- „Tortissimo by Tóth" / „Tortissimo by Niki", Tóth Nikolett, Obere Halde 34,
-- **5400** Baden, +41 79 948 88 07. Az 5430 Wettingen irányítószáma.
--
-- A részletesebb, helyes telefonszámú és weboldalas tétel marad; a generikus
-- másolat elrejtve.
UPDATE businesses SET hidden = 1 WHERE id = 'ch-imp-tortissimo';

-- A megmaradó tételben az irányítószám javítása 5430 → 5400.
UPDATE businesses SET address = 'Obere Halde 34, 5400 Baden'
 WHERE id = 'ch-imp-tortissimo-by-niki';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. NEM DUPLIKÁTUM, csak hiányos: a berni Spitalgasse 18–20 fogászat
-- ─────────────────────────────────────────────────────────────────────────────
-- Dr. Alexander Kaman és Dr. Andrea Kiss KÖZÖS praxisban dolgozik (medicosearch
-- mindkettőt a Spitalgasse 18-20 alatt hozza), és ugyanitt van Dr. Katalin
-- Koncz is. A közös tétel eddig telefon NÉLKÜL állt — vagyis zsákutca volt.
-- A praxis száma (a Kaman- és a Koncz-tételen is ez szerepel) felkerül; ezzel
-- az „Ugyanennél a praxisnál" szekció is összeköti a három bejegyzést.
UPDATE businesses SET phone = '+41 31 311 75 54'
 WHERE id = 'ch-imp-dr-med-dent-alexander-kaman-dr-med-dent-andrea-kiss'
   AND (phone IS NULL OR trim(phone) = '');
