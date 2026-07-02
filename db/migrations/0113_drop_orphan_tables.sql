-- 0113 — árva táblák ejtése (tech debt takarítás, 2026-07-03).
--
-- Mindkét tábla egy MEGSZŰNT funkcióé, kód/API már nem hivatkozik rájuk:
--  * spontaneous_meetups (0036) — a Spontán találkozók modul rég eltávolítva;
--    a tábla ÜRES (0 sor, remote-on ellenőrizve).
--  * hofladen_spots (0039→0057-ben ejtve→0101-ben újra létrehozva a „Magyar
--    bolt a sarkon" sémával) — a magyar-bolt funkció 2026-07-01-én megszűnt;
--    a táblában CSAK seed-adat volt (16 sor, mind ip_hash='seed-bolt*', 0 user-sor).
--
-- Az events tábla `bolt` tagje FÜGGETLEN ettől, az él tovább.

DROP TABLE IF EXISTS spontaneous_meetups;
DROP TABLE IF EXISTS hofladen_spots;
