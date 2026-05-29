-- ===========================================================================
-- 0034_bulletin_phone_whatsapp — telefon + WhatsApp mezők a hirdetésekhez.
--
-- A hirdetésekhez eddig csak opcionális email mező volt; sok feladó nem akar
-- emailt megadni, de telefonon / WhatsApp-on igen elérhető. Most két új
-- opcionális mező: a feladónál min. 1 elérhetőséget kötelező megadni
-- (email VAGY phone VAGY whatsapp) — ezt a kliens + szerver validálja.
-- A whatsapp ÜRES esetben a phone-ra megy (visszafelé kompatibilis).
-- ===========================================================================

ALTER TABLE bulletin_posts ADD COLUMN phone TEXT;
ALTER TABLE bulletin_posts ADD COLUMN whatsapp TEXT;

-- A draft (email-confirm flow) is megőrizze az elérhetőség-mezőket, hogy
-- megerősítés után a publish-INSERT-be át tudjuk vinni.
ALTER TABLE bulletin_drafts ADD COLUMN phone TEXT;
ALTER TABLE bulletin_drafts ADD COLUMN whatsapp TEXT;
