-- 0083: business_submissions.country_code
-- Az önregisztrált (email-megerősítéses) vállalkozás országa végigvezethető a
-- staging → publikálás láncon. Eddig hiányzott, ezért az AT-önregisztráció a
-- businesses.country_code DEFAULT 'CH'-ra esett volna (nem látszott AT-ben).
ALTER TABLE business_submissions ADD COLUMN country_code TEXT NOT NULL DEFAULT 'CH';
