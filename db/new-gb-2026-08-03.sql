-- GB szaknévsor — 2026-08-03
--
-- Két forrásból: (1) célzott Maps-keresés magyar üzlettípus-szavakkal
-- (120 lekérdezés, 20 város × 6 szó → 567 találat → 31 magyar jelölt),
-- (2) a Kőrösi Csoma Sándor Program diaszpóra-partnerlistája + a HCHS
-- tanoda-CÍMLISTA (hchs.org.uk/cimlista-tanodak).
--
-- ⚠️ A 31 jelöltből 21-et EL KELLETT VETNI, négy KÜLÖNBÖZŐ okból — mindegyiket
-- külön ellenőrzés fogta meg, egyik sem derült volna ki a másikból:
--   1. VÉGLEGESEN BEZÁRT (7 db) — a Maps bezárás-jelzője fogta meg
--      (Magyar bolt food stop, Budapest Corner Shop, Hungarian Food Ltd,
--       Magyar Bolt Hungary-Qm, Heaven Langosh, Hungarian Grocery Store,
--       Polish-Hungarian Food Store)
--   2. ORSZÁG-SZIVÁRGÁS (3 db) — a cím országa NEM az Egyesült Királyság:
--      „Molnár's kürtőskalács" = Váci u., BUDAPEST (+36!);
--      „Goulash & Langosh Bar" = Duna u. (+36!);
--      „The Hungarian Butcher" = W Dublin-Granville Rd, OHIO (+1!)
--   3. MÁR BENT VOLT (10 db) — a korábbi GB-körök alaposak voltak
--   4. AZONOSÍTHATATLAN (1 db) — a Maps találati listát adott, nem helyet
--
-- ⚠️⚠️ A weboldal HTTP-státusza ÖNMAGÁBAN NEM BIZONYÍTÉK: a parkoltatott
-- domain (hugedomains/sedo) 200-at ad. Ezért minden tétel Maps-en IS ellenőrizve.
--
-- A koordináták Nominatimból valók, SOHA nem tippelve.

------------------------------------------------------------------ ÚJ TÉTELEK

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('gb-tekerch-chimney-cake-edinburgh', 'Tekerch — magyar kürtőskalács, Edinburgh', 'cukrasz', 'Cukrászda', 'The Pitt, 20 West Shore Road, Granton, Edinburgh EH5 1QD', '+44 7488 364135', 'Magyar kürtőskalács-elárusítóhely az edinburgh-i The Pitt street food piacon. · instagram.com/hungarian_chimneycake', '["Magyar","Angol"]', 55.983090, -3.242743, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-gb-org', 'GB', NULL)
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('gb-fokonzulatus-edinburgh', 'Magyarország Főkonzulátusa — Edinburgh', 'magyar-kozosseg', 'Magyar közösség', '25 Union Street, Edinburgh EH1 3LR', '+44 131 556 3838', 'Magyarország hivatásos főkonzulátusa Skóciában — konzuli ügyintézés. · edinburgh.mfa.gov.hu', '["Magyar","Angol"]', 55.958631, -3.186773, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-gb-org', 'GB', NULL)
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('gb-hetmerfoldes-edinburgh', 'Hétmérföldes Játszóház és Tanoda — Edinburgh', 'magyar-kozosseg', 'Magyar közösség', 'Juniper Green Village Hall, 1A Juniper Park Road, Juniper Green, Edinburgh EH14 5DX', NULL, 'Magyar játszóház és hétvégi tanoda skóciai magyar családoknak. · hetmerfoldes.co.uk', '["Magyar"]', 55.905118, -3.287908, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-gb-org', 'GB', NULL)
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('gb-euro-market-bolton', 'Euro Market Bolton — magyar és európai élelmiszer', 'elelmiszer', 'Élelmiszerbolt', '292 Chorley Old Road, Bolton BL1 4JU', NULL, 'Magyar, lengyel és közép-európai élelmiszer Boltonban.', '["Magyar","Angol"]', 53.586916, -2.452311, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-gb-org', 'GB', 'NW')
ON CONFLICT(id) DO NOTHING;

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('gb-kurtoskalacs-langos-doncaster', 'Kürtőskalács & Lángos — Doncaster Market', 'cukrasz', 'Cukrászda', 'Neil''s Cheese Board, Market Place, Doncaster DN1 1NF', NULL, 'Magyar kürtőskalács és lángos a doncasteri piaccsarnokban.', '["Magyar","Angol"]', 53.524086, -1.132097, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-gb-org', 'GB', 'YH')
ON CONFLICT(id) DO NOTHING;

------------------------------------------------------------ DUPLIKÁTUM-ZÁRÁS
-- „Budapest Cafe Bristol" (seed, 2026-07-31-én ellenőrizve) és
-- „Budapest Cafe — Bristol" (csv-import) UGYANAZ: 58 Alma Vale Road, azonos
-- telefon. A csv-importos példányt rejtjük — hidden=1, SOHA nem DELETE.
UPDATE businesses SET hidden = 1, updated_at = datetime('now')
WHERE id = 'gb-imp-budapest-cafe-bristol';

---------------------------------------------------------- FRISSESSÉG-JAVÍTÁS
-- A Vagabonds Langos ELKÖLTÖZÖTT: a szaknévsorban 32 The Crescent (PE11 1AF)
-- szerepelt, a Maps szerint ma 2a Humber Drive (PE11 3WY). A telefon eddig
-- HIÁNYZOTT — ez egy zsákutcát is megszüntet.
-- ⚠️ A Maps által mutatott weboldalt (vagabondaslangos.co.uk) NEM írjuk be:
-- a tartomány nem oldódik fel (ENOTFOUND).
UPDATE businesses SET
  address = '2a Humber Drive, Spalding PE11 3WY',
  phone = '+44 7425 832117',
  lat = 52.789323, lng = -0.174569,
  updated_at = datetime('now')
WHERE id = 'gb-vagabonds-langos-taste-of-hungary-ltd';

-- Boltoni magyar bolt: a Maps ugyanazon a házszámon BL3 5DL-t ad (nálunk
-- BL3 5HL volt) és „Duna Market" néven is fut. Az irányítószámot javítjuk —
-- a rossz irányítószám a navigációt töri el. A nevet NEM írjuk át (nem
-- egyértelmű, melyik a mai cégér), de a blurbbe bekerül, hogy a kereső
-- mindkét néven megtalálja.
UPDATE businesses SET
  address = '132–134 Deane Road, Bolton BL3 5DL',
  blurb = 'Magyar és közép-európai élelmiszerbolt (Duna Market néven is) · Bolton',
  updated_at = datetime('now')
WHERE id = 'gb-budapest-food-store-magyar-bolt-bolton';

---------------------------------------------------- ELÉRHETŐSÉG-PÓTLÁS (HCHS)
-- Forrás: a Hungarian Culture & Heritage Society tanoda-címlistája. A lista
-- megbízhatóságát az támasztja alá, hogy ahol volt mivel összevetni, ott a
-- telefon PONTOSAN egyezett a szaknévsorban lévővel (Mosoly, Southend,
-- Northamptonshire, Chester, Tűzmadár, Kerek Egy Esztendő).
-- ⚠️ Ahol ELTÉRT (Reading, Guildford), ott NEM írjuk felül a meglévőt.
UPDATE businesses SET phone = '+44 7546 345048', updated_at = datetime('now')
WHERE id = 'gb-coventry-magyar-tanoda-es-kozosseg' AND phone IS NULL;

UPDATE businesses SET phone = '+44 7590 832572', updated_at = datetime('now')
WHERE id = 'gb-magyar-iskola-woking' AND phone IS NULL;

UPDATE businesses SET blurb = 'Hétvégi magyar iskola és közösségi program · Fen Drayton, Cambridge · kerekegyesztendo.co.uk', updated_at = datetime('now')
WHERE id = 'gb-kerek-egy-esztendo';

-- Csigabiga: eddig SEM telefon, SEM weboldal (zsákutca volt).
UPDATE businesses SET blurb = 'Hétvégi magyar iskola · Peacehaven · brightonovi.blogspot.com', updated_at = datetime('now')
WHERE id = 'gb-csigabiga-tanoda';

UPDATE businesses SET blurb = 'Hétvégi magyar iskola · Cambridge · magyariskolacambridge.wordpress.com', updated_at = datetime('now')
WHERE id = 'gb-magyar-iskola-cambridge';

-------------------------------------------------------- ÉRVÉNYTELEN RÉGIÓKÓD
-- ⚠️ Két tételen 'GR' régiókód ült, ilyen kód a GB_REGIONS-ben NINCS — vagyis
-- a /allasok és a szaknévsor régió-szűrője SOHA nem hozta volna elő őket.
-- Valószínű ok: a „GReat Doddington" / „GReater London" előtag-illesztés
-- (ugyanaz a substring-árnyék csapda, mint a város-térképnél).
UPDATE businesses SET canton_code = 'EM', updated_at = datetime('now')
WHERE id = 'gb-imp-acs-it-solution-pc-laptop-szerviz';   -- Wellingborough, Northamptonshire

UPDATE businesses SET canton_code = 'LDN', updated_at = datetime('now')
WHERE id = 'gb-imp-ga-repair-services-g-andras';         -- Wembley, London
