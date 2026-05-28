-- ===========================================================================
-- 0028_ride_ratings — Telekocsi kölcsönös értékelési rendszer
-- ===========================================================================

-- Végleges, megerősített értékelések (implicit profilok a telefonszám alapján)
CREATE TABLE ride_ratings (
  id TEXT PRIMARY KEY,
  target_phone TEXT NOT NULL,
  reviewer_email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(target_phone, reviewer_email)
);

-- Email megerősítésre váró értékelés piszkozatok
CREATE TABLE ride_rating_drafts (
  id TEXT PRIMARY KEY,
  target_phone TEXT NOT NULL,
  reviewer_email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  confirm_token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_ride_ratings_target ON ride_ratings(target_phone);
