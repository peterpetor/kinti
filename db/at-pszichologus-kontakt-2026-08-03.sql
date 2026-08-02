-- AT pszichológusok: elérhetőség-pótlás + 2 bezárt praxis kivezetése — 2026-08-03
--
-- ⚠️ MIÉRT EZ VOLT A SZAKNÉVSOR LEGNAGYOBB MINŐSÉGI PROBLÉMÁJA: az osztrák
-- pszichológus-kategória 82 tételéből 55-nek (67%) SEMMILYEN elérhetősége nem
-- volt — se telefon, se e-mail, se weboldal. Ez a legnagyobb ilyen csoport az
-- egész szaknévsorban. A tételek a `seed:web-verified2` körből származnak, ami
-- egy hatósági/kamarai regiszterből vette a NEVET és a PONTOS CÍMET, de a
-- regiszter telefonszámot nem közöl.
--
-- ⚠️⚠️ Boltnál a cím elég (be lehet sétálni) — PSZICHOLÓGUSNÁL NEM: oda időpontot
-- kell kérni. Ezért itt a hiányzó telefon ténylegesen HASZNÁLHATATLANNÁ teszi a
-- tételt, nem csak kényelmetlenné.
--
-- MÓDSZER: Google Maps-lekérdezés NÉV + PONTOS CÍM alapján, majd KÉT független
-- szűrő (`scripts/match-verified-phones.mjs` + név-ellenőrzés):
--   1. a Maps CÍME egyezzen a miénkkel (utcanév + házszám)
--   2. a Maps NEVE tartalmazza a szakember nevének valamelyik tokenjét
--
-- ⚠️ MINDKÉT szűrő kellett, egyik sem elég önmagában:
--   • a CÍM-szűrő fogta meg: Göschl-Kraemer Karla (Phorusgasse 2, 1040 Wien)
--     helyett egy MÁS praxist a Semperstraße 5-ben (1180 Wien) — a név stimmelt
--     volna, a cím nem. Összesen 8 ilyen elutasítás.
--   • a NÉV-szűrő fogta meg: Möthi Daniel (Thaliastraße 125) címén a Maps a
--     „HTL Wien West" MŰSZAKI ISKOLÁT adja — a CÍM tökéletesen egyezett, mégis
--     az iskola telefonszáma került volna egy művészetterapeuta adatlapjára.
--
-- Eredmény: 55 vizsgált tételből 16 telefon + 2 bezárt praxis.
-- A többi 37-re a Maps nem adott egyértelmű találatot (nincs saját Maps-tétel).
--
-- ⚠️ A telefonok nemzetközi alakra hozva (0664… → +43 664…).

--------------------------------------------------------- ELÉRHETŐSÉG-PÓTLÁS
UPDATE businesses SET phone = '+43 664 5141035', updated_at = datetime('now')
  WHERE id = 'at-biz3-katharina-anna-klavacs-logopadin' AND phone IS NULL;  -- Katharina Anna Klavacs – Logopädin
UPDATE businesses SET phone = '+43 660 3058467', updated_at = datetime('now')
  WHERE id = 'at-biz3-ips-impuls-familienberatung-pszichologus' AND phone IS NULL;  -- IPS Impuls Familienberatungs GmbH & Co KG – Pszichológia
UPDATE businesses SET phone = '+43 677 63714150', updated_at = datetime('now')
  WHERE id = 'at-biz3-koch-szekely-katalin-pszichologus' AND phone IS NULL;  -- Koch Székely Katalin – Pszichológus
UPDATE businesses SET phone = '+43 660 4846455', updated_at = datetime('now')
  WHERE id = 'at-biz3-kocsis-krisztina-pszichologus' AND phone IS NULL;  -- Dr. Kocsis Krisztina – Pszichológus
UPDATE businesses SET phone = '+43 677 61593665', updated_at = datetime('now')
  WHERE id = 'at-biz3-sandor-nora-pszichologus' AND phone IS NULL;  -- Sándor Nóra – Pszichológus
UPDATE businesses SET phone = '+43 664 4122908', updated_at = datetime('now')
  WHERE id = 'at-biz3-farkas-gerlinde-coach' AND phone IS NULL;  -- Farkas Gerlinde – Pszichológus / Coach
UPDATE businesses SET phone = '+43 664 2433844', updated_at = datetime('now')
  WHERE id = 'at-biz3-hitschmann-daniel-coach' AND phone IS NULL;  -- Hitschmann Daniel, DSA – Pszichológus / Coach
UPDATE businesses SET phone = '+43 664 8519531', updated_at = datetime('now')
  WHERE id = 'at-biz3-schania-piroska-coach' AND phone IS NULL;  -- Schania Piroska, MSc – Pszichológus / Coach
UPDATE businesses SET phone = '+43 660 2388718', updated_at = datetime('now')
  WHERE id = 'at-biz3-soulgarden-coach' AND phone IS NULL;  -- SOULGARDEN GmbH
UPDATE businesses SET phone = '+43 664 4241899', updated_at = datetime('now')
  WHERE id = 'at-biz3-wally-peter-coach' AND phone IS NULL;  -- Wally Peter, Mag. – Pszichológus / Coach
UPDATE businesses SET phone = '+43 676 5656452', updated_at = datetime('now')
  WHERE id = 'at-biz3-thuring-falvi-marianna-coach' AND phone IS NULL;  -- Thüring-Falvi Marianna – Pszichológus / Coach
UPDATE businesses SET phone = '+43 1 9850523', updated_at = datetime('now')
  WHERE id = 'at-biz3-dale-carnegie-austria-coach' AND phone IS NULL;  -- Dale Carnegie Austria (DCA Training GmbH)
UPDATE businesses SET phone = '+43 1 9230529', updated_at = datetime('now')
  WHERE id = 'at-biz3-im-kontext-coach' AND phone IS NULL;  -- Im Kontext (MSc Gabriele Bargehr e.U.)
UPDATE businesses SET phone = '+43 699 18006150', updated_at = datetime('now')
  WHERE id = 'biz3-at-eva-lak-psychotherapeutin' AND phone IS NULL;  -- Eva Lak, MSc – Psychotherapeutin
UPDATE businesses SET phone = '+43 699 12049241', updated_at = datetime('now')
  WHERE id = 'biz3-at-emese-misley-therapeutin' AND phone IS NULL;  -- Emese Misley – Terapeuta
UPDATE businesses SET phone = '+43 650 2009417', updated_at = datetime('now')
  WHERE id = 'biz3-at-eva-portan-therapeutin' AND phone IS NULL;  -- Eva Pörtan – Terapeuta

----------------------------------------------------------- BEZÁRT PRAXIS
-- Mindkettőnél a NÉV IS egyezik, és a Maps VÉGLEGESEN BEZÁRT jelzést ad.
-- Steindl Ulrikénál a CÍM is pontosan egyezik (Hockegasse 61, 1180 Wien).
-- Javorszky Karlt a MI CÍMÜNKKEL (Löblichgasse 13, 1090 Wien) újrakeresve
-- is bezártként jön vissza — tehát nem csak egy régi telephelye halott.
-- hidden=1, SOHA nem DELETE.
UPDATE businesses SET hidden = 1, updated_at = datetime('now') WHERE id = 'at-biz3-javorszky-karl-pszichologus';  -- Dr.phil. Javorszky Karl – Pszichológus
UPDATE businesses SET hidden = 1, updated_at = datetime('now') WHERE id = 'at-biz3-steindl-ulrike-coach';  -- Steindl Ulrike, Mag. – Pszichológus / Coach
