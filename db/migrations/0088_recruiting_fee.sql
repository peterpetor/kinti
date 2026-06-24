-- 0088 — közvetítői jutalék-összeg (EUR) a jelölthöz, a bevétel-követéshez.
-- A recruiter az „elhelyezve"/„kifizetve" jelöltnél beírja a jutalékot; a
-- dashboard összegzi (kifizetve = ténylegesen bejött pénz).
ALTER TABLE recruiting_candidates ADD COLUMN fee_eur INTEGER;
