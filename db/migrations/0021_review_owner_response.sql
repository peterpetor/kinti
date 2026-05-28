-- ===========================================================================
-- 0021_review_owner_response — A vállalkozó tulajdonosa válaszolhat a
-- véleményekre (Google-stílusú trust-jel). Nullable mezők; ha üres, nincs válasz.
-- ===========================================================================

ALTER TABLE reviews ADD COLUMN owner_response TEXT;
ALTER TABLE reviews ADD COLUMN owner_responded_at TEXT;
