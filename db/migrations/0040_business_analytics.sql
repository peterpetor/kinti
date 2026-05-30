-- ===========================================================================
-- 0040_business_analytics  —  Vállalkozói analitika (profil-megtekintés +
-- telefon-kattintás számláló).
--
-- A `businesses` táblán két aggregate-számláló (összes idejű); a részletesebb
-- napi bontás külön táblán, hogy "elmúlt 7 nap" / "elmúlt 30 nap" jellegű
-- statisztikát is lehessen mutatni a vállalkozónak. Egy IP-hash-t óránként
-- csak 1× számolunk be (dedupe-tábla), hogy ne lehessen pumpálni a számot.
--
-- PII-szabály:
--   • a vállalkozó ANONIM számokat lát ("142 megtekintés"), NEM IP-listát.
--   • az ip_hash csak rövid TTL-lel létezik (dedupe-célra), a `purge` cron
--     törli a >7 napos rekordokat.
--
-- A statisztikai tracking-end-point csendben hibázik (best-effort), tehát
-- ha valami fail-el, a látogató tapasztalata nem változik.
-- ===========================================================================

-- 1) Összesített számlálók a businesses táblán
ALTER TABLE businesses ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE businesses ADD COLUMN phone_click_count INTEGER NOT NULL DEFAULT 0;

-- 2) Napi bontású aggregate (utolsó N nap statisztikához)
CREATE TABLE IF NOT EXISTS business_analytics_daily (
  business_id       TEXT    NOT NULL,
  day               TEXT    NOT NULL,        -- YYYY-MM-DD UTC
  view_count        INTEGER NOT NULL DEFAULT 0,
  phone_click_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (business_id, day),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_analytics_daily_business_day
  ON business_analytics_daily (business_id, day DESC);

-- 3) Dedupe-tábla — egy IP-hash óránként 1× számít be egy adott business + kind-ra.
CREATE TABLE IF NOT EXISTS business_analytics_dedupe (
  business_id TEXT NOT NULL,
  kind        TEXT NOT NULL,                  -- 'view' | 'phone'
  ip_hash     TEXT NOT NULL,                  -- SHA-256(IP)
  hour_bucket TEXT NOT NULL,                  -- YYYY-MM-DDTHH UTC
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (business_id, kind, ip_hash, hour_bucket)
);

CREATE INDEX IF NOT EXISTS idx_analytics_dedupe_created
  ON business_analytics_dedupe (created_at);
