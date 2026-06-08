-- db/migrations/0054_job_board.sql

-- 1. Employers (Munkáltatók)
CREATE TABLE IF NOT EXISTS employers (
    id TEXT PRIMARY KEY,
    owner_user_id TEXT NOT NULL, -- Clerk or Auth user_id
    company_name TEXT NOT NULL,
    logo_key TEXT,
    description TEXT,
    website TEXT,
    contact_email TEXT NOT NULL,
    billing_email TEXT,
    subscription_tier TEXT DEFAULT 'free', -- free, basic, pro, enterprise
    stripe_customer_id TEXT,
    moderation_status INTEGER DEFAULT 0, -- 0=pending, 1=approved, 2=rejected
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Jobs (Álláshirdetések)
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    employer_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    employment_type TEXT NOT NULL, -- full-time, part-time, contract, etc.
    salary_min INTEGER,
    salary_max INTEGER,
    currency TEXT DEFAULT 'CHF',
    requirements TEXT,
    status TEXT DEFAULT 'draft', -- draft, active, closed
    moderation_status INTEGER DEFAULT 0, -- 0=pending, 1=approved, 2=rejected
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    FOREIGN KEY (employer_id) REFERENCES employers(id) ON DELETE CASCADE
);

-- 3. Worker Profiles (Munkavállalói profilok és CV-k)
CREATE TABLE IF NOT EXISTS worker_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE, -- Clerk or Auth user_id
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    cv_key TEXT, -- R2 object key
    ai_moderation_status INTEGER DEFAULT 0, -- 0=pending, 1=clean, 2=flagged
    searchable INTEGER DEFAULT 0, -- Opt-in for employers to find them
    layer3_opt_in INTEGER DEFAULT 0, -- Opt-in for recruitment agency offline matching
    expected_salary_min INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Applications (Jelentkezések)
CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    worker_profile_id TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'new', -- new, reviewed, rejected
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_profile_id) REFERENCES worker_profiles(id) ON DELETE CASCADE
);

-- Indexek a gyors kereséshez
CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status, moderation_status);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_worker_profile_id ON applications(worker_profile_id);
