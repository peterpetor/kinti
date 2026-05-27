-- ===========================================================================
-- 0018_sos_alerts — Közösségi S.O.S. Radar
-- ===========================================================================

CREATE TABLE sos_alerts (
  id               TEXT PRIMARY KEY,
  lat              REAL NOT NULL,               -- GPS koordináta (ahol a baj van)
  lng              REAL NOT NULL,
  description      TEXT NOT NULL,               -- Mi a probléma? (pl. Lerobbant autó)
  contact_phone    TEXT NOT NULL,               -- Gyors kapcsolatfelvétel
  poster_user_id   TEXT NOT NULL,               -- Clerk user_id (kötelező a visszaélések miatt)
  resolved         INTEGER NOT NULL DEFAULT 0,  -- 0 = aktív, 1 = megoldva (hogy a user lezárhassa)
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at       TEXT NOT NULL                -- Gyors lejárat (pl. +3 óra)
);

-- Index a térképes kereséshez
CREATE INDEX idx_sos_latlng ON sos_alerts(lat, lng);

-- Index a lejárt és aktív szűréshez
CREATE INDEX idx_sos_expires_at ON sos_alerts(expires_at);
CREATE INDEX idx_sos_resolved ON sos_alerts(resolved);
