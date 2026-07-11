-- 0127 — „Keresek" → fordított lead-routing: a jóváhagyott igényt a rendszer
-- kiküldi a kategóriabeli cégeknek (PRO kontakttal, nem-PRO zárolt teaserrel).
-- A routed_at az egyszeri-futás claim-je: újra-jóváhagyáskor nem küldünk duplán.
ALTER TABLE service_requests ADD COLUMN routed_at TEXT;
