-- 0085 — streak-mentő push (veszteség-averzió).
-- A napi belépési sorozat (streak) kliensoldali (localStorage), de a
-- push-feliratkozás szerveroldali. Hogy esténként szólni tudjunk annak, akinek
-- a sorozata MA megszakadhat, a kliens szinkronizálja a streak-hosszt és az
-- utolsó aktív napot a SAJÁT push-feliratkozására (endpoint-scope, NEM user-
-- identitás — a meglévő notify_* preferenciákkal azonos modell).
ALTER TABLE push_subscriptions ADD COLUMN last_active_day TEXT;
ALTER TABLE push_subscriptions ADD COLUMN streak_len INTEGER NOT NULL DEFAULT 0;
-- Idempotencia: egy adott napon legfeljebb egy streak-mentő push / feliratkozás.
ALTER TABLE push_subscriptions ADD COLUMN streak_save_sent_day TEXT;
