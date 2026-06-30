-- 0107 — Email suppression lista (sender reputation védelem). A Resend webhook
-- (email.bounced / email.complained) ide írja a problémás címeket; a küldő
-- (getResend interceptor) ezekre NEM küld többé. Spam-panasznál a cím radarjait
-- is töröljük (a leiratkozás-szándék tiszteletben tartása).
CREATE TABLE IF NOT EXISTS email_suppressions (
  email      TEXT PRIMARY KEY,
  reason     TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
