-- 0110 — Email-emlékeztető a Határidő-asszisztenshez (OPT-IN).
-- Ha a felhasználó az emailes emlékeztetőt is kéri, a bejelentkezett (Clerk)
-- email-címét ide tároljuk a határidő-sorokon; enélkül NULL (marad a CSAK-push,
-- anonim mód). A push továbbra is anonim (endpoint-höz kötve, user-azonosító
-- nélkül); az email tudatos privacy-tradeoff — lásd az Adatvédelmi Tájékoztatót.
ALTER TABLE deadline_reminders ADD COLUMN email TEXT;
