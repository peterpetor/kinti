-- ===========================================================================
-- 0017_rides — Telekocsi (Ride-sharing) modul különálló táblája
-- ===========================================================================

CREATE TABLE rides (
  id               TEXT PRIMARY KEY,
  departure_city   TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  departure_time   TEXT NOT NULL,               -- ISO 8601 (pl. 2026-06-20T14:00:00Z)
  lat              REAL NOT NULL,               -- indulási pont koordinátája a térképhez
  lng              REAL NOT NULL,
  seats            INTEGER NOT NULL DEFAULT 1,  -- szabad helyek száma
  price_text       TEXT,                        -- pl. "40 CHF" vagy "Megegyezés szerint"
  poster_name      TEXT NOT NULL,               -- a hirdető neve
  poster_user_id   TEXT,                        -- Clerk user_id (opcionális)
  contact_phone    TEXT NOT NULL,               -- WhatsApp / Tel. híváshoz (pl. +417...)
  notes            TEXT,                        -- egyéb megjegyzés (pl. "2 macskával jövök")
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at       TEXT NOT NULL                -- ez alapján fogja a Cron Job törölni!
);

-- Index a térképes lekérdezésekhez (Bounding box alapú kereséshez)
CREATE INDEX idx_rides_latlng ON rides(lat, lng);

-- Index a lejárati időhöz a gyors Cron Job törléshez
CREATE INDEX idx_rides_expires_at ON rides(expires_at);
