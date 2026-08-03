-- A telefon-audit második köre: 1 duplikátum + 1 IDEGEN TELEFONSZÁM — 2026-08-03
--
-- A telefon-alapú dedup 45 megosztott számot talált; 37 legitim (közös praxis,
-- házaspár-rendelő, egy cég két telephelye). A maradékból két eset dőlt el most.

------------------------------------------------- 1. UGYANAZ AZ ORVOS KÉTSZER
-- `ch-imp-dr-gabor-varadi-pallas-klinik-olten` (orvos) és
-- `ch-imp-dr-gabor-varadi-gyermekszemesz`      (szemesz)
-- UGYANAZ a szakorvos, UGYANABBAN a klinikában (Pallas Kliniken, Olten),
-- azonos telefonnal — és MINDKÉT leírás gyermekszemészetről szól.
-- A pontosabb kategóriájút (`szemesz`) tartjuk meg.
-- ⚠️ Ez NEM a [[company-two-profiles]] eset: ott egy cég KÉT KÜLÖNBÖZŐ
-- szerepben (munkáltató + vállalkozás) szerepel szándékosan. Itt egy személy
-- ugyanabban a szerepben van kétszer felvéve.
UPDATE businesses SET hidden = 1, updated_at = datetime('now')
WHERE id = 'ch-imp-dr-gabor-varadi-pallas-klinik-olten';

------------------------------------ 2. ⚠️⚠️ IDEGEN TELEFONSZÁM EGY ADATLAPON
-- „Magyar Könyvelőház" (Kleiweg 185A) és „Kovács Anita Magyar Könyvelő"
-- (Soetendaalseweg 63a) azonos telefonnal szerepelt — de a Google Maps szerint
-- ez KÉT KÜLÖNBÖZŐ rotterdami könyvelőiroda:
--   • Magyar Könyvelő Ház/Administratiehuis Rotterdam B.V. — Kleiweg 185A,
--     +31 6 23167808, magyarkonyvelohaz.nl
--   • Anita K Administraties — Soetendaalseweg 63-A, **+31 10 223 4343**
--
-- Vagyis Kovács Anita adatlapján a MÁSIK IRODA száma állt: aki felhívta,
-- egy idegen céget ért el. A Maps-cím pontosan egyezik a miénkkel, ezért a
-- javítás biztonságos.
--
-- ⚠️ Ez a telefon-alapú dedup MELLÉKTERMÉKE: nem duplikátumot talált, hanem egy
-- ROSSZ ADATOT. A „két tétel ugyanazzal a számmal" nem mindig duplikáció —
-- lehet, hogy az egyikre rossz szám került.
UPDATE businesses SET phone = '+31 10 223 4343', updated_at = datetime('now')
WHERE id = 'nl-imp-kovacs-anita-magyar-konyvelo';

-- A Könyvelőház weboldala hiányzott (ellenőrizve: 200, magyar tartalom).
UPDATE businesses SET
  blurb = 'ZZP/BV alapítás, áfa-bevallás, bérszámfejtés, adótanácsadás magyaroknak Hollandiában · magyarkonyvelohaz.nl',
  updated_at = datetime('now')
WHERE id = 'nl-imp-magyar-konyvelohaz';
