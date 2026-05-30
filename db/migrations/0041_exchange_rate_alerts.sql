-- ===========================================================================
-- 0041_exchange_rate_alerts  —  CHF/HUF árfolyam-riasztás push-értesítéssel.
--
-- A felhasználó beállíthat egy küszöböt (pl. "értesíts ha 1 CHF ≥ 410 HUF"),
-- és ha az árfolyam átlépi azt, push-értesítést kap. Push subscription már
-- létezik (push_subscriptions tábla 0016 óta); itt csak a küszöböket kötjük
-- hozzá az endpoint-tal.
--
-- PII-mentes: nem tárolunk emailt, nincs felhasználói azonosító, csak a
-- push-endpoint (ami már a push_subscriptions-ben is benne van).
--
-- A `last_fired_at` cooldown-célt szolgál: ha az árfolyam az érték körül
-- ingadozik, ne küldjünk percenként push-t — minimum 6 órás "csend" a
-- re-trigger előtt.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS exchange_rate_alerts (
  id              TEXT    PRIMARY KEY,
  push_endpoint   TEXT    NOT NULL,            -- ⇒ push_subscriptions.endpoint
  threshold_huf   REAL    NOT NULL,            -- pl. 410.5
  direction       TEXT    NOT NULL,            -- 'above' (≥) vagy 'below' (≤)
  active          INTEGER NOT NULL DEFAULT 1,
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  last_fired_at   TEXT
);

CREATE INDEX IF NOT EXISTS idx_exch_alerts_active
  ON exchange_rate_alerts (active);
CREATE INDEX IF NOT EXISTS idx_exch_alerts_endpoint
  ON exchange_rate_alerts (push_endpoint);
