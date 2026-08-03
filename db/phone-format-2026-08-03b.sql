-- A maradék 6 hibás formátumú telefonszám feloldása — 2026-08-03
--
-- Az előző kör (phone-format-2026-08-03.sql) 27 számot alakított át
-- mechanikusan, és 6-ot KÉZI vizsgálatra tett félre. Ez a fájl azokat zárja le.
--
-- ⭐ A MÓDSZER, ami feloldotta őket: A CÍM IRÁNYÍTÓSZÁMA MEGADJA A KÖRZETSZÁMOT.
-- Ha a telefonban szereplő körzetszám egyezik azzal, amit a település
-- irányítószáma alapján várunk, akkor a szám értelmezése biztos — nem kell
-- találgatni.
--
--   73728 Esslingen am Neckar  → 0711 (Stuttgart körzet)   ✓ egyezik
--   73525 Schwäbisch Gmünd     → 07171                      ✓ egyezik
--   Bad Aibling                → 08061                      ✓ egyezik
--   1010 Wien                  → 1                          ✓ egyezik
--
-- ⚠️ KETTŐS NEMZETKÖZI ELŐTAG volt három számban — ez tette olvashatatlanná
-- őket: „049-0711-…" (a 0049 elé csúszott egy 0), és „00049-…" (0049 helyett
-- 00049). A számjegyek maguk helyesek voltak, csak a burok hibás.

-- 1010 Wien → körzetszám 1. A „513" érvényes belvárosi bécsi központ.
UPDATE businesses SET phone = '+43 1 513 63 55', updated_at = datetime('now')
WHERE id = 'at-imp-dr-martos-istvan-versicherungsmakler';  -- volt: 513 63 55

-- 73728 Esslingen → 0711. A „049-0711-356737"-ből a kettős előtag lehántva.
UPDATE businesses SET phone = '+49 711 356737', updated_at = datetime('now')
WHERE id = 'de-imp-dr-med-tepfenhart-adel-piroska';  -- volt: 049-0711-356737

-- 73525 Schwäbisch Gmünd → 07171. Két tétel (házaspár-praxis, azonos szám).
UPDATE businesses SET phone = '+49 7171 2685', updated_at = datetime('now')
WHERE id = 'de-imp-mu-dr-simon-josef';  -- volt: 00049-7171-2685
UPDATE businesses SET phone = '+49 7171 2685', updated_at = datetime('now')
WHERE id = 'de-imp-mu-dr-simon-eleonore';  -- volt: 00049-7171-2685

-- Bad Aibling → 08061. A „004980619031605"-ből a 0049 lehántva.
UPDATE businesses SET phone = '+49 8061 9031605', updated_at = datetime('now')
WHERE id = 'de-orvos-dr-madarassy-gabor-idegsebesz-gerincsebesz';  -- volt: 004980619031605

-- ⚠️ Ez a szám ELSŐRE hibásnak látszott (a 0663 nem a megszokott osztrák
-- mobil-előhívó, és a maradék is hosszú), ezért kihagytam a mechanikus körből.
-- A Google Maps azonban PONTOSAN UGYANEZT a számsort mutatja a saját
-- adatlapján — vagyis a szám így publikált, nem elgépelés. Csak a nemzetközi
-- alakra hozzuk, a tagoláshoz nem nyúlunk.
-- TANULSÁG: a „szokatlan előhívó" gyanú ELLENŐRIZHETŐ, nem elég a megérzés.
UPDATE businesses SET phone = '+43 663 06444204', updated_at = datetime('now')
WHERE id = 'at-imp-dr-marta-ildiko-farkas';  -- volt: 0663 06444204
