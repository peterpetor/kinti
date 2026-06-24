-- 0089 — munkáltatói e-mail a shortlist-tételhez, a körlevél-kiküldéshez.
-- Az állás-API-k (Adzuna/Jooble) NEM adnak e-mailt, ezért a recruiter írja be
-- (a cég honlapjáról/hirdetéséről); a körlevél ezekre a címekre megy ki.
ALTER TABLE recruiting_shortlist ADD COLUMN employer_email TEXT;
