-- 0081 — country_code adatdimenzió a tartalom-táblákhoz (6-ország alap).
--
-- Eddig minden tartalom implicit svájci volt. A többország-induláshoz a
-- vállalkozás/állás/esemény kap egy ország-kódot. A meglévő sorok mind 'CH'
-- (DEFAULT), így a jelenlegi CH-app változatlanul működik; az új tartalom a
-- beküldő országával töltődik.
--
-- Régió-kód: a `jobs` és `events` tábláknak MÁR van canton_code-juk (0062, 0071).
-- A `businesses` táblának viszont NINCS — a kantont eddig a címből/koordinátából
-- SZÁRMAZTATTA (cantonFromAddress / nearestCantonCode), ami CH-specifikus. A
-- nem-CH régiók (AT Bundesland stb.) nem származtathatók a svájci logikából,
-- ezért a businesses is kap egy canton_code-ot (régió-kód, lásd lib/regions.ts).
-- A meglévő CH-sorok canton_code-ja NULL marad → a származtatás a fallback,
-- a CH-viselkedés változatlan.

ALTER TABLE businesses ADD COLUMN country_code TEXT NOT NULL DEFAULT 'CH';
ALTER TABLE businesses ADD COLUMN canton_code  TEXT;  -- régió-kód (CH: kanton, AT: Bundesland, …); NULL CH-nál = származtatott
ALTER TABLE jobs       ADD COLUMN country_code TEXT NOT NULL DEFAULT 'CH';
ALTER TABLE events     ADD COLUMN country_code TEXT NOT NULL DEFAULT 'CH';

CREATE INDEX IF NOT EXISTS idx_businesses_country ON businesses (country_code);
CREATE INDEX IF NOT EXISTS idx_businesses_canton  ON businesses (canton_code);
CREATE INDEX IF NOT EXISTS idx_jobs_country       ON jobs (country_code);
CREATE INDEX IF NOT EXISTS idx_events_country      ON events (country_code);
