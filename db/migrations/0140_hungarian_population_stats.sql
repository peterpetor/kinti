-- 0140 — Hivatalos népességstatisztika (magyar állampolgárok/nemzetiség régiónként).
--
-- Négy hivatalos statisztikai hivatal nyílt adatából (BFS Svájc, Statistik
-- Austria, CBS Hollandia, Destatis Németország — utóbbi később, API-hozzáférés
-- függvényében) — NEM az app saját (vékony) használati adatából, ellentétben a
-- korábban kivezetett presence-heatmap-pel (ld. [[presence-heatmap]] memória:
-- az ürességet reklámozta). Itt a szám MINDIG hivatalos forrásból való, akkor
-- is, ha egy régióban 0 vagy nagyon kevés — ez nem app-hiányosság, hanem tény.
--
-- A `region_level` országonként eltérő valódi közigazgatási szintet jelöl
-- (CH: kanton, AT: Bundesland, NL: provincie/gemeente, DE: Kreis majd) — a
-- kliens ennek megfelelően címkézi ("kanton", "tartomány" stb.).
CREATE TABLE hungarian_population_stats (
  id TEXT PRIMARY KEY,
  country_code TEXT NOT NULL,       -- CH / AT / DE / NL
  region_code TEXT NOT NULL,        -- ország-specifikus hivatalos régiókód
  region_name TEXT NOT NULL,
  region_level TEXT NOT NULL,       -- 'canton' | 'bundesland' | 'provincie' | 'gemeente' | 'kreis'
  hungarian_count INTEGER NOT NULL,
  year INTEGER NOT NULL,
  source TEXT NOT NULL,             -- pl. 'BFS STATPOP', 'Statistik Austria', 'CBS StatLine'
  source_url TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(country_code, region_code, year)
);

CREATE INDEX idx_hun_pop_country ON hungarian_population_stats(country_code);
CREATE INDEX idx_hun_pop_country_year ON hungarian_population_stats(country_code, year);
