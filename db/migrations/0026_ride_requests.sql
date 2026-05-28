-- ===========================================================================
-- 0026_ride_requests — Fuvart Keresek funkció.
--
-- A "rides" táblát bővítjük egy is_request oszloppal.
-- Ha 1, akkor a felhasználó fuvart KERES (utas), nem pedig kínál (sofőr).
-- ===========================================================================

ALTER TABLE rides ADD COLUMN is_request INTEGER NOT NULL DEFAULT 0;
