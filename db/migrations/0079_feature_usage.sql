-- 0079 — napi funkció-/oldal-használat számláló (privacy-first termék-analitika).
--
-- CSAK aggregált darabszámok (nap + esemény) — NINCS per-user / IP / cookie adat,
-- így illik a "no server identity" elvhez. A kliens UsageTracker route-váltáskor
-- növeli a `page:<szegmens>` számlálót (sessionönként egyszer/esemény), a kulcs
-- konverziókat pedig `action:<nev>` események. Az admin fülön látszik, MELYIK
-- funkciót használják valójában — ez alapján lehet fókuszálni / vágni.
CREATE TABLE IF NOT EXISTS feature_usage_daily (
  day   TEXT    NOT NULL,            -- 'YYYY-MM-DD' (UTC)
  event TEXT    NOT NULL,            -- pl. 'page:szaknevsor', 'action:lead-submit'
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, event)
);
