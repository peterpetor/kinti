-- 0075 — push kategória-preferenciák.
-- A kanton-célzott push eddig minden feliratkozónak ment (vállalkozás + esemény
-- egyben). Bevezetjük a kategória-szintű kapcsolókat; alapból minden BE.
ALTER TABLE push_subscriptions ADD COLUMN notify_business INTEGER NOT NULL DEFAULT 1;
ALTER TABLE push_subscriptions ADD COLUMN notify_event INTEGER NOT NULL DEFAULT 1;
