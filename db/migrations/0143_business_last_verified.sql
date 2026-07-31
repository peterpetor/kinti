-- 0143_business_last_verified.sql
--
-- Frissesség-bélyeg: mikor és ki ellenőrizte utoljára, hogy a vállalkozás
-- TÉNYLEGESEN MŰKÖDIK.
--
-- ⚠️ MIÉRT KELL: a 2026-07-31-i frissesség-audit kimutatta, hogy a szaknévsor
-- fogyasztó-arcú részének 20,6%-a (65/316) véglegesen bezárt üzlet volt, a
-- szolgáltatók 2,9%-a (59/2056) pedig megszűnt praxis. Indulás előtt a
-- legdrágább hiba nem a hiányzó tétel, hanem a halott: aki egyszer zárt
-- éttermet hív fel, többet nem jön vissza. A bélyeg ezt teszi láthatóvá a
-- felhasználónak — és egyben megismételhető, számon kérhető folyamattá az
-- auditot.
--
-- ⚠️ SZŰK ÁLLÍTÁS, SZÁNDÉKOSAN: az audit azt igazolta, hogy a vállalkozás
-- MŰKÖDIK — NEM azt, hogy minden mezője (telefon, nyitvatartás) helyes.
-- A felületen se állítsunk többet ennél.
--
-- last_verified_by értékek:
--   'audit' — automatikus frissesség-ellenőrzés (Google Maps állapotjel)
--   'owner' — a tulajdonos átvette/frissítette az adatlapot
--   'user'  — felhasználói visszajelzés erősítette meg
ALTER TABLE businesses ADD COLUMN last_verified_at TEXT;
ALTER TABLE businesses ADD COLUMN last_verified_by TEXT;

-- A listákon a friss tételeket előrébb lehessen sorolni, és az elavulókat
-- olcsón meg lehessen találni egy következő audit-körhöz.
CREATE INDEX IF NOT EXISTS idx_businesses_last_verified
  ON businesses (last_verified_at);
