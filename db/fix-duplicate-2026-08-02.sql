-- ⚠️ DUPLIKÁTUM JAVÍTÁSA — 2026-08-02
--
-- AZ ÉN HIBÁM: az „El Húngaro Hair Stylist" (Barcelona) MÁR BENT VOLT
-- `es-el-hungaro-hair-stylist` néven (source: seed-es-org), és a célzott
-- Maps-keresés utolsó körénél NEM futtattam dedup-ellenőrzést erre a tételre —
-- így létrejött egy második példány `es-imp-...-barcelona` néven.
--
-- Azonos cím ÉS azonos telefonszám (+34 722 56 00 53) → egyértelmű duplikátum.
-- A RÉGEBBIT tartjuk meg (az a kurált seed-forrásból való), az újat elrejtjük.
--
-- ⚠️ `hidden = 1`, NEM DELETE — a szaknévsor-szabály szerint sosem törlünk
-- (a rejtés visszafordítható, és megőrzi az esetleges hivatkozásokat).
--
-- TANULSÁG: a dedup-ellenőrzés NEM opcionális lépés a folyamat végén, hanem
-- MINDEN import előtt kötelező — akkor is, ha csak 1-2 tételről van szó.

UPDATE businesses SET hidden = 1
  WHERE id = 'es-imp-el-hungaro-hair-stylist-barcelona';
