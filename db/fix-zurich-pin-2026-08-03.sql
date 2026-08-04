-- ⚠️⚠️ HIBAJAVÍTÁS: 21 tétel térkép-pinje ZÜRICHBEN volt — 2026-08-03
--
-- A TÜNET: 13 brit és 8 spanyol vállalkozás — mind PONTOS utcacímmel — a
-- 47.3769 / 8.5417 koordinátán ült. Ez ZÜRICH. A londoni user a „Térkép" /
-- „Útvonal" gombra koppintva Svájcot kapott.
--
-- A GYÖKÉR-OK (scripts/prepare-business-import.mjs):
--     const COUNTRY_FALLBACK = { CH:…, AT:…, DE:…, NL:… };
--     const f = COUNTRY_FALLBACK[country] || [47.3769, 8.5417];
-- A térkép a NÉGY EREDETI országot ismerte. Az app azóta HATORSZÁGOS lett, de
-- ez a sor nem követte — az ES és a GB NÉMÁN a beégetett zürichi tartalékra
-- esett. Semmilyen hibaüzenet nem jelezte.
--
-- Ez a [[binary-country-fallthrough]] hibaosztály: nem hibát dob, hanem ROSSZ
-- ADATOT ad. A grep sem fogta volna meg, mert a hiba az `||` ágban van.
--
-- A KÓD-JAVÍTÁS ugyanebben a commitban: ES és GB felvéve, és a néma default
-- helyett HANGOS hiba, ha egy ország kimarad. Teszt őrzi, hogy a lista
-- lefedje a countries.ts összes engedélyezett országát.
--
-- ⚠️ A 7 SVÁJCI tétel ugyanezen a koordinátán MARAD: azok valóban zürichi
-- szervezetek, csak város-szintű címmel — rájuk a városközép helyes.
--
-- A koordináták Nominatimból; ahol a házszám nem oldódott fel, ott az
-- IRÁNYÍTÓSZÁM (5 tétel) — az is nagyságrendekkel pontosabb Zürichnél.
UPDATE businesses SET lat = 38.53616, lng = -0.130921, updated_at = datetime('now')
  WHERE id = 'es-imp-langos-benidorm-magyar-langos' AND lat = 47.3769 AND lng = 8.5417;
UPDATE businesses SET lat = 41.377883, lng = 2.153386, updated_at = datetime('now')
  WHERE id = 'es-imp-chimenea-roll-kurtoskalacs-barcelona' AND lat = 47.3769 AND lng = 8.5417;
UPDATE businesses SET lat = 28.354658, lng = -16.370109, updated_at = datetime('now')
  WHERE id = 'es-imp-chimney-tenerife-kurtoskalacs' AND lat = 47.3769 AND lng = 8.5417;
UPDATE businesses SET lat = 36.723022, lng = -2.62802, updated_at = datetime('now')
  WHERE id = 'es-imp-kurtoskalacs-pastel-chimenea-roquetas-de-mar' AND lat = 47.3769 AND lng = 8.5417;
UPDATE businesses SET lat = 39.480879, lng = -0.395489, updated_at = datetime('now')
  WHERE id = 'es-imp-akos-clinica-medico-estetica-valencia' AND lat = 47.3769 AND lng = 8.5417;
UPDATE businesses SET lat = 36.507429, lng = -4.889501, updated_at = datetime('now')
  WHERE id = 'es-imp-chimney-cake-marbella' AND lat = 47.3769 AND lng = 8.5417;
UPDATE businesses SET lat = 52.188393, lng = -2.234865, updated_at = datetime('now')
  WHERE id = 'gb-imp-smile-dental-care-clinic-worcester' AND lat = 47.3769 AND lng = 8.5417;
UPDATE businesses SET lat = 52.199406, lng = 0.127084, updated_at = datetime('now')
  WHERE id = 'gb-imp-dove-dental-cambridge' AND lat = 47.3769 AND lng = 8.5417;
UPDATE businesses SET lat = 51.52264, lng = -0.114448, updated_at = datetime('now')
  WHERE id = 'gb-imp-implantcenter-dentistry-london' AND lat = 47.3769 AND lng = 8.5417;
UPDATE businesses SET lat = 51.545741, lng = -0.300579, updated_at = datetime('now')
  WHERE id = 'gb-imp-laptop-szerviz-london' AND lat = 47.3769 AND lng = 8.5417;
UPDATE businesses SET lat = 51.426433, lng = -0.175836, updated_at = datetime('now')
  WHERE id = 'gb-imp-dr-lozsadi-dora' AND lat = 47.3769 AND lng = 8.5417;
UPDATE businesses SET lat = 51.52182, lng = -0.165646, updated_at = datetime('now')
  WHERE id = 'gb-imp-haemorrhoid-clinic-london' AND lat = 47.3769 AND lng = 8.5417;
UPDATE businesses SET lat = 51.529653, lng = -0.120291, updated_at = datetime('now')
  WHERE id = 'gb-imp-gyorfi-anna-pszichoterapeuta-london' AND lat = 47.3769 AND lng = 8.5417;
UPDATE businesses SET lat = 51.514047, lng = -0.105532, updated_at = datetime('now')
  WHERE id = 'gb-imp-barancsi-boroka-london' AND lat = 47.3769 AND lng = 8.5417;
UPDATE businesses SET lat = 52.904863, lng = -1.237824, updated_at = datetime('now')
  WHERE id = 'gb-imp-homeland-hungarian-food' AND lat = 47.3769 AND lng = 8.5417;
UPDATE businesses SET lat = 51.896775, lng = -0.493817, updated_at = datetime('now')
  WHERE id = 'gb-imp-kurtoskalacs-luton-dunstable' AND lat = 47.3769 AND lng = 8.5417;
UPDATE businesses SET lat = 36.764791, lng = -4.442201, updated_at = datetime('now')
  WHERE id = 'es-imp-kurtos-coffee-kurtoskalacs-malaga' AND lat = 47.3769 AND lng = 8.5417;
UPDATE businesses SET lat = 28.130512, lng = -15.509124, updated_at = datetime('now')
  WHERE id = 'es-imp-natural-hungarian-magyar-termekek-gran-canaria' AND lat = 47.3769 AND lng = 8.5417;
UPDATE businesses SET lat = 51.568958, lng = -0.13082, updated_at = datetime('now')
  WHERE id = 'gb-imp-archway-dental-group-london' AND lat = 47.3769 AND lng = 8.5417;
UPDATE businesses SET lat = 51.58159, lng = 0.204043, updated_at = datetime('now')
  WHERE id = 'gb-imp-painter-decorator' AND lat = 47.3769 AND lng = 8.5417;
UPDATE businesses SET lat = 53.797838, lng = -1.54382, updated_at = datetime('now')
  WHERE id = 'gb-imp-hungarian-traditional-food' AND lat = 47.3769 AND lng = 8.5417;
