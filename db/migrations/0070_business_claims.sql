-- ===========================================================================
-- 0070_business_claims — „nem megerősített lista" + Foglald el a profilod flow
--
-- Supply-bootstrap: a Szaknévsorba behozhatunk valódi, nyilvános adatokból
-- kutatott vállalkozásokat tulajdonos nélkül (claimed = 0). A publikus profilon
-- ilyenkor „nem megerősített" jelzés + „Ez a vállalkozásod? Foglald el!" CTA
-- jelenik meg. A tulajdonos beküld egy claim-kérést → admin jóváhagyja →
-- manage-token-t kap, és onnantól szerkesztheti (a meglévő kezelő-link infra).
--
-- A meglévő (önként beküldött / Clerk-es) vállalkozások claimed = 1 (alapért.).
-- ===========================================================================

ALTER TABLE businesses ADD COLUMN claimed INTEGER NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS business_claims (
  id             TEXT PRIMARY KEY,
  business_id    TEXT NOT NULL,
  claimant_name  TEXT,
  claimant_email TEXT NOT NULL,
  claimant_phone TEXT,
  message        TEXT,
  status         TEXT NOT NULL DEFAULT 'pending',   -- pending | approved | rejected
  ip_hash        TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  decided_at     TEXT,
  decided_by     TEXT,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_business_claims_status ON business_claims(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_claims_biz ON business_claims(business_id);
