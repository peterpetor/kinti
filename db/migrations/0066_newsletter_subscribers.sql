-- ===========================================================================
-- 0066_newsletter_subscribers
-- ===========================================================================

CREATE TABLE newsletter_subscribers (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  country TEXT NOT NULL,
  confirm_token TEXT NOT NULL,
  manage_token TEXT NOT NULL,
  confirmed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_newsletter_subscribers_country ON newsletter_subscribers(country);
