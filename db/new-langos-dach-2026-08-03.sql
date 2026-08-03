-- DE/AT — 11 új magyar lángosos és kürtőskalácsos — 2026-08-03
--
-- ⭐ MÓDSZER: a GB-ben legjobban teljesítő technika (magyar TERMÉKSZÓ a Google
-- Mapsen) végre lefuttatva DACH-ra is: 80 lekérdezés, 20 város × 4 szó
-- (`langos`, `kurtoskalacs`, `magyar bolt`, `palinka`).
-- 325 nyers találat → 44 magyar jelölt → 11 új tétel.
--
-- ⚠️⚠️ A `palinka` SZÓ TELJES VESZTESÉG VOLT: mind a 11 találata MAGYARORSZÁGI
-- pálinkafőzde (+36-os telefonnal: Pintér, BOLYHOS, Sáppusztai, PANKA, Milán,
-- balatongyöröki desztilláló…). TANULSÁG: a `langos`/`kürtőskalács` UTCAI ÉTEL —
-- azt a KÜLFÖLDÖN élő magyar teszi a cégnevébe. A `pálinka` viszont TERMELÉSI
-- szó, ami a magyarországi főzdékre illeszkedik. Terméknév ≠ terméknév.
--
-- ⚠️ TOVÁBBI KISZŰRT ZAJ:
--   • „Planungsgesellschaft Langos mbH" (Hamburg) — MÉRNÖKIRODA, a tulajdonos
--     vezetékneve Langos. Semmi köze a lángoshoz.
--   • 5 BEZÁRT hely (Restaurant Langosch, Langos Stuttgart, Paprika Jancsi,
--     Magyar ízek, Langos Stand) — a Maps bezárás-jelzője fogta meg.
--   • 8 tétel MÁR BENT VOLT (Borsó, Leckerwerk, Grafing, Paprika & Friends,
--     Little Hungary, Langos Csarda, Meister Langos & Lemon, Piroschka).
--   • „Ungarische Gaststätte" és „Zum Ziehbrunnen" — a CÍM-dedup fogta meg őket
--     (a nevük eltért a nálunk lévőtől, a címük nem).
--
-- ⚠️ KIHAGYVA ÓVATOSSÁGBÓL: „Meister Lángos" (Eduard-Lang-Weg 99, 1020 Wien) —
-- a „Meister Langos & Lemon" (Prater 23, 1020 Wien) MÁR BENT VAN, és mindkét
-- cím a Práter területén van. Ugyanaz az üzemeltető két standja vagy ugyanaz a
-- stand két Maps-tétellel — nem tudtam eldönteni, ezért nem vettem fel.
--
-- ⚠️ A `langos-bros.de` weboldalt NEM írom be: HTTP 200-at ad, DE a törzse
-- **0 BÁJT** — a user üres lapot látna. Ez a halott-oldal egy új változata
-- (nem parkoltatás, nem hibakód). A telefon marad.
--
-- Minden tétel Maps-en ellenőrizve: NYITVA (nincs bezárás-jelző), a cím
-- Németországban/Ausztriában. Koordináták Nominatimból, irányítószámmal.
-- Osztrák telefonok nemzetközi alakra hozva (0681… → +43 681…).

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-frank-langos-berlin', 'Frank Langos — Berlin', 'etterem', 'Étterem', 'Wassergasse 5, 10179 Berlin', '+49 30 27592301', 'Magyar lángos Berlin belvárosában (Mitte).', '["Magyar","Német"]', 52.512029, 13.413219, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-langos-dach', 'DE', 'BE'),
('de-langos-bros-hamburg', 'Lángos Bros — Hamburg', 'etterem', 'Étterem', 'Moorkoppel 10, 22043 Hamburg (Wandsbek)', '+49 1522 4107140', 'Magyar lángos Hamburgban, Wandsbek városrészben.', '["Magyar","Német"]', 53.573072, 10.120613, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-langos-dach', 'DE', 'HH'),
('de-langos-original-riesa', 'LÁNGOS original Ungarische — Riesa', 'etterem', 'Étterem', 'Lommatzscher Straße 27, 01587 Riesa', '+49 1523 4541290', 'Magyar lángos Riesában (Szászország).', '["Magyar","Német"]', 51.295038, 13.287059, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-langos-dach', 'DE', 'SN'),
('de-daves-langos-nurnberg', 'Dave''s Langos — Nürnberg', 'etterem', 'Étterem', 'Dr.-Kurt-Schumacher-Straße 17, 90402 Nürnberg', '+49 177 2762861', 'Magyar lángos Nürnberg óvárosában. · instagram.com/daves_langos', '["Magyar","Német"]', 49.449306, 11.071976, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-langos-dach', 'DE', 'BY'),
('de-orginal-langos-furth', 'Orginal Langos — Fürth', 'etterem', 'Étterem', 'Waldstraße 82, 90763 Fürth', NULL, 'Magyar lángos Fürthben, Nürnberg mellett.', '["Magyar","Német"]', 49.458229, 11.006833, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-langos-dach', 'DE', 'BY'),
('at-lili-langos-wien', 'Lili Langos — Bécs', 'etterem', 'Étterem', 'Perfektastraße 86, 1230 Wien', '+43 681 81226948', 'Magyar lángos Bécs 23. kerületében (Liesing).', '["Magyar","Német"]', 48.136950, 16.309094, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-langos-dach', 'AT', 'W'),
('at-langos-schnitzel-wien', 'Langos & Schnitzel — Bécs, Schuhmeierplatz', 'etterem', 'Étterem', 'Schuhmeierplatz 12, 1160 Wien', '+43 699 11279892', 'Magyar lángos és rántott hús Bécs 16. kerületében (Ottakring).', '["Magyar","Német"]', 48.211211, 16.318659, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-langos-dach', 'AT', 'W'),
('at-langos-queen-wien', 'Langos Queen — Bécs', 'etterem', 'Étterem', 'Erika-Weinzierl-Platz, 1060 Wien', '+43 676 7458754', 'Magyar lángos Bécs 6. kerületében (Mariahilf). · langos-queen.at', '["Magyar","Német"]', 48.199180, 16.352882, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-langos-dach', 'AT', 'W'),
('at-danys-langos-wien', 'Dany''s Hausgemachte Langos — Bécs', 'etterem', 'Étterem', 'Laaer Wald 149, 1100 Wien', NULL, 'Házi magyar lángos a bécsi Böhmischer Prater területén.', '["Magyar","Német"]', 48.166710, 16.399782, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-langos-dach', 'AT', 'W'),
('at-langos-factory-linz', 'Langos-Factory das Original — Linz', 'etterem', 'Étterem', 'Ars-Electronica-Straße, 4040 Linz', NULL, 'Magyar lángos Linzben, az Ars Electronica környékén.', '["Magyar","Német"]', 48.309896, 14.285072, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-langos-dach', 'AT', 'OOE'),
('at-langos-baumkuchen-linz', 'Ungarische Langos und Baumkuchen — Linz', 'etterem', 'Étterem', 'Einsteinstraße 7, 4020 Linz', NULL, 'Magyar lángos és kürtőskalács Linzben.', '["Magyar","Német"]', 48.276134, 14.297825, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-langos-dach', 'AT', 'OOE')
ON CONFLICT(id) DO NOTHING;
