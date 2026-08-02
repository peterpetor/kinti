-- CH — duplikátum-zárás: ugyanaz a widen-i magyar autószerviz kétszer — 2026-08-03
--
-- A két tétel:
--   ch-imp-car-garage-zurich-magyar-szerviz  „Car-Garage Zürich – Magyar szerviz"
--       Bremgarterstrasse 94, 8967 Widen · telefon NINCS · www.car-garage.ch
--   ch-imp-meszaros-tamas-car-garage         „Mészáros Tamás – Car Garage"
--       Bremgartenstrasse 59, 8967 Widen · +41 76 579 3099
--
-- MIÉRT UGYANAZ:
--   • azonos település (8967 Widen, ~4000 fős község) és azonos utcanév
--     (a „Bremgarterstrasse"/„Bremgartenstrasse" egy betűs eltérés ugyanarra
--     az utcára)
--   • mindkettő magyar AUTÓSZERVIZ
--   • ⭐ a döntő jel: az `arkadasi.hu/svajc` forrás a `car-garage.ch` domaint és
--     az `info@car-garage.ch` címet KIFEJEZETTEN Mészáros Tamáshoz rendeli —
--     vagyis a weboldal, ami a MÁSIK tételen szerepel, az övé.
--
-- ⚠️ A `www.car-garage.ch` MA NEM OLDÓDIK FEL (000) — a rejtendő tételnek tehát
-- sem telefonja, sem élő weboldala nincs: teljes zsákutca. A megmaradó tételnek
-- van működő telefonja, ezért AZT tartjuk meg.
-- A halott domaint NEM visszük át a megmaradó tételre.
--
-- A rejtendő tétel leírásában szereplő valós szolgáltatás-adatok (gumicsere,
-- MFK-vizsga, baleseti javítás) átkerülnek a megmaradóba, hogy ne vesszenek el,
-- és hogy a kereső a „Car-Garage" néven is megtalálja.
--
-- hidden = 1, SOHA nem DELETE.

UPDATE businesses SET
  blurb = 'Magyar autószerelő Widenben, Aargau kantonban (Car-Garage néven is): karosszéria, klíma, gumicsere, MFK-vizsga, baleseti javítás, vontatás.',
  updated_at = datetime('now')
WHERE id = 'ch-imp-meszaros-tamas-car-garage';

UPDATE businesses SET hidden = 1, updated_at = datetime('now')
WHERE id = 'ch-imp-car-garage-zurich-magyar-szerviz';
