-- ===========================================================================
-- 0049_moderation_strikes — Auto-ban (Three strikes) rendszer naplója
--
-- Naplózza, hányszor próbált egy IP-cím trágár, rasszista vagy NSFW
-- tartalmat beküldeni. Ha egy bizonyos időablakon belül (pl. 1 óra) eléri
-- a limitet (pl. 3), a rendszer automatikusan beteszi az IP-hash-t a
-- blocklist táblába.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS moderation_strikes (
  id          TEXT    PRIMARY KEY,
  ip_hash     TEXT    NOT NULL,
  reason      TEXT    NOT NULL,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_mod_strikes_lookup
  ON moderation_strikes (ip_hash, created_at);
