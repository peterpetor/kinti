-- DE — magyar bolt/étterem kör: 1 új tétel + 1 duplikátum zárása — 2026-08-03
--
-- A `nemetorszagi-magyarok.de/cimtar` `magyar-bolt` és `etterem` aloldalai
-- (15 + 7 tétel) végignézve. **21-ből 20 MÁR BENT VOLT** — a német
-- élelmiszer/étterem-lefedettség telített. Ez értékes negatív eredmény: a
-- korábbi körök alaposak voltak.
--
------------------------------------------------------ ÚJ TÉTEL: Emese-Shop
-- Az egyetlen új: magyar élelmiszer-üzlet Hechingenben.
-- Ellenőrizve: a Google Maps ismeri (Katharinenstraße, 72379 Hechingen), és az
-- emese-shop.com ÉL (200). ⚠️ A Maps NEM ad telefont hozzá — a telefon a
-- címtárból való; a kettő nem mond ellent egymásnak.

INSERT INTO businesses (id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-emese-shop-hechingen', 'Emese-Shop — magyar élelmiszer, Hechingen', 'elelmiszer', 'Élelmiszerbolt', 'Katharinenstraße, 72379 Hechingen', '+49 151 59183761', 'Magyar élelmiszer és termékek Hechingenben. · emese-shop.com', '["Magyar","Német"]', 48.350954, 8.963910, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-de-trades', 'DE', 'BW')
ON CONFLICT(id) DO NOTHING;

-------------------------------------------------------- DUPLIKÁTUM-ZÁRÁS
-- A Majsai étterem KÉTSZER szerepelt, és a két példány KÉT KÜLÖNBÖZŐ hibát vitt:
--
--   de-imp-majsai-etterem-magyar-bufe  (csv-import)
--       „Hol fenweg 41"  ← ELGÉPELT utcanév
--       „+49 1772 772147" ← ROSSZUL TAGOLT telefon (a 177-es előhívó elcsúszott)
--       DE: jobb, részletesebb leírás
--
--   de-ir-majsai-etterem-magyar-bufe   (seed-iranytu)
--       „Hopfenweg 41"   ← HELYES (a Google Maps is ezt adja)
--       „+49 177 2772147" ← HELYES
--       DE: szegényes leírás
--
-- ⚠️ Egy tisztán NÉV-alapú dedup ezt nem fogta volna meg (a két név eltérő
-- írásmódú), és a CÍM-alapú sem, mert az utcanév egy betűben különbözik.
-- A TELEFON fedte fel: ugyanaz a szám, más tagolással.
--
-- Megtartjuk a HELYES adatú tételt, és átvisszük rá a jobb leírást.
UPDATE businesses SET
  blurb = 'Magyar étterem és büfé Krumbachban (Bajorország) — lángos és házias magyar ételek. · majsai-langos.de',
  updated_at = datetime('now')
WHERE id = 'de-ir-majsai-etterem-magyar-bufe';

UPDATE businesses SET hidden = 1, updated_at = datetime('now')
WHERE id = 'de-imp-majsai-etterem-magyar-bufe';
