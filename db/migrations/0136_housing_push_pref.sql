-- 0136 — Albérlet push-kategória: jóváhagyott KIADÓ hirdetésről (szoba/lakás)
-- régió-célzott push megy a feliratkozóknak („új albérlet a régiódban" — a
-- lakást keresők visszatérés-triggere). Alapból BE (0075/0129-minta); a
-- beállítások UI-ban kikapcsolható. Kereső hirdetésről NEM megy push.
ALTER TABLE push_subscriptions ADD COLUMN notify_housing INTEGER NOT NULL DEFAULT 1;
