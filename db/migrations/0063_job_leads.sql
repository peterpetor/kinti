-- ===========================================================================
-- 0063_job_leads — Gyorsított Jelentkezési Profil (Kinti Talent)
-- ===========================================================================

CREATE TABLE job_leads (
  id               TEXT PRIMARY KEY,
  user_id          TEXT,                        -- Opcionális (Clerk ID)
  first_name       TEXT NOT NULL,
  last_name        TEXT NOT NULL,
  email            TEXT NOT NULL,
  phone            TEXT NOT NULL,
  
  -- Szakmai adatok
  profession       TEXT NOT NULL,               -- Pl. "Asztalos", "Felszolgáló"
  german_level     TEXT NOT NULL,               -- "Nincs", "A1", "A2", "B1", "B2", "C1+"
  driving_license  INTEGER NOT NULL DEFAULT 0,  -- 1 ha van B kategóriás jogsija
  has_car          INTEGER NOT NULL DEFAULT 0,  -- 1 ha van saját autója Svájcban/hozható
  
  -- Svájci adatok
  is_in_switzerland INTEGER NOT NULL DEFAULT 0, -- 1 ha már Svájcban van
  permit_type      TEXT,                        -- "Nincs", "L", "B", "C", "G"
  target_canton    TEXT,                        -- Pl. "AG", "ZH", vagy "Bárhol"
  available_from   TEXT,                        -- Pl. "Azonnal", "1 hónap múlva"
  
  notes            TEXT,                        -- Egyéb megjegyzés a jelölttől
  
  status           TEXT NOT NULL DEFAULT 'new', -- 'new', 'contacted', 'placed', 'rejected'
  
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_job_leads_status ON job_leads(status);
CREATE INDEX idx_job_leads_created_at ON job_leads(created_at);
