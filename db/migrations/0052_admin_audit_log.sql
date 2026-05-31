-- ===========================================================================
-- 0052_admin_audit_log — Comprehensive admin action audit trail
--
-- Tracks ALL admin moderation decisions: content approvals/rejections,
-- blocklist additions, manual strikes, etc. This enables accountability
-- and helps identify moderation patterns over time.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id              TEXT    PRIMARY KEY,
  admin_user_id   TEXT    NOT NULL,
  action_type     TEXT    NOT NULL,  -- 'approve', 'reject', 'block', 'strike', etc.
  target_type     TEXT    NOT NULL,  -- 'review', 'business', 'event', 'ip', etc.
  target_id       TEXT,              -- ID of the reviewed content (if applicable)
  ip_hash         TEXT,              -- IP being blocked/struck (if applicable)
  reason          TEXT,              -- Why this action was taken
  details         TEXT,              -- JSON metadata (content snippet, etc.)
  created_at      TEXT    NOT NULL   DEFAULT (datetime('now'))
);

-- Efficient lookups for admin activity
CREATE INDEX IF NOT EXISTS idx_audit_admin
  ON admin_audit_log (admin_user_id, created_at);

-- Lookups by action type (for dashboards)
CREATE INDEX IF NOT EXISTS idx_audit_action
  ON admin_audit_log (action_type, created_at);

-- IP block tracking
CREATE INDEX IF NOT EXISTS idx_audit_ip
  ON admin_audit_log (ip_hash, created_at);

-- Target-specific tracking (e.g., all actions on a review)
CREATE INDEX IF NOT EXISTS idx_audit_target
  ON admin_audit_log (target_type, target_id);
