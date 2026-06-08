-- db/migrations/0056_job_board_moderation_audit.sql
-- Audit-oszlopok az employers és jobs táblákhoz,
-- hogy az admin döntések nyomon követhetők legyenek.

ALTER TABLE employers ADD COLUMN moderation_decision_at DATETIME;
ALTER TABLE employers ADD COLUMN moderation_decided_by TEXT;

ALTER TABLE jobs ADD COLUMN moderation_decision_at DATETIME;
ALTER TABLE jobs ADD COLUMN moderation_decided_by TEXT;
