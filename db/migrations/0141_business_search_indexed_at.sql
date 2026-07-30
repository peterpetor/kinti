-- 0141 — szemantikus keresés: per-cég indexelési időbélyeg.
--
-- Miért kell: a Vectorize-index eddig SOSEM készült el teljesen (2369 cégből
-- ~1268 volt benne). Az ok szerkezeti: a teljes reindex EGYETLEN edge-kérésben
-- ~95 egymás utáni AI-embedding + upsert körre futott, ami CPU-/alkérés-limitbe
-- ütközik, és a job félbeszakadt.
--
-- Ez az oszlop teszi a munkát FOLYTATHATÓVÁ és PONTOSSÁ: a napi cron csak azokat
-- a cégeket indexeli, amiknek nincs vagy elavult a vektora
-- (search_indexed_at IS NULL OR search_indexed_at < updated_at). Így
--   • a hátralék magától lefogy néhány nap alatt,
--   • a szerkesztett cégek automatikusan újraindexelődnek,
--   • és NEM pazarolunk Workers AI kvótát a már naprakész sorokra
--     (a lekérdezés magától nullára fogy, ha minden friss).
--
-- Additív, visszafelé kompatibilis: a régi kód figyelmen kívül hagyja.
ALTER TABLE businesses ADD COLUMN search_indexed_at TEXT;

-- A hátralék-lekérdezés fedő indexe (a cron minden futáskor ezt futtatja).
CREATE INDEX IF NOT EXISTS idx_businesses_search_pending
  ON businesses (search_indexed_at)
  WHERE hidden = 0 AND moderation_status = 1;
