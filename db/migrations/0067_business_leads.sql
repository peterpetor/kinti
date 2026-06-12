-- db/migrations/0067_business_leads.sql
--
-- Beérkező ajánlatkérések (lead-ek) tárolása a vállalkozó in-app
-- „Ajánlatkérés-postaládájához" (Szaknévsor PRO). Eddig a lead csak emailben
-- ment ki — most rekordot is mentünk, hogy a PRO-vállalkozó kezelhesse.
--
-- A lead a kérő SAJÁT, megkereséshez megadott adata (implicit hozzájárulás).
-- Csak az a vállalkozás látja, AKINEK küldtük (business_id). GDPR: az
-- ajánlatkéréseket időszakosan érdemes törölni (lásd purge follow-up).

CREATE TABLE IF NOT EXISTS business_leads (
  id             TEXT PRIMARY KEY,
  business_id    TEXT NOT NULL,
  sender_name    TEXT NOT NULL,
  sender_email   TEXT NOT NULL,
  sender_phone   TEXT,
  category_label TEXT,
  message        TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'new',   -- new, contacted, archived
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_business_leads_business
  ON business_leads(business_id, created_at);
