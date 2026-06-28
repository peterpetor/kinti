-- 0101 — „Magyar bolt a sarkon": magyar élelmiszer-helyek közösségi térképe.
-- A hofladen_spots tábla a megszűnt Hofladen-modullal együtt eltűnt a prod D1-ről
-- (csak svájci farmer-bolt seedek voltak benne, nem valós user-adat) → ÚJRA létrehozzuk
-- a magyar-bolt sémával. Modell: AZONNALI megjelenés (hidden=0) + anti-abuse a
-- beküldéskor + közösségi jelentés (reports_count ≥ 3 → auto-hide). manage_token a saját
-- poszt szerkesztéséhez. Ország-tudatos (country_code), egy fő kategória.
DROP TABLE IF EXISTS hofladen_spots;

CREATE TABLE hofladen_spots (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  category        TEXT,                       -- pekseg | hentes | bolt | etterem | cukraszda | piac
  location_name   TEXT,
  lat             REAL NOT NULL,
  lng             REAL NOT NULL,
  country_code    TEXT NOT NULL DEFAULT 'CH',
  canton_code     TEXT,
  categories      TEXT NOT NULL DEFAULT '[]', -- (legacy oszlop, nem használt)
  payment_methods TEXT NOT NULL DEFAULT '[]', -- (legacy oszlop, nem használt)
  open_24h        INTEGER NOT NULL DEFAULT 0,
  open_text       TEXT,
  note            TEXT,
  manage_token    TEXT,
  ip_hash         TEXT,
  reports_count   INTEGER NOT NULL DEFAULT 0,
  hidden          INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_hofladen_country ON hofladen_spots(country_code, hidden);
CREATE INDEX IF NOT EXISTS idx_hofladen_iphash ON hofladen_spots(ip_hash, created_at);
