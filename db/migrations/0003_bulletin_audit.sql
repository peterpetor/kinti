-- ===========================================================================
-- 0003_bulletin_audit  —  GDPR / Ekertv audit-trail mezők a hirdetésposztoláshoz.
--
-- Cél: jogvitában (takedown-kérés, NAIH-vizsgálat, polgári per) bizonyítható
-- legyen, hogy a hirdetés feladója MIKOR és MILYEN feltétel-verziókat fogadott
-- el, valamint a beküldés származási IP-jét (hashed, nem visszafejthető) — a
-- GDPR adatminimalizálási elvet (5(1)c) tartva.
--
-- Az IP-t SHA-256-ban tároljuk só nélkül; csak duplikáció-keresésre / abuse-
-- bizonyításra szükséges. Az aláírt szöveg ("terms_version") egy egyszerű
-- verzió-string (pl. "2026-05-25"), amit a kódban frissítünk a jogi szöveg
-- változásakor.
-- ===========================================================================

-- --- 1) Piszkozat: amikor a felhasználó beküldte, mit fogadott el?
ALTER TABLE bulletin_drafts ADD COLUMN accepted_terms_at TEXT;
ALTER TABLE bulletin_drafts ADD COLUMN terms_version     TEXT;
ALTER TABLE bulletin_drafts ADD COLUMN age_confirmed     INTEGER NOT NULL DEFAULT 0;
ALTER TABLE bulletin_drafts ADD COLUMN ip_hash           TEXT;

-- --- 2) Publikált poszt: ugyanezek átvezetődnek a confirm-step után
ALTER TABLE bulletin_posts ADD COLUMN accepted_terms_at TEXT;
ALTER TABLE bulletin_posts ADD COLUMN terms_version     TEXT;
ALTER TABLE bulletin_posts ADD COLUMN age_confirmed     INTEGER NOT NULL DEFAULT 0;
ALTER TABLE bulletin_posts ADD COLUMN ip_hash           TEXT;

CREATE INDEX idx_bulletin_posts_ip_hash ON bulletin_posts(ip_hash);
