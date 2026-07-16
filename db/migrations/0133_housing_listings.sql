-- 0133: „Szoba- és albérlet-börze" — felhasználók közötti (UGC) lakhatási
-- hirdetőtábla. A Kinti CSAK hirdetési felület (safe harbor): nem közvetít,
-- nem kezel bérleti díjat. A contact_info SOSEM megy le a lista-payloadban —
-- kizárólag a PRO-gated /api/housing/contact adja ki (Kinti PRO kapuőr-modell).
-- A feladáshoz Clerk-belépés + kötelező főbérlői-engedély nyilatkozat kell
-- (a consent tényét az ÁSZF-szakasz + a beküldő API kényszeríti ki).
CREATE TABLE IF NOT EXISTS kinti_housing_listings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,               -- Clerk userId (tulajdon + rate-limit)
  type TEXT NOT NULL,                  -- 'room_offered' | 'apartment_offered' | 'looking_for_room'
  country TEXT NOT NULL,               -- 'CH' | 'AT' | 'DE' | 'NL'
  city TEXT NOT NULL,
  price REAL NOT NULL,                 -- havi ár (kereső hirdetésnél: max keret)
  currency TEXT NOT NULL DEFAULT 'EUR',
  description TEXT NOT NULL,
  contact_info TEXT NOT NULL,          -- e-mail / telefon — CSAK PRO-nak, API-n át
  is_active INTEGER NOT NULL DEFAULT 1, -- 0 = levéve (DSA-jelentés / admin)
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_housing_country_active
  ON kinti_housing_listings(country, is_active);
-- Feladó szerinti lekérdezés (napi rate-limit + saját hirdetések).
CREATE INDEX IF NOT EXISTS idx_housing_user
  ON kinti_housing_listings(user_id, created_at);
