-- ⚠️⚠️ SEED-MÓDSZERTAN ELTÁVOLÍTÁSA A PUBLIKUS LEÍRÁSOKBÓL — 2026-08-03
--
-- 97 tétel `blurb`-jében ott maradt, HOGY MI HOZTA ELŐ a tételt:
--   „… — a nemetorszagi-magyarok.de közösségi adatbázisából."   (~72 tétel)
--   „… (Iránytű Németországban cégregiszter)."                  (~24 tétel)
--   „… — a MÁR bent lévő 'Magyar etterem Kassel' éttermtől eltérő, önálló bolt"
--       ← ez egy BELSŐ DEDUP-JEGYZET, ami publikus szövegbe szivárgott
--
-- A `blurb` a felhasználónak szóló, ADATLAPON MEGJELENŐ szöveg. A saját
-- kutatási módszerünk nem tartozik rá, és bizalmatlanságot kelt („ezt csak
-- valahonnan átmásolták"). A tiltás dokumentált (blurb-public-text-rules), és
-- egy korábbi kör 13 tételt már ki is takarított — ez a 97 azért maradt benne,
-- mert MÁS megfogalmazást használ, mint amit az akkori szűrő keresett.
--
-- ⚠️ A puszta törlés sovány leírást hagyna („Magyar vendéglátóhely."), ezért a
-- CÍMBŐL kinyert VÁROST hozzáfűzzük, ugyanabban a „ · " formátumban, amit a
-- szaknévsor máshol is használ:
--     „Magyar vendéglátóhely · Wolfsburg · pusztarestaurant.blogspot.com"
-- A weboldal MINDIG az utolsó szegmens marad — erre a `contact-links.ts`
-- épít, és a zsákutca-számláló is ezt a mintát nézi.
--
-- ⚠️ ÁLTALÁNOS TANULSÁG: egy tiltás-ellenőrzést NE egyetlen szóra írj. Az
-- eredeti szűrő a konkrét korábbi megfogalmazásra keresett, ezért ez a 97,
-- másképp fogalmazott eset átcsúszott rajta.

UPDATE businesses SET blurb = 'Magyar üzlet · München', updated_at = datetime('now')
  WHERE id = 'de-imp-dirndl-szalon-munchenben';
UPDATE businesses SET blurb = 'Magyar vendéglátóhely · München', updated_at = datetime('now')
  WHERE id = 'de-imp-paprika-haus';
UPDATE businesses SET blurb = 'Magyar vendéglátóhely · Suhl', updated_at = datetime('now')
  WHERE id = 'de-imp-hungaria-restaurant-suhl';
UPDATE businesses SET blurb = 'Magyar vendéglátóhely · Wolfsburg · pusztarestaurant.blogspot.com', updated_at = datetime('now')
  WHERE id = 'de-imp-magyar-etterem-wolfsburgban-puszta-etterem';
UPDATE businesses SET blurb = 'Magyar vendéglátóhely · Kassel', updated_at = datetime('now')
  WHERE id = 'de-imp-magyar-etterem-kassel';
UPDATE businesses SET blurb = 'Magyar vendéglátóhely · Gernrode', updated_at = datetime('now')
  WHERE id = 'de-imp-magyar-etterem-gernrode-eichsfeld';
UPDATE businesses SET blurb = 'Magyar vendéglátóhely · Nittenau . · www.wildeentebistronomie.de', updated_at = datetime('now')
  WHERE id = 'de-imp-magyar-etterem-nittenau-wilde-ente';
UPDATE businesses SET blurb = 'Magyar vendéglátóhely · Regensburg', updated_at = datetime('now')
  WHERE id = 'de-imp-magyar-etterem-regensburg-hungarikum';
UPDATE businesses SET blurb = 'Magyar vendéglátóhely · Zuzenhausen', updated_at = datetime('now')
  WHERE id = 'de-imp-magyar-etterem-zuzenhausen-csarda';
UPDATE businesses SET blurb = 'Magyar kozmetikus · Hildesheim', updated_at = datetime('now')
  WHERE id = 'de-imp-horvath-zsuzsa';
UPDATE businesses SET blurb = 'Magyar kozmetikus · Giengen an der Brenz', updated_at = datetime('now')
  WHERE id = 'de-imp-muntyan-aliz';
UPDATE businesses SET blurb = 'Magyar fodrász · Bahnhofplatz 5', updated_at = datetime('now')
  WHERE id = 'de-imp-beauty-palace';
UPDATE businesses SET blurb = 'Magyar autószerelő · Finsing', updated_at = datetime('now')
  WHERE id = 'de-imp-toth-albert';
UPDATE businesses SET blurb = 'Magyar vendéglátóhely · www.facebook.com/Vollmond-Hattingen-451690.', updated_at = datetime('now')
  WHERE id = 'de-imp-gaststatte-vollmond-hattingen';
UPDATE businesses SET blurb = 'Magyar vendéglátóhely · Neuss · www.hauspullen.de', updated_at = datetime('now')
  WHERE id = 'de-imp-gaststatte-pullen-neuss';
UPDATE businesses SET blurb = 'Magyar vendéglátóhely · Niederkassel', updated_at = datetime('now')
  WHERE id = 'de-imp-bootshaus-rheidt-niederkassel';
UPDATE businesses SET blurb = 'Magyar vendéglátóhely · Siegburg · www.facebook.com/pages/Haus-M%C3%BCnchshec', updated_at = datetime('now')
  WHERE id = 'de-imp-haus-munchshecke-siegburg';
UPDATE businesses SET blurb = 'Magyar üzlet · Emsdetten · www.jegenyes.de', updated_at = datetime('now')
  WHERE id = 'de-imp-alpar-jegenyes-ungarische-weine';
UPDATE businesses SET blurb = 'Magyar kozmetikus · Dorfen', updated_at = datetime('now')
  WHERE id = 'de-imp-illes-nora';
UPDATE businesses SET blurb = 'Magyar vendéglátóhely · Rothenburg ob der Tauber · www.facebook.com/Lecs%C3%B3-Restaurant-137', updated_at = datetime('now')
  WHERE id = 'de-imp-lecso-restaurant';
UPDATE businesses SET blurb = 'Magyar vendéglátóhely · Schillingsfürst · lisztoria.eatbu.com', updated_at = datetime('now')
  WHERE id = 'de-imp-lisztoria-restaurant-es-bar';
UPDATE businesses SET blurb = 'Magyar kozmetikus · Röthenbach · www.facebook.com/krisztina.korpos', updated_at = datetime('now')
  WHERE id = 'de-imp-crystal-wax-beauty';
UPDATE businesses SET blurb = 'Magyar autószerelő · Lutzingen', updated_at = datetime('now')
  WHERE id = 'de-imp-j-v-rotary-motorsport';
UPDATE businesses SET blurb = 'Magyar üzlet · Hutthurm', updated_at = datetime('now')
  WHERE id = 'de-imp-ary-ungarische-geschmacker';
UPDATE businesses SET blurb = 'Magyar vendéglátóhely · Dingelsdorf', updated_at = datetime('now')
  WHERE id = 'de-imp-terrasse-restaurant';
UPDATE businesses SET blurb = 'Magyar vendéglátóhely · Zirndorf · www.facebook.com/pension.nurnbergstein.9', updated_at = datetime('now')
  WHERE id = 'de-imp-magyar-pizzeria-nurnberg-mellett';
UPDATE businesses SET blurb = 'Magyar vendéglátóhely · Waldkraiburg · bit.ly/3a0XMJR', updated_at = datetime('now')
  WHERE id = 'de-imp-waldkraiburg-i-magyar-langos';
UPDATE businesses SET blurb = 'Magyar vendéglátóhely · Mainburg · bit.ly/2QJjyKM', updated_at = datetime('now')
  WHERE id = 'de-imp-ildiko-csarda-mainburg';
UPDATE businesses SET blurb = 'Magyar kozmetikus · Oberschleißheim · www.zsd-kosmetik.de', updated_at = datetime('now')
  WHERE id = 'de-imp-dragon-zsuzsanna-kozmetika-kineziologia';
UPDATE businesses SET blurb = 'Magyar vendéglátóhely · Au in der Hallertau', updated_at = datetime('now')
  WHERE id = 'de-imp-hungarikum-in-der-hallertau';
UPDATE businesses SET blurb = 'Magyar kozmetikus · Hildesheim · bit.ly/Tunde-szepsegszalon', updated_at = datetime('now')
  WHERE id = 'de-imp-tunde-szepsegszalon-hildesheim';
UPDATE businesses SET blurb = 'Magyar üzlet · Freilassing · www.alpenapothekebgl.de', updated_at = datetime('now')
  WHERE id = 'de-imp-alpen-apotheke';
UPDATE businesses SET blurb = 'Magyar üzlet · Ötisheim 75443 · www.paprika-express.de', updated_at = datetime('now')
  WHERE id = 'de-imp-paprika-express-webaruhaz-magyar-termekekkel';
UPDATE businesses SET blurb = 'Magyar vendéglátóhely · Hennef', updated_at = datetime('now')
  WHERE id = 'de-imp-plattensee-langos-gulasch';
UPDATE businesses SET blurb = 'Magyar vendéglátóhely · Zirndorf · bit.ly/étterem', updated_at = datetime('now')
  WHERE id = 'de-imp-b-b-pizza-haus-vendeglo';
UPDATE businesses SET blurb = 'Magyar vendéglátóhely · www.facebook.com/Abenberg', updated_at = datetime('now')
  WHERE id = 'de-imp-lavendel-restaurant-magyar-vendeglo-abenbergben';
UPDATE businesses SET blurb = 'Magyar vendéglátóhely · Bobenheim-Roxheim · puskas-restaurant.metro.rest/?lang=ro', updated_at = datetime('now')
  WHERE id = 'de-imp-puskas-restaurant-bobenheim-roxheim';
UPDATE businesses SET blurb = 'Magyar kozmetikus · Dienheim · www.diana-rupp-kosmetik.de/kontakt', updated_at = datetime('now')
  WHERE id = 'de-imp-diana-rupp-kozmetikus-dienheim';
UPDATE businesses SET blurb = 'Magyar vendéglátóhely · Moosach · bit.ly/magyarhalaszcsarda', updated_at = datetime('now')
  WHERE id = 'de-imp-moosachi-halaszcsarda';
UPDATE businesses SET blurb = 'Magyar vendéglátóhely · Gross-Geraub · www.facebook.com/LangosGG', updated_at = datetime('now')
  WHERE id = 'de-imp-l-ngos-express-gross-geraub';
UPDATE businesses SET blurb = 'Magyar vendéglátóhely · Pforzheim · www.facebook.com/SziaLangos', updated_at = datetime('now')
  WHERE id = 'de-imp-szia-bistro-bar-pforzheim-etterem';
UPDATE businesses SET blurb = 'Magyar vendéglátóhely · Hilpoltstein · bit.ly/furstenhof-etterem', updated_at = datetime('now')
  WHERE id = 'de-imp-furstenhof-burger-restaurant-und-bar-hilpoltstein';
UPDATE businesses SET blurb = 'Magyar kozmetikus · Hüpfelinstraße 8 · doenczivandabeauty.de', updated_at = datetime('now')
  WHERE id = 'de-imp-donczi-vanda-diva-beauty';
UPDATE businesses SET blurb = 'Magyar vendéglátóhely · bit.ly/bretten-langosozo-kurtos', updated_at = datetime('now')
  WHERE id = 'de-imp-ungarische-langos-kurtos-bretten';
UPDATE businesses SET blurb = 'Magyar vendéglátóhely · Wiesloch · bit.ly/BigHungary', updated_at = datetime('now')
  WHERE id = 'de-imp-bighungary-etterem-wiesloch';
UPDATE businesses SET blurb = 'Magyar vendéglátóhely · Langen', updated_at = datetime('now')
  WHERE id = 'de-imp-alka-freshfood-langen';
UPDATE businesses SET blurb = 'Magyar üzlet · Ulm · www.facebook.com/kati.paprikaabc.5', updated_at = datetime('now')
  WHERE id = 'de-imp-paprika-abc-ulm';
UPDATE businesses SET blurb = 'Magyar kozmetikus · Wörth · bit.ly/Kittikosmetik', updated_at = datetime('now')
  WHERE id = 'de-imp-kitti-kosmetik-worth';
UPDATE businesses SET blurb = 'Magyar kozmetikus · Schefflenz · www.facebook.com/ilona.zsarik', updated_at = datetime('now')
  WHERE id = 'de-imp-szentgyorgyi-ilona-kozmetikus-schefflenz';
UPDATE businesses SET blurb = 'Magyar vendéglátóhely · Plochingen', updated_at = datetime('now')
  WHERE id = 'de-imp-fischerhutte-plochingen-etterem';
UPDATE businesses SET blurb = 'Magyar kozmetikus · Langenbach · bit.ly/Timikosmetik', updated_at = datetime('now')
  WHERE id = 'de-imp-timi-kosmetik-langenbach';
UPDATE businesses SET blurb = 'Magyar manikűrös-pedikűrös · Filderstadt · www.facebook.com/byeykyeninails', updated_at = datetime('now')
  WHERE id = 'de-imp-eyky-eni-nails-koromszalon-filderstadt';
UPDATE businesses SET blurb = 'Magyar vendéglátóhely · Pfronten · www.facebook.com/Rosenstuble', updated_at = datetime('now')
  WHERE id = 'de-imp-pizzeria-rosenstuble';
UPDATE businesses SET blurb = 'Magyar manikűrös-pedikűrös · Flomborn · bit.ly/erikabarabasmanikurpedikur', updated_at = datetime('now')
  WHERE id = 'de-imp-erika-barabas-mobile-fachfusspflege-magyar-pedikuros-man';
UPDATE businesses SET blurb = 'Magyar manikűrös-pedikűrös · Exerzierplatz str2', updated_at = datetime('now')
  WHERE id = 'de-imp-paradise-beauty-bar-szepsegszalon-pirmasens';
UPDATE businesses SET blurb = 'Magyar kozmetikus · Herbertingen · m.facebook.com/ikosmetikstudio', updated_at = datetime('now')
  WHERE id = 'de-imp-ildiko-kosmetikstudio';
UPDATE businesses SET blurb = 'Magyar könyvelő/adótanácsadó · Coburg · www.haerer.de', updated_at = datetime('now')
  WHERE id = 'de-imp-baumann-melinda';
UPDATE businesses SET blurb = 'Magyar könyvelő/adótanácsadó.', updated_at = datetime('now')
  WHERE id = 'de-imp-eperjesi-ibolya-konyvelo';
UPDATE businesses SET blurb = 'Magyar könyvelő/adótanácsadó · Augsburg', updated_at = datetime('now')
  WHERE id = 'de-imp-heinrich-maria-magdalena-segitseg-adobevalllasban';
UPDATE businesses SET blurb = 'Magyar fordító/tolmács · Tübingen · www.hitelesforditas.de', updated_at = datetime('now')
  WHERE id = 'de-imp-hiteles-magyar-nemet-forditas-es-tolmacsolas-zimmermann-';
UPDATE businesses SET blurb = 'Magyar könyvelő/adótanácsadó · München · bbc-company.net', updated_at = datetime('now')
  WHERE id = 'de-imp-bbc-treuhand-und-steuerberatungsges-ag';
UPDATE businesses SET blurb = 'Magyar fordító/tolmács · Moers · www.translation.sc', updated_at = datetime('now')
  WHERE id = 'de-imp-fl-intercoop-forditoiroda-ficsor-laszlo';
UPDATE businesses SET blurb = 'Magyar fordító/tolmács · Nürnberg · gmbh-ug.com/hu', updated_at = datetime('now')
  WHERE id = 'de-imp-gmbh-ug-com';
UPDATE businesses SET blurb = 'Magyar könyvelő/adótanácsadó · Leonberg · www.firmenmacher.com', updated_at = datetime('now')
  WHERE id = 'de-imp-gapwork-iroda';
UPDATE businesses SET blurb = 'Magyar fordító/tolmács · Alfter · bit.ly/Melinda-Stern-tolmács', updated_at = datetime('now')
  WHERE id = 'de-imp-stern-melinda-tolmacs-alfter';
UPDATE businesses SET blurb = 'Magyar fordító/tolmács · Krefeld · ungarisch-uebersetzen.com', updated_at = datetime('now')
  WHERE id = 'de-imp-stratkemper-ildiko-fordito';
UPDATE businesses SET blurb = 'Magyar könyvelő/adótanácsadó · Korntal-Münchingen · rewecon.de', updated_at = datetime('now')
  WHERE id = 'de-imp-rewecon-steuerberatungsgesellschaft-erika-fulop';
UPDATE businesses SET blurb = 'Magyar fordító/tolmács · München · www.drszathmari.com', updated_at = datetime('now')
  WHERE id = 'de-imp-cegalapitas-szekhely-dr-szathmari-tibor';
UPDATE businesses SET blurb = 'Magyar fordító/tolmács · Echzell', updated_at = datetime('now')
  WHERE id = 'de-imp-strickert-gabriella';
UPDATE businesses SET blurb = 'Magyar fordító/tolmács · Karlsruhe', updated_at = datetime('now')
  WHERE id = 'de-imp-bote-gergely';
UPDATE businesses SET blurb = 'Magyar könyvelő/adótanácsadó · Cham', updated_at = datetime('now')
  WHERE id = 'de-imp-kornelia-csuha';
UPDATE businesses SET blurb = 'Magyar fordító/tolmács · Leverkusen', updated_at = datetime('now')
  WHERE id = 'de-imp-gengeliczkine-sumegi-eszter-leverkusen';
UPDATE businesses SET blurb = 'Magyar fordító/tolmács · München', updated_at = datetime('now')
  WHERE id = 'de-imp-elisabeth-rosche-dolmetscherin';
UPDATE businesses SET blurb = 'Magyar fordító/tolmács · Neuss · und-lingua.de', updated_at = datetime('now')
  WHERE id = 'de-imp-katalin-schmitz-molnar';
UPDATE businesses SET blurb = 'Magyar fordító/tolmács · Moosburg', updated_at = datetime('now')
  WHERE id = 'de-imp-funk-anita-magyar-nemet-ugyintezo-tolmacs';
UPDATE businesses SET blurb = 'Magyar fordító/tolmács · Köln · bit.ly/Lippkai-Judit-fordito', updated_at = datetime('now')
  WHERE id = 'de-imp-dr-heider-lippkai-judit-koln';
UPDATE businesses SET blurb = 'Magyar könyvelő/adótanácsadó · München · www.aktuell-verein.de/lohnsteuerhilfe/sark', updated_at = datetime('now')
  WHERE id = 'de-imp-andreas-sarkadi-munchen';
UPDATE businesses SET blurb = 'Magyar fordító/tolmács · Zorneding · www.trischler.eu', updated_at = datetime('now')
  WHERE id = 'de-imp-gabriel-m-trischler-m-a-gcdf';
UPDATE businesses SET blurb = 'Magyar könyvelő/adótanácsadó · buchhaltungsburo-eching.de', updated_at = datetime('now')
  WHERE id = 'de-imp-szalisznyo-hilda';
UPDATE businesses SET blurb = 'Magyar fordító/tolmács · Landshut', updated_at = datetime('now')
  WHERE id = 'de-imp-dr-szilvia-horvath-sprachdienste';
UPDATE businesses SET blurb = 'Magyar fordító/tolmács · Magdeburg', updated_at = datetime('now')
  WHERE id = 'de-imp-sprachenservice-philippou-nyelviskola-forditoiroda-bevan';
UPDATE businesses SET blurb = 'Magyar fordító/tolmács · Konstanz', updated_at = datetime('now')
  WHERE id = 'de-imp-sallai-b-katalin-fordito';
UPDATE businesses SET blurb = 'Magyar fordító/tolmács · Hamburg', updated_at = datetime('now')
  WHERE id = 'de-imp-laszlo-jankovits-ingatlan-munka-lak-skozvetit-s';
UPDATE businesses SET blurb = 'Magyar élelmiszerbolt Rastattban, magyar éttermeket is kiszolgál alapanyaggal.', updated_at = datetime('now')
  WHERE id = 'de-imp-a-z-ungarische-lebensmittel';
UPDATE businesses SET blurb = 'Magyar pszichológus, egyéni tanácsadás magyar és német nyelven · Thalmässing', updated_at = datetime('now')
  WHERE id = 'de-imp-aniko-kaloczi-pszichologus';
UPDATE businesses SET blurb = 'Magyar ügyvéd Bielefeldben — büntetőjog, bérleti, örökélési és céges ügyek.', updated_at = datetime('now')
  WHERE id = 'de-imp-asthoff-tamas-ugyvedi-iroda';
UPDATE businesses SET blurb = 'Magyar könyvelő és adóügyi tanácsadó Schwäbisch Hallban.', updated_at = datetime('now')
  WHERE id = 'de-imp-csilla-tamas-tanacsadas-konyveles';
UPDATE businesses SET blurb = 'Magyar háziorvos Thalmässingben.', updated_at = datetime('now')
  WHERE id = 'de-imp-dr-attila-peter-kaloczi-haziorvos';
UPDATE businesses SET blurb = 'Magyar fogorvos Bonnban.', updated_at = datetime('now')
  WHERE id = 'de-imp-dr-katalin-weber-fogorvos';
UPDATE businesses SET blurb = 'Magyar ügyvédi társulás hamburgi fióktelepe (2019 óta), központ Budapesten · www.katonalaw.com/hu', updated_at = datetime('now')
  WHERE id = 'de-imp-dr-katona-geza-ugyvedi-iroda';
UPDATE businesses SET blurb = 'Magyar kozmetikus, galvanikus finomáramú arckezelések · Kolbermoor', updated_at = datetime('now')
  WHERE id = 'de-imp-edit-feigi-kozmetikus';
UPDATE businesses SET blurb = 'Magyar ügyvéd Bielefeldben.', updated_at = datetime('now')
  WHERE id = 'de-imp-fancsik-zoltan-ugyved';
UPDATE businesses SET blurb = 'Magyar élelmiszerbolt Kelheimben, 2022 óta — hidegtálak, ajándékkosarak.', updated_at = datetime('now')
  WHERE id = 'de-imp-fanni-s-ungarische-feinkost';
UPDATE businesses SET blurb = 'Teljeskörű németországi hivatali ügyintézés és tolmácsolás kórházban, ügyvédnél, rendőrségen · Ichenhausen', updated_at = datetime('now')
  WHERE id = 'de-imp-gal-csaba-ugyintezo-tolmacs';
UPDATE businesses SET blurb = 'Cellulit- és bőrfeszesítő kezelések, arckezelések · Neumarkt', updated_at = datetime('now')
  WHERE id = 'de-imp-new-motion-beauty';
UPDATE businesses SET blurb = 'Magyar gyógytornász saját praxissal Augsburgban, 2023 óta.', updated_at = datetime('now')
  WHERE id = 'de-imp-privatpraxis-fur-physiotherapie-e-szabo';
UPDATE businesses SET blurb = 'Magyar élelmiszerbolt Kasselben.', updated_at = datetime('now')
  WHERE id = 'de-imp-ungarische-delikatessen-kassel';
