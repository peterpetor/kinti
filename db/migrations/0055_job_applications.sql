-- db/migrations/0055_job_applications.sql

-- Álláspályázatok táblája
-- A jelentkezők adatait tároljuk minimálisan (névés email),
-- amíg a munkáltató feldolgozza. Adattakarékosság elvének megfelelően.
CREATE TABLE IF NOT EXISTS job_applications (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    employer_id TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT,
    status TEXT DEFAULT 'new', -- new, reviewed, rejected, hired
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (employer_id) REFERENCES employers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_employer_id ON job_applications(employer_id);
-- Egyedi: egy email csak egyszer jelentkezhet egy állásra
CREATE UNIQUE INDEX IF NOT EXISTS idx_job_applications_unique ON job_applications(job_id, email);
