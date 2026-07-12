-- 0131 — munkáltatói lejárat-értesítők: a hirdetés lejárata ELŐTT (figyelmeztető)
-- és UTÁN (megújítás-hívó) email megy a munkáltatónak, Kiemelt Állás upsell-lel.
-- A két időbélyeg az egyszeri-küldés őre (a review-nudge minta).
ALTER TABLE jobs ADD COLUMN expiry_warned_at TEXT;
ALTER TABLE jobs ADD COLUMN expiry_notified_at TEXT;
