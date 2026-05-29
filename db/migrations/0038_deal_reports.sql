-- ===========================================================================
-- 0038_deal_reports — Svájci akció-térkép modul.
--
-- A felhasználók a boltban látott leárazásokat dobhatják fel a térképre
-- (Migros/Coop/Denner stb. + kategória + kedvezmény-%). NEM tárol képet,
-- nem küld push-értesítést — diszkrét, biztonságos.
--
-- TTL: aznap éjfélig (Europe/Zurich) — frissesség, nem stale adat.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS deal_reports (
  id            TEXT PRIMARY KEY,
  /** Bolt-lánc kulcsa (deals.ts STORES). */
  store_id      TEXT NOT NULL,
  /** Kategória kulcsa (deals.ts CATEGORIES). */
  category_id   TEXT NOT NULL,
  /** Kedvezmény százalék (20, 25, 30, 40, 50, 60, 75). */
  discount_pct  INTEGER NOT NULL,
  /** Geokódolt koordináta (kötelező — különben hol jelenik meg). */
  lat           REAL NOT NULL,
  lng           REAL NOT NULL,
  /** Opcionális szöveges helymegjelölés (a böngészőből vagy bolt-név). */
  location_name TEXT,
  /** Kanton (szűréshez). */
  canton_code   TEXT,
  /** Opcionális rövid megjegyzés (max 100 karakter). */
  note          TEXT,
  /** Anti-spam: SHA-256(IP). */
  ip_hash       TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  /** Aznap éjfél (CH-time) — lejár éjfélkor. */
  expires_at    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_deal_reports_expires ON deal_reports(expires_at);
CREATE INDEX IF NOT EXISTS idx_deal_reports_store ON deal_reports(store_id);
CREATE INDEX IF NOT EXISTS idx_deal_reports_canton ON deal_reports(canton_code);
