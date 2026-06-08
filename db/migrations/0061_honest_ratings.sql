-- 0061_honest_ratings — Őszinte értékelés: a businesses.rating / .reviews
-- mostantól KIZÁRÓLAG a valódi, látható és jóváhagyott véleményekből származik.
--
-- Háttér: a seed (és korábbi import) beégetett rating/reviews értékeket állított
-- be tényleges vélemény-rekordok nélkül → „rating vélemény nélkül". Ez egyszeri
-- újraszámolás minden vállalkozásra: ahol nincs valódi vélemény, a rating 0-ra
-- áll vissza. Innentől a recomputeBusinessRating tartja karban (ugyanezzel a
-- szűrővel), és az aggregateRating JSON-LD sem hirdet valótlan értékelést.

UPDATE businesses SET
  rating  = COALESCE((
    SELECT ROUND(AVG(rating), 1) FROM reviews
    WHERE business_id = businesses.id AND hidden = 0 AND moderation_status = 1
  ), 0),
  reviews = COALESCE((
    SELECT COUNT(*) FROM reviews
    WHERE business_id = businesses.id AND hidden = 0 AND moderation_status = 1
  ), 0);
