-- ===========================================================================
-- 0019_ride_waypoints — Közbeeső megállók a telekocsihoz (Oszkár-szintű UX).
--
-- JSON tömb: [{"city":"Győr","lat":47.68,"lng":17.63}, ...]
-- Nullable: ha nincs megálló, direkt járat.
-- ===========================================================================

ALTER TABLE rides ADD COLUMN waypoints TEXT;
