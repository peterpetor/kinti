-- ===========================================================================
-- 0024_manage_tokens — email-only management flow minden publikus tartalomhoz.
--
-- Az "email-first" minta keretében minden publikus tartalom kap egy egyedi
-- `manage_token`-t a beküldéskor. A megerősítő e-mailben a /kezeles/<token>
-- link megnyit egy szerkesztőt, ahol a feladó Clerk-belépés NÉLKÜL módosíthatja
-- vagy törölheti a sajátját.
-- A `rides` táblán már megvolt — most a businesses + events + business_submissions.
-- ===========================================================================

ALTER TABLE business_submissions ADD COLUMN manage_token TEXT;
ALTER TABLE businesses ADD COLUMN manage_token TEXT;
ALTER TABLE events ADD COLUMN manage_token TEXT;

CREATE INDEX idx_businesses_manage ON businesses(manage_token);
CREATE INDEX idx_events_manage ON events(manage_token);
