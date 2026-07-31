-- 0144_business_corrections.sql
--
-- „Javíts rajta" — könnyű adatjavítási javaslat a szaknévsor tételeihez.
--
-- ⚠️ MIÉRT KELL: eddig az EGYETLEN felhasználói visszajelzési út a „Jelentem"
-- volt, ami AZONNAL ELREJTI a vállalkozást (DSA Art. 16 notice-and-action).
-- Ez helyes egy jogsértő tartalomra — de aránytalan egy elgépelt telefonszámra.
-- Aki csak javítani akarna, vagy nem szól, vagy indokolatlanul levetet egy
-- működő céget. Mindkettő rossz.
--
-- ⚠️ A JAVASLAT SOSEM ÍRJA FELÜL AUTOMATIKUSAN AZ ADATOT. Csak sorba áll;
-- admin dönt. Egy nyílt beküldő-űrlap, ami közvetlenül írná a publikus
-- szaknévsort, triviális rongálási felület lenne.
--
-- A tétel NEM rejtődik el javaslat hatására — ez a lényegi különbség a
-- content_reports-hoz képest.
CREATE TABLE IF NOT EXISTS business_corrections (
  id            TEXT PRIMARY KEY,
  business_id   TEXT NOT NULL,
  -- Melyik mezőre vonatkozik: phone | address | website | email | hours | closed | other
  field         TEXT NOT NULL,
  -- A javasolt helyes érték (a „closed" jelzésnél üres lehet).
  suggestion    TEXT,
  -- Szabad szöveges megjegyzés.
  note          TEXT,
  -- open | applied | rejected
  status        TEXT NOT NULL DEFAULT 'open',
  reporter_ip_hash TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at   TEXT,
  resolved_by   TEXT
);

CREATE INDEX IF NOT EXISTS idx_business_corrections_status
  ON business_corrections (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_corrections_business
  ON business_corrections (business_id);
-- A visszaélés-szűrőnek (óránkénti darabszám bejelentőnként).
CREATE INDEX IF NOT EXISTS idx_business_corrections_reporter
  ON business_corrections (reporter_ip_hash, created_at);
