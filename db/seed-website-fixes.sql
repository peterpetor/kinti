-- db/seed-website-fixes.sql — AUTOGENERÁLT (scripts/gen-website-fix-sql.mjs).
-- A szaknévsor 872 hirdetett weboldalának élet-ellenőrzése után.
--   wrangler d1 execute kinti-db --remote --file=./db/seed-website-fixes.sql

-- Baán Anita – adótanácsadó és könyvelés — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyar nyelvű könyvelés, adóbevallás, BVG/AHV ügyintézés Arbonban (Thurgau). · http://banita.ch/' WHERE id = 'biz-baan-anita';

-- Magyar Egyetemisták és Öregdiákok Klubja — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar diák / öregdiák · Graz' WHERE id = 'at-magyar-egyetemistak-es-oregdiakok-klubja';

-- Deutsch-Ungarische Gesellschaft Stuttgart — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Német-magyar társaság · Stuttgart' WHERE id = 'de-deutsch-ungarische-gesellschaft-stuttgart';

-- Hamburgi Magyarok Közössége — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar közösség · Hamburg' WHERE id = 'de-hamburgi-magyarok-kozossege';

-- Hannoveri Magyar Egyesület (Ungarischer Verein Hannover) — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar egyesület · Hannover' WHERE id = 'de-hannoveri-magyar-egyesulet-ungarischer-verein-hannover';

-- Genfi Magyar Egyesület — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyar egyesület · Genf · http://ahg.ch/' WHERE id = 'ch-genfi-magyar-egyesulet';

-- Thurgaui Magyar Iskola és Óvoda — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyar iskola és óvoda · Kreuzlingen · http://ungarischervereinthurgau.ch/' WHERE id = 'ch-thurgaui-magyar-iskola-es-ovoda';

-- Zürichi Magyar Cserkészcsapat — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyar cserkészcsapat · Zürich · http://cserkesz.ch/' WHERE id = 'ch-zurichi-magyar-cserkeszcsapat';

-- Csodaszarvas – Magyar Kulturális Egyesület Karlsruhe — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyar kulturális egyesület · Karlsruhe · https://wukk.de/hu/' WHERE id = 'de-csodaszarvas-magyar-kulturalis-egyesulet-karlsruhe';

-- Genfi Magyar Cserkészcsapat — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyar cserkészcsapat · Genf · http://cserkesz.ch/' WHERE id = 'ch-genfi-magyar-cserkeszcsapat';

-- Bánfai Erika — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Kozmetikus és hajgyógyász, arckezelések, testkezelések, hajápolás Bécs 1. kerületében.' WHERE id = 'at-imp-banfai-erika';

-- The Taste of Hungary — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyar élelmiszerek és termékek online boltja, Hollandia-szerte szállít. · https://desmaakvanhongarije.nl/' WHERE id = 'nl-imp-the-taste-of-hungary';

-- Salon de Beauté – Révész-Kovács Anita — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar tulajdonú szépségszalon Bécs 23. kerületében (Liesing). Hajvágás, körmök, arckezelés, masszázs.' WHERE id = 'at-imp-salon-de-beaute-revesz-kovacs-anita';

-- Attila Hairdesign — HALOTT LINK levágva (notfound); a tétel MARAD.
UPDATE businesses SET blurb = 'Prémium fodrász szalon Stuttgart-Möhringenben. Intercoiffure-tag, La Biosthetique termékek, kedd-szombat nyitva.' WHERE id = 'de-imp-attila-hairdesign';

-- Attila Visnyei – Rechtsanwalt München — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar ügyvéd Münchenben. Munkajog, kártérítési jog, bevándorlási ügyek — magyarul és németül.' WHERE id = 'de-imp-attila-visnyei-rechtsanwalt-munchen';

-- Tomas Auto Garage – Ridderkerk — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar autószerelő Hollandiában. APK-vizsga, javítás, diagnosztika, motorfelújítás — magyarul is intézhető.' WHERE id = 'nl-imp-tomas-auto-garage-ridderkerk';

-- Erika Eidlitz – Pszichoterapeuta — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar pszichoterapeuta és tanácsadó Bécsben (Penzing). Egyéni terápia, párterápia, online ülések is.' WHERE id = 'at-imp-erika-eidlitz-pszichoterapeuta';

-- Dr. Andrea Dudás – Hausarzt Wien — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar háziorvos Bécs 23. kerületében (Liesing). Általános orvosi ellátás, szűrővizsgálatok, beutalók.' WHERE id = 'at-imp-dr-andrea-dudas-hausarzt-wien';

-- Konditorei Piroschka Stuttgart — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar cukrászda Stuttgartban. Hagyományos torták, sütemények, kávézó — napi friss készítmények.' WHERE id = 'de-imp-konditorei-piroschka-stuttgart';

-- Puszta-Hütte – Gulyás Köln — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Kölni intézmény 1948 óta. Egyetlen fogás: eredeti recept szerinti magyar gulyásleves — turista- és helyi kedvenc. · https://xn--puszta-htte-0hb.de/' WHERE id = 'de-imp-puszta-hutte-gulyas-koln';

-- Paprika & Weine – Berlin — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyar bor- és élelmiszerspecialitás bolt Berlinben (Friedrichshain). Tokaji, Bull''s Blood, fűszerek, befőttek. · https://paprikaandfriends.com/de/' WHERE id = 'de-imp-paprika-weine-berlin';

-- Dr. Mathias Varnai – Zahnarzt Frankfurt — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar képzettségű (Budapest) fogorvos Frankfurtban (Bornheim). Általános fogászat, rendelési idő egyeztetéssel.' WHERE id = 'de-imp-dr-mathias-varnai-zahnarzt-frankfurt';

-- Túri Zsuzsanna – Friseursalon Zürich — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar fodrász Zürich közelében. Hajvágás, festés, balayage, alkalmi frizurák — online foglalás is.' WHERE id = 'ch-imp-turi-zsuzsanna-friseursalon-zurich';

-- FM Beauty – Kozmetika Zürich — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar kozmetikai szalon Zürich belvárosában. Arckezelések, szempilla, köröm, testápolás — WhatsApp-on is.' WHERE id = 'ch-imp-fm-beauty-kozmetika-zurich';

-- Dr. Semek Sándor – Bergisch Gladbach — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar fogorvos Bergisch Gladbachban (Köln közelében). Általános fogászat, fogpótlás, szuvas kezelés.' WHERE id = 'de-imp-dr-semek-sandor-bergisch-gladbach';

-- Váradi Csárda – Leipzig — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Hagyományos magyar csárda Lipcsében. Gulyás, pusztai szelet, lángos, élő zene — K-Szo ebéd és vacsora.' WHERE id = 'de-imp-varadi-csarda-leipzig';

-- Paprika & Friends – Berlin Hobrechtstr. — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyar bor- és élelmiszerspecialitás bolt Berlinben (Neukölln). Tokaji borok, paprikakrém, felvágottak, befőttek. · https://paprikaandfriends.com/de/' WHERE id = 'de-imp-paprika-friends-berlin-hobrechtstr';

-- Ladislav Anisic – ABC-Anwälte Hamburg — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Hamburgi ügyvédi iroda — Ladislav Anisic magyar nyelven is vállal jogi képviseletet. Polgári és kereskedelmi jog. · http://www.abc-anwaelte.de/' WHERE id = 'de-imp-ladislav-anisic-abc-anwalte-hamburg';

-- Eryil KFZ Werkstatt – Wien — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Autószerviz Bécs 14. kerületében (Penzing). Javítás, olajcsere, gumiszerelés, klímaszerelés — időpont ajánlott. · https://www.eryil.at/' WHERE id = 'at-imp-eryil-kfz-werkstatt-wien';

-- Autowerkstatt Graz — HALOTT LINK levágva (nem saját oldal (http://autowerkstatt-graz.at/cgi-sys/suspendedpage.cgi)); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar tulajdonos (Musti Tibor) autószervize Grazban (Andritz). Márkafüggetlen szerviz, Pickerl-vizsgálat.' WHERE id = 'at-imp-autowerkstatt-graz';

-- Buda Brigitta – Cégalapítás Svájcban — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar adó- és cégalapítási tanácsadás Schaffhausen kantonban. AHV/BVG nyugdíj-ügyintézés is.' WHERE id = 'ch-imp-buda-brigitta-cegalapitas-svajcban';

-- PD Dr. med. Antal Csepregi — HALOTT LINK levágva (refused); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar gasztroenterológus és belgyógyász szakorvos Reinachban, Bázel mellett.' WHERE id = 'ch-imp-pd-dr-med-antal-csepregi';

-- Dr. med. Robert Csiszér — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar háziorvos Flamattban, Fribourg kantonban.' WHERE id = 'ch-imp-dr-med-robert-csiszer';

-- Baán Anita – Treuhand — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyar könyvelő és adótanácsadó Arbonban, Thurgau kantonban. · http://www.banita.ch/' WHERE id = 'ch-imp-baan-anita-treuhand';

-- Paprikamarket — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar élelmiszerbolt és étterem Beverwijkben.' WHERE id = 'nl-imp-paprikamarket';

-- Dr. med. dent. Alexander Attila Kaman – Zahnimplantat Zentrum Bern — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar szájsebész és fogászati implantológus Bernben.' WHERE id = 'ch-imp-dr-med-dent-alexander-attila-kaman-zahnimplantat-zentrum';

-- Zahnimplantat Zentrum Kloten — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar fogászati implant-központ Klotenben, Zürich mellett.' WHERE id = 'ch-imp-zahnimplantat-zentrum-kloten';

-- Dr. med. dent. Katalin Koncz — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar fogorvos Bernben (Zahnimplantat Zentrum).' WHERE id = 'ch-imp-dr-med-dent-katalin-koncz';

-- Dr. med. Ágnes Koenig-Piros – Klinik Siloah — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyar szemész szakorvos Gümligenben, Bern mellett. · https://eyeparc.ch/kontakt/eyeparc-guemligen/' WHERE id = 'ch-imp-dr-med-agnes-koenig-piros-klinik-siloah';

-- Dr. med. Jenö Katho – Plastische Chirurgie — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar plasztikai sebész Zürichben.' WHERE id = 'ch-imp-dr-med-jeno-katho-plastische-chirurgie';

-- lic. iur. Georg Wohl – Rechtsanwalt — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyarul is beszélő ügyvéd Baselben. Tőkepiaci jog, adójog.' WHERE id = 'ch-imp-lic-iur-georg-wohl-rechtsanwalt';

-- Monika Pentz – Fordító — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Hites magyar-német fordító és tolmács Pockingban (Passau mellett). · http://www.ungarisch-passau.de/' WHERE id = 'de-imp-monika-pentz-fordito';

-- Akos Vida – Avimedia — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Hites magyar-német fordító és tolmács Münchenben. · http://www.avimedia.de/' WHERE id = 'de-imp-akos-vida-avimedia';

-- Dr. Péter Markotányos — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar fogorvos Bécs 21. kerületében.' WHERE id = 'at-imp-dr-peter-markotanyos';

-- Restaurant Schäfli Romanshorn — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyaros étterem Romanshornban (Pócs Imre) — házias ételek, magyar borok és pálinkák, hétvégente élő cigányzenével.' WHERE id = 'ch-imp-restaurant-schafli-romanshorn';

-- Süli Metzgerei – Magyar bolt Berg — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar húsbolt és élelmiszerbolt Bergben (Süli Béla) — saját gyártású húskészítmények, importált magyar élelmiszerek.' WHERE id = 'ch-imp-suli-metzgerei-magyar-bolt-berg';

-- Charlotte Bakery GmbH — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar cukrászda Zürich belvárosában (Bereczki-Papp Emese) — Dobostorta, Eszterházytorta, allergénmentes változatok is.' WHERE id = 'ch-imp-charlotte-bakery-gmbh';

-- Csillas Ungarische Wurst und Delikatessen — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar húskülönlegességek és delikáteszek Weilheim in Oberbayernban.' WHERE id = 'de-imp-csillas-ungarische-wurst-und-delikatessen';

-- Henry Posmontier – Podotherapie — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar podoterapeuta (orvosi lábápolás) Kölnben.' WHERE id = 'de-imp-henry-posmontier-podotherapie';

-- City Style — HALOTT LINK levágva (notfound); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar fodrászszalon Nürnbergben.' WHERE id = 'de-imp-city-style';

-- Kingart & Beautysalon — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar kozmetikai szalon Swalmenben (Limburg).' WHERE id = 'nl-imp-kingart-beautysalon';

-- Café – Brasserie Huszár — mély útvonal 404, a gyökér él
UPDATE businesses SET blurb = 'Magyar tulajdonú kávézó-brasszéria Delftben — kávézó, sörcsarnok, étterem és gasztropub egyben. · https://huszar.nl' WHERE id = 'nl-imp-cafe-brasserie-huszar';

-- Majsai étterem, Magyar büfé — mély útvonal 404, a gyökér él
UPDATE businesses SET blurb = 'Magyar étterem és büfé Krumbachban (Bajorország) — lángos és házias magyar ételek. · https://majsai-langos.de' WHERE id = 'de-imp-majsai-etterem-magyar-bufe';

-- Dr. János F. Weber-Várszegi — HALOTT LINK levágva (nem saját oldal (https://www.doktor.ch/augenaerzte/index.html)); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar szemész szakorvos Horwban (Luzern).' WHERE id = 'ch-imp-dr-janos-f-weber-varszegi';

-- Paprika and More — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar élelmiszerbolt Bregenzben (Vorarlberg).' WHERE id = 'at-imp-paprika-and-more';

-- Magyar bolt Graz — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar élelmiszerbolt Grazban (Stájerország).' WHERE id = 'at-imp-magyar-bolt-graz';

-- Panifício – Magyar pékség és kávézó — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyar pékség és kávézó Innsbruckban (Tirol). · http://www.panificio-innsbruck.at/' WHERE id = 'at-imp-panificio-magyar-pekseg-es-kavezo';

-- Patisserie Lady Lavender — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar anya-lánya (Sasvári Ildi és Dominika) cukrászdája Limburgban, Eszterházy szelet és Dobos torta is kapható.' WHERE id = 'nl-imp-patisserie-lady-lavender';

-- ABC Work Munkaközvetítő & Könyvelő Iroda — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Munkaerő-közvetítés és teljeskörű könyvelés, bérszámfejtés magyaroknak Hollandiában.' WHERE id = 'nl-imp-abc-work-munkakozvetito-konyvelo-iroda';

-- Paprika Csárda — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar étterem Zaandamban, hagyományos ízekkel.' WHERE id = 'nl-imp-paprika-csarda';

-- Metzgerei Konrad Floc — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyaros kolbász és fűszerpaprika is kapható ebben az 1980 óta működő karlsruhei hentesüzletben. · http://www.metzgerei-floc.de/' WHERE id = 'de-imp-metzgerei-konrad-floc';

-- Holland Üvegtigris Magyar Áruk Mobilboltja — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Mobil magyar élelmiszerbolt Frízföldön (Friesland), rendelésre házhozszállítással.' WHERE id = 'nl-imp-holland-uvegtigris-magyar-aruk-mobilboltja';

-- Timi's Bakery — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar tulajdonú cukrászda Zwolléban, rendelésre.' WHERE id = 'nl-imp-timi-s-bakery';

-- A&A Fit Voeding Webshop — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Egészséges/fitness élelmiszerek webshopja Rotterdamban, magyar nyelvű felülettel.' WHERE id = 'nl-imp-a-a-fit-voeding-webshop';

-- Paprikajancsi Étterem — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar étterem Büchlbergben (Alsó-Bajorország, Passau mellett) — Sebők Péter vezetésével.' WHERE id = 'de-imp-paprikajancsi-etterem';

-- Wine-Hopper – Hungarian Wines — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar borok webshopja Grünwaldban, München mellett.' WHERE id = 'de-imp-wine-hopper-hungarian-wines';

-- Dr. Norbert Adelwöhrer — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Nőgyógyász-szülész, magyarul beszélő.' WHERE id = 'at-imp-dr-norbert-adelwohrer';

-- Dr. Zoltán Tihanyi — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Sebész-gasztroenterológus, magyarul beszélő orvos.' WHERE id = 'at-imp-dr-zoltan-tihanyi';

-- Hair & Style Team Csilla — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyar fodrász Bécs 10. kerületében (Wienerberg City). Kedd-szombat nyitva. Vágás, festés, teljes fodrász-szolgáltatás. · https://www.hairstyle-csilla.at/' WHERE id = 'at-imp-hair-style-team-csilla';

-- Dr. Nagy Kornélia — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Fogorvos, magyarul beszélő.' WHERE id = 'at-imp-dr-nagy-kornelia';

-- Dr. Popadics-Antal Csilla — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Ügyvéd (lakásbérleti-család-öröklési-bűnügyi-munkaügyi-csőd jog), magyarul beszélő. · http://www.sup-a.at/' WHERE id = 'at-imp-dr-popadics-antal-csilla';

-- Radics Steuerberatung – Radics András — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Adójog, társadalombiztosítási és családi juttatások ügyintézése, magyarul beszélő.' WHERE id = 'at-imp-radics-steuerberatung-radics-andras';

-- Dr. Szilágyi Imre — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Nőgyógyász-szülész, magyarul beszélő.' WHERE id = 'at-imp-dr-szilagyi-imre';

-- Ungarische Spezialitäten Merseburg — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar élelmiszerbolt: paprika, füstölt kolbász, szalonna.' WHERE id = 'de-imp-ungarische-spezialitaten-merseburg';

-- Einbauservice Benkö GmbH — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyar autószerelő Stuttgart mellett (Backnang). · https://autoglas-backnang.de/' WHERE id = 'de-imp-einbauservice-benko-gmbh';

-- Hungarikumshop — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyar élelmiszer webshop és bolt Köln/Bonn környékén. · http://hungarikumshop.de/' WHERE id = 'de-imp-hungarikumshop';

-- Magyar etterem Nittenau, Wilde Ente — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar vendéglátóhely — a nemetorszagi-magyarok.de közösségi adatbázisából.' WHERE id = 'de-imp-magyar-etterem-nittenau-wilde-ente';

-- Gaststätte Pullen, Neuss — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar vendéglátóhely — a nemetorszagi-magyarok.de közösségi adatbázisából.' WHERE id = 'de-imp-gaststatte-pullen-neuss';

-- Bootshaus-Rheidt, Niederkassel — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar vendéglátóhely — a nemetorszagi-magyarok.de közösségi adatbázisából.' WHERE id = 'de-imp-bootshaus-rheidt-niederkassel';

-- Haus Münchshecke, Siegburg — mély útvonal 404, a gyökér él
UPDATE businesses SET blurb = 'Magyar vendéglátóhely — a nemetorszagi-magyarok.de közösségi adatbázisából. · https://www.facebook.com' WHERE id = 'de-imp-haus-munchshecke-siegburg';

-- Lisztoria Restaurant és Bár — HALOTT LINK levágva (notfound); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar vendéglátóhely — a nemetorszagi-magyarok.de közösségi adatbázisából.' WHERE id = 'de-imp-lisztoria-restaurant-es-bar';

-- J&V Rotary Motorsport — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar autószerelő — a nemetorszagi-magyarok.de közösségi adatbázisából.' WHERE id = 'de-imp-j-v-rotary-motorsport';

-- Puskás Restaurant, Bobenheim-Roxheim — HALOTT LINK levágva (notfound); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar vendéglátóhely — a nemetorszagi-magyarok.de közösségi adatbázisából.' WHERE id = 'de-imp-puskas-restaurant-bobenheim-roxheim';

-- Paprika Express - webáruház magyar termékekkel — HALOTT LINK levágva (refused); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar üzlet — a nemetorszagi-magyarok.de közösségi adatbázisából.' WHERE id = 'de-imp-paprika-express-webaruhaz-magyar-termekekkel';

-- ALKA FRESHFOOD, Langen — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar vendéglátóhely — a nemetorszagi-magyarok.de közösségi adatbázisából.' WHERE id = 'de-imp-alka-freshfood-langen';

-- Fischerhütte Plochingen étterem — HALOTT LINK levágva (notfound); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar vendéglátóhely — a nemetorszagi-magyarok.de közösségi adatbázisából.' WHERE id = 'de-imp-fischerhutte-plochingen-etterem';

-- Paradise Beauty Bar, szépségszalon, Pirmasens — HALOTT LINK levágva (notfound); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar manikűrös-pedikűrös — a nemetorszagi-magyarok.de közösségi adatbázisából.' WHERE id = 'de-imp-paradise-beauty-bar-szepsegszalon-pirmasens';

-- Stratkemper Ildiko fordító — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyar fordító/tolmács — a nemetorszagi-magyarok.de közösségi adatbázisából. · http://ungarisch-uebersetzen.com/' WHERE id = 'de-imp-stratkemper-ildiko-fordito';

-- Kornelia Csuha — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar könyvelő/adótanácsadó — a nemetorszagi-magyarok.de közösségi adatbázisából.' WHERE id = 'de-imp-kornelia-csuha';

-- Katalin Schmitz-Molnár — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyar fordító/tolmács — a nemetorszagi-magyarok.de közösségi adatbázisából. · http://und-lingua.de/index.php/DE/' WHERE id = 'de-imp-katalin-schmitz-molnar';

-- Creativecv — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar szolgáltató Bécsben.' WHERE id = 'at-imp-creativecv';

-- Gabriel M. Trischler (M.A.) GCDF — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyar fordító/tolmács — a nemetorszagi-magyarok.de közösségi adatbázisából. · http://www.trischler.eu/' WHERE id = 'de-imp-gabriel-m-trischler-m-a-gcdf';

-- PC Top Service — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyar számítógép-szerviz Hágában. · http://pctopservice.nl/' WHERE id = 'nl-imp-pc-top-service';

-- FL Intercoop fordítóiroda, Ficsor László — HALOTT LINK levágva (refused); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar fordító/tolmács — a nemetorszagi-magyarok.de közösségi adatbázisából.' WHERE id = 'de-imp-fl-intercoop-forditoiroda-ficsor-laszlo';

-- MH Treuhand GmbH — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar vezetésű könyvelő- és adótanácsadó iroda (Treuhand) Arbonban, Thurgau kantonban.' WHERE id = 'ch-imp-mh-treuhand-gmbh';

-- Zack Zack Schönheit – Böszörményi Ágnes, Vaszari Tímea — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Fodrász- és szépségszalon Zürichben, magyar tulajdonosokkal (Böszörményi Ágnes, Vaszari Tímea).' WHERE id = 'ch-imp-zack-zack-schonheit-boszormenyi-agnes-vaszari-timea';

-- Dr. iur. Alex R. Korach — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Ügyvéd (Dr. Alex R. Korach), magyar háttérrel, kereskedelmi és társasági jogban, Zürichben.' WHERE id = 'ch-imp-dr-iur-alex-r-korach';

-- Priv.-Doz. Dr. Peter Kalmar — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Radiológus szakorvos (Röntgen am Kai), magyarul is rendel, Grazban (Doctena).' WHERE id = 'at-imp-priv-doz-dr-peter-kalmar';

-- Bavaria Hair — HALOTT LINK levágva (notfound); a tétel MARAD.
UPDATE businesses SET blurb = 'Fodrászat Münchenben (Untergiesing-Giesing), a csapat magyarul is beszél (Treatwell).' WHERE id = 'de-imp-bavaria-hair';

-- Haarstudio Alex Rudi — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Fodrászat Linzben (Urfahr), a tulajdonos (Alex) magyarul is beszél (Treatwell).' WHERE id = 'at-imp-haarstudio-alex-rudi';

-- Übersetzungsbüro Melinda Kovacsova — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar-szlovák-német fordítóiroda Welsben, Felső-Ausztriában (tulajdonos: Kovácsová Melinda).' WHERE id = 'at-imp-ubersetzungsburo-melinda-kovacsova';

-- Dr. Andreas Sir — HALOTT LINK levágva (refused); a tétel MARAD.
UPDATE businesses SET blurb = 'Nőgyógyász szakorvos, magyarul is rendel, Halleinben, Salzburg tartományban (Doctena).' WHERE id = 'at-imp-dr-andreas-sir';

-- Szabó Eyke u. László Dolmetscher und Übersetzer — mély útvonal 404, a gyökér él
UPDATE businesses SET blurb = 'Hites tolmács és fordítóiroda magyar nyelvre, Berlinben (Pankow). · https://www.gelbeseiten.de' WHERE id = 'de-imp-szabo-eyke-u-laszlo-dolmetscher-und-ubersetzer';

-- Dr. Elke Sallmon-Herrmann — mély útvonal 404, a gyökér él
UPDATE businesses SET blurb = 'Fogorvos Berlinben (Mitte), magyarul is rendel (Doctena). · https://www.doctena.de' WHERE id = 'de-imp-dr-elke-sallmon-herrmann';

-- Timis Torten Manufaktur — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyaros ízvilágú tortaműhely Stuttgartban (Weilimdorf), Timea Leffler-Czigler cukrász keze munkája, kizárólag rendelésre.' WHERE id = 'de-imp-timis-torten-manufaktur';

-- Restaurant 1832 – Familie Rosics — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar, európai és osztrák konyhát kínáló étterem Hainichenben, Barbara és György Rosics vezetésével.' WHERE id = 'de-imp-restaurant-1832-familie-rosics';

-- Váradi-Hofladen — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyar házi termékeket (szalámi, kolbász, sonka, fűszerek) kínáló hofladen és party-szerviz Kolkwitzben (Váradi család). · http://www.varadi-hofladen.de/' WHERE id = 'de-imp-varadi-hofladen';

-- Dr. Gabriela M. Simon – Zahnarzt Stuttgart — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyar (kolozsvári képzettségű) fogorvosnő Stuttgart belvárosában. · http://www.zahnarzt-g-simon.de/' WHERE id = 'de-imp-dr-gabriela-m-simon-zahnarzt-stuttgart';

-- Paprika Shop Olten — mély útvonal 404, a gyökér él
UPDATE businesses SET blurb = 'Magyar élelmiszerbolt Oltenben (Solothurn kanton). Paprika, füstölt húsáruk, tartós élelmiszerek, magyar különlegességek. · https://www.paprikashop.ch' WHERE id = 'ch-imp-paprika-shop-olten';

-- Zelizi Petra Viselkedéselemző, Pszichológus, Önfejlesztési Tanácsadó — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Pszichológus / Coach' WHERE id = 'de-nmde-zelizi-petra-viselkedeselemzo-pszichologus-onfejle';

-- Ungarische Welt, magyar bolt, Nittenau — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar bolt / élelmiszer' WHERE id = 'de-nmde-ungarische-welt-magyar-bolt-nittenau';

-- Ungarnservice — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar bolt / élelmiszer' WHERE id = 'de-nmde-ungarnservice';

-- Ungarikum Delikatesse, magyar bolt, Metten — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar bolt / élelmiszer' WHERE id = 'de-nmde-ungarikum-delikatesse-magyar-bolt-metten';

-- Magyar kozmetikus Schwabachban, Calmeza Kosmetik és Wellness — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Kozmetikus' WHERE id = 'de-nmde-magyar-kozmetikus-schwabachban-calmeza-kosmetik-es';

-- Zoli's Extrawurst und_fertig, magyar étterem, Espasingen — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Étterem' WHERE id = 'de-nmde-zoli-s-extrawurst-und-fertig-magyar-etterem-espasi';

-- Turcsanyi Photography, DEINSPORTBILD.de — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Fotós' WHERE id = 'de-nmde-turcsanyi-photography-deinsportbild-de';

-- Made in Hungaria - ungarische Spezialitäten, magyar bolt — mély útvonal 404, a gyökér él
UPDATE businesses SET blurb = 'Magyar bolt / élelmiszer · https://bit.ly' WHERE id = 'de-nmde-made-in-hungaria-ungarische-spezialitaten-magyar-b';

-- NB-Center GmbH, autószerelő, autókereskedő, Northeim — mély útvonal 404, a gyökér él
UPDATE businesses SET blurb = 'Autókereskedés · https://bit.ly' WHERE id = 'de-nmde-nb-center-gmbh-autoszerelo-autokereskedo-northeim';

-- Balázs Edit, fordító, Dresden-Neustadt — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Fordító · http://uebersetzungen-ungarisch.de/' WHERE id = 'de-nmde-balazs-edit-fordito-dresden-neustadt';

-- Ungarische spezialitäten, Linsengericht — HALOTT LINK levágva (notfound); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar bolt / élelmiszer' WHERE id = 'de-nmde-ungarische-spezialitaten-linsengericht';

-- Andrea Tolk en Vertaalservice – Molnár Andrea — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar-holland-román-angol tolmács és fordító Wapenveldben (Gelderland tartomány).' WHERE id = 'nl-imp-andrea-tolk-en-vertaalservice-molnar-andrea';

-- Ménesi Csaba - fotós — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Fotós' WHERE id = 'de-nmde-menesi-csaba-fotos';

-- Mühl-Lingua – magyar-német fordítások — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Fordító' WHERE id = 'de-nmde-muhl-lingua-magyar-nemet-forditasok';

-- HonNed – Virtuális asszisztens — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Virtuális asszisztens' WHERE id = 'nl-hh-honned-virtualis-asszisztens';

-- Chilicum Deutschland – Magyar chili termékek — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar bolt / élelmiszer' WHERE id = 'de-nmde-chilicum-deutschland-magyar-chili-termekek';

-- Prof. Dr. Németh Zoltán — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyar nőgyógyász professzor Bécsben. · https://www.aerztezentrum-wien.at/' WHERE id = 'at-imp-prof-dr-nemeth-zoltan';

-- Naturheilpraxis Oliver Boros – Természetgyógyász — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Természetgyógyász · http://naturheilpraxis-boros.de/' WHERE id = 'de-nmde-naturheilpraxis-oliver-boros-termeszetgyogyasz';

-- FM Steuerberatung / PROTAX – Michlits Margit — HALOTT LINK levágva (refused); a tétel MARAD.
UPDATE businesses SET blurb = 'Adótanácsadás magyarul Burgenlandban (Bruckneudorf) — Mag. Margit Michlits vezetésével; könyvelés, bérszámfejtés, adóbevallás.' WHERE id = 'at-imp-fm-steuerberatung-protax-michlits-margit';

-- Arcsebész Münchenben, Dr. Balogh Péter — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyar sebész · https://mkg-pch.com/' WHERE id = 'de-orvos-arcsebesz-munchenben-dr-balogh-peter';

-- Dr.Theil Edit, haziorvos, belgyogyasz, München, Hallbergmoos — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyar belgyógyász · http://www.hausarzt-hallbergmoos.de/' WHERE id = 'de-orvos-dr-theil-edit-haziorvos-belgyogyasz-munchen-hallbe';

-- Serester Robert-Alexander — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyar szemész · http://www.augenarzt-serester.de/' WHERE id = 'de-orvos-serester-robert-alexander';

-- Dr. med. Krisztian Kovacs, Teisnach — mély útvonal 404, a gyökér él
UPDATE businesses SET blurb = 'Magyar orvos · https://www.jameda.de' WHERE id = 'de-orvos-dr-med-krisztian-kovacs-teisnach';

-- Urológus orvos Münchenben, Dr. Marius Michael Anger — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyar urológus · https://www.urologie-am-sendlinger-tor.de/' WHERE id = 'de-orvos-urologus-orvos-munchenben-dr-marius-michael-anger';

-- Rajcsanyi Pal, Dr. — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar orvos' WHERE id = 'de-orvos-rajcsanyi-pal-dr';

-- Háziorvos Gammertingenben, Dr. Vlazak Gabor — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar háziorvos' WHERE id = 'de-orvos-haziorvos-gammertingenben-dr-vlazak-gabor';

-- Linde-Krakowsky Zsuzsanna, Dr. MU Debrecen — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyar orvos · http://www.dr-linde.de/' WHERE id = 'de-orvos-linde-krakowsky-zsuzsanna-dr-mu-debrecen';

-- Nagy Zoltán, Dr. med. dent — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyar fogorvos · http://www.drnagy.de/' WHERE id = 'de-orvos-nagy-zoltan-dr-med-dent';

-- Fizioterápia Münchenben, Pogany Katalin — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar fizioterapeuta' WHERE id = 'de-orvos-fizioterapia-munchenben-pogany-katalin';

-- Kovacs Edit szőlésznő — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyar szülésznő / bába · http://www.hebamme-bonn.com/' WHERE id = 'de-orvos-kovacs-edit-szoleszno';

-- Fogorvos Münchenben, Dr. Dr. Bangha-Szabo Thomas — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyar fogorvos · http://www.bangha-szabo.de/' WHERE id = 'de-orvos-fogorvos-munchenben-dr-dr-bangha-szabo-thomas';

-- Fogorvos Münchenben, Dr. Görgey Tibor — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyar fogorvos · https://www.zahnzentrum-solln.de/' WHERE id = 'de-orvos-fogorvos-munchenben-dr-gorgey-tibor';

-- Dr. Gyula Sipos-Jackel fogorvos — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar fogorvos' WHERE id = 'de-orvos-dr-gyula-sipos-jackel-fogorvos';

-- Dr. med. Gabriella Marthy — mély útvonal 404, a gyökér él
UPDATE businesses SET blurb = 'Magyar orvos · https://www.sanego.de' WHERE id = 'de-orvos-dr-med-gabriella-marthy';

-- Tömöri Kinga, Dr. — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyar orvos · http://zahn-art-praxis.de/' WHERE id = 'de-orvos-tomori-kinga-dr';

-- Guildfordi Magyar Tanoda és Játszóház — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Hétvégi magyar iskola és játszóház · Guildford · http://hcaguildford.org.uk/' WHERE id = 'gb-guildfordi-magyar-tanoda-es-jatszohaz';

-- Koczor Krisztián - táplálkozási tanácsadó Oberhausenben — mély útvonal 404, a gyökér él
UPDATE businesses SET blurb = 'Magyar táplálkozási tanácsadó · https://www.nutriception.de' WHERE id = 'de-orvos-koczor-krisztian-taplalkozasi-tanacsado-oberhausen';

-- Dr. Vasas Péter — proktológiai/sebészeti magánrendelés (London) — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyarul beszélő sebész (aranyér-kezelés, gasztrointesztinális sebészet) — szombat délutáni (15–19h) magánrendelés, kizárólag magánbetegek, előzetes bejelentkezéssel · London · http://haemorrhoidclinic.co.uk.websitebuilder.prositehosting.co.uk/magyar' WHERE id = 'gb-dr-vasas-peter-proktologiai-sebeszeti-maganrendeles-london';

-- Dr. Vasas Péter — sebészeti konzultáció (Pontefract/Doncaster) — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Magyarul beszélő sebész — hétköznapi konzultáció és vizsgálat (Church View Medical Centre), a londoni szombati magánrendelés hétköznapi alternatívája ugyanazzal az orvossal · Pontefract · http://haemorrhoidclinic.co.uk.websitebuilder.prositehosting.co.uk/magyar' WHERE id = 'gb-dr-vasas-peter-sebeszeti-konzultacio-pontefract-doncaster';

-- The Langos Factory Ltd — HALOTT LINK levágva (dns-dead); a tétel MARAD.
UPDATE businesses SET blurb = 'Magyar lángos (utcai gyorsétel), take-away + rendezvényes catering · Bushey' WHERE id = 'gb-the-langos-factory-ltd';

-- MADACH Egyesület — Spanyolországi Magyarok Egyesülete — csak HTTP-n él / átirányít
UPDATE businesses SET blurb = 'Országos magyar kulturális egyesület (Madrid, Barcelona, Costa del Sol, Zaragoza, Valencia helyi csoportokkal) · Madrid · http://www.madach.es/' WHERE id = 'es-madach-egyesulet-spanyolorszagi-magyarok-egyesulete';

-- Hotel Algorfa — magyarul is beszélő szálloda és étterem — HALOTT LINK levágva (notfound); a tétel MARAD.
UPDATE businesses SET blurb = '3 csillagos szálloda étteremmel a Costa Blancán, magyarul is beszélő személyzettel (az étlapon gulyás is) · Algorfa' WHERE id = 'es-hotel-algorfa-magyarul-is-beszelo-szalloda-es-etterem';
