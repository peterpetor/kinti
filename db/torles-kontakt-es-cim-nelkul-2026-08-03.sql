-- Kontakt NÉLKÜLI és PONTOS CÍM nélküli tételek kivezetése — 2026-08-03
--
-- USER-DÖNTÉS: „ahol nincs elérhetőség és pontos cím sincs, azokat töröld ki —
-- értelmetlen olyan adat, amiből a felhasználó nem tud kapcsolatot létrehozni."
--
-- ⚠️ A DEFINÍCIÓ PONTOSÍTÁSA, ami ehhez a döntéshez vezetett: a korábbi
-- „zsákutca" mérőszámom (184 tétel, 8,1%) CSAK az elérhetőséget nézte, a címet
-- NEM. Emiatt túlbecsülte a problémát: a 184-ből **119-nek VAN pontos
-- utcacíme** — oda a felhasználó egyszerűen odamegy (lángosos a Prater 23
-- alatt, magyar szentmise a Kamperfoelieplein 29 alatt). Azok NEM haszontalanok.
--
-- VALÓBAN használhatatlan: se elérhetőség, SE pontos cím — csak egy városnév.
-- Ez 65 tétel = a látható szaknévsor 2,9%-a.
--
-- ÖSSZETÉTEL: 59 magyar közösségi szervezet (egyesület, hétvégi iskola,
-- cserkészcsapat, néptáncegyüttes) + 4 étterem + 2 orvos.
-- Együttes megtekintés-számuk: **2**.
--
-- ⚠️ A 6 NEM-KÖZÖSSÉGI tételt előbb MEGPRÓBÁLTAM MEGMENTENI (Google Maps,
-- egyenként) — egyik sem sikerült:
--   • „Hausarztpraxis Lenzburg – Dr. Csiky-Strauss" → a Maps a Bahnhofstrasse
--     18-at adja, +41 62 891 85 85 telefonnal — ez viszont MÁR BENT VAN
--     „Dr. Endre Nadudvari, Dr. Gabor Csiky-Strauss…" néven, teljes adattal.
--     Tehát ez DUPLIKÁTUM, nem menthető önálló tétel.
--   • „Petite Hanna" (Lausanne) → a Maps a „LITTLE PERSIA" perzsa éttermet adja
--     a keresésre; a magyar hely nem azonosítható.
--   • Gourmet Langos, Gergo's Langos, Monika's Langos, Hausarztpraxis Wohlen →
--     a Maps nem ismeri őket.
--
-- ⚠️ `hidden = 1`, NEM SQL DELETE. A felhasználó felől ez ugyanaz (eltűnnek a
-- listából, a keresésből és a térképről), de VISSZAFORDÍTHATÓ: ha bármelyikhez
-- előkerül egy telefon vagy egy pontos cím, egyetlen UPDATE visszahozza.
--   UPDATE businesses SET hidden=0 WHERE id='…';
--
-- ⚠️ EXPLICIT azonosító-lista, NEM névminta szerinti tömeges rejtés.

UPDATE businesses SET hidden = 1, updated_at = datetime('now') WHERE id IN (
  'biz-gourmet-langos',
  'biz-petite-hanna-lausanne',
  'gb-gergo-s-langos-winchester-hampshire',
  'gb-monika-s-langos-ludlow-shropshire',
  'at-79-sz-dr-kozma-gyorgy-sj-cserkeszcsapat',
  'at-alsoori-otthon',
  'at-alsoori-enekkar',
  'at-alsoori-vasjobbagyi-magyar-barati-kor',
  'at-becsi-magyar-munkasegylet',
  'at-becsujhely-es-kornyeki-magyarok-kulturalis-egyesulete',
  'at-egyesulet-a-magyar-kulturaert-karintiaban',
  'at-erdelyi-magyarok-ausztriai-egyesulete',
  'at-felso-ausztriai-magyarok-kulturegyesulete',
  'at-graci-magyar-katolikus-kozosseg',
  'at-hungaromedia',
  'at-innsbrucki-magyar-ifjusagi-es-kulturegyesulet',
  'at-kozep-burgenlandi-magyar-kulturegyesulet',
  'at-lean-in-femspace',
  'at-linzi-magyar-katolikus-kozosseg',
  'at-magyar-egyetemistak-es-oregdiakok-klubja',
  'at-magyar-kultur-es-tancegyesulet-alsoor',
  'at-mi-magyarok-egymasert',
  'at-reformatus-ifjusagi-olvasokor',
  'at-vorarlbergi-magyar-egyesulet',
  'at-eszak-burgenlandi-magyar-kulturalis-egyesulet',
  'ch-berni-magyar-egyesulet',
  'ch-bazeli-kulturalis-magyar-talalkozo',
  'ch-ticinoi-magyar-egyesulet',
  'ch-zurichi-magyar-egyesulet-zurcher-ungarn-verein',
  'de-bajororszagi-konzuli-magyar-iskola',
  'de-deutsch-ungarische-gesellschaft-hannover',
  'de-deutsch-ungarische-gesellschaft-munchen',
  'de-deutsch-ungarische-gesellschaft-stuttgart',
  'de-egyetemi-magyar-klub-gottingen',
  'de-hajnali-magyar-neptancegyuttes-hamburg',
  'de-hannoveri-magyar-egyesulet-ungarischer-verein-hannover',
  'de-heidelbergi-magyar-cserkeszcsapat-kmcssz',
  'de-kolni-foegyhazmegye-magyar-katolikus-lelkeszsege',
  'de-lingua-hungarica-magyar-hetvegi-iskola-frankfurt',
  'de-manoka-magyar-kulturalis-egyesulet',
  'de-magyar-cserkeszcsapat-frankfurt-kmcssz',
  'de-magyar-cserkeszcsapat-koln-kmcssz',
  'de-magyar-cserkeszcsapat-mainz-kmcssz',
  'de-magyar-klub-dresden',
  'de-munchen-liszt-ferenc-cserkeszcsapat',
  'de-nurnbergi-magyar-hetvegi-iskola',
  'de-rajna-ruhr-videki-magyar-barati-kor-ufrr',
  'de-regos-magyar-neptanc-egyesulet-munchen',
  'de-rezeda-magyar-neptancegyuttes-frankfurt',
  'de-stuttgarti-magyar-cserkeszcsapat-kmcssz',
  'de-ungarisch-sachsischer-kulturverein-neustadt-e-v',
  'nl-amszterdami-magyar-ovoda-es-iskola',
  'nl-baba-mama-klub-amszterdam',
  'nl-hengeloi-magyar-iskola',
  'nl-hollandiai-magyar-romai-katolikus-egyhazkozseg',
  'nl-hagai-magyar-reformatus-gyulekezet',
  'nl-hagai-magyar-ovoda-es-iskola',
  'nl-kolcsey-ferenc-magyar-egyesulet',
  'nl-limburgi-rakoczi-ferenc-magyar-klub',
  'nl-meppeli-magyar-iskola',
  'nl-utrechti-magyar-iskola',
  'nl-utrechti-magyar-klub',
  'nl-vianeni-magyar-otthon',
  'biz-csiky-lenzburg',
  'biz-csiky-wohlen');
