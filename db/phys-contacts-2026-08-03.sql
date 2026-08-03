-- Fizikai üzletek elérhetőség-pótlása + 1 bezárt étterem — 2026-08-03
--
-- 59 kontakt nélküli FIZIKAI üzlet (étterem, bolt, fodrász, autószerelő,
-- kozmetika) Maps-lekérdezése, majd KÉT független szűrő
-- (`scripts/match-physical-contacts.mjs`): a CÍMNEK és a NÉVNEK is egyeznie kell.
-- Eredmény: 10 telefon + 1 véglegesen bezárt tétel.
--
-- ⚠️⚠️ A SZŰRŐM HÁROM HIBÁJA, amit ez a kör hozott elő — mindhárom ÉLES ADATOT
-- rontott volna el:
--
--  1. UGYANAZ AZ UTCANÉV MÁSIK VÁROSBAN. A „Magyar etterem Gernrode"
--     (Quedlinburger Straße 7, **06507 Gernrode**) keresésére a Maps a
--     „Quedlinburger Str. 7, **06485 Quedlinburg**"-i Csardát adta — BEZÁRTKÉNT.
--     Azonos utcanév, azonos házszám, MÁS település. Irányítószám-ellenőrzés
--     nélkül egy ÉLŐ éttermet rejtettem volna el.
--     → a cím-egyeztető mostantól KÖTELEZŐEN egyező irányítószámot vár, ha
--       mindkét címben van.
--
--  2. A SZAKMA-SZÓ NEM AZONOSÍTÓ. A „Happy Face Killer – Tattoo & **Barber**"
--     és a „Bandido **Barber** Shop Horb" egyezőnek látszott — pusztán a közös
--     szakmanévtől. A szakmanév épp azért közös, mert ugyanabba a kategóriába
--     soroltuk őket. → szakma-szavak a zaj-listára.
--
--  3. A VÁROSNÉV SEM AZONOSÍTÓ. Ugyanez a pár a „**Horb**" szón is egyezett,
--     ami a VÁROS neve. → ami a CÍMBEN is szerepel, az helynév, nem cégnév-jel;
--       a név-egyeztető ezeket most kizárja.
--
-- ⚠️ KÉZI DÖNTÉSRE FÉLRETÉVE (csak a cím egyezik, a név nem — nem írjuk be):
--   • Bánfai Erika → „Beauty am Hof" (1010 Wien) — a saját domainje a mai
--     link-auditban HALOTT volt; lehet átnevezés, lehet új bérlő.
--   • Happy Face Killer → „Bandido Barber Shop" (Horb) — a happyfacekiller.de
--     viszont ÉL (200), tehát ellentmondás van; nem döntök helyette.
--   • Anyu Büfé → „Jumbo" — a Jumbo HOLLAND SZUPERMARKET-LÁNC. Tankönyvi
--     helyszín-csapda, elutasítva.
--   • Budapest Food Store → „Duna Market" — ugyanaz az üzlet (ma már tisztázva),
--     de a Mapsen sincs telefonja; nincs mit beírni.
--
-- ⚠️ A telefon TAGOLÁSÁT a forrásból vesszük át, csak a vezető 0-t cseréljük
-- országhívóra: a saját „3 jegy + maradék" csoportosításom a bécsi VEZETÉKESBŐL
-- (01 9613401) hibás +43 196 13401-et csinált a helyes +43 1 9613401 helyett.

UPDATE businesses SET phone = '+43 650 4880821', updated_at = datetime('now')
  WHERE id = 'at-imp-budapest-bagel-wien' AND phone IS NULL;  -- Budapest Bagel Wien [AT]
UPDATE businesses SET phone = '+43 1 9613401', updated_at = datetime('now')
  WHERE id = 'osmbiz2-at-nachbarn' AND phone IS NULL;  -- Nachbarn [AT]
UPDATE businesses SET phone = '+49 1525 7003102', updated_at = datetime('now')
  WHERE id = 'osmbiz3-de-ungarische-delikatessen' AND phone IS NULL;  -- Ungarische Delikatessen [DE]
UPDATE businesses SET phone = '+49 171 9190727', updated_at = datetime('now')
  WHERE id = 'biz2-de-ungarische-speisekammer' AND phone IS NULL;  -- Ungarische Speisekammer [DE]
UPDATE businesses SET phone = '+49 172 7286352', updated_at = datetime('now')
  WHERE id = 'de-biz3-fuchs-und-huhn' AND phone IS NULL;  -- Fuchs und Huhn [DE]
UPDATE businesses SET phone = '+49 162 7758518', updated_at = datetime('now')
  WHERE id = 'de-biz3-scharfer-kessel' AND phone IS NULL;  -- Scharfer Kessel [DE]
UPDATE businesses SET phone = '+49 38302 3716', updated_at = datetime('now')
  WHERE id = 'de-biz3-ungarisches-restaurant-puszta' AND phone IS NULL;  -- Ungarisches Restaurant Puszta [DE]
UPDATE businesses SET phone = '+49 3337 450934', updated_at = datetime('now')
  WHERE id = 'de-biz3-restaurant-bellevue' AND phone IS NULL;  -- Restaurant Bellevue [DE]
UPDATE businesses SET phone = '+44 1223 857331', updated_at = datetime('now')
  WHERE id = 'gb-taste-from-hungary-magyar-bolt' AND phone IS NULL;  -- Taste From Hungary Magyar Bolt [GB]
UPDATE businesses SET phone = '+31 10 840 7005', updated_at = datetime('now')
  WHERE id = 'nl-imp-vintage-beauty-nature-cosmetics' AND phone IS NULL;  -- Vintage Beauty Nature Cosmetics [NL]

---------------------------------------------------- VÉGLEGESEN BEZÁRT
UPDATE businesses SET hidden = 1, updated_at = datetime('now') WHERE id = 'de-ir-ungarische-gourmet-kuche-gulyas-csarda';  -- Ungarische Gourmet Küche – Gulyás Csárda
