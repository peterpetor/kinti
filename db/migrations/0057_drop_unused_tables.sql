-- db/migrations/0057_drop_unused_tables.sql
-- Tech debt cleanup: eltávolítjuk azokat a táblákat, amelyekre már nincs UI/API.
-- A feature-ök (Hofladen térkép, határátkelési riportok) el lettek távolítva.
-- A táblák üresek (csak seed-adatot tartalmaznak), így nincs adat-veszteség.

-- Hofladen termelői pontok (0039_hofladen_spots.sql) — feature eltávolítva
DROP TABLE IF EXISTS hofladen_spots;

-- Határátkelési riportok (0037_border_reports.sql) — feature eltávolítva
DROP TABLE IF EXISTS border_reports;
