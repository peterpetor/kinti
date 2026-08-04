-- Aranyoldalak, 2. kör: étterem-lekérdezések — 2026-08-03
--
-- Két lekérdezés: „Ungarisches Restaurant" (33 találat) és „Langos" (7).
-- 23 jelölt maradt szűrés után → gépi dedup (cím + TELEFON) 13-at kiszűrt mint
-- meglévőt → 10 új jelölt → Maps-hitelesítés → **2 felvehető tétel**.
--
-- ⚠️⚠️ AZ ARANYOLDALAK ADATA ERŐSEN ELAVULT: a 10 „újnak" látszó étteremből a
-- Maps **ÖTÖT VÉGLEGESEN BEZÁRTNAK** mutatott (Hungarium-International/
-- Schwetzingen, Veeta's/Karlsruhe, Zum Engenhahner Kochkessel, Lángos Land/
-- Bad Wildungen, Langos-König/Rastatt), hármat pedig nem is talált.
-- **50%-os elhalálozási arány a jelölteken.** Az Aranyoldalak NYOMFORRÁS.
--
-- ⚠️ A „Langos" lekérdezés 7 találatából 3 NEM ÉTEL, hanem a tulajdonos
-- VEZETÉKNEVE: Planungsgesellschaft Langos mbH, Langos Eleonore Dr.
-- Architekturbüro, Langos Messemontagen GmbH. (Az első kettő ma másodszor jön
-- elő — ld. a Maps-körök.)
--
-- ⚠️ A gépi dedup TELEFON-kulcsa fogta meg többek közt a „Sven Wagner Der
-- Langos Wagner" tételt: nálunk „Cserepes Ildikó" néven van bent, azonos
-- számmal. Teljesen eltérő NÉV, azonos szám.
--
-- ⭐ HUNGARICA: az Aranyoldalak Karlstr. 20-at ír, a Maps Lange Brücke 29-et —
-- az étterem KÖLTÖZÖTT. A Maps-címet vesszük.
-- ⭐ KLOSTERHOF: német néven fut és a Maps nem jelöli magyarnak, DE a saját
-- weboldala kimondja: „regionale exquisite **deutsch-ungarische Küche**", a
-- tulajdonosok pedig **Edit és Sándor Roza**. Ezért felvehető.

INSERT INTO businesses (id, name, category_id, category_label, address, phone, contact_email, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-hungarica-exzellent-erfurt', 'Hungarica Exzellent — magyar étterem, Erfurt', 'etterem', 'Étterem', 'Lange Brücke 29, 99084 Erfurt', '+49 162 7480669', NULL, 'Magyar étterem Erfurt óvárosában. · restauranthungarica-excellent.com', '["Magyar","Német"]', 50.974041, 11.027511, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-gelbeseiten', 'DE', 'TH'),
('de-klosterhof-stiepel-bochum', 'Restaurant-Café Klosterhof — Roza család, Bochum', 'etterem', 'Étterem', 'Am Varenholt 17, 44797 Bochum (Stiepel)', '+49 234 795553', 'restaurant@klosterhof-stiepel.de', 'Német–magyar konyha a bochumi ciszterci kolostor mellett, Edit és Sándor Roza vezetésével. · klosterhof-stiepel.de', '["Magyar","Német"]', 51.432161, 7.228096, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-gelbeseiten', 'DE', 'NW')
ON CONFLICT(id) DO NOTHING;
