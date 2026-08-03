-- Frissesség-bélyeg: a MA EGYENKÉNT Maps-en ellenőrzött tételek — 2026-08-03
--
-- ⚠️ A `last_verified_at` az adatlapon MEGJELENŐ „Ellenőrizve: …" állítás alapja.
-- Ezért CSAK arra a tételre kerülhet rá, amit tényleg ellenőriztem — nem az
-- egész mai batchre.
--
-- Ez a 6 tétel MA, egyenként, a Google Maps-en lett igazolva: a hely LÉTEZIK,
-- NYITVA van (nincs „véglegesen bezárt" jelzés), és a MAPS CÍME EGYEZIK azzal,
-- amit felvettünk.
--
-- ⚠️ SZÁNDÉKOSAN KIMARAD a mai batch másik 11 tétele (AutoKlinik, BSM Bau,
-- Bernáth Levente, Hajdu Roland, Müller Mihály, PG Haustechnik, Palos Norbert,
-- Peter GbR, Pozbai Péter, Szanyi Balázs, Szili & Zelenak). Azok a
-- nemetorszagi-magyarok.de címtárból származnak, és bár a forrás megbízhatóságát
-- MÉRTEM (4 telefonszáma pontosan egyezett a Maps-szel), MAGUKAT AZ ENTITÁSOKAT
-- nem igazoltam egyenként. Rájuk nem állítom, hogy ellenőriztem őket.
--
-- Ugyanígy NEM kap bélyeget az a 46 régebbi tétel (csv-import / seed-es-org /
-- seed:web-verified2), amit a 2026-07-31-i audit szándékosan kihagyott.

UPDATE businesses SET last_verified_at = '2026-08-03', last_verified_by = 'maps-egyenkent', updated_at = datetime('now')
WHERE id IN (
  'at-maler-toth-wien',                  -- Albertgasse 5, 1080 Wien
  'at-malermeister-nagy-imre-altheim',   -- Schatzdorferstraße 8, 4950 Altheim
  'gb-brasserie-transylvania-london',    -- 353 Green Lanes, London N4 1DZ
  'gb-euro-market-bolton',               -- 292 Chorley Old Road, Bolton BL1 4JU
  'gb-kurtoskalacs-langos-doncaster',    -- Market Place, Doncaster DN1 1NF
  'de-emese-shop-hechingen'              -- Katharinenstraße, 72379 Hechingen
);
