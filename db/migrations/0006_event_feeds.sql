-- ===========================================================================
-- 0006_event_feeds  —  iCal-feed lista a D1-ben (admin által kezelhető).
--
-- Eddig a `kinti-cron-events-sync` Worker a `FEED_URLS` env-változót olvasta.
-- Ezután a worker EZT a táblát olvassa, az `/admin/feeds` oldalon pedig admin
-- felhasználó hozzáadhat / kikapcsolhat / törölhet forrásokat anélkül, hogy
-- újra-deploy kéne. A `last_synced_at` + `last_error` + `events_count`
-- visszaírja az utolsó futás eredményét, így a felületen látható, hogy az
-- adott feed él-e.
--
-- A `source_id` ugyanaz az `ical:<sha256-prefix>` mint amit az `events.source`
-- mező használ → 1:1 hozzárendelés feedről eseményekre.
-- ===========================================================================

CREATE TABLE event_feeds (
  id              TEXT PRIMARY KEY,
  url             TEXT NOT NULL UNIQUE,
  label           TEXT,                          -- pl. "Magyar Egyesület Zürich"
  enabled         INTEGER NOT NULL DEFAULT 1,
  source_id       TEXT NOT NULL UNIQUE,          -- ical:<hash> — összeköti az events.source-szal
  last_synced_at  TEXT,                          -- ISO datetime
  last_error      TEXT,
  events_count    INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_event_feeds_enabled ON event_feeds(enabled);
