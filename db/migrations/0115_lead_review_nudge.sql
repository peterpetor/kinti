-- 0115 — vélemény-gyűjtő nudge az ajánlatkérések (lead-ek) után.
--
-- A szaknévsor várárka a valódi magyar vélemény: aki 3 napja árajánlatot kért
-- egy vállalkozástól, azt emailben megkérdezzük: „Milyen volt? Írj pár
-- mondatot" — mélylinkkel a cégoldal értékelő-űrlapjára. A nudge lead-enként
-- EGYSZER megy ki (review_nudge_at időbélyeg; NULL = még nem küldtük).
ALTER TABLE business_leads ADD COLUMN review_nudge_at TEXT;
