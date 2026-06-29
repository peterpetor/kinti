-- db/seed-events-community.sql — „Magyar események a térképen" induló VALÓDI közösségi
-- horgonyok (TÉRKÉP-pinek, nem a naptár-lista). Dátum nélküli állandó „hely"-pinek
-- (event_date = NULL → a térkép-query nem évülteti el; a naptár-lista kihagyja őket).
-- Minden cím hivatalos forrásból ellenőrzött + Nominatim-geokódolt koordináta.
-- Forrás: culture.hu (Liszt Intézet hálózat), protestans.ch, magyar-misszio.ch,
-- salzung.com, hongaarsefederatie.nl. source='seed-community', INSERT OR IGNORE → idempotens.
-- moderation_status=1 + status='approved' → azonnal látszik a térképen.
--
-- Futtatás (remote D1):
--   npx wrangler d1 execute kinti-db --remote --file=./db/seed-events-community.sql

INSERT OR IGNORE INTO events
  (id, title, event_date, venue, going, tag, color, description, status, moderation_status, source, country_code, lat, lng)
VALUES
-- CH (2)
('seed-ev-ch-grossmunster','Zürichi Magyar Protestáns Gyülekezet',NULL,
 'Grossmünster, Zwingliplatz, 8001 Zürich',0,'talalkozo','#1d4434',
 'Magyar nyelvű református istentisztelet kéthetente a Grossmünster oldalkápolnájában.',
 'approved',1,'seed-community','CH',47.3701214,8.5439115),

('seed-ev-ch-misszio','Zürichi Magyar Katolikus Misszió',NULL,
 'Winterthurerstrasse 135, 8057 Zürich',0,'talalkozo','#1d4434',
 'Magyar katolikus közösség és szentmisék Zürichben (magyar-misszio.ch).',
 'approved',1,'seed-community','CH',47.3943760,8.5447762),

-- AT (2)
('seed-ev-at-chw','Collegium Hungaricum Wien – Liszt Intézet',NULL,
 'Hollandstraße 4, 1020 Wien',0,'talalkozo','#1d4434',
 'Magyarország bécsi kulturális intézete: kiállítások, koncertek, közösségi programok.',
 'approved',1,'seed-community','AT',48.2149394,16.3764072),

('seed-ev-at-salzung','SalzUNG – Salzburgi Magyar Egyesület',NULL,
 'Fürstenallee 45, 5020 Salzburg',0,'talalkozo','#1d4434',
 'Magyar közösség és kulturális programok Salzburgban és a tartományban (salzung.com).',
 'approved',1,'seed-community','AT',47.7852353,13.0520091),

-- DE (2)
('seed-ev-de-chb','Collegium Hungaricum Berlin',NULL,
 'Dorotheenstraße 12, 10117 Berlin',0,'talalkozo','#1d4434',
 'Magyarország berlini kulturális intézete (Liszt Intézet): programok, kiállítások, koncertek.',
 'approved',1,'seed-community','DE',52.5194238,13.3944978),

('seed-ev-de-stuttgart','Liszt Intézet – Magyar Kulturális Központ Stuttgart',NULL,
 'Christophstraße 7, 70178 Stuttgart',0,'talalkozo','#1d4434',
 'Magyar kulturális központ Stuttgartban, a főkonzulátus szomszédságában.',
 'approved',1,'seed-community','DE',48.7721210,9.1753537),

-- NL (2)
('seed-ev-nl-denhaag','Hágai Magyar Református Gyülekezet',NULL,
 'Heilige Familiekerk, Kamperfoelieplein 29, Den Haag',0,'talalkozo','#1d4434',
 'Magyar nyelvű református istentisztelet Hágában (a hollandiai magyar gyülekezetek anyaegyháza).',
 'approved',1,'seed-community','NL',52.0724831,4.2679469),

('seed-ev-nl-amsterdam','Amszterdami Magyar Református Istentisztelet',NULL,
 'Vrijburg Kerk, Herman Gorterstraat 31, 1077 Amsterdam',0,'talalkozo','#1d4434',
 'Magyar nyelvű református istentisztelet Amszterdamban a Vrijburg templomban.',
 'approved',1,'seed-community','NL',52.3459203,4.8826898);
