-- 0124 — B2B Hub (Alvállalkozó & Projektkereső). Zárt, Szaknévsor-PRO-only
-- projektpiac: egy ellenőrzött (featured=1) magyar cég munkát ír ki, más PRO
-- cégek jelentkeznek rá. A hozzáférést a businesses.featured szabja meg
-- (business_pro_monthly Paddle termék állítja) — NEM a user-szintű Kinti PRO.
--
-- author_id: Clerk user_id (a kiíró). business_id: businesses(id) — melyik
-- (ellenőrzött) cég írta ki. created_at: epoch ms (a spec szerint INTEGER).
CREATE TABLE IF NOT EXISTS b2b_projects (
  id              TEXT PRIMARY KEY,                 -- UUID
  author_id       TEXT NOT NULL,                    -- Clerk user_id
  business_id     TEXT NOT NULL,                    -- businesses(id)
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  target_country  TEXT NOT NULL,                    -- CH/AT/DE/NL
  target_city     TEXT,
  category_needed TEXT,                             -- categories(id): 'festo', 'vizszerelo', …
  contact_phone   TEXT,
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at      INTEGER NOT NULL                  -- epoch ms
);

-- A feed a nyitott projekteket, idő szerint csökkenő sorrendben listázza.
CREATE INDEX IF NOT EXISTS idx_b2b_projects_open ON b2b_projects (status, created_at);
-- Ország-szűrés (a feed alap-szűrője) + a marketing-teaser darabszáma.
CREATE INDEX IF NOT EXISTS idx_b2b_projects_country ON b2b_projects (target_country, status);
-- „Saját projektjeim" (lezárás jogosultság-ellenőrzés).
CREATE INDEX IF NOT EXISTS idx_b2b_projects_author ON b2b_projects (author_id);
