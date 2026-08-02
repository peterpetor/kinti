-- Elérhetőség-pótlás KÉZI KUTATÁSSAL (Google Maps) — 2026-08-02
--
-- Cél: a MAGAS GYAKORISÁGÚ szakmák zsákutcái (étterem, élelmiszerbolt,
-- autószerelő, fodrász) — ott, ahol a hiányzó telefon KÖZVETLENÜL a
-- felhasználó célját töri el. 53 célból 14 elfogadott (26%).
--
-- ⚠️ ÖSSZEHASONLÍTÁS: az automatizált OSM/Nominatim-gyűjtés ugyanezen a napon
-- 92-ből 2-t hozott (2,2%). A kézi Maps-kutatás TÍZSZER hatékonyabb — mert a
-- kisvállalkozások a Mapsben vannak jelen, nem az OpenStreetMapben.
--
-- ELFOGADÁSI KÜSZÖB (mindkettő KELL, különben elutasítva):
--   • a Maps-beli NÉV token-szinten egyezik (nem nyers substring — az
--     „Abel" ⊂ „Izabella" hibaosztály miatt), ÉS
--   • a CÍM is egyezik (irányítószám VAGY utcanév).
-- A 39 elutasított tételnél volt, hogy találtunk telefont, de a név/cím nem
-- stimmelt — azokat SZÁNDÉKOSAN eldobtuk („inkább nincs adat, mint rossz").
--
-- ⚠️ NEM másoltunk értékelést és nyitvatartást (ToS + EU adatbázisjog, és a
-- saját véleményrendszerünkkel is ütközne) — CSAK telefon és weboldal.
--
-- NORMALIZÁLÁS (mind egy-egy korábbi hibaosztályból):
--   • telefon nemzetközire, a csoportosítás megtartásával („0676 3165255" →
--     „+43 676 3165255") — a célközönség külföldön él, helyi alakban nem hívható;
--   • követő-paraméterek levágva (a Maps `?utm_source=…`-t ad vissza);
--   • gyökér preferálva az aloldal helyett, DE közösségi oldalnál SOHA
--     (a `facebook.com/HULebensmittel` gyökérre rövidítve a Facebook kezdőlapja);
--   • minden weboldal MÉRVE: https-en válaszol-e; ha csak http, a TELJES
--     `http://` URL kerül tárolásra (a contact-links.ts különben https-t told).

-- Der Autodoktor (AT, autoszer)
--   Maps: Der Autodoktor | Lessinggasse 12, 2232 Deutsch-Wagram
UPDATE businesses SET phone = '+43 676 3165255', blurb = 'Autószerviz Deutsch-Wagramban (Alsó-Ausztria, Bécs közelében). Általános javítás, karbantartás, diagnosztika. · www.der-autodoktor.at'
  WHERE id = 'at-imp-der-autodoktor';

-- KFZ Schimitz (AT, autoszer)
--   Maps: KFZ Schimitz | Weinzierler Str. 30, 9220 Velden am Wörthersee
UPDATE businesses SET phone = '+43 676 6138816'
  WHERE id = 'at-imp-kfz-schimitz';

-- Car-Experts GmbH (AT, autoszer)
--   Maps: car-experts GmbH | Bachstraße 68, 5023 Salzburg
UPDATE businesses SET phone = '+43 662 664269', blurb = 'Autószerviz Salzburgban. Általános javítás, diagnosztika, karbantartás. · www.carexperts.at'
  WHERE id = 'at-imp-car-experts-gmbh';

-- Kfz Werkstätte Aslan (AT, autoszer)
--   Maps: Kfz Werkstätte Aslan | Viaduktbögen 121/123, 6020 Innsbruck
UPDATE businesses SET phone = '+43 676 7900521', blurb = 'Autószerviz Innsbruckban (viadukt-ívek). Javítás, karbantartás, diagnosztika. · kfzaslan.at'
  WHERE id = 'at-imp-kfz-werkstatte-aslan';

-- Auto Merienn (DE, autoszer)
--   Maps: Auto Merienn | Gewerbegebiet West-Aicherpark, Kolbermoorer Str. 12, 83026 Rosenheim, Németország
UPDATE businesses SET phone = '+49 178 1539086'
  WHERE id = 'de-imp-auto-merienn';

-- Ungarische Lebensmittel Kaufbeuren (DE, elelmiszer)
--   Maps: Ungarische Lebensmittel | Am Hofanger 22, 87600 Kaufbeuren, Németország
UPDATE businesses SET blurb = 'Magyar magyar bolt / élelmiszer · www.facebook.com/HULebensmittel'
  WHERE id = 'de-ir-ungarische-lebensmittel-kaufbeuren';

-- Paprika Market Landshut (DE, elelmiszer)
--   Maps: Paprika Market ungarische Feinkost | Alte Regensburger Str. 2, 84030 Ergolding, Németország
UPDATE businesses SET phone = '+49 871 14354601', blurb = 'Magyar magyar bolt / élelmiszer · www.paprikamarket.de'
  WHERE id = 'de-ir-paprika-market-landshut';

-- Zum Mönchswald – Magyar Étterem (DE, etterem)
--   Maps: Gästehaus Mönchswald - Franken HSG GmbH | Hauptstraße 1, 91735 Muhr am See, Németország
UPDATE businesses SET phone = '+49 9831 5783999', blurb = 'Magyar étterem Muhr am See-ben, Nürnberg mellett — magyarok főznek, magyar konyha. · gaestehaus-moenchswald.de'
  WHERE id = 'de-imp-zum-monchswald-magyar-etterem';

-- Majsai Étterem – Magyar Büfé (DE, etterem)
--   Maps: Majsai‘s Langos ungarische Spezialitäten | Hopfenweg 41, 86381 Krumbach (Schwaben), Németország
UPDATE businesses SET phone = '+49 177 2772147', blurb = 'Magyar étterem · www.majsai-langos.de'
  WHERE id = 'de-ir-majsai-etterem-magyar-bufe';

-- Paprika Fusion Restaurant — Ciudad Quesada (ES, etterem)
--   Maps: Paprika Csárda | Av. de las Naciones.1-C, 03170 Cdad. Quesada, Alicante, Spanyolország
UPDATE businesses SET phone = '+34 640 07 43 94', blurb = 'Mediterrán–magyar fúziós étterem (családi vállalkozás, magyar tulajdonossal) · Ciudad Quesada · paprikarestaurant.eu'
  WHERE id = 'es-paprika-fusion-restaurant-ciudad-quesada';

-- Cut & Style (CH, fodrasz)
--   Maps: Cut & Style | Rathausgasse 4, 9320 Arbon, Svájc
UPDATE businesses SET phone = '+41 71 440 38 36', blurb = 'Coiffeur Arbonban. Hajvágás, hajápolás és styling kisebb településen, pontos cím alapján. · www.cut-style.ch'
  WHERE id = 'ch-imp-cut-style';

-- Impuls Coiffure (CH, fodrasz)
--   Maps: Impuls Coiffure | Hauptstrasse 1, 9320 Arbon, Svájc
UPDATE businesses SET phone = '+41 71 446 41 41', blurb = 'Coiffeur Arbonban. Hajvágás, styling és szépségápolási szolgáltatások. · www.coiffure-arbon.ch'
  WHERE id = 'ch-imp-impuls-coiffure';

-- Haargold GmbH (CH, fodrasz)
--   Maps: Haargold GmbH | Bahnhofstrasse 40, 9320 Arbon, Svájc
UPDATE businesses SET phone = '+41 71 558 85 87', blurb = 'Coiffeur és hajápolási szolgáltatás Arbonban. Precíz vágások és modern frizurák. · www.haargold.ch'
  WHERE id = 'ch-imp-haargold-gmbh';

-- Zoltán Hair Zürich (CH, fodrasz)
--   Maps: Zoltan Hair Zürich | Nussgasse 3, 8008 Zürich, Svájc
UPDATE businesses SET phone = '+41 76 451 60 34', blurb = 'zoltanhairzurich.ch · www.zoltanhairzurich.ch'
  WHERE id = 'biz2-ch-zoltan-hair-zuerich';
