-- 0130 — „Meghívók" ranglista-kategória: a meghívó-kód konverzió-száma mint
-- SZERVER-OLDALON HITELESÍTETT al-pontszám (a szinkron a referral_conversions-ből
-- számolja — nem önbevallás, mint a többi kategória). Privacy változatlan:
-- anonim kód + anonim ranglista-token, identitás nélkül.
ALTER TABLE leaderboard ADD COLUMN score_referral INTEGER NOT NULL DEFAULT 0;
