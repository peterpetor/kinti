-- 0142_external_jobs_dedupe_key.sql
--
-- ⚠️ ÉLESBEN MÉRT HIBA JAVÍTÁSA. Az `external_jobs` ütközés-kulcsa a teljes
-- `source_url` volt, csakhogy az Adzuna és a Jooble KÉRÉSENKÉNT ÚJ követő-
-- paramétereket ad ugyanarra az állásra (`elckey`, `se`, `v`). Emiatt az
-- `ON CONFLICT(source_url)` SOHA nem sült el, és minden szinkron-futás ÚJRA
-- beszúrta ugyanazt a hirdetést.
--
-- Mérés 2026-07-31 (7227 sor):
--   adzuna   5695 sor / 5695 egyedi URL / 2942 egyedi útvonal  → 48% fölösleg
--   jooble   1025 sor / 1025 egyedi URL /  289 egyedi útvonal  → 72% fölösleg
--   job-room  507 sor /  507 egyedi URL /  507 egyedi útvonal  → tiszta
-- A job-room közvetlen munkáltatói URL-t ad query string nélkül — ez erősíti
-- meg, hogy a query a változékony rész, az útvonal a stabil azonosító.
--
-- ⚠️ BIZTONSÁGI ELLENŐRZÉS a kulcs bevezetése előtt: az útvonal FINOMABB
-- bontású, mint a cím+cég páros (Adzuna 2942 > 1776), tehát a dedup NEM olvaszt
-- össze különböző állásokat, csak ugyanannak a hirdetésnek a követő-változatait.
--
-- ⚠️ A LÉPÉSEK SORRENDJE KÖTELEZŐ: a UNIQUE index CSAK a meglévő duplikátumok
-- kitakarítása UTÁN hozható létre, különben a migráció megáll.

-- 1) Új oszlop (additív — a régi kód NULL-lal ír, amit a UNIQUE index megenged,
--    tehát a migráció és a deploy közötti ablakban sem hasal el semmi).
ALTER TABLE external_jobs ADD COLUMN dedupe_key TEXT;

-- 2) Visszatöltés a meglévő sorokra: hosztnév + útvonal, query string nélkül.
--    SQLite-ban nincs URL-parser, ezért LÉPÉSENKÉNT, egyszerű string-műveletekkel
--    (nem korrelált CTE-vel — az törékeny lenne). A végeredménynek KARAKTERRE
--    egyeznie kell a JS-oldali `externalJobDedupeKey`-jel, különben a backfillelt
--    sor nem találkozna a következő szinkron beszúrásával.

-- 2a) Séma és `www.` előtag levágása.
UPDATE external_jobs SET dedupe_key =
  CASE
    WHEN source_url LIKE 'https://www.%' THEN substr(source_url, 13)
    WHEN source_url LIKE 'http://www.%'  THEN substr(source_url, 12)
    WHEN source_url LIKE 'https://%'     THEN substr(source_url, 9)
    WHEN source_url LIKE 'http://%'      THEN substr(source_url, 8)
    ELSE source_url
  END;

-- 2b) Query string levágása (ez a változékony rész: elckey / se / v / utm_*).
UPDATE external_jobs SET dedupe_key = substr(dedupe_key, 1, instr(dedupe_key, '?') - 1)
 WHERE instr(dedupe_key, '?') > 0;

-- 2c) Fragment levágása.
UPDATE external_jobs SET dedupe_key = substr(dedupe_key, 1, instr(dedupe_key, '#') - 1)
 WHERE instr(dedupe_key, '#') > 0;

-- 2d) Kisbetűsítés, majd a záró `/` levágása (a sorrend számít: a `LIKE '%/'`
--     a már kisbetűs értéken fut).
UPDATE external_jobs SET dedupe_key = lower(dedupe_key);
UPDATE external_jobs SET dedupe_key = substr(dedupe_key, 1, length(dedupe_key) - 1)
 WHERE dedupe_key LIKE '%/';

-- 3) Duplikátumok kitakarítása: kulcsonként a LEGFRISSEBBEN látott sor marad.
--    (Döntetlennél a rowid dönt, hogy determinisztikus legyen.)
DELETE FROM external_jobs
 WHERE rowid NOT IN (
   SELECT rowid FROM (
     SELECT rowid,
            ROW_NUMBER() OVER (PARTITION BY dedupe_key ORDER BY fetched_at DESC, rowid DESC) AS rn
       FROM external_jobs
   ) WHERE rn = 1
 );

-- 4) Mostantól EZ az ütközés-kulcs.
CREATE UNIQUE INDEX IF NOT EXISTS idx_extjobs_dedupe_key ON external_jobs(dedupe_key);
