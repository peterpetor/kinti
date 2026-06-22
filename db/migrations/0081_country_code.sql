-- 0081 — country_code adatdimenzió a tartalom-táblákhoz (6-ország alap).
--
-- Eddig minden tartalom implicit svájci volt (canton_code-ra épülve). A
-- többország-induláshoz a vállalkozás/állás/esemény kap egy ország-kódot.
-- A meglévő sorok mind 'CH' (DEFAULT), így a jelenlegi CH-app változatlanul
-- működik; az új tartalom a beküldő országával töltődik.
--
-- A region_code-ot NEM vezetjük be külön oszlopként: a meglévő canton_code
-- tölti be ezt a szerepet (CH-n kívül az adott ország régió-kódját tárolja,
-- lásd lib/regions.ts). Így nincs duplikált geo-oszlop.

ALTER TABLE businesses ADD COLUMN country_code TEXT NOT NULL DEFAULT 'CH';
ALTER TABLE jobs       ADD COLUMN country_code TEXT NOT NULL DEFAULT 'CH';
ALTER TABLE events     ADD COLUMN country_code TEXT NOT NULL DEFAULT 'CH';

CREATE INDEX IF NOT EXISTS idx_businesses_country ON businesses (country_code);
CREATE INDEX IF NOT EXISTS idx_jobs_country       ON jobs (country_code);
CREATE INDEX IF NOT EXISTS idx_events_country      ON events (country_code);
