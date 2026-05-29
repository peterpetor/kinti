-- ===========================================================================
-- 0037_border_reports — Waze-szerű közösségi határátkelő-jelentések.
--
-- A felhasználók jelezhetik az aktuális ellenőrzési intenzitást vagy a
-- forgalmi helyzetet a CH-DE / CH-AT / CH-IT / CH-FR átkelőkön.
--
-- TTL: 4 óra alapból (rövid lejárat — egy ellenőrzés általában elmúlik).
-- ===========================================================================

CREATE TABLE IF NOT EXISTS border_reports (
  id              TEXT PRIMARY KEY,
  /** Hivatkozás a border-crossings.ts statikus listára (pl. "thayngen"). */
  crossing_id     TEXT NOT NULL,
  /** "strict" / "moderate" / "easy" / "closed" / "traffic". */
  status          TEXT NOT NULL,
  /** Szabad-szöveges megjegyzés (opcionális). */
  note            TEXT,
  /** Anti-spam: SHA-256(IP). */
  ip_hash         TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_border_reports_crossing ON border_reports(crossing_id);
CREATE INDEX IF NOT EXISTS idx_border_reports_expires ON border_reports(expires_at);
