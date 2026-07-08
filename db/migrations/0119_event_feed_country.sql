-- 0119 — Ország-kód az iCal/RSS esemény-feedekhez.
-- Eddig az event_feeds nem ismerte a forrás országát → a syncFeeds a
-- cantonFromAddress()-t (svájci PLZ/kanton-feloldó) FELTÉTEL NÉLKÜL hívta minden
-- feed helyszínére. Jelenleg minden feed CH (nincs másik felvéve), ezért inert
-- volt — de az első AT/DE/NL forrásnál a svájci feloldó álpozitívat adott volna
-- (lásd a landing country-claim / PLZ-csapda korábbi eseteit). A country_code
-- default 'CH' a jelenlegi (implicit CH) viselkedést őrzi meg csere nélkül.
ALTER TABLE event_feeds ADD COLUMN country_code TEXT NOT NULL DEFAULT 'CH';
