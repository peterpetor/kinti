-- Szaknévsor PRO (business_pro) előfizetés-metaadat.
--
-- MIÉRT: a businesses.featured csak a JOGOSULTSÁGOT tárolja — a fizetési
-- szolgáltató subscription/customer azonosítója eddig elveszett, ezért a
-- céges előfizetéshez nem lehetett appon belüli kezelést/lemondást adni
-- (Paddle customer portal), csak email-utat. A Kinti PRO-nál ugyanez a
-- subscriptions táblában él; a céges párját ez a tábla adja.
--
-- A sorokat a Paddle-webhook / Play-verify tölti (lib/entitlements.ts) a
-- subscription.* eseményekből — a MEGLÉVŐ előfizetők a következő megújulási
-- webhookkal kapnak sort (≤1 hónap), addig a portál-gomb a support-email
-- fallbacket mutatja nekik.
CREATE TABLE IF NOT EXISTS business_subscriptions (
  business_id          TEXT PRIMARY KEY,             -- businesses.id
  provider_sub_id      TEXT,                          -- Paddle sub id VAGY "play:<token-prefix>"
  provider_customer_id TEXT,                          -- Paddle customer id (Play-nél NULL)
  status               TEXT NOT NULL DEFAULT 'active',
  current_period_end   TEXT,
  updated_at           TEXT NOT NULL DEFAULT (datetime('now'))
);
