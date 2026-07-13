-- Google Play Billing vásárlások nyilvántartása.
--
-- MIÉRT KELL: a Play-előfizetés purchaseTokenje NEM hordoz custom_data-t
-- (ellentétben a Paddle-lel) — a token → {jogosultság, cél-entitás} leképezést
-- MI tároljuk a vásárlás-ellenőrzéskor (/api/payments/play/verify). Az RTDN
-- webhook (megújulás/lemondás) ebből a táblából tudja, MIT kell frissítenie.
-- Egyben idempotencia-őr is: ugyanaz a token kétszer nem aktiválhat.
CREATE TABLE IF NOT EXISTS play_purchases (
  purchase_token TEXT PRIMARY KEY,
  product_id     TEXT NOT NULL,             -- kinti_pro_monthly / business_pro_monthly / job_featured
  entitlement    TEXT NOT NULL,             -- user_pro / business_pro / job_featured
  ref_id         TEXT,                      -- businessId / jobId (user_pro-nál NULL)
  user_id        TEXT,                      -- Clerk userId (a vásárló)
  status         TEXT NOT NULL DEFAULT 'active',
  expiry_time    TEXT,                      -- előfizetés lejárata (ISO)
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_play_purchases_user ON play_purchases (user_id);
