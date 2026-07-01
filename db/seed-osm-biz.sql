-- db/seed-osm-biz.sql — VALÓDI, mindennapi magyar ÜZLETEK (étterem, kávézó, deli)
-- pontos, HÁZSZÁM-szintű címmel. Forrás: OpenStreetMap (Overpass) — valós addr:street
-- + addr:housenumber, a lat/lng az OSM koordináta. Kézzel KURÁLVA (csak egyértelműen
-- magyar üzletek; a téma-egyezés téves találatait kiszűrtem). Nulla kitalált adat.
-- Alkalmazás: printf 'y\n' | wrangler d1 execute kinti-db --remote --file=./db/seed-osm-biz.sql

INSERT OR IGNORE INTO categories (id, label, glyph, sort_order) VALUES ('etterem','Étterem','🍽️',120);

-- AT
INSERT OR IGNORE INTO businesses (id,name,category_id,category_label,address,blurb,languages,lat,lng,pin_x,pin_y,rating,reviews,featured,open_now,moderation_status,claimed,hidden,source,country_code,canton_code)
VALUES ('osmbiz-at-piroschka-wien','Piroschka','etterem','Étterem','Gersthofer Straße 140/1, 1180 Wien','Magyar étterem · Bécs','["Magyar"]',48.2376695,16.3218812,50,50,0,0,0,0,1,0,0,'seed-osm-biz','AT','W');
INSERT OR IGNORE INTO businesses (id,name,category_id,category_label,address,blurb,languages,lat,lng,pin_x,pin_y,rating,reviews,featured,open_now,moderation_status,claimed,hidden,source,country_code,canton_code)
VALUES ('osmbiz-at-bistro-budapest-wien','Bistro Budapest','kavez','Kávézó / Bisztró','Pilgramgasse 10, 1050 Wien','Magyar kávézó / bisztró · Bécs','["Magyar"]',48.1919609,16.3570494,50,50,0,0,0,0,1,0,0,'seed-osm-biz','AT','W');
INSERT OR IGNORE INTO businesses (id,name,category_id,category_label,address,blurb,languages,lat,lng,pin_x,pin_y,rating,reviews,featured,open_now,moderation_status,claimed,hidden,source,country_code,canton_code)
VALUES ('osmbiz-at-meister-langos-wien','Meister Langos & Lemon','etterem','Lángos / Street food','Prater 23, 1020 Wien','Lángos és magyar street food · Bécs','["Magyar"]',48.2167201,16.3990187,50,50,0,0,0,0,1,0,0,'seed-osm-biz','AT','W');

-- CH
INSERT OR IGNORE INTO businesses (id,name,category_id,category_label,address,blurb,languages,lat,lng,pin_x,pin_y,rating,reviews,featured,open_now,moderation_status,claimed,hidden,source,country_code,canton_code)
VALUES ('osmbiz-ch-paprika-zurich','Paprika','etterem','Étterem','Brahmsstrasse 22, 8003 Zürich','Magyar étterem · Zürich','["Magyar"]',47.3786937,8.5065553,50,50,0,0,0,0,1,0,0,'seed-osm-biz','CH','ZH');
INSERT OR IGNORE INTO businesses (id,name,category_id,category_label,address,blurb,languages,lat,lng,pin_x,pin_y,rating,reviews,featured,open_now,moderation_status,claimed,hidden,source,country_code,canton_code)
VALUES ('osmbiz-ch-paprika-shop-zurich','Paprika Shop Feinkost aus Ungarn','husszek','Magyar élelmiszer / deli','Rötelstrasse 1, 8006 Zürich','Magyar élelmiszer és hentesáru (Feinkost aus Ungarn) · Zürich','["Magyar"]',47.3894082,8.5385205,50,50,0,0,0,0,1,0,0,'seed-osm-biz','CH','ZH');
INSERT OR IGNORE INTO businesses (id,name,category_id,category_label,address,blurb,languages,lat,lng,pin_x,pin_y,rating,reviews,featured,open_now,moderation_status,claimed,hidden,source,country_code,canton_code)
VALUES ('osmbiz-ch-paprika-inout-neuchatel','Paprika In & Out','etterem','Étterem','Rue de Flandres 2, 2000 Neuchâtel','Magyar étterem · Neuchâtel','["Magyar"]',46.9905771,6.92886,50,50,0,0,0,0,1,0,0,'seed-osm-biz','CH','NE');
INSERT OR IGNORE INTO businesses (id,name,category_id,category_label,address,blurb,languages,lat,lng,pin_x,pin_y,rating,reviews,featured,open_now,moderation_status,claimed,hidden,source,country_code,canton_code)
VALUES ('osmbiz-ch-paprika-evole-neuchatel','Paprika','etterem','Étterem','Rue de l''Evole 39, 2000 Neuchâtel','Magyar étterem · Neuchâtel','["Magyar"]',46.9895202,6.921701,50,50,0,0,0,0,1,0,0,'seed-osm-biz','CH','NE');
INSERT OR IGNORE INTO businesses (id,name,category_id,category_label,address,blurb,languages,lat,lng,pin_x,pin_y,rating,reviews,featured,open_now,moderation_status,claimed,hidden,source,country_code,canton_code)
VALUES ('osmbiz-ch-budapest-estavayer','Budapest','etterem','Étterem','Place de la Gare 3, 1470 Estavayer-le-Lac','Magyar étterem · Estavayer-le-Lac','["Magyar"]',46.8442381,6.8438422,50,50,0,0,0,0,1,0,0,'seed-osm-biz','CH','FR');

-- DE (Berlin)
INSERT OR IGNORE INTO businesses (id,name,category_id,category_label,address,blurb,languages,lat,lng,pin_x,pin_y,rating,reviews,featured,open_now,moderation_status,claimed,hidden,source,country_code,canton_code)
VALUES ('osmbiz-de-ungarisches-restaurant-berlin','Ungarisches Restaurant','etterem','Étterem','Eschengraben 41, 13189 Berlin','Magyar étterem · Berlin','["Magyar"]',52.5563238,13.4219808,50,50,0,0,0,0,1,0,0,'seed-osm-biz','DE','BE');
INSERT OR IGNORE INTO businesses (id,name,category_id,category_label,address,blurb,languages,lat,lng,pin_x,pin_y,rating,reviews,featured,open_now,moderation_status,claimed,hidden,source,country_code,canton_code)
VALUES ('osmbiz-de-piroschka-berlin','Piroschka','etterem','Étterem','Jungfernstieg 29, 12207 Berlin','Magyar étterem · Berlin','["Magyar"]',52.4287566,13.3252608,50,50,0,0,0,0,1,0,0,'seed-osm-biz','DE','BE');
