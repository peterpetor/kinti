-- 0073 — esemény-emlékeztetők: 24h ÉS 1h (lead_minutes oszlop).
-- A korábbi UNIQUE(event_id, push_endpoint) csak 1 emlékeztetőt engedett
-- eseményenként; tábla-újraépítéssel bevezetjük a lead_minutes-t, és a
-- UNIQUE-ot (event_id, push_endpoint, lead_minutes)-re bővítjük.
ALTER TABLE event_reminders RENAME TO event_reminders_old;

CREATE TABLE event_reminders (
  id            TEXT PRIMARY KEY,
  event_id      TEXT NOT NULL,
  push_endpoint TEXT NOT NULL,
  remind_at     TEXT NOT NULL,                 -- ISO datetime (UTC) — mikor küldjük
  lead_minutes  INTEGER NOT NULL DEFAULT 60,   -- hány perccel a kezdés előtt (1440=24h, 60=1h)
  sent          INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (event_id, push_endpoint, lead_minutes)
);

-- A régi sorok (kezdés−3h) 180 perc lead-del öröklődnek.
INSERT INTO event_reminders (id, event_id, push_endpoint, remind_at, lead_minutes, sent, created_at)
  SELECT id, event_id, push_endpoint, remind_at, 180, sent, created_at FROM event_reminders_old;

DROP TABLE event_reminders_old;

CREATE INDEX idx_event_reminders_due ON event_reminders (sent, remind_at);
