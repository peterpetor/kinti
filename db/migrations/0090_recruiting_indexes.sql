-- 0090 — indexek a skálázható jelölt-listához (több ezer rekordnál is gyors
-- szűrés/rendezés). A név/szakma LIKE '%...%' nem indexelhető (vezető wildcard),
-- de a státusz/ország szűrés és az updated_at rendezés igen.
CREATE INDEX IF NOT EXISTS idx_recruiting_updated ON recruiting_candidates(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_recruiting_status ON recruiting_candidates(status);
CREATE INDEX IF NOT EXISTS idx_recruiting_country ON recruiting_candidates(country);
CREATE INDEX IF NOT EXISTS idx_worker_placement ON worker_profiles(layer3_opt_in, updated_at DESC);
