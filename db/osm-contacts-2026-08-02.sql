-- Hiányzó elérhetőségek pótlása OpenStreetMap-ből — 2026-08-02
--
-- Forrás: scripts/nominatim-contact-harvest.mjs (Nominatim `extratags=1`).
-- Elfogadási küszöb VÁLTOZATLAN: ≤150 m a tárolt koordinátától ÉS token-szintű
-- névegyezés (a nyers substring-illesztés IDEGEN telefonszámot adna — ld.
-- contact-completion-runbook).
--
-- ⚠️ HOZAM: 92 célból MINDÖSSZE 2 szigorú egyezés (2,2%). A korábbi kör 212-ből
-- 10-et hozott (~5%) — a forrás tehát KIMERÜLT: ami maradt, az nincs benne az
-- OSM-ben (magánrendelők, lakásban működő szakemberek, egyesületek).
-- Ebből NEM következik, hogy a maradék 173 tétel rossz — csak azt, hogy
-- automatizált OSM-gyűjtéssel nem érhető el több. A következő lépés kézi
-- kutatás vagy a tulajdonosi átvétel ösztönzése.
--
-- Mindkét tétel egyenként ellenőrizve:
--   • PS Autoservice — OSM „PS-Autoservice", 5 m távolság, jaccard-egyezés.
--   • Hammberger-Hof — OSM „Hammberger Hof", 0 m; a weboldal ÉLŐ (mérve:
--     www.hammberger-hof.de → 301 → hammberger-hof.de 200), ezért a
--     VÉGLEGES, átirányítás nélküli alakot tároljuk.

UPDATE businesses SET phone = '+43 2682 62110'
  WHERE id = 'at-imp-ps-autoservice';

UPDATE businesses SET
  phone = '+49 7266 911388',
  blurb = 'Magyar vendéglátás Ittlingenben, az A6-os autópálya mellett (Sinsheim/Eppingen környéke) — játszótér gyerekeknek. · hammberger-hof.de'
  WHERE id = 'de-imp-hammberger-hof-restaurant';
