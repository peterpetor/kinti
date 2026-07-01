-- 0112 — GDPR hozzájárulás-napló (demonstrálhatóság, 7. cikk (1)).
-- A device-szintű jogi kapu elfogadását szerver-oldalon is rögzítjük, hogy a
-- hozzájárulás BIZONYÍTHATÓ legyen (mikor, milyen VERZIÓT, mit fogadott el).
-- Privacy-tiszta: NINCS IP/PII — csak egy kliens-generált, véletlen `consent_id`
-- (eszköz-szintű, nem tracking-cél), a verzió, a három jelölőnégyzet, és az idő.
CREATE TABLE IF NOT EXISTS consent_log (
  id         TEXT PRIMARY KEY,
  consent_id TEXT NOT NULL,               -- kliens-generált véletlen azonosító (nem PII)
  version    TEXT NOT NULL,               -- a jogi feltételek verziója (mihez járult hozzá)
  age18      INTEGER NOT NULL DEFAULT 0,  -- 18+ nyilatkozat
  aszf       INTEGER NOT NULL DEFAULT 0,  -- ÁSZF elfogadva
  privacy    INTEGER NOT NULL DEFAULT 0,  -- Adatkezelési Tájékoztató elfogadva
  country    TEXT,                        -- választott ország (joghatóság), opcionális
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_consent_cid ON consent_log (consent_id);
CREATE INDEX IF NOT EXISTS idx_consent_created ON consent_log (created_at);
