-- 0122 — Blocklist auto-lejárat (TTL) + a redundáns scrape_blocklist elhagyása.
--
-- A honeypot-csapdába lépő IP-ket mostantól a MEGLÉVŐ, egységes `blocklist`
-- rendszerbe írjuk (admin-feloldó UI már van hozzá) — nem külön táblába. A kézi
-- admin-tiltás VÉGLEGES marad (expires_at = NULL), a honeypot auto-tiltása
-- viszont LEJÁR (pl. 7 nap), hogy egy megosztott IP mögötti valódi user ne
-- ragadjon örökre 403-ban (biztonsági szelep / false-positive önjavítás).
ALTER TABLE blocklist ADD COLUMN expires_at TEXT; -- NULL = végleges; dátum = auto-lejáró

-- A 0121-ben létrehozott külön scrape-tábla feleslegessé vált (egységesítve a
-- blocklist-re). Eldobjuk, hogy ne legyen két párhuzamos tiltólista.
DROP TABLE IF EXISTS scrape_blocklist;
