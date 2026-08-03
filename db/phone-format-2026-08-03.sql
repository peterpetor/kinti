-- Telefonszám-formátum javítása: 27 szám nemzetközi alakra — 2026-08-03
--
-- ⚠️⚠️ MIÉRT SZÁMÍT EZ KÜLÖNÖSEN EBBEN AZ APPBAN: a Kinti felhasználói
-- KÜLFÖLDÖN élő magyarok. Egy „01/5233320" vagy „0676/3740748" alakú szám a
-- telefonon RÁKOPPINTVA nem tárcsázható helyesen külföldi SIM-mel vagy roaming
-- közben — a hívás egyszerűen nem épül fel. A szám ott van az adatlapon, a
-- felhasználó látja, megnyomja, és nem történik semmi. Semmi nem jelzi a hibát.
--
-- A teljes telefon-formátum-audit: 1829 számból 55 volt gyanús.
--   • 27 mechanikusan javítható (helyi alak, egyértelmű vezető 0)  → EZ A FÁJL
--   • 6 KÉZI vizsgálatra félretéve (ld. lent)
--   • 6 magyarországi (+36) szám külföldi országú tételen — külön kérdés,
--     lehet legitim (magyarországi iroda szolgálja ki a kintieket)
--   • a többi „túl rövid" jelzés HAMIS RIASZTÁS: az osztrák és német
--     VEZETÉKES számok jogosan rövidek (pl. +43 1 24250 érvényes bécsi szám)
--
-- ⚠️ A TAGOLÁST a forrásból tartjuk meg, csak a vezető 0-t cseréljük
-- országhívóra. A saját újratagolásom korábban a bécsi vezetékesből hibás
-- számot csinált (+43 196 13401 a helyes +43 1 9613401 helyett).
--
-- ⚠️ KÉZI VIZSGÁLATRA FÉLRETÉVE (mechanikusan NEM javítható):
--   „049-0711-356737" és „00049-7171-2685" — KETTŐS országhívó, elgépelt
--       nemzetközi előtag; nem egyértelmű, mi a valódi szám
--   „0663 06444204" — a 0663 nem létező osztrák mobil-előhívó (0664/0676/0699
--       a valódiak), és a maradék is túl hosszú
--   „004980619031605" — 15 számjegy, hosszabb a lehetségesnél
--   „513 63 55" — 7 jegy, országhívó és körzetszám NÉLKÜL
--
UPDATE businesses SET phone = '+41 79 632 70 18', updated_at = datetime('now')
  WHERE id = 'ch-imp-dr-adel-schumacher-ubersetzerin';  -- 079 632 70 18  [CH] Dr. Adél Schumacher – Übersetzerin
UPDATE businesses SET phone = '+49 2103 9106498', updated_at = datetime('now')
  WHERE id = 'de-imp-zoltan-lokodi-praxis-lokodi';  -- 02103-9106498  [DE] Zoltán Lokodi – Praxis Lokodi
UPDATE businesses SET phone = '+49 911 606740', updated_at = datetime('now')
  WHERE id = 'de-imp-dres-croy-zahnarztpraxis';  -- 0911 606740  [DE] Dres. Croy – Zahnarztpraxis
UPDATE businesses SET phone = '+49 7151 42933', updated_at = datetime('now')
  WHERE id = 'de-imp-dr-degrell-thomas';  -- 07151/42933  [DE] Dr. Degrell Thomas
UPDATE businesses SET phone = '+49 8531 310800', updated_at = datetime('now')
  WHERE id = 'de-imp-dr-med-bolla-peter';  -- 08531-310800  [DE] Dr. med. Bolla Péter
UPDATE businesses SET phone = '+49 7851 8729330', updated_at = datetime('now')
  WHERE id = 'de-imp-dr-kasza-laszlo';  -- 07851-8729330  [DE] Dr. Kasza László
UPDATE businesses SET phone = '+43 1 366 1021', updated_at = datetime('now')
  WHERE id = 'at-imp-dr-arnold-bobb';  -- 01 366 1021  [AT] Dr. Arnold Bobb
UPDATE businesses SET phone = '+43 1 892 32 63', updated_at = datetime('now')
  WHERE id = 'at-imp-ddr-robert-mallinger';  -- 01 892 32 63  [AT] DDr. Robert Mallinger
UPDATE businesses SET phone = '+43 1 5233320', updated_at = datetime('now')
  WHERE id = 'at-imp-dr-alireza-emami-nouri';  -- 01/5233320  [AT] Dr. Alireza Emami Nouri
UPDATE businesses SET phone = '+43 1 5030706', updated_at = datetime('now')
  WHERE id = 'at-imp-dr-mario-castro';  -- 01/5030706  [AT] Dr. Mario Castro
UPDATE businesses SET phone = '+43 676 3740748', updated_at = datetime('now')
  WHERE id = 'at-imp-dr-nora-eiler';  -- 0676/3740748  [AT] Dr. Nóra Eiler
UPDATE businesses SET phone = '+43 1 216 33 32', updated_at = datetime('now')
  WHERE id = 'at-imp-dr-szabolcs-horvai';  -- 01/216-33-32  [AT] Dr. Szabolcs Horvai
UPDATE businesses SET phone = '+43 664 1936379', updated_at = datetime('now')
  WHERE id = 'at-imp-priv-doz-dr-andrea-papp';  -- 0664/1936379  [AT] Priv.-Doz. Dr. Andrea Papp
UPDATE businesses SET phone = '+43 680 5577760', updated_at = datetime('now')
  WHERE id = 'at-imp-oa-dr-gyongyi-fodor';  -- 0680/5577760  [AT] OA Dr. Gyöngyi Fodor
UPDATE businesses SET phone = '+41 21 311 35 33', updated_at = datetime('now')
  WHERE id = 'ch-imp-dr-ferenc-rakoczy';  -- 021 311 35 33  [CH] Dr. Ferenc Rakoczy
UPDATE businesses SET phone = '+49 8131 3186084', updated_at = datetime('now')
  WHERE id = 'de-imp-garabas-cosmetics';  -- 08131/3186084  [DE] Garabas Cosmetics
UPDATE businesses SET phone = '+49 30 2916655', updated_at = datetime('now')
  WHERE id = 'de-imp-szabo-eyke-u-laszlo-dolmetscher-und-ubersetzer';  -- 030 2916655  [DE] Szabó Eyke u. László Dolmetscher und Überset
UPDATE businesses SET phone = '+43 1 799 2155', updated_at = datetime('now')
  WHERE id = 'at-imp-ap-prof-dr-klara-rosta';  -- 01/799 2155  [AT] Ap. Prof. Dr. Klara Rosta
UPDATE businesses SET phone = '+43 2952 30999', updated_at = datetime('now')
  WHERE id = 'at-imp-dr-agnes-hofer';  -- 02952/30999  [AT] Dr. Agnes Hofer
UPDATE businesses SET phone = '+43 1 706 45 45', updated_at = datetime('now')
  WHERE id = 'at-imp-dr-michael-lasta';  -- 01/706 45 45  [AT] Dr. Michael Lasta
UPDATE businesses SET phone = '+43 662 870 780', updated_at = datetime('now')
  WHERE id = 'at-imp-dr-jorg-dabernig';  -- 0662/870 780  [AT] Dr. Jörg Dabernig
UPDATE businesses SET phone = '+43 699 100 994 98', updated_at = datetime('now')
  WHERE id = 'at-imp-priv-doz-dr-alexander-hans-petter-puchner';  -- 0699/100 994 98  [AT] Priv.Doz. Dr. Alexander Hans Petter-Puchner
UPDATE businesses SET phone = '+43 1 2123005', updated_at = datetime('now')
  WHERE id = 'at-imp-oa-dr-behrooz-salehi';  -- 01/2123005  [AT] OA Dr. Behrooz Salehi
UPDATE businesses SET phone = '+49 30 2084442', updated_at = datetime('now')
  WHERE id = 'de-imp-dr-elke-sallmon-herrmann';  -- 030 2084442  [DE] Dr. Elke Sallmon-Herrmann
UPDATE businesses SET phone = '+43 676 5626267', updated_at = datetime('now')
  WHERE id = 'at-imp-dr-med-noemi-simionas';  -- 0676/5626267  [AT] Dr. med. Noemi Simionas
UPDATE businesses SET phone = '+43 680 3311125', updated_at = datetime('now')
  WHERE id = 'at-imp-priv-doz-dr-andreas-kliegel';  -- 0680/3311125  [AT] Priv.Doz. Dr. Andreas Kliegel
UPDATE businesses SET phone = '+43 1 587 36 36', updated_at = datetime('now')
  WHERE id = 'at-imp-dr-eva-brownstone';  -- 01/587 36 36  [AT] Dr. Eva Brownstone
