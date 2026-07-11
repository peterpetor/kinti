-- 0126 — „Régiók Harca": a napi kvíz anonim pontszám-eloszlása RÉGIÓ-szinten.
--
-- A 0120-as quiz_daily_stats (ország-szintű hisztogram) párja, kanton/tartomány/
-- provincia dimenzióval — ebből épül a kvíz-eredmény és a /ranglista „Régiók
-- Harca" heti versenytáblája (Bajorország vs Baden-Württemberg stb.).
--
-- TELJESEN ANONIM AGGREGÁTUM: se azonosító, se token, se IP — csak darabszám
-- (ország × régió × nap × pontszám). A régió a kliens által küldött, szerveren
-- getRegions ellen validált preferencia (coarse, önkéntes: enélkül a játék csak
-- az ország-szintű táblába számít). Privacy-elv (privacy-no-server-identity) áll.
-- Minimum-minta kapu (>= 10 játék/régió/hét, >= 2 régió) védi az „ürességet
-- reklámozó" esettől (presence-heatmap tanulság).
CREATE TABLE IF NOT EXISTS quiz_region_stats (
  country TEXT NOT NULL,        -- CH | AT | DE | NL
  canton TEXT NOT NULL,         -- régió-kód (regions.ts: kanton/Bundesland/provincia)
  day TEXT NOT NULL,            -- YYYY-MM-DD (szerver, UTC date('now'))
  score INTEGER NOT NULL,       -- 0..3
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (country, canton, day, score)
);

-- A heti lekérdezés ország + nap-tartományra szűr → fedő index.
CREATE INDEX IF NOT EXISTS idx_quiz_region_stats_country_day ON quiz_region_stats(country, day);
