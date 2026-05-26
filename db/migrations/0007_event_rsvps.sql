-- ===========================================================================
-- 0007_event_rsvps  —  „Megyek" szavazás eseményekre (IP-alapú dedupe).
--
-- Tervezés:
--   • Account NÉLKÜLI szavazás (akár a hirdetésposztoláshoz hasonlóan)
--   • 1 IP = 1 RSVP / esemény → ip_hash + event_id az összetett PK
--   • Nyers IP-t NEM tárolunk (GDPR adatminimalizálási elv): SHA-256(IP)
--   • Az `events.going` mező marad „base count" (seedelt szám); a tényleges
--     RSVP-k EFFEL HOZZÁADÓDNAK megjelenítéskor → felhasználó EGY összesített
--     számot lát (pl. „187 fő megy" + új szavazatok).
--
-- ON DELETE CASCADE: ha az eseményt törlik, a rá leadott RSVP-k is mennek.
-- ===========================================================================

CREATE TABLE event_rsvps (
  event_id   TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ip_hash    TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (event_id, ip_hash)
);
CREATE INDEX idx_event_rsvps_event ON event_rsvps(event_id);
