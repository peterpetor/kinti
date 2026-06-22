-- 0080 — push „Új állás" kategória.
-- A kanton-célzott push eddig csak vállalkozás (0075: notify_business) és esemény
-- (notify_event) kategóriát ismert. Egy álláskereső közönségnek a legnagyobb
-- retenció-trigger az „új állás a kantonodban" — ehhez kell egy harmadik kapcsoló.
-- Alapból BE (a meglévő feliratkozók is kapják az új állásokat).
ALTER TABLE push_subscriptions ADD COLUMN notify_job INTEGER NOT NULL DEFAULT 1;
