-- ===========================================================================
-- 0025_ride_rate_limit — IP-alapú napi limit a telekocsi feladásnál.
--
-- A /api/rides/submit Clerk-auth NÉLKÜL működik (vendég-feladás), ezért a
-- spam-védelem két rétegre tolódott: Turnstile CAPTCHA + IP-alapú napi limit
-- (a Bulletin / Event flow-kkal azonos mintára).
-- ===========================================================================

CREATE TABLE IF NOT EXISTS ride_submit_log (
  id         TEXT PRIMARY KEY,
  ip_hash    TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ride_submit_ip_time ON ride_submit_log(ip_hash, created_at);
