-- 0060_review_helpful — Vélemény „Hasznos volt" szavazás, account NÉLKÜL.
--
-- Adatvédelem: nincs per-user azonosító. 1 szavazat / készülék-IP / vélemény,
-- a dedup IP-hash-en (SHA-256) történik — ugyanaz a minta, mint az esemény-RSVP
-- (event_rsvps). A nyers IP-t nem tároljuk, a hash csak duplikáció-szűrésre van.

CREATE TABLE IF NOT EXISTS review_helpful_votes (
  review_id  TEXT NOT NULL,
  ip_hash    TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (review_id, ip_hash)
);

CREATE INDEX IF NOT EXISTS idx_review_helpful_review ON review_helpful_votes(review_id);
