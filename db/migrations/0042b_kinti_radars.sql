-- ===========================================================================
-- 0042_kinti_radars  —  Univerzális Push Értesítés Radarok.
--
-- A felhasználó beállíthat különböző "Radarokat" (pl. új albérlet,
-- telekocsi, árfolyam). Ezeket a backend figyeli és push értesítést küld,
-- ha egyezés van.
--
-- PII-mentes: a push_endpoint az egyetlen "azonosító".
-- ===========================================================================

CREATE TABLE IF NOT EXISTS kinti_radars (
  id              TEXT    PRIMARY KEY,
  push_endpoint   TEXT    NOT NULL,            -- ⇒ push_subscriptions.endpoint
  radar_type      TEXT    NOT NULL,            -- 'exchange_rate', 'alberlet', 'telekocsi'
  parameters      TEXT    NOT NULL,            -- JSON (pl. {"canton": "ZH"}, {"threshold": 410, "direction": "above"})
  active          INTEGER NOT NULL DEFAULT 1,
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  last_fired_at   TEXT
);

CREATE INDEX IF NOT EXISTS idx_kinti_radars_endpoint
  ON kinti_radars (push_endpoint);

CREATE INDEX IF NOT EXISTS idx_kinti_radars_type_active
  ON kinti_radars (radar_type, active);
