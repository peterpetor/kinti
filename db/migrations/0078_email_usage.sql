-- 0078 — napi email-küldés számláló (admin monitoring a Resend free-tier 100/nap
-- falához). Minden SIKERES Resend-küldés (megerősítő, lead, digest, admin-értesítő
-- stb.) napi összesítőbe kerül, hogy az admin fülön látszódjon, közelíted-e a limitet.
CREATE TABLE IF NOT EXISTS email_usage_daily (
  day   TEXT    NOT NULL PRIMARY KEY,   -- 'YYYY-MM-DD' (UTC)
  count INTEGER NOT NULL DEFAULT 0
);
