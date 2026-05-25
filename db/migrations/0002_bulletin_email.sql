-- ===========================================================================
-- 0002_bulletin_email  —  account-mentes hirdetőfal (email-megerősítéses flow).
--
-- Cél: a kinti közösség TAGJAINAK nem kell Clerk-account a hirdetésposztoláshoz
-- (lakás, állás, eladó, szolgáltatás). A spam-szűrés három rétegű:
--   1) Cloudflare Turnstile (CAPTCHA — kliens-oldali)
--   2) email-megerősítő link (Craigslist-minta)
--   3) opcionális admin-moderáció az első posztra (később, /admin route-tal)
--
-- A megerősítésre váró ("nyitott") posztok átmenetileg bulletin_drafts-ban
-- élnek; a confirm-link kattintásakor átkerülnek bulletin_posts-ba.
-- ===========================================================================

-- --- 1) Hirdetés-piszkozatok (megerősítésre váró)
CREATE TABLE bulletin_drafts (
  id TEXT PRIMARY KEY,                                          -- crypto.randomUUID()
  email TEXT NOT NULL,                                          -- megerősítő link címzettje
  kind_id TEXT NOT NULL REFERENCES bulletin_kinds(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  meta TEXT,                                                    -- "Zürich · 1 980 CHF / hó"
  body TEXT,                                                    -- hosszabb leírás (opcionális)
  poster TEXT,                                                  -- megjelenő név (opcionális)
  confirm_token TEXT NOT NULL UNIQUE,                           -- /confirm/<token> linkhez
  manage_token TEXT NOT NULL UNIQUE,                            -- /kezeles/<token> linkhez
  expires_at TEXT NOT NULL,                                     -- ISO datetime; ha nem erősítik meg, takarítjuk
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_bulletin_drafts_expires ON bulletin_drafts(expires_at);
CREATE INDEX idx_bulletin_drafts_email ON bulletin_drafts(email);

-- --- 2) bulletin_posts bővítés
--    email + manage_token  → a feladó saját posztját szerkesztheti/törölheti
--                            a megerősítő emailben lévő link alapján
--    body                 → hosszabb leírás
--    expires_at           → automatikus lejárat (30 nap)
--    published_at         → mikor jelent meg (megerősítés ideje)
--    is_pending           → 1 = admin-moderációra vár, 0 = publikus
ALTER TABLE bulletin_posts ADD COLUMN email TEXT;
ALTER TABLE bulletin_posts ADD COLUMN manage_token TEXT;
ALTER TABLE bulletin_posts ADD COLUMN body TEXT;
ALTER TABLE bulletin_posts ADD COLUMN expires_at TEXT;
ALTER TABLE bulletin_posts ADD COLUMN published_at TEXT;
ALTER TABLE bulletin_posts ADD COLUMN is_pending INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX idx_bulletin_posts_manage_token
  ON bulletin_posts(manage_token) WHERE manage_token IS NOT NULL;
CREATE INDEX idx_bulletin_posts_expires ON bulletin_posts(expires_at);
CREATE INDEX idx_bulletin_posts_pending ON bulletin_posts(is_pending);
