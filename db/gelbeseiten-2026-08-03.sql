-- ÚJ MÓDSZER: német Aranyoldalak (gelbeseiten.de) — 2026-08-03
--
-- ⭐ MIÉRT ÚJ: eddig minden felderítés a Google Maps indexére épült. A
-- `gelbeseiten.de` egy TELJESEN KÜLÖN, országos cégjegyzék — olyan tételeket is
-- tartalmaz, amik a Mapsen nem jönnek elő. Szabad szavas, országos keresés:
--   gelbeseiten.de/Suche/<kifejezés>/Bundesweit
-- Az „Ungarische Spezialitäten" lekérdezés 12 találatot adott, teljes címmel és
-- telefonnal, olyan városokban, ahol gyengék vagyunk (Chemnitz, Magdeburg,
-- Erfurt, Suhl, Marl, Dresden).
--
-- ⚠️⚠️ DE NYOMFORRÁS, NEM IGAZSÁGFORRÁS: az Aranyoldalak BENT TARTJA a megszűnt
-- cégeket. A 12 találatból a Maps-ellenőrzés **hármat BEZÁRTNAK** mutatott
-- (Váradi Csárda/Leipzig, Julischka/Dresden, Ungarische Spezialitäten/Mannheim),
-- egy negyediknél pedig már MÁS cég ül a címen (Budapest/Magdeburg → „Mendoza"
-- steakhouse). **Minden találatot Maps-en kell hitelesíteni.**
--
-- ⭐ EGY KORÁBBI DÖNTÉSÜNK IGAZOLÓDOTT: a Váradi Csárda (Leipzig) nálunk MÁR
-- REJTVE volt egy korábbi frissesség-körből — az Aranyoldalak élő telefonnal
-- listázza, a Maps viszont bezártként. A mi adatunk volt a pontosabb.
--
-- ⚠️ ELVETVE — „Bei Ivan" (Marl): magyar szakértőnek tűnt a listán, de a saját
-- weboldala (restaurant-bei-ivan-marl.de) BALKÁNI étteremként hirdeti magát,
-- semmi magyar jel. A tulajdonos neve (Brac Ivan) is horvát. Nem magyar tétel.
-- ⚠️ ELVETVE — „Josef Groh / Ferienwohnung Haus zum wilden Wein" (Gehlberg):
-- a Maps szerint NYARALÓ, nem bolt. A hozzá tartozó ungarnmarkt.de webshop
-- viszont valódi — az kerül be, a saját (lindenbergi) székhelyével.

INSERT INTO businesses (id, name, category_id, category_label, address, phone, contact_email, blurb, languages, lat, lng, pin_x, pin_y, rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code) VALUES
('de-weinland-ungarn-chemnitz', 'Weinland Ungarn — magyar borkereskedés, Chemnitz', 'elelmiszer', 'Élelmiszerbolt', 'Herderstraße 7, 09120 Chemnitz', '+49 371 255216', 'toth-csaba@online.de', 'Magyar borok és élelmiszer-különlegességek, elsősorban webshopként és házhozszállítással. · weinland-ungarn.de', '["Magyar","Német"]', 50.821260, 12.909120, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-gelbeseiten', 'DE', 'SN'),
('de-ungarnmarkt-lindenberg', 'Ungarnmarkt — magyar élelmiszer-webshop', 'elelmiszer', 'Élelmiszerbolt', 'Sonnenstraße 5, 88161 Lindenberg im Allgäu', '+49 8381 8307466', 'ungarnmarkt@feinkost-aus-ungarn.de', 'Magyar fűszer, füstölt áru, bor, pálinka és méz — webshop, személyes átvétellel Gehlbergben is. · ungarnmarkt.de', '["Magyar","Német"]', 47.604477, 9.890603, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, 'seed-gelbeseiten', 'DE', 'BY')
ON CONFLICT(id) DO NOTHING;

------------------------------------------------------------- CÍM-JAVÍTÁS
-- ⭐ A TELEFON-DEDUP HARMADSZOR IS FOGOTT MA: a „Bakos- Ungarische
-- Spezialitäten" (Dürerstraße 75, 09126 Chemnitz-Gablenz) UGYANAZT a telefont
-- és weboldalt használja, mint a meglévő „Bakos Lángos" tételünk
-- (+49 176 21232807 · bakos-langos.de). Vagyis nem új üzlet: ELKÖLTÖZÖTT.
-- ⚠️ A régi címünk ráadásul HIÁNYOS volt — se irányítószám, se város
-- („Augustusburger Straße 230").
UPDATE businesses SET
  name = 'Bakos Lángos és magyar élelmiszer — Chemnitz',
  address = 'Dürerstraße 75, 09126 Chemnitz (Gablenz)',
  lat = 50.826425, lng = 12.944250,
  updated_at = datetime('now')
WHERE id = (SELECT id FROM businesses WHERE name = 'Bakos Lángos' LIMIT 1);
