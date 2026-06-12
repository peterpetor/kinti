-- db/migrations/0069_business_search_terms.sql
--
-- „Honnan jönnek az emberek" — a Szaknévsor keresőből egy vállalkozás
-- profiljára kattintáskor rögzítjük a keresőszót (Analytics Dashboard, PRO).
-- Aggregált számláló kifejezésenként (nem per-látogató → nincs PII).

CREATE TABLE IF NOT EXISTS business_search_terms (
  business_id TEXT NOT NULL,
  term        TEXT NOT NULL,
  count       INTEGER NOT NULL DEFAULT 1,
  last_seen   TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (business_id, term),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_business_search_terms_biz
  ON business_search_terms(business_id, count DESC);
