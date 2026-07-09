-- 0123 — „Feature bloat" leépítés: a kivezetett modulok tábláinak eldobása.
--
-- Kivezetett funkciók: Közösség/Események, Telekocsi (rides), Akciók (deals),
-- Árfolyam-riasztás (exchange_rate_alerts), Hofladen/termelői piac, Presence/GPS.
-- Megmarad: Szaknévsor, Állások, B2B (munkáltató/közvetítés), Kvíz, Iránytű,
-- Keresek, Ranglista (leaderboard!), Meghívó (referral).
--
-- Mind DROP TABLE IF EXISTS (idempotens; a nem létező táblákra no-op). A gyerek-
-- táblákat (FK) a szülő ELŐTT dobjuk. Egyetlen FK a dobott halmazon belül van
-- (event_rsvps → events); MEGTARTOTT táblából NINCS FK ezekre, így biztonságos.

-- === Közösség & Események (event_rsvps → events FK: gyerek előbb) ===
DROP TABLE IF EXISTS event_rsvps;
DROP TABLE IF EXISTS event_reminders;
DROP TABLE IF EXISTS event_feeds;
DROP TABLE IF EXISTS event_submit_log;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS spontaneous_meetups;

-- === Telekocsi (rides) — a UI rég nincs, csak árva táblák maradtak ===
DROP TABLE IF EXISTS ride_ratings;
DROP TABLE IF EXISTS ride_rating_drafts;
DROP TABLE IF EXISTS ride_submit_log;
DROP TABLE IF EXISTS ride_waypoints;
DROP TABLE IF EXISTS ride_requests;
DROP TABLE IF EXISTS rides_packages;
DROP TABLE IF EXISTS ride_rate_limit;
DROP TABLE IF EXISTS ride_whatsapp;
DROP TABLE IF EXISTS rides;

-- === Akciók a térképen (deals) ===
DROP TABLE IF EXISTS deal_reports;

-- === Árfolyam-riasztás (a KintiRadar exchange_rate a kinti_radars-ban él, azt
--     NEM bántjuk — a job_alert radart használja; itt csak a régi árva tábla) ===
DROP TABLE IF EXISTS exchange_rate_alerts;

-- === Hofladen / termelői piac (2026-07-01 óta árva) ===
DROP TABLE IF EXISTS hofladen_spots;

-- === Presence / GPS (a presence_pings-t a 0114 már eldobta — IF EXISTS = no-op) ===
DROP TABLE IF EXISTS presence_pings;
