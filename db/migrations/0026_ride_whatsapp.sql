-- ===========================================================================
-- 0026_ride_whatsapp — külön WhatsApp szám a Telefon mellett.
--
-- Eddig mindkét gomb (Hívás + WhatsApp) ugyanazon a contact_phone-on ment, de
-- a feladók egy része eltérő számot használ a kettőhöz (pl. üzleti SIM hívásra,
-- privát SIM WhatsAppra). Mostantól külön mező — opcionális; ha üres, a
-- WhatsApp-gomb a Telefon számra megy (visszafelé kompatibilis).
-- ===========================================================================

ALTER TABLE rides ADD COLUMN contact_whatsapp TEXT;
