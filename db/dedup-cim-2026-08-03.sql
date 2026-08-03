-- CÍM-alapú dedup-audit: 2 duplikátum zárása — 2026-08-03
--
-- A telefon-alapú audit (dedup-telefon-2026-08-03.sql) után CÍM szerint is
-- végigmentem — mert a telefon nélküli tételeket az nem foghatta meg.
--
-- Normalizálás: kisbetű, ékezet le, `ß`→`ss`, `Straße/Strasse/Str.` egységesítve,
-- `platz/Pl.` egységesítve, és ⚠️ a házszám utáni `/ajtó` LEVÁGVA — ez a
-- 2026-07-13-án dokumentált lépcsőház-csapda („140/1" vs „140").
--
-- Eredmény: 55 azonos című csoport, ebből 10 névben is hasonló.
-- ⚠️ NYOLC LEGITIM, ezekhez NEM nyúlunk:
--   • két templom/gyülekezet ugyanabban a faluban (Felsőőr) — város-szintű cím
--   • egy ernyőszervezet és az óvodája (Felső-Ausztria) — régió-szintű cím
--   • fordítóiroda és ügyvédek EGY kamarában (Museumstraße 5/19, Wien)
--   • három házaspár-praxis (Decker, Simon, Király) — azonos cím, két orvos
-- A közös épület/rendelő NEM duplikáció.

------------------------------------------------------------------ VISNYEI
-- `de-imp-rechtsanwaltskanzlei-visnyei`      Münchnerstraße 18 · +49 89 923 368 00 · ra-visnyei.de
-- `de-imp-attila-visnyei-rechtsanwalt-munchen` Münchner Straße 18 · +49 89 923 368
-- Ugyanaz az ügyvéd, ugyanaz az iroda; a cím csak szóközben tér el.
-- ⚠️ A második telefonja CSONKA: „+49 89 923 368" — a teljes szám „…368 00".
-- Ez önmagában is hibás adat volt (hívhatatlan szám).
-- A teljes telefonnal és ÉLŐ weboldallal rendelkezőt tartjuk meg.
-- (A másik példányon szereplő `www.visnyei.de` a mai halott-link auditban már
--  kiesett — az egy MÁSIK, nem feloldódó domain volt, nem a `ra-visnyei.de`.)
UPDATE businesses SET hidden = 1, updated_at = datetime('now')
WHERE id = 'de-imp-attila-visnyei-rechtsanwalt-munchen';

-- A megmaradó leírásába átvisszük a rejtett tétel szakterület-felsorolását is,
-- hogy a kereső ne veszítsen találatot.
UPDATE businesses SET
  blurb = 'Magyar ügyvéd Münchennél: társasági, munka-, közlekedési, öröklési, kártérítési és bevándorlási jog — magyarul és németül. · ra-visnyei.de',
  updated_at = datetime('now')
WHERE id = 'de-imp-rechtsanwaltskanzlei-visnyei';

------------------------------------------------------------- FOREST & RAY
-- Azonos cím (8F Gilbert Place, Bloomsbury, London WC1A 2JD), gyakorlatilag
-- azonos név. Két KÜLÖNBÖZŐ telefonszám szerepelt — egy rendelőnek lehet több
-- vonala, de két külön TÉTEL nem indokolt.
-- A gazdagabbat tartjuk meg (e-mail + weboldal is van rajta).
UPDATE businesses SET hidden = 1, updated_at = datetime('now')
WHERE id = 'gb-imp-forest-ray-fogaszat-london-bloomsbury';
