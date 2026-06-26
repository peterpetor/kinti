-- 0091 — „Ki költözött melléd?" anonim magyar jelenlét-hőtérkép.
-- Egyetlen kérdés: melyik régióban élsz? → egy névtelen ping. NINCS account, email,
-- nyers IP — az ip_hash CSAK rate-limit kulcs (egyirányú hash, nem identitás), és
-- nem köthető vissza a felhasználóhoz. Régió-szinten aggregálunk.
CREATE TABLE IF NOT EXISTS presence_pings (
  id          TEXT PRIMARY KEY,
  country     TEXT NOT NULL,            -- CH/AT/DE/NL
  region_code TEXT NOT NULL,            -- kanton (CH) / Bundesland (AT/DE) / provincie (NL)
  ip_hash     TEXT NOT NULL,            -- CSAK rate-limit; NEM identitás
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_presence_country ON presence_pings(country, region_code);
CREATE INDEX IF NOT EXISTS idx_presence_iphash ON presence_pings(ip_hash, created_at);
