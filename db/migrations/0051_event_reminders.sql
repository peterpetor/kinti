-- ===========================================================================
-- 0051_event_reminders — push-emlékeztető a „Megyek"-et nyomott eseményekre.
--
-- Amikor egy felhasználó RSVP-zik EGY eseményre ÉS van push-feliratkozása, egy
-- sor kerül ide a kiszámolt `remind_at` (UTC) időponttal (esemény kezdés − 3 óra).
-- Az óránként futó cron-worker (kinti-cron-exchange-alert) küldi ki a payload-
-- mentes push-t, majd `sent = 1`-re állítja. 1 esemény = 1 emlékeztető / endpoint.
-- ===========================================================================

CREATE TABLE event_reminders (
  id            TEXT PRIMARY KEY,                          -- UUID
  event_id      TEXT NOT NULL,
  push_endpoint TEXT NOT NULL,                             -- a push_subscriptions kulcsa
  remind_at     TEXT NOT NULL,                             -- ISO datetime (UTC) — mikor küldjük
  sent          INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (event_id, push_endpoint)
);

CREATE INDEX idx_event_reminders_due ON event_reminders (sent, remind_at);
