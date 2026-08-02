-- Halott weboldal-linkek kivezetése a szaknévsorból — 2026-08-03
--
-- ⚠️ MIÉRT SZÁMÍT: 833 tételnél a `blurb` végén álló weboldal a fő — 5 tételnél
-- az EGYETLEN — elérhetőség (`lib/contact-links.ts` → `extractContactFromBlurb`).
-- Ha a domain meghal, a tétel némán zsákutcává válik: a user rákattint és
-- hibalapot kap. Semmi nem jelzi.
--
-- MÉRÉS: mind a 833 link ellenőrizve (`scripts/check-blurb-websites.mjs`),
-- majd a gyanúsak ÚJRAMÉRVE VALÓDI BÖNGÉSZŐVEL (`recheck-websites-browser.mjs`).
--
-- ⚠️⚠️ A KÉT MÓDSZER KELLETT, mert a sima HTTP MINDKÉT IRÁNYBAN téved:
--   • 24 link, amit a `fetch` bukottnak jelölt, BÖNGÉSZŐVEL ÉL (403/503 =
--     bot-védelem, nem halál). Köztük: osborneslaw.com, amigohungaro.es,
--     mksmiles.co.uk, europaclub.at. Ezekhez NEM nyúltam.
--   • 3 tétel, amit a `fetch` „parkoltatottnak" jelölt, valójában él
--     (a „coming soon"/„under construction" szöveg élő lapon is előfordul):
--     zsigmondkiraly.co.uk, bristolikisiskola.org.uk, moveamus.at.
--
-- ⚠️⚠️ ÉS EGY SAJÁT MÉRŐESZKÖZ-HIBA, amit el kellett kapni: a böngészős
-- újramérés ELSŐ változata EGYETLEN lapot használt újra mind a 104 címre, és a
-- sok sikertelen navigáció után a lap beragadt — **mind a 104 „halott" lett**,
-- köztük a nyilvánvalóan élő osborneslaw.com. Ha elhiszem, 104 ÉLŐ linket
-- töröltem volna. A javítás: címenként új böngésző-kontextus + a hibaüzenet
-- kiírása. **Egy ismerten élő elem a halmazban ingyen kontrollcsoport.**
--
-- AMIT TÖRLÜNK (64) — mindkét módszer egyetért:
--   54 db: a domain NEM oldódik fel (ERR_NAME_NOT_RESOLVED böngészőben is)
--    1 db: parkoltatott domain
--    7 db: a domain él, de a GYÖKÉR is 404-et ad → a link a user felé törött
--    2 db: eltűnt KATALÓGUS-PROFIL (gelbeseiten.de, doctena.de) — itt a gyökér
--          a platform főoldala lenne, ami a usernek használhatatlan
--
-- ⚠️ NEM törlünk 403/401/500/503 esetén: azok bot-védelem vagy átmeneti hiba.
--
-- HATÁS: 64 tételből 59-nek MARAD telefonja/e-mailje; 5-nél a weboldal volt az
-- egyetlen elérhetőség — azok zsákutcává válnak, DE már eddig is azok voltak,
-- csak láthatatlanul (törött linkkel).

----------------------------------------------- A HALOTT LINK ELTÁVOLÍTÁSA
UPDATE businesses SET blurb = 'Magyar baráti kör · Essen', updated_at = datetime('now')
  WHERE id = 'de-rajna-ruhr-videki-magyar-barati-kor-ufrr';  -- hunrheinruhr.jimdo.com
UPDATE businesses SET blurb = 'Kozmetikus és hajgyógyász, arckezelések, testkezelések, hajápolás Bécs 1. kerületében.', updated_at = datetime('now')
  WHERE id = 'at-imp-banfai-erika';  -- kosmetik-haut-haar.at
UPDATE businesses SET blurb = 'Magyar tulajdonú szépségszalon Bécs 23. kerületében (Liesing). Hajvágás, körmök, arckezelés, masszázs.', updated_at = datetime('now')
  WHERE id = 'at-imp-salon-de-beaute-revesz-kovacs-anita';  -- salondebeaute.wien
UPDATE businesses SET blurb = 'Magyar ügyvéd Münchenben. Munkajog, kártérítési jog, bevándorlási ügyek — magyarul és németül.', updated_at = datetime('now')
  WHERE id = 'de-imp-attila-visnyei-rechtsanwalt-munchen';  -- www.visnyei.de
UPDATE businesses SET blurb = 'Magyar autószerelő Hollandiában. APK-vizsga, javítás, diagnosztika, motorfelújítás — magyarul is intézhető.', updated_at = datetime('now')
  WHERE id = 'nl-imp-tomas-auto-garage-ridderkerk';  -- www.tomasautogaragebedrijf.nl
UPDATE businesses SET blurb = 'Magyar pszichoterapeuta és tanácsadó Bécsben (Penzing). Egyéni terápia, párterápia, online ülések is.', updated_at = datetime('now')
  WHERE id = 'at-imp-erika-eidlitz-pszichoterapeuta';  -- www.psychotherapie-eidlitz.at
UPDATE businesses SET blurb = 'Magyar háziorvos Bécs 23. kerületében (Liesing). Általános orvosi ellátás, szűrővizsgálatok, beutalók.', updated_at = datetime('now')
  WHERE id = 'at-imp-dr-andrea-dudas-hausarzt-wien';  -- www.dr-dudas.at
UPDATE businesses SET blurb = 'Magyar képzettségű (Budapest) fogorvos Frankfurtban (Bornheim). Általános fogászat, rendelési idő egyeztetéssel.', updated_at = datetime('now')
  WHERE id = 'de-imp-dr-mathias-varnai-zahnarzt-frankfurt';  -- www.zahnaerzte-varnai-varnai.de
UPDATE businesses SET blurb = 'Magyar fodrász Zürich közelében. Hajvágás, festés, balayage, alkalmi frizurák — online foglalás is.', updated_at = datetime('now')
  WHERE id = 'ch-imp-turi-zsuzsanna-friseursalon-zurich';  -- www.turizsuzsa.ch
UPDATE businesses SET blurb = 'Magyar kozmetikai szalon Zürich belvárosában. Arckezelések, szempilla, köröm, testápolás — WhatsApp-on is.', updated_at = datetime('now')
  WHERE id = 'ch-imp-fm-beauty-kozmetika-zurich';  -- www.fmbeauty.ch
UPDATE businesses SET blurb = 'Magyar fogorvos Bergisch Gladbachban (Köln közelében). Általános fogászat, fogpótlás, szuvas kezelés.', updated_at = datetime('now')
  WHERE id = 'de-imp-dr-semek-sandor-bergisch-gladbach';  -- www.zahnarzt-dr-semek.de
UPDATE businesses SET blurb = 'Magyar adó- és cégalapítási tanácsadás Schaffhausen kantonban. AHV/BVG nyugdíj-ügyintézés is.', updated_at = datetime('now')
  WHERE id = 'ch-imp-buda-brigitta-cegalapitas-svajcban';  -- www.cegalapitas-svajcban.com
UPDATE businesses SET blurb = 'Magyar fogorvos Bernben (Zahnimplantat Zentrum).', updated_at = datetime('now')
  WHERE id = 'ch-imp-dr-med-dent-katalin-koncz';  -- www.zahnimplantat-zentrum.ch/bern
UPDATE businesses SET blurb = 'Magyar plasztikai sebész Zürichben.', updated_at = datetime('now')
  WHERE id = 'ch-imp-dr-med-jeno-katho-plastische-chirurgie';  -- www.drkatho.ch
UPDATE businesses SET blurb = 'Magyarul is beszélő ügyvéd Baselben. Tőkepiaci jog, adójog.', updated_at = datetime('now')
  WHERE id = 'ch-imp-lic-iur-georg-wohl-rechtsanwalt';  -- www.advokatur-wohl.ch
UPDATE businesses SET blurb = 'Magyar fogorvos Bécs 21. kerületében.', updated_at = datetime('now')
  WHERE id = 'at-imp-dr-peter-markotanyos';  -- drpetermarkos.com
UPDATE businesses SET blurb = 'Magyar podoterapeuta (orvosi lábápolás) Kölnben.', updated_at = datetime('now')
  WHERE id = 'de-imp-henry-posmontier-podotherapie';  -- henrypodotherapie.de
UPDATE businesses SET blurb = 'Magyar kozmetikai szalon Swalmenben (Limburg).', updated_at = datetime('now')
  WHERE id = 'nl-imp-kingart-beautysalon';  -- www.kingartenbeautysalon.nl
UPDATE businesses SET blurb = 'Magyar élelmiszerbolt Bregenzben (Vorarlberg).', updated_at = datetime('now')
  WHERE id = 'at-imp-paprika-and-more';  -- www.paprikaandmore.at
UPDATE businesses SET blurb = 'Magyar élelmiszerbolt Grazban (Stájerország).', updated_at = datetime('now')
  WHERE id = 'at-imp-magyar-bolt-graz';  -- www.magyarboltgraz.eu
UPDATE businesses SET blurb = 'Magyar belgyógyász Merseburgban (Sachsen-Anhalt).', updated_at = datetime('now')
  WHERE id = 'de-imp-andrea-barath-dipl-med';  -- docvadis.de/andrea-barath
UPDATE businesses SET blurb = 'Magyar anya-lánya (Sasvári Ildi és Dominika) cukrászdája Limburgban, Eszterházy szelet és Dobos torta is kapható.', updated_at = datetime('now')
  WHERE id = 'nl-imp-patisserie-lady-lavender';  -- www.patisserieladylavender.nl
UPDATE businesses SET blurb = 'Munkaerő-közvetítés és teljeskörű könyvelés, bérszámfejtés magyaroknak Hollandiában.', updated_at = datetime('now')
  WHERE id = 'nl-imp-abc-work-munkakozvetito-konyvelo-iroda';  -- abcwork.nl
UPDATE businesses SET blurb = 'Mobil magyar élelmiszerbolt Frízföldön (Friesland), rendelésre házhozszállítással.', updated_at = datetime('now')
  WHERE id = 'nl-imp-holland-uvegtigris-magyar-aruk-mobilboltja';  -- www.hollanduvegtigrismobilbolt.eu
UPDATE businesses SET blurb = 'Magyar tulajdonú cukrászda Zwolléban, rendelésre.', updated_at = datetime('now')
  WHERE id = 'nl-imp-timi-s-bakery';  -- www.timisbakery.nl
UPDATE businesses SET blurb = 'Egészséges/fitness élelmiszerek webshopja Rotterdamban, magyar nyelvű felülettel.', updated_at = datetime('now')
  WHERE id = 'nl-imp-a-a-fit-voeding-webshop';  -- fit-voedingwebshop.nl/hu
UPDATE businesses SET blurb = 'Magyar étterem Büchlbergben (Alsó-Bajorország, Passau mellett) — Sebők Péter vezetésével.', updated_at = datetime('now')
  WHERE id = 'de-imp-paprikajancsi-etterem';  -- www.paprikajancsi.com
UPDATE businesses SET blurb = 'Magyar borok webshopja Grünwaldban, München mellett.', updated_at = datetime('now')
  WHERE id = 'de-imp-wine-hopper-hungarian-wines';  -- www.wine-hopper.de
UPDATE businesses SET blurb = 'Nőgyógyász-szülész, magyarul beszélő.', updated_at = datetime('now')
  WHERE id = 'at-imp-dr-norbert-adelwohrer';  -- www.adelwoherer.at
UPDATE businesses SET blurb = 'Sebész-gasztroenterológus, magyarul beszélő orvos.', updated_at = datetime('now')
  WHERE id = 'at-imp-dr-zoltan-tihanyi';  -- www.surgery-tihanyi.com
UPDATE businesses SET blurb = 'Adójog, társadalombiztosítási és családi juttatások ügyintézése, magyarul beszélő.', updated_at = datetime('now')
  WHERE id = 'at-imp-radics-steuerberatung-radics-andras';  -- www.radics-stauerberatung.at
UPDATE businesses SET blurb = 'Magyar élelmiszerbolt: paprika, füstölt kolbász, szalonna.', updated_at = datetime('now')
  WHERE id = 'de-imp-ungarische-spezialitaten-merseburg';  -- ungarischer-laden.de
UPDATE businesses SET blurb = 'Magyar vendéglátóhely — a nemetorszagi-magyarok.de közösségi adatbázisából.', updated_at = datetime('now')
  WHERE id = 'de-imp-paprika-haus';  -- www.paprikahaus.jimdo.com
UPDATE businesses SET blurb = 'Magyar vendéglátóhely — a nemetorszagi-magyarok.de közösségi adatbázisából.', updated_at = datetime('now')
  WHERE id = 'de-imp-bootshaus-rheidt-niederkassel';  -- www.www.bootshaus-rheidt.de
UPDATE businesses SET blurb = 'Magyar autószerelő — a nemetorszagi-magyarok.de közösségi adatbázisából.', updated_at = datetime('now')
  WHERE id = 'de-imp-j-v-rotary-motorsport';  -- rotaryteile.de
UPDATE businesses SET blurb = 'Magyar vendéglátóhely — a nemetorszagi-magyarok.de közösségi adatbázisából.', updated_at = datetime('now')
  WHERE id = 'de-imp-alka-freshfood-langen';  -- www.alka-freshfood-langen.de/#cat6
UPDATE businesses SET blurb = 'Magyar könyvelő/adótanácsadó — a nemetorszagi-magyarok.de közösségi adatbázisából.', updated_at = datetime('now')
  WHERE id = 'de-imp-kornelia-csuha';  -- jog-ado-nemetorszag.hu
UPDATE businesses SET blurb = 'Magyar szolgáltató Bécsben.', updated_at = datetime('now')
  WHERE id = 'at-imp-creativecv';  -- www.creativecv.solutions
UPDATE businesses SET blurb = 'Magyar vezetésű könyvelő- és adótanácsadó iroda (Treuhand) Arbonban, Thurgau kantonban.', updated_at = datetime('now')
  WHERE id = 'ch-imp-mh-treuhand-gmbh';  -- www.mh-treuhand.ch
UPDATE businesses SET blurb = 'Fodrász- és szépségszalon Zürichben, magyar tulajdonosokkal (Böszörményi Ágnes, Vaszari Tímea).', updated_at = datetime('now')
  WHERE id = 'ch-imp-zack-zack-schonheit-boszormenyi-agnes-vaszari-timea';  -- www.zackzackschoenheit.ch
UPDATE businesses SET blurb = 'Ügyvéd (Dr. Alex R. Korach), magyar háttérrel, kereskedelmi és társasági jogban, Zürichben.', updated_at = datetime('now')
  WHERE id = 'ch-imp-dr-iur-alex-r-korach';  -- www.korachsimonius.ch
UPDATE businesses SET blurb = 'Radiológus szakorvos (Röntgen am Kai), magyarul is rendel, Grazban (Doctena).', updated_at = datetime('now')
  WHERE id = 'at-imp-priv-doz-dr-peter-kalmar';  -- drkalmar.at
UPDATE businesses SET blurb = 'Magyar-szlovák-német fordítóiroda Welsben, Felső-Ausztriában (tulajdonos: Kovácsová Melinda).', updated_at = datetime('now')
  WHERE id = 'at-imp-ubersetzungsburo-melinda-kovacsova';  -- www.uebersetzungsbuero-kovacsova.at
UPDATE businesses SET blurb = 'Magyar, európai és osztrák konyhát kínáló étterem Hainichenben, Barbara és György Rosics vezetésével.', updated_at = datetime('now')
  WHERE id = 'de-imp-restaurant-1832-familie-rosics';  -- www.1832restaurant.de
UPDATE businesses SET blurb = 'Péter Varga családi lángos-bisztrója, hagyományos recept szerint készített lángossal és süteményekkel.', updated_at = datetime('now')
  WHERE id = 'de-imp-varga-s-bistro';  -- vargas-bistro.de
UPDATE businesses SET blurb = 'Magyar-holland-román-angol tolmács és fordító Wapenveldben (Gelderland tartomány).', updated_at = datetime('now')
  WHERE id = 'nl-imp-andrea-tolk-en-vertaalservice-molnar-andrea';  -- tolk-en-vertaalservice.nl
UPDATE businesses SET blurb = 'Büntetőjogi ügyvéd Amszterdamban — a hágai magyar nagykövetség ajánlásával.', updated_at = datetime('now')
  WHERE id = 'nl-imp-mr-marielle-van-essen-advocaat';  -- www.vanessen-advocaat.nl
UPDATE businesses SET blurb = 'Magyar–angol jogi és orvosi szakfordítás (online, nincs ügyfélfogadó iroda) · London', updated_at = datetime('now')
  WHERE id = 'gb-koczor-translation-koczor-ida-jogi-orvosi-szakfordito';  -- koczortranslation.co.uk
UPDATE businesses SET blurb = 'Magyar lángos (utcai gyorsétel), take-away + rendezvényes catering · Bushey', updated_at = datetime('now')
  WHERE id = 'gb-the-langos-factory-ltd';  -- www.thelangosfactory.com
UPDATE businesses SET blurb = 'Unisex fodrászat, budapesti fodrász-családi hagyomány · Reading', updated_at = datetime('now')
  WHERE id = 'gb-varga-s-hair-design';  -- www.hairdresser-reading.co.uk
UPDATE businesses SET blurb = 'Prémium fodrász szalon Stuttgart-Möhringenben. Intercoiffure-tag, La Biosthetique termékek, kedd-szombat nyitva.', updated_at = datetime('now')
  WHERE id = 'de-imp-attila-hairdesign';  -- www.attila-hairdesign.com
UPDATE businesses SET blurb = 'Magyar gasztroenterológus és belgyógyász szakorvos Reinachban, Bázel mellett.', updated_at = datetime('now')
  WHERE id = 'ch-imp-pd-dr-med-antal-csepregi';  -- www.doktorcsepregi.ch
UPDATE businesses SET blurb = 'Magyar tulajdonú természetes kozmetikai szalon és bolt Rotterdam Hillegersberg negyedében.', updated_at = datetime('now')
  WHERE id = 'nl-imp-vintage-beauty-nature-cosmetics';  -- vintagebeautyrotterdam.nl
UPDATE businesses SET blurb = 'Magyar fodrászszalon Nürnbergben.', updated_at = datetime('now')
  WHERE id = 'de-imp-city-style';  -- city0style.business.site
UPDATE businesses SET blurb = 'Svájci és magyar specialitások Horgenbergen, Alexandra és Viktoria Barillò vezetésével.', updated_at = datetime('now')
  WHERE id = 'ch-imp-restaurant-wiesental';  -- www.wiesental-horgenberg.ch
UPDATE businesses SET blurb = 'Magyar vendéglátóhely — a nemetorszagi-magyarok.de közösségi adatbázisából.', updated_at = datetime('now')
  WHERE id = 'de-imp-fischerhutte-plochingen-etterem';  -- fischerhuetteplochingen.de
UPDATE businesses SET blurb = 'Magyar manikűrös-pedikűrös — a nemetorszagi-magyarok.de közösségi adatbázisából.', updated_at = datetime('now')
  WHERE id = 'de-imp-paradise-beauty-bar-szepsegszalon-pirmasens';  -- paradise-beauty-bar.business.site
UPDATE businesses SET blurb = 'Fodrászat Münchenben (Untergiesing-Giesing), a csapat magyarul is beszél (Treatwell).', updated_at = datetime('now')
  WHERE id = 'de-imp-bavaria-hair';  -- bavaria-hair.mytreatwell.de
UPDATE businesses SET blurb = 'Hites tolmács és fordítóiroda magyar nyelvre, Berlinben (Pankow).', updated_at = datetime('now')
  WHERE id = 'de-imp-szabo-eyke-u-laszlo-dolmetscher-und-ubersetzer';  -- www.gelbeseiten.de/gsbiz/080a3c2e-b54f-49a6-95fb-4badebcb04ab
UPDATE businesses SET blurb = 'Fogorvos Berlinben (Mitte), magyarul is rendel (Doctena).', updated_at = datetime('now')
  WHERE id = 'de-imp-dr-elke-sallmon-herrmann';  -- www.doctena.de/de/behandler/dr-elke-sallmonn-herrmann-284039
UPDATE businesses SET blurb = 'Hites magyar-német műszaki fordító Reutlingenben (Ungarisch-Stuttgart), a stuttgarti magyar főkonzulátus hivatalos listáján.', updated_at = datetime('now')
  WHERE id = 'de-imp-kiss-mayer-emoke-fordito';  -- www.ungarisch-stuttgart.de
UPDATE businesses SET blurb = 'Magyar gulyás-étterem Berlin-Kreuzbergben, egy fős konyha (a szakács maga szolgál fel), csak készpénz.', updated_at = datetime('now')
  WHERE id = 'de-imp-g-wie-goulasch';  -- www.g-wie-goulasch.de
UPDATE businesses SET blurb = 'Magyar háziorvos', updated_at = datetime('now')
  WHERE id = 'de-orvos-dr-zsok-cristina';  -- www.hausarztpraxis-zsok.de
UPDATE businesses SET blurb = 'Fordítóiroda Luganóban, magyar nyelvű fordítási szolgáltatással is.', updated_at = datetime('now')
  WHERE id = 'ch-imp-kosmos-translations-services-sagl';  -- www.kosmostranslations.com

-------------------------------------- ÚTVONAL LEVÁGÁSA (a gyökér-domain ÉL)
-- Ezeknél nem a domain halt meg, csak a hivatkozott ALOLDAL tűnt el. A
-- gyökér mindhárom esetben 200-at ad, tehát a link menthető.
UPDATE businesses SET blurb = 'Magyar étterem és büfé Krumbachban (Bajorország) — lángos és házias magyar ételek. · majsai-langos.de', updated_at = datetime('now')
  WHERE id = 'de-imp-majsai-etterem-magyar-bufe';  -- majsai-langos.de/galerie → majsai-langos.de
UPDATE businesses SET blurb = 'Magyar tulajdonú kávézó-brasszéria Delftben — kávézó, sörcsarnok, étterem és gasztropub egyben. · huszar.nl', updated_at = datetime('now')
  WHERE id = 'nl-imp-cafe-brasserie-huszar';  -- huszar.nl/hu → huszar.nl
UPDATE businesses SET blurb = 'Magyar élelmiszerbolt Oltenben (Solothurn kanton). Paprika, füstölt húsáruk, tartós élelmiszerek, magyar különlegességek. · www.paprikashop.ch', updated_at = datetime('now')
  WHERE id = 'ch-imp-paprika-shop-olten';  -- www.paprikashop.ch/de → www.paprikashop.ch
