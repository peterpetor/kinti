-- AT — Jokris Lángos Foodtruck (Herzogenburg) — 2026-08-03
--
-- ⚠️ HOLLAND KÖRBŐL JÖTT: 80 lekérdezés 20 HOLLAND városra (langos,
-- kurtoskalacs, magyar bolt, hongaars restaurant) → 641 találat → 23 magyar
-- jelölt → **1 felvehető tétel, és az is AUSZTRIÁBAN van**.
--
-- ⚠️⚠️ A HOLLAND KÖR GYAKORLATILAG NULLA: a 23 jelöltből **13 BUDAPESTI**
-- (Váci u., Szent István tér/Bazilika, József Attila u., Lövőház u., Megyeri
-- út, Madách Imre út, Fő u., Duna u., Flórián tér aluljáró, Október 6. u.,
-- Párizsi u., Pozsonyi út), a többi pedig már bent volt:
--   • „Magyar Bolt Haga" = a meglévő „Tamás Magyar Boltja" (Valkenboslaan 302)
--   • „Magyar szupermarket" = a meglévő „Magyar és görög supermarket" (Hoefkade)
--   • „Lekkeristic" = már bent, ugyanazon a címen (Hofveld 123, Apeldoorn)
-- ⇒ Az NL-forrásoldal ezzel NEGYEDSZERRE is megerősítetten kimerült.
--
-- ⭐ EGY FRISSESSÉG-MEGERŐSÍTÉS: a „Spajz-Hollandia Magyar Bolt"
-- (Soetendaalseweg 63a, Rotterdam) a Maps szerint VÉGLEGESEN BEZÁRT — és a mi
-- összes Spájz-tételünk ezen a címen MÁR REJTVE VAN egy korábbi körből.
-- Vagyis a korábbi döntés utólag igazolódott; nem kellett hozzányúlni.
--
-- Az egyetlen új tétel Maps-en ellenőrizve: nyitva, osztrák cím, osztrák
-- telefon. Koordináta Nominatimból. Telefon nemzetközi alakra hozva.

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('at-jokris-langos-herzogenburg', 'Jokris Lángos Foodtruck — Herzogenburg', 'etterem', 'Étterem', 'Kirchenplatz 3, 3130 Herzogenburg', '+43 660 4028700', 'Magyar lángos food truck Herzogenburgban (Alsó-Ausztria).', '["Magyar","Német"]', 48.286631, 15.695697, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-langos-dach', 'AT', 'NOE')
ON CONFLICT(id) DO NOTHING;
