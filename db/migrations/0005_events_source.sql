-- ===========================================================================
-- 0005_events_source  —  külső iCal-források követhetősége az events táblán.
--
-- A kinti-cron-events-sync Worker különböző svájci magyar szervezetek Google
-- Calendar / iCal feed-jét húzza naponta. Hogy az újrasync ne duplázzon, és
-- a TÖRÖLT eseményeket is takarítani tudjuk: minden feedhez egy stabil
-- forrás-azonosító tartozik (SHA-256 prefix), és ezt tároljuk a sorral.
--
-- A kézzel/seed-elt események `source IS NULL` — érintetlenek maradnak a
-- szinkron során. A szinkronizált sorok `source = 'ical:<hash>'` formátumúak;
-- a Worker indulása elején DELETE-eli az adott forrás összes sorát, majd újra
-- beszúr — így a forrásban TÖRÖLT esemény tényleg eltűnik.
-- ===========================================================================

ALTER TABLE events ADD COLUMN source TEXT;
CREATE INDEX idx_events_source ON events(source);
