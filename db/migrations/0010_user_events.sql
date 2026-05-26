-- Migration: Add user-submitted event properties with moderation support
ALTER TABLE events ADD COLUMN description TEXT;
ALTER TABLE events ADD COLUMN image_key TEXT;
ALTER TABLE events ADD COLUMN email TEXT;
ALTER TABLE events ADD COLUMN status TEXT NOT NULL DEFAULT 'approved';
ALTER TABLE events ADD COLUMN token TEXT;

CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_token ON events(token);
