-- db/hide-closed-2026-07-31.sql
-- Frissesség-audit: VÉGLEGESEN BEZÁRT üzletek elrejtése (hidden=1, NEM törlés).
--
-- Módszer: Google Maps "Permanently closed" a fő találati panelben, ahol a
-- találat NEVE ÉS CÍME is egyezik a nálunk tároltakkal. 316 fogyasztó-arcú
-- üzlet (étterem/bolt/cukrászda/pékség/szállás) ellenőrizve, 85 nyers jelölt,
-- ebből 20 hamis pozitív kiszűrve (a Google más üzletet hozott fel), 65 marad.
--
-- ⚠️ A katalógus-oldalak (cylex, gelbeseiten, firmenabc, yelp-listázás,
-- speisekarte.de) NYITVATARTÁST mutatnak ezeknél is — ez NEM cáfolat: ezek az
-- adatok évekig fennmaradnak bezárás után. Négy mintavételes ellenőrzés
-- (Mathias Szamos, Ilona Stüberl, Váradi Csárda, BigHungary) mind megerősítette
-- a bezárást friss fogyasztói forrásból.
--
-- Visszavonás: UPDATE businesses SET hidden=0 WHERE id IN (...) ugyanezzel a listával.

-- AT · cukrasz · Mathias Szamos Konfiserie — Landstraßer Hauptstraße 72, 1030 Wien
UPDATE businesses SET hidden = 1 WHERE id = 'at-imp-mathias-szamos-konfiserie';
-- AT · elelmiszer · Paprika Jancsi – Ungarische Spezialitäten — Klosterneuburger Straße 50, 1200 Wien
UPDATE businesses SET hidden = 1 WHERE id = 'at-imp-paprika-jancsi-ungarische-spezialitaten';
-- AT · elelmiszer · Hungarian Corner Shop — Reindorfgasse 23, 1150 Wien
UPDATE businesses SET hidden = 1 WHERE id = 'at-imp-hungarian-corner-shop';
-- AT · etterem · Ilona Stüberl — Bräunerstraße 2, 1010 Wien
UPDATE businesses SET hidden = 1 WHERE id = 'at-imp-ilona-stuberl';
-- AT · etterem · Bistro Cocina — Bahnhofstraße 1, 3950 Gmünd
UPDATE businesses SET hidden = 1 WHERE id = 'osmbiz2-at-bistro-cocina';
-- AT · etterem · Schachlwirt — Moosstraße 133, 5020
UPDATE businesses SET hidden = 1 WHERE id = 'osmbiz2-at-schachlwirt';
-- CH · cukrasz · Charlotte Bakery GmbH — General-Wille-Strasse 11, 8002 Zürich
UPDATE businesses SET hidden = 1 WHERE id = 'ch-imp-charlotte-bakery-gmbh';
-- CH · etterem · Corvinus – Magyar Étterem — Landstrasse 3, 5412 Gebenstorf
UPDATE businesses SET hidden = 1 WHERE id = 'ch-imp-corvinus-magyar-etterem';
-- CH · etterem · Restaurant Schäfli Romanshorn — Hafenstrasse 32, 8590 Romanshorn
UPDATE businesses SET hidden = 1 WHERE id = 'ch-imp-restaurant-schafli-romanshorn';
-- DE · cukrasz · Timis Torten Manufaktur — Glemsgaustraße 51, 70499 Stuttgart
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-timis-torten-manufaktur';
-- DE · elelmiszer · Csillas Ungarische Wurst und Delikatessen — Obere Stadt 4, 82362 Weilheim in Oberbayern
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-csillas-ungarische-wurst-und-delikatessen';
-- DE · elelmiszer · Fair Souvenir & ungarische Lebensmittel — Fischergasse 8, 89073 Ulm
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-fair-souvenir-ungarische-lebensmittel';
-- DE · elelmiszer · Ungarischer Wanderer Imbiss und Lebensmittelgeschäft — Scheffelstr. 6a, 78315 Radolfzell am Bodensee
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-ungarischer-wanderer-imbiss-und-lebensmittelgeschaft';
-- DE · elelmiszer · Metzgerei Konrad Floc — Schillerstraße 35, 76135 Karlsruhe
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-metzgerei-konrad-floc';
-- DE · elelmiszer · Strudelparadies — Marchgrabenplatz 1, 80805 München
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-strudelparadies';
-- DE · elelmiszer · ARY Ungarische Geschmäcker — Marktstr. 4, 94116 Hutthurm
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-ary-ungarische-geschmacker';
-- DE · elelmiszer · Alpen Apotheke — Hauptstr.19, 83395 Freilassing
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-alpen-apotheke';
-- DE · elelmiszer · Paprika-abc, Ulm — Am Bleicher Hag 54, 89075 Ulm
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-paprika-abc-ulm';
-- DE · elelmiszer · Fleischmann & Sons — Heinrich-Wieland-Allee 2, 75172 Pforzheim
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-fleischmann-sons';
-- DE · elelmiszer · Ungarische Welt, magyar bolt, Nittenau — Hauptstraße 4 93149, Nittenau
UPDATE businesses SET hidden = 1 WHERE id = 'de-nmde-ungarische-welt-magyar-bolt-nittenau';
-- DE · elelmiszer · Ungarnservice — Weingartener Str. 9, Stutensee
UPDATE businesses SET hidden = 1 WHERE id = 'de-nmde-ungarnservice';
-- DE · elelmiszer · Ungarikum Delikatesse, magyar bolt, Metten — Donaustraße 11. 94526 Metten
UPDATE businesses SET hidden = 1 WHERE id = 'de-nmde-ungarikum-delikatesse-magyar-bolt-metten';
-- DE · elelmiszer · Made in Hungaria - ungarische Spezialitäten, magyar bolt — Schwandorf 92421, Pfleghofstufen 2
UPDATE businesses SET hidden = 1 WHERE id = 'de-nmde-made-in-hungaria-ungarische-spezialitaten-magyar-b';
-- DE · elelmiszer · Feri's Markt Ungarische Spezialitäten, Dortmund — Färber strasse 17, 44329 Dortmund
UPDATE businesses SET hidden = 1 WHERE id = 'de-nmde-feri-s-markt-ungarische-spezialitaten-dortmund';
-- DE · elelmiszer · Fleischmann & Son's Magyar Bolt — Heinrich-Wieland-Allee 2, 75177 Pforzheim
UPDATE businesses SET hidden = 1 WHERE id = 'de-ir-fleischmann-son-s-magyar-bolt';
-- DE · elelmiszer · Betyár Markt — Altmühlstraße 17, 93309 Kelheim
UPDATE businesses SET hidden = 1 WHERE id = 'de-ir-betyar-markt';
-- DE · elelmiszer · Budapest Ungarische Lebensmittel — Bahnhofstraße 17, 79798 Jestetten
UPDATE businesses SET hidden = 1 WHERE id = 'de-ir-budapest-ungarische-lebensmittel';
-- DE · etterem · Hungarium International — Robert-Bosch-Str. 58, 63225 Langen
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-hungarium-international';
-- DE · etterem · TIMIS Café und Restaurant Stuttgart — Goslarer Straße 79, 70499 Stuttgart
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-timis-cafe-und-restaurant-stuttgart';
-- DE · etterem · Gasthaus Goldener Anker – Heroldsberg — Oberer Markt 19, 90562 Heroldsberg
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-gasthaus-goldener-anker-heroldsberg';
-- DE · etterem · Váradi Csárda – Leipzig — Arthur-Hoffmann-Straße 111, 04275 Leipzig
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-varadi-csarda-leipzig';
-- DE · etterem · Gulasch – Ungarisches Restaurant — Hofgasse 25, 89312 Günzburg
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-gulasch-ungarisches-restaurant';
-- DE · etterem · Boheme Bistro und Ungarischer Shop — Oberstadtstraße 17, 72401 Haigerloch
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-boheme-bistro-und-ungarischer-shop';
-- DE · etterem · Adam's Restaurant — Ettlinger Str. 18/1, 76332 Bad Herrenalb
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-adam-s-restaurant';
-- DE · etterem · Rosenhäusle — Obere Beutau 1, 73728 Esslingen am Neckar
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-rosenhausle';
-- DE · etterem · Gaststätte Flügelrad – Bajor-Magyar étterem — Truderinger Straße 115a, 81673 München
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-gaststatte-flugelrad-bajor-magyar-etterem';
-- DE · etterem · Janos — Hauptstr. 45, 83324 Ruhpolding
UPDATE businesses SET hidden = 1 WHERE id = 'de-biz3-janos-ruhpolding';
-- DE · etterem · Magyar etterem Nittenau, Wilde Ente — Hauptstrasse 6, 93149 Nittenau .
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-magyar-etterem-nittenau-wilde-ente';
-- DE · etterem · Magyar etterem Zuzenhausen, Csarda — Rechgasse 37, 74939 Zuzenhausen
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-magyar-etterem-zuzenhausen-csarda';
-- DE · etterem · Gaststätte Vollmond, Hattingen — Kirchplatz 20, 45525 Hattingen
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-gaststatte-vollmond-hattingen';
-- DE · etterem · Gaststätte Pullen, Neuss — Bergheimer Straße 68, 41464 Neuss
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-gaststatte-pullen-neuss';
-- DE · etterem · Haus Münchshecke, Siegburg — Hauptstraße 402, 53721 Siegburg, Deutschland
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-haus-munchshecke-siegburg';
-- DE · etterem · Lecsó Restaurant — Bensenstr 1, 91541 Rothenburg ob der Tauber
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-lecso-restaurant';
-- DE · etterem · Lisztoria Restaurant és Bár — Am Wall 6, 91583 Schillingsfürst
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-lisztoria-restaurant-es-bar';
-- DE · etterem · Hungarikum in der Hallertau — Untere Hauptstraße 1, 84072 Au in der Hallertau
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-hungarikum-in-der-hallertau';
-- DE · etterem · Lavendel Restaurant, magyar véndéglő Abenbergben — Schweinauer Str. 1, 91183 Abenberg
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-lavendel-restaurant-magyar-vendeglo-abenbergben';
-- DE · etterem · Puskás Restaurant, Bobenheim-Roxheim — Am Binnendamm 20, 67240 Bobenheim-Roxheim
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-puskas-restaurant-bobenheim-roxheim';
-- DE · etterem · Fürstenhof Burger Restaurant und Bar, Hilpoltstein — Johann-Friedrich-Str. 1 91161, Hilpoltstein
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-furstenhof-burger-restaurant-und-bar-hilpoltstein';
-- DE · etterem · BigHungary, étterem, Wiesloch — In den Weinäckern 3, 69168 Wiesloch
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-bighungary-etterem-wiesloch';
-- DE · etterem · Paprika Restaurant — Lixstraße 19, 74076 Heilbronn
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-paprika-restaurant';
-- DE · etterem · Restaurant Budapest – Kempten — Klostersteige 7, 87435 Kempten im Allgäu
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-restaurant-budapest-kempten';
-- DE · etterem · Zum Ungar — Marktplatz 25, 91281 Kirchenthumbach
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-zum-ungar';
-- DE · etterem · Zur Blauen Donau — Deggendorfer Straße 9, 94569 Stephansposching
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-zur-blauen-donau';
-- DE · etterem · Zoli's Extrawurst und_fertig, magyar étterem, Espasingen — Meersburger Str. 4, 78333 Espasingen
UPDATE businesses SET hidden = 1 WHERE id = 'de-nmde-zoli-s-extrawurst-und-fertig-magyar-etterem-espasi';
-- DE · etterem · CAR KITCHEN, magyar bar és grill Deggendorfban — Hauptstr. 45, 94469 Deggendorf
UPDATE businesses SET hidden = 1 WHERE id = 'de-nmde-car-kitchen-magyar-bar-es-grill-deggendorfban';
-- DE · etterem · Balaton Retro, magyar étterem — Augsburger Str. 31 / B, 82194 Groebenzell
UPDATE businesses SET hidden = 1 WHERE id = 'de-nmde-balaton-retro-magyar-etterem';
-- DE · etterem · Alte Bastei Restaurant — Hauptstraße 4, 74638 Waldenburg
UPDATE businesses SET hidden = 1 WHERE id = 'de-ir-alte-bastei-restaurant';
-- DE · etterem · Haus Münchshecke — Hauptstraße 402, 53721 Siegburg
UPDATE businesses SET hidden = 1 WHERE id = 'de-ir-haus-munchshecke';
-- DE · pek · Konditorei Piroschka Stuttgart — Gablenberger Hauptstraße 27, 70186 Stuttgart
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-konditorei-piroschka-stuttgart';
-- ES · elelmiszer · Paprika Gourmet — Carrer de Lepant 311, 08025 Barcelona
UPDATE businesses SET hidden = 1 WHERE id = 'es-paprika-gourmet';
-- ES · etterem · Langos Bar — Ca'n Picafort — Avenida Josep Trias 24, 07458 Ca'n Picafort, Mallorca
UPDATE businesses SET hidden = 1 WHERE id = 'es-langos-bar-ca-n-picafort';
-- NL · elelmiszer · Édes Anna ABC — Van der Hoopstraat 14, 2921 LR Krimpen aan den IJssel
UPDATE businesses SET hidden = 1 WHERE id = 'nl-imp-edes-anna-abc';
-- NL · elelmiszer · Paprikamarket — Breestraat 1, 1941 EL Beverwijk
UPDATE businesses SET hidden = 1 WHERE id = 'nl-imp-paprikamarket';
-- NL · elelmiszer · Spájz-Hollandia Magyar Bolt — Soetendaalseweg 63a, 3036 EL Rotterdam
UPDATE businesses SET hidden = 1 WHERE id = 'nl-imp-spajz-hollandia-magyar-bolt';
-- NL · etterem · Magyar Unicum — Linnaeuslaan 21, 3571 TS Utrecht
UPDATE businesses SET hidden = 1 WHERE id = 'nl-imp-magyar-unicum';
