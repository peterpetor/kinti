-- ===========================================================================
-- 0035_rides_packages — csomagszállítás kibővítés a telekocsi-modulra.
--
-- A sofőrök, akik úgyis mennek (jellemzően HU ↔ CH irányba), jelölhetik
-- hogy vállalnak csomagot is — ezzel a "kintieknek" lehetőséget adva, hogy
-- magyar termékeket (élelmiszer, könyv, stb.) olcsón hozzanak ki, vagy
-- hazafelé hozzanak.
--
-- Két új OPCIONÁLIS mező:
--   - accepts_packages (0/1): a sofőr kijelölte-e
--   - package_note (TEXT): mit, mennyit, milyen áron — szabad szöveg
--
-- NEM külön tábla / post-típus — a meglévő ride-listán szűrhető lesz.
-- A kapcsolatfelvétel zero-relay: a meglévő telefonszámon vagy WA-n.
-- ===========================================================================

ALTER TABLE rides ADD COLUMN accepts_packages INTEGER NOT NULL DEFAULT 0;
ALTER TABLE rides ADD COLUMN package_note TEXT;
