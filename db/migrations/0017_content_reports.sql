-- ===========================================================================
-- 0017_content_reports — Jelentés (Notice & Takedown) a hirdetésekhez és
-- véleményekhez.
--
-- Logika: ha valaki jelent egy tartalmat (indokkal), az AZONNAL elrejtődik a
-- publikum elől (hidden=1), amíg az admin vissza nem állítja vagy véglegesen
-- nem törli. Így a rendszer azonnal reagál a jogsértő tartalomra.
-- ===========================================================================

ALTER TABLE bulletin_posts ADD COLUMN hidden INTEGER NOT NULL DEFAULT 0 CHECK (hidden IN (0, 1));
ALTER TABLE reviews ADD COLUMN hidden INTEGER NOT NULL DEFAULT 0 CHECK (hidden IN (0, 1));

CREATE TABLE content_reports (
  id               TEXT PRIMARY KEY,                 -- UUID
  content_type     TEXT NOT NULL,                    -- 'bulletin' | 'review'
  content_id       TEXT NOT NULL,
  reason           TEXT,                             -- a bejelentő indoka
  reporter_ip_hash TEXT,                             -- SHA-256(IP), abuse-szűréshez
  moderate_token   TEXT NOT NULL,                    -- admin keep/remove link token
  status           TEXT NOT NULL DEFAULT 'open',     -- 'open' | 'kept' | 'removed'
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_reports_token ON content_reports (moderate_token);
CREATE INDEX idx_reports_iptime ON content_reports (reporter_ip_hash, created_at);
CREATE INDEX idx_reports_content ON content_reports (content_type, content_id);
