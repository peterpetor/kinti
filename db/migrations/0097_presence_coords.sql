-- 0097 — precíz jelenlét: a presence_pings kap lat/lng oszlopot, hogy NE csak a ~12
-- kurált nagyvárost lehessen feltenni, hanem bármely települést (pl. Grossarl) a saját
-- koordinátáján. A régi sorok lat/lng = NULL (a térkép a város-névhez tartozó kurált
-- koordinátára esik vissza). A `city` továbbra is a megjelenített hely neve. Lásd 0091/0092.
ALTER TABLE presence_pings ADD COLUMN lat REAL;
ALTER TABLE presence_pings ADD COLUMN lng REAL;
