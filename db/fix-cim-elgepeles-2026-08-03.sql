-- ⚠️ HIBAJAVÍTÁS: elgépelt utcanevek + rossz térkép-pin — 2026-08-03
--
-- HOGYAN KERÜLT ELŐ: a „hány tétel ül ugyanazon a koordinátán" vizsgálat után
-- megpróbáltam újrageokódolni azt a 17 tételt, aminek VAN házszáma, mégis
-- beégetett VÁROSKÖZÉP-koordinátán ült. 14 közülük a Nominatimban EGYÁLTALÁN
-- NEM oldódott fel — ami nem hálózati hiba volt, hanem a MI CÍMEINK hibája.
--
-- ⚠️⚠️ HÁROM ELGÉPELT UTCANÉV. Ez rosszabb, mint a rossz pin: a felhasználó
-- SAJÁT navigációja is elbukik rajta, mert a cím szövegét másolja be.
--     „Langegasse 76, 1080 Wien"      → helyesen „Lange Gasse 76" (KÉT szó)
--     „Rue de Bugnon 17/48, Lausanne" → helyesen „Rue du Bugnon"
--     „Huttingerstrasse 5, Zürich"    → helyesen „Hottingerstrasse 5"
-- Mindhárom javított alakot a Nominatim azonnal megtalálta.
--
-- ⚠️ AMIT SZÁNDÉKOSAN NEM ÍRTAM BE: az irányítószám-alapú tartalék-geokódolás
-- egy VÉLETLENSZERŰ HÁZAT ad vissza a körzeten belül, nem a körzet közepét.
-- Élesben ez a „Chemin de Trois-Rois 7" helyett a „Rue Marterey 77"-et adta,
-- a „Gehaplatz 7-9" helyett a „Schusterstraße 1"-et. Ezek nem javítások, hanem
-- ÚJ hibák lettek volna. Csak az UTCANÉV-SZINTEN igazolt találatok kerülnek be.
--
-- MARAD kézi kutatásra (a cím nem oldódik fel, és nem tudtam megfejteni):
--   Gürtelstraße 100, 1060 Wien (Reinigungs Kommando) — a bécsi Gürtel
--     szakaszonként külön nevet visel, „Gürtelstraße" néven nincs 1060-ban
--   Viaduktbögen 121/123, 6020 Innsbruck (Kfz Werkstätte Aslan)
--   Gehaplatz 7-9, 2111 Tresdorf (AutoTom)
--   Döblingergürtel 21-23, 1190 Wien (Account Berater)
--   Hatzmühlstr. 30, 85290 Geisenfeld (SB-Kfztechnik)
--   Pfinztal Eichenstr. 6, Karlsruhe (Böte Gergely)
--   Gustav-Schlönleber-Straße 24, 76187 Karlsruhe (Balázs-Kercsó Erzsébet)
--   Meiliauergasse 15, 1220 Wien (Dr. Dévényi Levente)
--   Calle Coronel Ripollet 6, Fuengirola (Asesoría Infinity)
--   Hüpfelinstraße 8, 80939 München (Dönczi Vanda)

-- ── ELGÉPELÉS-JAVÍTÁS + pontos koordináta ──────────────────────────────────
UPDATE businesses SET address = 'Rue du Bugnon 17, 1011 Lausanne', lat = 46.523414, lng = 6.641486, updated_at = datetime('now')
WHERE id = 'ch-imp-dr-istvan-bathory-anesztezista';

UPDATE businesses SET address = 'Rue du Bugnon 48, 1011 Lausanne', lat = 46.526424, lng = 6.643325, updated_at = datetime('now')
WHERE id = 'ch-imp-dr-monika-nagy-huliger';

UPDATE businesses SET address = 'Hottingerstrasse 5, 8032 Zürich', lat = 47.368752, lng = 8.548996, updated_at = datetime('now')
WHERE id = 'ch-imp-dr-vivien-brigitta-sebok';

UPDATE businesses SET address = 'Lange Gasse 76, 1080 Wien', lat = 48.211527, lng = 16.348263, updated_at = datetime('now')
WHERE id = 'at-imp-papp-janos-kaffee-konditorei';

-- ── UTCANÉV-SZINTEN igazolt koordináta (a cím már jó volt) ──────────────────
UPDATE businesses SET lat = 36.528744, lng = -4.626404, updated_at = datetime('now')
WHERE id = 'es-dr-visky-szabolcs-fogorvos-nh-clinicas';

UPDATE businesses SET lat = 36.528744, lng = -4.626404, updated_at = datetime('now')
WHERE id = 'es-dr-hajnal-adrien-eva-borgyogyasz-nh-clinicas';
