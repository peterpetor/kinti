-- 0137 — Albérlet lejárat-előtti értesítő: egyszeri-küldés őr (a job-expiry
-- 0131-minta). A daily-nudge a lejárat előtti ≤3 napban emailt küld a hirdetés
-- kontakt-emailjére (ha email-formájú), és ide bélyegzi, hogy ne duplázzon.
-- Megújításkor visszaáll NULL-ra (új ciklus → új figyelmeztetés járhat).
ALTER TABLE kinti_housing_listings ADD COLUMN expiry_warned_at TEXT;
