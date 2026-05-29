-- ===========================================================================
-- 0036_spontaneous_meetups — Mikro-események / túratárs-keresés modul.
--
-- A felhasználók 24-48 órás "spontán" találkozókat dobhatnak fel (pl.
-- "Szombat délelőtt bringázás a tó körül, 2 embert még várunk"). Ez NEM a
-- nagyobb, szervezett események modulja (events tábla), hanem egy
-- spontán-csatorna a barátkozáshoz / közös szabadidős aktivitásokhoz.
--
-- Kontakt: zéró-relay — a feladó telefonszáma vagy WA-ja jelenik meg.
-- TTL: alapból 24h, max 48h.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS spontaneous_meetups (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  /** Szabad-szöveges helymegjelölés (pl. "Zürich-tó, Bürkliplatz"). */
  location_name   TEXT NOT NULL,
  /** Geokódolt koordináta — opcionális, fallback a kanton közepe. */
  lat             REAL,
  lng             REAL,
  canton_code     TEXT,
  /** Mikor (ISO datetime). */
  meetup_time     TEXT NOT NULL,
  /** Hány embert vár még (1-10). */
  max_people      INTEGER NOT NULL DEFAULT 1,
  contact_phone   TEXT NOT NULL,
  contact_whatsapp TEXT,
  /** Megjelenő név vagy üres → auto-handle. */
  poster          TEXT,
  notes           TEXT,
  manage_token    TEXT NOT NULL UNIQUE,
  /** SHA-256(IP) — anti-spam, NEM nyers IP. */
  ip_hash         TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  /** Lejárati idő (max 48h, alapból 24h). */
  expires_at      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_spontaneous_meetups_expires ON spontaneous_meetups(expires_at);
CREATE INDEX IF NOT EXISTS idx_spontaneous_meetups_canton ON spontaneous_meetups(canton_code);
CREATE INDEX IF NOT EXISTS idx_spontaneous_meetups_manage_token ON spontaneous_meetups(manage_token);
