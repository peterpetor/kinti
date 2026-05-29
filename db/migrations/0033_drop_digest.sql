-- ===========================================================================
-- 0033_drop_digest — heti hírlevél email-funkció megszüntetése.
--
-- A local-first váltás keretében a heti email-hírlevél megszűnt. A push-
-- értesítések (push_subscriptions) helyettesítik. Eltávolítjuk a teljes
-- email-feliratkozó táblát — semmilyen email-cím nem marad tárolva.
-- ===========================================================================

DROP TABLE IF EXISTS digest_subscribers;
