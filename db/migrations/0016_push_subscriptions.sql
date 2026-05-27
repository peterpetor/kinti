-- ===========================================================================
-- 0016_push_subscriptions — Web Push feliratkozások (PWA push-értesítés).
--
-- A felhasználó a böngészőben feliratkozik (engedély + pushManager.subscribe),
-- és a feliratkozást ide mentjük. A canton_code adja a célzást: új esemény
-- esetén csak az adott kanton (vagy a "minden Svájc" = NULL) feliratkozóit
-- értesítjük. GDPR: nem tárolunk személyes adatot, csak a push-endpointot.
-- ===========================================================================

CREATE TABLE push_subscriptions (
  id          TEXT PRIMARY KEY,                  -- UUID
  endpoint    TEXT NOT NULL UNIQUE,              -- a push-szolgáltató egyedi endpointja
  p256dh      TEXT NOT NULL,                     -- a kliens publikus kulcsa (jövőbeni payloadhoz)
  auth        TEXT NOT NULL,                     -- auth secret (jövőbeni payloadhoz)
  canton_code TEXT,                              -- NULL = egész Svájc (minden esemény)
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_push_canton ON push_subscriptions (canton_code);
