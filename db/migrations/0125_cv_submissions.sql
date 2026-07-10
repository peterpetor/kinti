-- 0125 — Német Önéletrajz Készítő: OPCIONÁLIS, hozzájárulás-alapú profil-mentés.
-- A PDF teljesen a böngészőben készül; ez a tábla CSAK akkor kap sort, ha a
-- felhasználó KIFEJEZETTEN bepipálja a „keressenek meg állással" opt-int
-- (GDPR 6(1)a — hozzájárulás). Cél: magyar munkaközvetítés (Feedback Jobs).
-- A kontakt-adat PII → törlés a manage_token-nel vagy info@kinti.app-on kérhető.
CREATE TABLE IF NOT EXISTS cv_submissions (
  id               TEXT PRIMARY KEY,                 -- UUID
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  full_name        TEXT NOT NULL,
  email            TEXT,
  phone            TEXT,
  city             TEXT,
  category         TEXT,                             -- job-category id (szűréshez)
  profession_de    TEXT,                             -- német szakma-megnevezés
  years_experience INTEGER,
  summary          TEXT,
  payload          TEXT NOT NULL,                    -- a teljes CV JSON-ként
  placement_opt_in INTEGER NOT NULL DEFAULT 1 CHECK (placement_opt_in IN (0, 1)),
  manage_token     TEXT                              -- önkiszolgáló törléshez
);

CREATE INDEX IF NOT EXISTS idx_cv_submissions_created ON cv_submissions (created_at);
CREATE INDEX IF NOT EXISTS idx_cv_submissions_category ON cv_submissions (category);
