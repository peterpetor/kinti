-- Add lead_count tracking to businesses and analytics tables
ALTER TABLE businesses ADD COLUMN lead_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE business_analytics_daily ADD COLUMN lead_count INTEGER NOT NULL DEFAULT 0;
