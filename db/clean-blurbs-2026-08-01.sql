-- Bemutatkozó-szövegek tisztítása — 2026-08-01
--
-- KÉT hibaosztály, mindkettő a PUBLIKUS bemutatkozóban (blurb) landolt:
--
-- (1) SEED-MÓDSZERTAN SZIVÁRGÁS (4 tétel) — user-jelzés. A saját, belső
--     jegyzetem került a felhasználó elé arról, hogy MI HOZTA ELŐ a tételt:
--     „Vezetéknév+szakma Google Maps-keresés hozta elő ('Nagy garage')".
--     Ez a felhasználót nem érdekli, és rontja a tétel hitelét: úgy olvassa,
--     mintha a cégről nem tudnánk mást, csak azt, hogyan akadtunk rá.
--
-- (2) ÁTMÁSOLT IDEGEN ÉRTÉKELÉS (10 tétel) — a tisztítás közben találtam.
--     „5,0 csillag." / „(4,7/5, 722 értékelés)" — Google, Facebook és
--     restaurantguru pontszámok a leírásban. HÁROM külön baj:
--       • a saját véleményrendszerünk szerint MINDEN cég 0 véleményes, és az
--         adatlap meta-sorában „Új · Írd meg az elsőt!" áll — a leírásban lévő
--         „5,0 csillag" ezt közvetlenül cáfolja, ugyanazon a képernyőn;
--       • idegen platform összeállított adatának újraközlése (ToS + EU
--         adatbázisjog) — ugyanaz az elv, amiért a Google nyitvatartását sem
--         másoljuk (ld. freshness-stamp-and-corrections);
--       • egy 2020-as pontszám ma már bármi lehet — nem frissítjük, nem tudjuk.
--
-- A LEÍRÓ tartalom (mit csinál, hol, mit kínál) MINDEN esetben megmarad, és a
-- záró „· domain" rész is (azt az app a weboldal-gombhoz használja).
--
-- Kifejezett ID-lista, nem mintaillesztés — a szaknévsor-szabály szerint.

-- (1) Seed-módszertan
UPDATE businesses SET blurb =
  '50+ éves családi autószerelő műhely Texel szigetén, BOVAG-tag. · www.garagenagy.nl'
  WHERE id = 'nl-imp-garage-nagy-b-v';

UPDATE businesses SET blurb =
  'FMH-szakvizsgás pszichiáter és pszichoterapeuta.'
  WHERE id = 'ch-imp-dr-med-edit-kovacs-psychiatrie';

UPDATE businesses SET blurb =
  'Autókereskedés (luxusautók) Bern mellett. · nemeth.ch'
  WHERE id = 'ch-imp-automobile-nemeth-ag';

-- (1)+(2) egyszerre: módszertan ÉS csillag
UPDATE businesses SET blurb =
  'Családi receptes lángos-büfé Grazban (nőtulajdonos); friss, saját kezűleg nyújtott tésztából.'
  WHERE id = 'at-imp-vanyai-langos';

-- (2) Átmásolt idegen értékelések
UPDATE businesses SET blurb =
  'Magyar és nemzetközi ételeket kínáló étterem Gunzenhausenben — gulyás, szilvás gombóc, fedett kerthelyiség. · www.gunzenhausen.info/gastronomie/piroschka-ungarisches_restaura-2900'
  WHERE id = 'de-imp-restaurant-piroschka-gunzenhausen';

UPDATE businesses SET blurb =
  'Magyar étterem Parchimban, Bela Czutor vezetésével — nagy adagok, kedvező árak. · restaurantguru.com/Restaurant-Hungaria-Bela-Czutor-Parchim-2'
  WHERE id = 'de-imp-restaurant-hungaria-bela-czutor';

UPDATE businesses SET blurb =
  'Magyar specialitású bisztró Erfurtban 2015 óta — kürtőskalács (Schornsteinbrot), levesek, kolbász, pálinka. · abendbrot-erfurt.de'
  WHERE id = 'de-imp-abendbrot-ungarisches-bistro';

UPDATE businesses SET blurb =
  'Magyar-német konyhát kínáló családias étterem Zwieselben (Bajor-erdő) — gulyás, schnitzel, grillételek. · restaurantguru.com/Restaurant-Piroschka-Zwiesel'
  WHERE id = 'de-imp-restaurant-piroschka-zwiesel';

UPDATE businesses SET blurb =
  'Magyar élelmiszer-szaküzlet Lindenbergben (Allgäu) — kolbász, sajt, savanyúságok, tészta, mangalica szalonna. · www.feinkost-aus-ungarn.de'
  WHERE id = 'de-imp-feinkost-aus-ungarn-x';

UPDATE businesses SET blurb =
  'Magyar élelmiszerbolt Zirndorfban (Nürnberg mellett).'
  WHERE id = 'de-imp-hello-ungarn-shop';

UPDATE businesses SET blurb =
  'A Semmelweis Egyetemen (Budapest) végzett fogorvos rendelője Frankfurt belvárosában. · www.frankfurts-zahnarzt.de'
  WHERE id = 'de-imp-dr-imre-jancsecz-zahnarzt-frankfurt';

UPDATE businesses SET blurb =
  'Magyar fogászati rendelő IJsselsteinben (Utrecht tartomány). · mondzorghongarije.nl'
  WHERE id = 'nl-imp-mondzorg-hongarije';

UPDATE businesses SET blurb =
  'Szombati piaci árus, magyar kolbász (''Hongaarse Lekkere Worst'').'
  WHERE id = 'nl-imp-mayki-hongaarse-lekkere-worst';
