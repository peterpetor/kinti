-- Kategória-javítás: Budapest Bistro (Bécs) — 2026-08-03
--
-- ⭐ HOGYAN KERÜLT ELŐ: egy kategória-heurisztika (a NÉV/LEÍRÁS erős kulcsszava
-- más kategóriára mutat, mint ami be van állítva). A 2267 tételből 48 lett
-- gyanús, de **szinte mind LEGITIM megkülönböztetés** volt:
--   • német „Steuerberater" = adótanácsadó, nem könyvelő
--   • „Gerichtsdolmetscherin" = tolmács, nem fordító
--   • a pszichiáter nem pszichológus
--   • ügyvéd, akinek a leírásában szerepel az ingatlanjog
-- A heurisztika kulcsszó-halmazai fedik egymást — ezért NEM automatikus javító,
-- csak gyanú-lista. Egyetlen valódi hibát talált.
--
-- A HIBA: a „Budapest Bistro" (Pilgramgasse 10, 1050 Wien) `cukrasz`
-- kategóriában volt, holott a saját leírása szerint „magyar bisztró … egész
-- napos reggeli és magyar fogásokkal" — vagyis ÉTTEREM.
--
-- ⚠️⚠️ A HIBA OKA TANULSÁGOS: a tétel korábban KÉTSZER szerepelt, és egy
-- korábbi dedup-kör a `cukrasz` példányt tartotta meg, a HELYES kategóriájú
-- (`etterem`) példányt pedig elrejtette.
-- ⇒ SZABÁLY: duplikátum-zárásnál nem elég eldönteni, MELYIK sort tartjuk meg —
--   át kell nézni, hogy a MEGTARTOTT soron a kategória, a cím és a telefon is
--   a jobbik-e. Ma ez háromszor is előjött (SB-Kfztechnik weboldala, Sacal
--   kategóriája, most a Budapest Bistro).
--
-- ⚠️ NEM javítom: „Katalin Farkas – Ungarischer Laden & Bäckerei" (Wädenswil)
-- `kenyer_pekseg`-ben van, a rejtett párja `elelmiszer` volt. A bolt egyszerre
-- bolt, pékség ÉS kávézó — a `category_label` mindhármat kimondja
-- („Magyar bolt, pékség és kávézó"), tehát a felhasználó így is megtalálja.
-- Kétértelmű eset, nincs egyértelműen jobb választás.

UPDATE businesses SET
  category_id = 'etterem',
  category_label = 'Étterem / bisztró',
  updated_at = datetime('now')
WHERE id = 'at-imp-budapest-bistro';
