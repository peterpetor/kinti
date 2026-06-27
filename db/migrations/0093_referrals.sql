-- 0093 — „Küldj egy magyart" referral. Anonim: NINCS account/identitás; a `code`
-- a meghívó böngészőjében generált random kód, az `ip_hash` CSAK dedup/rate-limit.
-- Egy (code, ip_hash) páros egyszer számít (UNIQUE) — így egy hálózat nem fújja fel.
CREATE TABLE IF NOT EXISTS referral_conversions (
  id         TEXT PRIMARY KEY,
  code       TEXT NOT NULL,
  ip_hash    TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_referral_code ON referral_conversions(code);
CREATE UNIQUE INDEX IF NOT EXISTS idx_referral_code_ip ON referral_conversions(code, ip_hash);
CREATE INDEX IF NOT EXISTS idx_referral_iphash ON referral_conversions(ip_hash, created_at);
