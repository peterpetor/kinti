-- 0120 — Napi kvíz anonim pontszám-eloszlás (heti percentilishez).
--
-- TELJESEN ANONIM AGGREGÁTUM: se azonosító, se token, se IP nem tárolódik —
-- kizárólag darabszám (ország × nap × pontszám). Ebből számoljuk a kvíz
-- eredmény-képernyőjén a „ezen a héten a <ország>-iak X%-ánál jobb voltál"
-- percentilist. A napi kvíz determinisztikus (mindenki ugyanazt a 3 kérdést
-- kapja aznap az adott országban), ezért a pontszám-összevetés tisztességes.
--
-- Privacy-elv (privacy-no-server-identity) változatlan: ez NEM per-user tábla,
-- csak hisztogram. A minimum-minta kapu (kliens/route oldalon) védi a
-- „ürességet reklámozó" esettől (lásd a kivezetett presence-heatmap tanulságát).
CREATE TABLE IF NOT EXISTS quiz_daily_stats (
  country TEXT NOT NULL,        -- CH | AT | DE | NL
  day TEXT NOT NULL,            -- YYYY-MM-DD (szerver, UTC date('now'))
  score INTEGER NOT NULL,       -- 0..3 (napi 3 kérdés helyes válaszai)
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (country, day, score)
);

-- A heti lekérdezés ország + nap-tartományra szűr → fedő index.
CREATE INDEX IF NOT EXISTS idx_quiz_daily_stats_country_day ON quiz_daily_stats(country, day);
