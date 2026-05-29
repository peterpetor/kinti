-- ===========================================================================
-- 0031_first_name_only — meglevő teljes nevek vágása az első szóra.
--
-- A GDPR adatminimalizálás keretében a felhasználói név-mezőkön csak a
-- keresztnevet (vagy első tokent) tároljuk. Például:
--   "Kovács Anna"   → "Anna"
--   "Anna K."       → "Anna"
--   "VidámPék42"    → "VidámPék42"  (változatlan, mert nincs space)
--   "  Anna  "      → "Anna"        (trim)
--
-- A 3 érintett mező: rides.poster_name, reviews.reviewer_name,
--                    bulletin_posts.poster
-- ===========================================================================

UPDATE rides SET poster_name =
  CASE
    WHEN INSTR(TRIM(poster_name), ' ') > 0
    THEN TRIM(SUBSTR(TRIM(poster_name), 1, INSTR(TRIM(poster_name), ' ') - 1))
    ELSE TRIM(poster_name)
  END
  WHERE poster_name IS NOT NULL AND TRIM(poster_name) != '';

UPDATE reviews SET reviewer_name =
  CASE
    WHEN INSTR(TRIM(reviewer_name), ' ') > 0
    THEN TRIM(SUBSTR(TRIM(reviewer_name), 1, INSTR(TRIM(reviewer_name), ' ') - 1))
    ELSE TRIM(reviewer_name)
  END
  WHERE reviewer_name IS NOT NULL AND TRIM(reviewer_name) != '';

UPDATE bulletin_posts SET poster =
  CASE
    WHEN INSTR(TRIM(poster), ' ') > 0
    THEN TRIM(SUBSTR(TRIM(poster), 1, INSTR(TRIM(poster), ' ') - 1))
    ELSE TRIM(poster)
  END
  WHERE poster IS NOT NULL AND TRIM(poster) != '';
