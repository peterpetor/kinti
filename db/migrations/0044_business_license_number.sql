-- A 3.1-es ÁSZF pont alapján kötelező engedélyszám mező az engedélyköteles szakmáknak
ALTER TABLE businesses ADD COLUMN license_number TEXT;
ALTER TABLE business_submissions ADD COLUMN license_number TEXT;
