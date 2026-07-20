-- 0137 — Árfolyam-riasztás (hazautalás) push-kategória.
--
-- ⚠️ SZÁNDÉKOSAN `DEFAULT 0` (OPT-IN), eltérően a többi kategóriától!
-- A notify_business/event/job/daily/keresek/housing mind OPT-OUT (DEFAULT 1),
-- azaz a meglévő feliratkozók automatikusan kapják. Az árfolyam-riasztás
-- viszont csak azokat érdekli, akik ténylegesen haza utalnak — ezért a meglévő
-- ÉS az új sorok is 0-val indulnak, és a felhasználó az Utalás-asszisztensben
-- kapcsolja be. A listPushSubscriptions ehhez `notify_remit = 1`-et szűr
-- (NEM COALESCE(...,1)-et, ami visszahozná az opt-out viselkedést).
ALTER TABLE push_subscriptions ADD COLUMN notify_remit INTEGER DEFAULT 0;
