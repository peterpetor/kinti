-- db/hide-closed-services-2026-07-31.sql
-- Frissesség-audit, 2. kör: MEGSZŰNT SZOLGÁLTATÓK elrejtése (hidden=1, NEM törlés).
--
-- 2056 szolgáltató (orvos/fogorvos/ügyvéd/fordító/pszichológus/közösség stb.)
-- ellenőrizve Google Maps "Permanently closed" jelre. 101 nyers jelölt →
-- 30 hamis pozitív kiszűrve (más üzlet/más cím), 12 bizonytalan KIHAGYVA
-- (cím nem volt kiolvasható), marad 59.
--
-- Arány: 2.9% — a fogyasztó-arcú kategóriák 20,6%-ának töredéke.
-- Az orvos+fogorvos dominál (32/59): a tipikus minta a NYUGDÍJAZÁS és a
-- PRAXIS-ÁTADÁS, nem a csőd. Pl. Dr. Susanne Wig (Köln) praxisa lezárva, a
-- címén ma egy MVZ működik — a magyar nyelvű ellátás ott már nem igazolható.
--
-- ⚠️ NULLA magyar-kozosseg tétel került ide: a 7 nyers közösségi jelölést a
-- név-szűrő helyesen kizárta (azok a BÉRELT HELYSZÍN bezárásáról szóltak,
-- nem a csoport megszűnéséről).
--
-- Visszavonás: UPDATE businesses SET hidden=0 WHERE id IN (...) ugyanezzel a listával.

-- AT · fodrasz · Haarstudio Alex Rudi — Hauptstraße 30, 4040 Linz
UPDATE businesses SET hidden = 1 WHERE id = 'at-imp-haarstudio-alex-rudi';
-- AT · fogorvos · Dr. Alexander Fülöp — Keplergasse 9/16, 1100 Wien
UPDATE businesses SET hidden = 1 WHERE id = 'at-imp-dr-alexander-fulop';
-- AT · fogorvos · Dr. Ujváry Attila — Hauptstraße 2, 7540 Güssing
UPDATE businesses SET hidden = 1 WHERE id = 'at-imp-dr-ujvary-attila';
-- AT · fogorvos · Dr. Nagy Kornélia — Parkstraße 2, 7431 Bad Tatzmannsdorf
UPDATE businesses SET hidden = 1 WHERE id = 'at-imp-dr-nagy-kornelia';
-- AT · fogorvos · Dr. Baumgartner Lőrinc — Gentzschgasse 31, 2763 Pernitz
UPDATE businesses SET hidden = 1 WHERE id = 'at-imp-dr-baumgartner-lorinc';
-- AT · fogorvos · Dr. Ludwig Albert — Valentin-Zeileis-Straße 20, 4713 Gallspach
UPDATE businesses SET hidden = 1 WHERE id = 'at-imp-dr-ludwig-albert';
-- AT · manikur · Rubi Kosmetik & Nagelstudio — Große Stadtgutgasse 18/3, 1020 Wien
UPDATE businesses SET hidden = 1 WHERE id = 'at-imp-rubi-kosmetik-nagelstudio';
-- AT · nemet_tolmacs · Dr. Bogyi-Nagy Margit — Franzensbrückenstraße 3/30, 1020 Wien
UPDATE businesses SET hidden = 1 WHERE id = 'at-imp-dr-bogyi-nagy-margit';
-- AT · nogyogyasz · Dr. Tamás Neufeld — Nussdorfer Straße 77, 1090 Wien
UPDATE businesses SET hidden = 1 WHERE id = 'at-imp-dr-tamas-neufeld';
-- AT · nogyogyasz · Dr. Szilágyi Imre — Fadingerstraße 17, 4020 Linz
UPDATE businesses SET hidden = 1 WHERE id = 'at-imp-dr-szilagyi-imre';
-- AT · nogyogyasz · Dr. Gabriel Victor Grünfeld — Landstraßer Hauptstraße 7/1, 1030 Wien
UPDATE businesses SET hidden = 1 WHERE id = 'at-imp-dr-gabriel-victor-grunfeld';
-- AT · orvos · Dr. Maha Goria — Reindorfgasse 27, 1150 Wien
UPDATE businesses SET hidden = 1 WHERE id = 'at-imp-dr-maha-goria';
-- AT · orvos · Dr. Stefan Petrutziu — Hardtmuthgasse 90/7/9, 1100 Wien
UPDATE businesses SET hidden = 1 WHERE id = 'at-imp-dr-stefan-petrutziu';
-- AT · orvos · Dr. Renate Robetin — Hauptstraße 71/1/2, 1140 Wien
UPDATE businesses SET hidden = 1 WHERE id = 'at-imp-dr-renate-robetin';
-- AT · orvos · Dr. Judit Szekely — Thimiggasse 63/10/1, 1180 Wien
UPDATE businesses SET hidden = 1 WHERE id = 'at-imp-dr-judit-szekely';
-- AT · orvos · Dr. Helmuth Bertolini — Heldendankstraße 20, 6900 Bregenz
UPDATE businesses SET hidden = 1 WHERE id = 'at-imp-dr-helmuth-bertolini';
-- AT · pszichologus · Dr. Károly Jávorszky – Pszichológus — Landhausgasse 4/23, 1010 Wien
UPDATE businesses SET hidden = 1 WHERE id = 'at-imp-dr-karoly-javorszky-pszichologus';
-- AT · pszichologus · Gombos Izabella – Pszichológus / Coach — Anastasius-Grün-Gasse 16, 1180 Wien
UPDATE businesses SET hidden = 1 WHERE id = 'at-biz3-gombos-izabella-coach';
-- AT · pszichologus · Jelinek Akademie e.U. — Kajetan Schellmanngasse 20, 2352 Gumpoldskirchen
UPDATE businesses SET hidden = 1 WHERE id = 'at-biz3-jelinek-akademie-coach';
-- AT · ugyved · Mag. Arpad Gered – Rechtsanwalt — Falkestraße 6, 1010 Wien
UPDATE businesses SET hidden = 1 WHERE id = 'at-biz3-mag-arpad-gered-rechtsanwalt';
-- CH · fogorvos · Dr. med. dent. Alexander Attila Kaman – Zahnimplantat Zentrum Bern — Spitalgasse 18, 3011 Bern
UPDATE businesses SET hidden = 1 WHERE id = 'ch-imp-dr-med-dent-alexander-attila-kaman-zahnimplantat-zentrum';
-- CH · fogorvos · Zahnimplantat Zentrum Kloten — Obstgartenstrasse 15, 8302 Kloten
UPDATE businesses SET hidden = 1 WHERE id = 'ch-imp-zahnimplantat-zentrum-kloten';
-- CH · it · Computer General Service Switzerland – Kovács — St.Gallerstrasse 47, 9320 Arbon
UPDATE businesses SET hidden = 1 WHERE id = 'ch-imp-computer-general-service-switzerland-kovacs';
-- CH · nogyogyasz · Dr. Valeriu Virtic — Rue Oscar-Huguenin 29, 2017 Boudry
UPDATE businesses SET hidden = 1 WHERE id = 'ch-imp-dr-valeriu-virtic';
-- CH · orvos · Dr. med. Robert Csiszér — Bernstrasse 7, 3175 Flamatt
UPDATE businesses SET hidden = 1 WHERE id = 'ch-imp-dr-med-robert-csiszer';
-- CH · orvos · Dr. med. Mihály Belák – Praxisgruppe Stettlen — Bahnhofstrasse 1, 3066 Stettlen
UPDATE businesses SET hidden = 1 WHERE id = 'ch-imp-dr-med-mihaly-belak-praxisgruppe-stettlen';
-- CH · orvos · Dr. Amalia Marina Safran — Route de la Corniche 1, 1066 Epalinges
UPDATE businesses SET hidden = 1 WHERE id = 'ch-imp-dr-amalia-marina-safran';
-- CH · orvos · Dr. Suzanne Marti Nagy — Hirschengraben 43, 6003 Luzern
UPDATE businesses SET hidden = 1 WHERE id = 'ch-imp-dr-suzanne-marti-nagy';
-- CH · pszichiater · Dr. Suzanne Lukács Rüfenacht — Chemin des Fontaines 11, 2800 Delémont
UPDATE businesses SET hidden = 1 WHERE id = 'ch-imp-dr-suzanne-lukacs-rufenacht';
-- DE · adotanacsado · Claudia Latzl – Steuerberaterin — Stuttgarter Straße 10, 73054 Eislingen
UPDATE businesses SET hidden = 1 WHERE id = 'de-biz3-claudia-latzl-steuerberaterin';
-- DE · allatorvos · Doc Marton's – Kleintierpraxis Berlin — Alt-Reinickendorf 37, 13407 Berlin
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-doc-marton-s-kleintierpraxis-berlin';
-- DE · allatorvos · Dr. Miklós Ruffy — Obere Flüh 19, 79713 Bad Säckingen
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-dr-miklos-ruffy';
-- DE · allatorvos · Váradi István állatorvos, Nürnberg — Ulmenstraße 18, 90443 Nürnberg
UPDATE businesses SET hidden = 1 WHERE id = 'de-orvos-varadi-istvan-allatorvos-nurnberg';
-- DE · autokereskedes · NB-Center GmbH, autószerelő, autókereskedő, Northeim — Robert-Bosch Straße 17, 37154 Northeim
UPDATE businesses SET hidden = 1 WHERE id = 'de-nmde-nb-center-gmbh-autoszerelo-autokereskedo-northeim';
-- DE · autoszer · Funken Kfz Werkstatt — Hohenzollernstraße 80c, 72419 Neufra
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-funken-kfz-werkstatt';
-- DE · fodrasz · Kawa Fodrászszalon — Hauptstraße 72, 89522 Heidenheim an der Brenz
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-kawa-fodraszszalon';
-- DE · fogorvos · Dr. Péter Oroszi – Zahnarzt — Neustadt 457, 84028 Landshut
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-dr-peter-oroszi-zahnarzt';
-- DE · fogorvos · Dr. Eva Maria Ziss – Zahnärztin — Obere Hauptstr. 8, 85354 Freising
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-dr-eva-maria-ziss-zahnarztin';
-- DE · fogorvos · Dr. Andrea Kiss — Vogesenstraße 4, 79206 Breisach am Rhein
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-dr-andrea-kiss';
-- DE · fogorvos · Dr. Tóth Ferencz Tibor – Zahnarzt Calw — Heinz-Schnaufer-Straße 30, 75365 Calw
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-dr-toth-ferencz-tibor-zahnarzt-calw';
-- DE · fogorvos · Nagy Zoltán, Dr. med. dent — Friedrich-Ebert-Str.17, 51373 Leverkusen/Wiesdorf
UPDATE businesses SET hidden = 1 WHERE id = 'de-orvos-nagy-zoltan-dr-med-dent';
-- DE · fordito · Strickert Gabriella — Bahnhofstr. 17, 61209 Echzell
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-strickert-gabriella';
-- DE · gepijarmu_oktato · Autósiskola theorie-und-praxis — Einsteinstr. 130, 81675 München
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-autosiskola-theorie-und-praxis';
-- DE · nogyogyasz · Dr. Janka Géza – Frauenarzt — Aspacher Str. 9, 71522 Backnang
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-dr-janka-geza-frauenarzt';
-- DE · orvos · Dr. Lippóy László – Hausarzt — Schleißheimerstr. 117, 80797 München
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-dr-lippoy-laszlo-hausarzt';
-- DE · orvos · Dr. med. Marada-Csorba Olga — Pfarrgäßle 1, 71134
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-dr-med-marada-csorba-olga';
-- DE · orvos · Dr. medic Locker-Kamionek Aida — Oderstraße 59, 73529
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-dr-medic-locker-kamionek-aida';
-- DE · orvos · Dr. med. Kamionek Andreas — Oderstraße 59, 73529
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-dr-med-kamionek-andreas';
-- DE · orvos · Stöckl Karl — Hauptstraße 94, 94474
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-stockl-karl';
-- DE · orvos · Dr. med. Nicole C. Heiler — Eisenstraße 11, 65428
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-dr-med-nicole-c-heiler';
-- DE · orvos · Dr. med. Wig Susanne — Barbarossaplatz 10, 50674
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-dr-med-wig-susanne';
-- DE · orvos · Zenker Nóra — Wilhelmstraße 55-63, 53721
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-zenker-nora';
-- DE · orvos · Dr. Harcos Margit — Hauptstr. 53-55, 69214
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-dr-harcos-margit';
-- DE · orvos · Dr. István Melik — Berthold-Hupmann-Straße 1, 88400 Biberach
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-dr-istvan-melik';
-- DE · orvos · Tömöri Kinga, Dr. — Leonrodstr. 27, München, 80636
UPDATE businesses SET hidden = 1 WHERE id = 'de-orvos-tomori-kinga-dr';
-- DE · pszichologus · Katalin Csordas – Psychotherapeutin — Kasernenstraße 14, 53111 Bonn
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-katalin-csordas-psychotherapeutin';
-- DE · pszichologus · Bakó Judit – Psychotherapeutin — Bürgerstr. 12, 69115 Heidelberg
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-bako-judit-psychotherapeutin';
-- DE · szepseg · Dora Kiss – Kiss Beauty & Make Up — Hauptstätterstr. 152, 70178 Stuttgart
UPDATE businesses SET hidden = 1 WHERE id = 'de-imp-dora-kiss-kiss-beauty-make-up';
-- NL · it · PC Top Service — Lippe-Biesterfeldweg 177, 2552 EA Den Haag
UPDATE businesses SET hidden = 1 WHERE id = 'nl-imp-pc-top-service';
