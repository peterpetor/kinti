-- AT pszichológusok: elérhetőség-pótlás a PsyOnline.at regiszterből — 2026-08-03
--
-- A délelőtti Maps-kör 55 kontakt nélküli osztrák pszichológusból 16-ot oldott
-- meg; a maradék 37-nek nincs saját Maps-tétele. Ezekre a PsyOnline.at
-- (Ausztria legnagyobb pszichoterápiás portálja) a megoldás.
--
-- ⚠️ EZ PÓTLÁS, NEM FELFEDEZÉS: csak MÁR MEGLÉVŐ, magyar kötődés miatt korábban
-- felvett tételekhez kerestem kontaktot. Új tételt innen NEM veszünk fel — a
-- PsyOnline MINDEN osztrák terapeutát listáz, magyar nyelvtudás nem derül ki
-- belőle (ld. a „Kiss"-csapda a filter-hu-candidates.mjs-ben).
--
-- A KERESŐ HÁROM RÉTEGBEN REJTETTE AZ ADATOT:
--   1. a találati link NEM <a href>, hanem JS-vezérelt → kattintással derült ki
--      a közvetlen URL-minta (`go.asp?...&stichwort=<név>`)
--   2. a telefon NEM a találati lapon van, hanem a „Kontaktdaten" fül mögött
--      (`rkarte=infodetails`); csak a FIZETŐS profilok írják ki a listában —
--      emiatt tűnt először úgy, hogy 5-ből csak 1-nek van száma (valójában 4)
--   3. ⚠️ az ÉKEZET blokkolta a keresést: a regiszter „Noemi"-t tárol
--      „Noémi" helyett → ékezet nélküli VEZETÉKNÉVRE kell keresni
--
-- ⚠️⚠️ ÉS EZÉRT KELL A CÍM-EGYEZTETŐ: a vezetéknév-keresés az ELSŐ találatot
-- adja, nem a helyeset. A 23 megtalált telefonból a cím-szűrő **11-et
-- ELUTASÍTOTT (48%)** — ennyi IDEGEN telefonszám került volna magyar
-- szakemberek adatlapjára. A legtanulságosabbak:
--   • „Varga Fanni" és „Varga Flóra" UGYANAZT a számot kapta (2823 Pitten) —
--     a „Varga" keresés mindkétszer ugyanazt az első találatot adta
--   • „Wiesinger Henriette" (4600 Wels) helyett egy 1010 Wien-i tétel jött,
--     mert a keresés egy UTCANÉVRE (Wiesingerstraße) illeszkedett
--   • Hoffmann/Marton/Reiter/Schnitzler/Putz/Pavel: mind más város
--
-- ⚠️ TÖBB RENDELŐ: Giselbrecht Brigittának két praxisa van (1020 és 1220 Wien).
-- Ezért MINDEN kiírt címet összegyűjtünk, és BÁRMELYIK egyezése elfogadható —
-- ha csak az elsőt néznénk, valódi találatot utasítanánk el.
--
-- ⚠️ WEBOLDAL: csak a szakember SAJÁT domainje kerül be (mind az 5 ellenőrizve,
-- 200-at ad). A regiszter-profil (psyonline.at/…, lebensberatung.at/…) NEM
-- weboldal, hanem ugyanannak a katalógusnak az aloldala — kihagyva.
--
-- Telefon nemzetközi alakra hozva (0676 - 3508814 → +43 676 3508814).
UPDATE businesses SET phone = '+43 676 3508814', blurb = '· www.praxisacel.com', updated_at = datetime('now')
  WHERE id = 'at-biz3-acel-andras-pszichologus' AND phone IS NULL;  -- Ácel András – Pszichológus
UPDATE businesses SET phone = '+43 676 4151493', updated_at = datetime('now')
  WHERE id = 'at-biz3-ambrus-kanalas-noemi-pszichologus' AND phone IS NULL;  -- Ambrus-Kanalas Noémi – Pszichológus
UPDATE businesses SET phone = '+43 699 11595633', blurb = '· www.betriebsgesundheitsmanagement.com', updated_at = datetime('now')
  WHERE id = 'at-biz3-giselbrecht-brigitta-pszichologus' AND phone IS NULL;  -- Giselbrecht Brigitta – Pszichológus
UPDATE businesses SET phone = '+43 660 7433220', blurb = '· www.medgyesy.at', updated_at = datetime('now')
  WHERE id = 'at-biz3-medgyesy-judit-pszichologus' AND phone IS NULL;  -- Medgyesy Judit – Pszichológus
UPDATE businesses SET phone = '+43 660 3546525', updated_at = datetime('now')
  WHERE id = 'at-biz3-minimair-marta-pszichologus' AND phone IS NULL;  -- Minimair Márta – Pszichológus
UPDATE businesses SET phone = '+43 680 1409985', updated_at = datetime('now')
  WHERE id = 'at-biz3-nemes-judith-pszichologus' AND phone IS NULL;  -- Nemes Judith – Pszichológus
UPDATE businesses SET phone = '+43 699 11510203', blurb = '· www.reischle.at', updated_at = datetime('now')
  WHERE id = 'at-biz3-reischle-karin-pszichologus' AND phone IS NULL;  -- Reischle Karin – Pszichológus
UPDATE businesses SET phone = '+43 699 10243180', updated_at = datetime('now')
  WHERE id = 'at-biz3-waltl-barbara-pszichologus' AND phone IS NULL;  -- Waltl Barbara – Pszichológus
UPDATE businesses SET phone = '+43 664 3014415', updated_at = datetime('now')
  WHERE id = 'at-biz3-hornof-eva-coach' AND phone IS NULL;  -- Hornof Éva, MSc – Pszichológus / Coach
UPDATE businesses SET phone = '+43 699 17130771', updated_at = datetime('now')
  WHERE id = 'at-biz3-vecsei-zsuzsanna-mediator' AND phone IS NULL;  -- Vecsei Zsuzsanna, BA – Mediátor
UPDATE businesses SET phone = '+43 664 78003530', blurb = 'therapeuten.at (nyelvi szűrő: magyar) · www.boglarkatoth.at', updated_at = datetime('now')
  WHERE id = 'biz3-at-boglarka-toth-therapeutin' AND phone IS NULL;  -- Boglarka Toth, BA.pth. – Terapeuta
UPDATE businesses SET phone = '+43 676 7907257', updated_at = datetime('now')
  WHERE id = 'biz3-at-gabriella-wegscheider-therapeutin' AND phone IS NULL;  -- Gabriella Wegscheider, Mag. – Terapeuta
