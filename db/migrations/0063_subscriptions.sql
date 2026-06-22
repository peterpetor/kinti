-- db/migrations/0063_subscriptions.sql
--
-- Kinti PRO előfizetések. Az identitás a Clerk user_id (1 user = 1 előfizetés).
-- A státuszt a Paddle webhook frissíti (subscription.created/activated/canceled/…).
--
-- status értékek (a Paddle-ből leképezve):
--   active, on_trial, past_due, cancelled, expired, paused, inactive
-- A `current_period_end` ISO időbélyeg: eddig jár a hozzáférés (cancelled
-- előfizetés is aktív a periódus végéig).

CREATE TABLE IF NOT EXISTS subscriptions (
  id                 TEXT PRIMARY KEY,
  user_id            TEXT NOT NULL UNIQUE,        -- Clerk userId
  status             TEXT NOT NULL DEFAULT 'inactive',
  plan               TEXT,                        -- pl. 'pro'
  ls_subscription_id TEXT,                        -- fizetési szolgáltató (Paddle) subscription id
  ls_customer_id     TEXT,                        -- fizetési szolgáltató (Paddle) customer id
  current_period_end TEXT,                        -- ISO; eddig aktív
  created_at         TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_ls ON subscriptions(ls_subscription_id);
