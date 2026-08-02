-- DE magyar közösségek: elérhetőség-pótlás — 2026-08-03
--
-- ⚠️ A `magyar-kozosseg` kategória a szaknévsor MÁSODIK legnagyobb zsákutca-
-- fészke: DE 25/60 (42%), AT 21/60 (35%), NL 13/19 (68%), CH 4/23 (17%).
-- Ezek egy diaszpóra-NÉVLISTÁBÓL kerültek be: van nevük és VÁROSUK, de se
-- utcacímük, se elérhetőségük — vagyis a térképen egy városközépi pin, amivel
-- a felhasználó semmit nem tud kezdeni.
--
-- Ez a kör a legnagyobb ÖSSZEFÜGGŐ klasztert zárja le: a Német–Magyar
-- Társaságokat (10 tétel). Klaszterenként haladni sokkal gyorsabb, mint
-- egyesével — egy ernyőszervezet/közös névminta egyszerre több tételt old meg.
--
-- ⚠️⚠️ MINDEN weboldal TARTALOMMAL ellenőrizve, nem státuszkóddal
-- (ld. directory-candidate-death-modes: a parkoltatott domain 200-at ad):
--   ✓ dug-darmstadt.de, dug-frankfurt.de, dug-kiel.org, dug-pf.de — élnek,
--     és a lap szövege igazolja, hogy a KERESETT szervezetről van szó
--   ✗ dug-hannover.de — a keresőmotor még hozza, de a domain NEM oldódik fel
--     (000). NEM írjuk be. A hannoveri tétel marad kontakt nélkül.
--   ✗ d-u-g.org — ÉL, de ez a BERLINI társaság („die einzige deutsch-ungarische
--     Gesellschaft mit Sitz in der deutschen Hauptstadt"), NEM a stuttgarti.
--     A DACH/Berlin tételünkhöz már be van kötve a dug-dach.de. A stuttgarti
--     tétel marad kontakt nélkül.
--   ✗ München — nem találtam igazolható weboldalt; a keresőmotor adott címet és
--     telefont, de FÜGGETLEN forrásból nem tudtam megerősíteni → kihagyva.
-- A már bekötött három link (dug-dach.de, dug-mv.de, muenster.org/ungarn) is
-- újraellenőrizve: mind a három ÉL.
--
-- ⚠️ ADATVÉDELEM: a kieli és a frankfurti társaság postacíme MAGÁNLAKÁS
-- (Allensteiner Weg 52, Altenholz; illetve Johanneswiesenweg 4, Neu-Anspach —
-- utóbbi nem is Frankfurtban van). A lakcímet NEM tesszük ki, és az ahhoz
-- kötött telefonszámot sem — csak a SZERVEZETI e-mailt és a weboldalt.
-- Ugyanaz a minta, mint a HCHS/Redditch egyesületeknél (gb-szaknevsor-seed).

UPDATE businesses SET blurb = 'Német-magyar társaság · Darmstadt · dug-darmstadt.de', updated_at = datetime('now')
WHERE id = 'de-deutsch-ungarische-gesellschaft-darmstadt';

UPDATE businesses SET blurb = 'Német-magyar társaság · Frankfurt am Main · dug-frankfurt.de',
  contact_email = 'dug-frankfurt@gmx.de', updated_at = datetime('now')
WHERE id = 'de-deutsch-ungarische-gesellschaft-frankfurt';

UPDATE businesses SET blurb = 'Német-magyar társaság · Kiel · dug-kiel.org',
  contact_email = 'DUG_Kiel@email.de', updated_at = datetime('now')
WHERE id = 'de-deutsch-ungarische-gesellschaft-kiel';

UPDATE businesses SET blurb = 'Német-magyar társaság · Pforzheim · dug-pf.de', updated_at = datetime('now')
WHERE id = 'de-deutsch-ungarische-gesellschaft-pforzheim-enzkreis';
