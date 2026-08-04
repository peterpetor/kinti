-- ÚJ FORRÁS: 11880.com (a másik német cégjegyzék) — 2026-08-03
--
-- Az „Ungarische Spezialitäten" lekérdezés 14 találatot adott — RÉSZBEN MÁST,
-- mint a gelbeseiten.de ugyanerre a kifejezésre. A két német cégjegyzék tehát
-- NEM ugyanazt az adatbázist másolja; érdemes MINDKETTŐT lefuttatni.
-- 14 találat → gépi dedup 5-öt kiszűrt → 6 jelölt → Maps → **3 új tétel**.
--
-- ⚠️⚠️ SAJÁT DEDUP-HIBA, amit el kellett kapni: az ad-hoc dedupom csak az
-- utcanevet és a házszámot nézte, a VÁROST nem — és SUBSTRING-gel illesztett.
-- Így a „Harmonie" (Bahnhofstr. **26**, Deggendorf) egyezőnek látszott a
-- „Dr. Julaj Galan" tétellel (Bahnhofstrasse **2**, MAINZ), mert a
-- „bahnhofstr2" részszövege a „bahnhofstr26"-nak. A Bahnhofstraße a
-- leggyakoribb német utcanév — város nélkül használhatatlan kulcs.
-- **Majdnem eldobtam egy valódi új tételt.** Ugyanaz a substring-árnyék csapda,
-- amit a CITY-térképnél már dokumentáltunk.
--
-- ⚠️⚠️ ÉS EGY FONTOS FORRÁS-TANULSÁG: a „Paprika ABC" SAJÁT WEBOLDALA azt
-- állítja, „2 Geschäften in Ulm und Senden" — vagyis hogy az ulmi boltjuk is
-- működik. A mi ulmi tételünk viszont REJTVE volt egy korábbi frissesség-körből.
-- A Maps-ellenőrzés szerint az ULMI BOLT VÉGLEGESEN BEZÁRT (pontosan a mi
-- rejtett tételünk telefonjával: +49 731 55038657).
-- ⇒ **A cég SAJÁT weboldala is lehet elavult.** A mi adatunk volt a pontosabb;
--   az ulmi tétel rejtve marad, a sendeni bolt viszont valódi új tétel.

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-langos-freunde-osternienburg', 'Langos Freunde — magyar különlegességek', 'elelmiszer', 'Élelmiszerbolt', 'Gartenstraße 13, 06386 Osternienburger Land (Trinum)', '+49 1525 4085405', 'Magyar élelmiszer-különlegességek és lángos Anhalt térségében.', '["Magyar","Német"]', 51.772129, 11.914957, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-11880', 'DE', 'ST'),
('de-harmonie-deggendorf', 'Harmonie — magyar különlegességek, Deggendorf', 'elelmiszer', 'Élelmiszerbolt', 'Bahnhofstraße 26, 94469 Deggendorf', '+49 176 67345082', 'Magyar élelmiszer-különlegességek Deggendorfban (Alsó-Bajorország).', '["Magyar","Német"]', 48.833898, 12.959619, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-11880', 'DE', 'BY'),
('de-paprika-abc-senden', 'Paprika ABC — magyar élelmiszer, Senden', 'elelmiszer', 'Élelmiszerbolt', 'Ulmer Straße 23, 89250 Senden', '+49 7307 9523623', 'Magyar füstölt áru, szalámi, pálinka és fűszerek Senden városában, Ulm mellett. · paprika-abc.de', '["Magyar","Német"]', 48.327051, 10.033983, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-11880', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;
