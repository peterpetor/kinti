-- „Csak Anglia" — a nem-angliai GB-tételek kivezetése (üzemeltetői döntés, 2026-08-03)
--
-- Az app a GB országot „Anglia" NÉVEN mutatja (countries.ts: { code: "GB",
-- name: "Anglia" }), és a régiólista IS csak a 9 angol ONS-régiót ismeri —
-- Skóciára/Walesre/Észak-Írországra NINCS régiókód, azok a tételek `canton_code
-- IS NULL`-lal ültek bent, vagyis a régió-szűrő SOHA nem hozta elő őket.
--
-- ⚠️ A leletet a saját aznapi bővítésem hozta felszínre: három edinburgh-i
-- tételt vettem fel, mielőtt ellenőriztem volna az ország hatókörét. A
-- memóriában rögzített szabály („a Kinti GB-je csak Anglia") már 2026-07-30 óta
-- létezett — de az ÉLES ADAT ellentmondott neki (Aberdeen + 2 Belfast bent volt),
-- ezért nem tűnt fel. A user megerősítette: CSAK ANGLIA.
--
-- A kiválasztás irányítószám-KÖRZET alapján történt, nem városnév alapján
-- (a városnév-illesztés kihagyná a kisebb skót/walesi településeket).
-- ⚠️ SZÁNDÉKOSAN kimaradt a CH (Chester = ANGLIA) és az SY (Shrewsbury =
-- ANGLIA is) körzet — azok átnyúlnak a határon, vak kizárásuk angol tételeket
-- dobna ki.
--
-- hidden = 1, SOHA nem DELETE (ld. business-dedup szabály): ha az ország
-- hatóköre valaha az Egyesült Királyságra bővül, egyetlen UPDATE visszahozza.

UPDATE businesses SET hidden = 1, updated_at = datetime('now')
WHERE id IN (
  -- Skócia
  'gb-imp-goulash-magyar-etterem-aberdeen',
  'gb-tekerch-chimney-cake-edinburgh',
  'gb-fokonzulatus-edinburgh',
  'gb-hetmerfoldes-edinburgh',
  -- Észak-Írország
  'gb-imp-belfastabc-magyar-elelmiszerbolt',
  'gb-imp-piercings-by-vesty-belfast'
);
