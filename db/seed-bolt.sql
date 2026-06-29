-- db/seed-bolt.sql — „Magyar bolt a sarkon" induló valódi helyek (a szaknévsor valós,
-- precíz-koordinátás magyar élelmiszer-helyeiből + geokódolt AT/DE/NL boltokból).
-- ip_hash='seed-bolt' a provenanciához. INSERT OR IGNORE → idempotens.

-- CH (8) — a szaknévsor user-beküldött, precíz koordinátás boltjai
INSERT OR IGNORE INTO hofladen_spots (id,name,category,location_name,lat,lng,country_code,ip_hash,hidden) VALUES
('ch-bolt-joes','Joe''s Bolt (Anona GmbH)','bolt','Rötelstrasse 1, 8006 Zürich',47.3875,8.5373,'CH','seed-bolt',0),
('ch-bolt-katalin','Katalin Farkas – Ungarischer Laden & Bäckerei','pekseg','Seestrasse 181, 8820 Wädenswil',47.2245,8.679,'CH','seed-bolt',0),
('ch-bolt-madeinhu','Made in Hungary – Ungarische Spezialitäten','bolt','Langgasse 88, 9008 St. Gallen',47.428,9.399,'CH','seed-bolt',0),
('ch-bolt-annamelie','Annamelie – Ungarisches Kuchenhaus','cukraszda','Löwenstrasse 12, 6004 Luzern',47.0573,8.311,'CH','seed-bolt',0),
('ch-bolt-piroska','Piroska – Ungarische Spezialitäten','bolt','Hegibachplatz, 8008 Zürich',47.3556,8.567,'CH','seed-bolt',0),
('ch-bolt-bela','Metzgerei Béla Süli','hentes','Hauptstrasse 46, 8572 Berg TG',47.553,9.265,'CH','seed-bolt',0),
('ch-bolt-langos','Gourmet Langos','etterem','Tägerwilen, Thurgau',47.648,9.135,'CH','seed-bolt',0),
('ch-bolt-hanna','Petite Hanna – Spécialités Hongroises','etterem','Lausanne',46.519,6.633,'CH','seed-bolt',0);

-- AT (3) — Nominatim-mal geokódolt, valódi bécsi helyek
INSERT OR IGNORE INTO hofladen_spots (id,name,category,location_name,lat,lng,country_code,ip_hash,hidden) VALUES
('at-bolt-ilona','Ilona Stüberl','etterem','Bräunerstraße 2, 1010 Wien',48.20841,16.36928,'AT','seed-bolt',0),
('at-bolt-budapestbistro','Budapest Bistro','etterem','Pilgramgasse 10, 1050 Wien',48.19202,16.35695,'AT','seed-bolt',0),
('at-bolt-cornershop','Hungarian Corner-Shop','bolt','Reindorfgasse 23, 1150 Wien',48.18977,16.33023,'AT','seed-bolt',0);

-- DE (2) — Nominatim-mal geokódolt, valódi berlini helyek
INSERT OR IGNORE INTO hofladen_spots (id,name,category,location_name,lat,lng,country_code,ip_hash,hidden) VALUES
('de-bolt-gaststaette','Ungarische Gaststätte Berlin','etterem','Eschengraben 41, 13189 Berlin',52.55630,13.42204,'DE','seed-bolt',0),
('de-bolt-szimpla','Szimpla Berlin','etterem','Gärtnerstraße 15, 10245 Berlin',52.51119,13.46128,'DE','seed-bolt',0);

-- NL (1) — Nominatim-mal geokódolt, valódi amszterdami hely
INSERT OR IGNORE INTO hofladen_spots (id,name,category,location_name,lat,lng,country_code,ip_hash,hidden) VALUES
('nl-bolt-paprika','Paprika Csárda','etterem','Van Eeghenstraat 64, 1071 GK Amsterdam',52.35776,4.87383,'NL','seed-bolt',0);
