-- 0129 — „Keresek" push-kategória: jóváhagyott igény-hirdetésről régió-célzott
-- push megy (hátha a feliratkozó a keresett szaki). Alapból BE (mint a többi
-- kategória, 0075-minta); a beállítások UI-ban kikapcsolható.
ALTER TABLE push_subscriptions ADD COLUMN notify_keresek INTEGER NOT NULL DEFAULT 1;
