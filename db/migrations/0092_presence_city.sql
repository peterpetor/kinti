-- 0092 — város-szintű jelenlét: a presence_pings kap egy `city` oszlopot.
-- A régi (region-only) sorok city = NULL maradnak; a region_code továbbra is megvan
-- (a térkép-aggregáláshoz és a kompatibilitásért). Lásd 0091 + lib/presence-cities.ts.
ALTER TABLE presence_pings ADD COLUMN city TEXT;
CREATE INDEX IF NOT EXISTS idx_presence_city ON presence_pings(country, city);
