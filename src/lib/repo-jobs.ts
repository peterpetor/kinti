/**
 * repo-jobs.ts — Munkáltatók és álláshirdetések (Job Board) adatrétege.
 */
import { getDB } from "./cloudflare";
import { bool } from "./repo-shared";
import type { Employer, Job } from "./types";

/** Egy hirdetés (és a "Kiemelt Állás" boost) élettartama napokban — ugyanaz a
 *  szám mindkettőhöz, hogy egy friss kiemelés-vásárlás a teljes hirdetést is
 *  frissen tartsa (lásd a paddle webhook job_featured ágát). */
export const JOB_LISTING_DAYS = 30;

/** ISO időbélyeg `JOB_LISTING_DAYS` nap múlva — hirdetés létrehozásakor,
 *  megújításkor és kiemelés-vásárláskor egyaránt ezt használjuk. */
export function jobExpiryIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + JOB_LISTING_DAYS);
  return d.toISOString();
}

interface EmployerRow {
  id: string; owner_user_id: string; company_name: string; logo_key: string | null;
  description: string | null; website: string | null; contact_email: string;
  billing_email: string | null; subscription_tier: string; stripe_customer_id: string | null;
  company_uid: string | null; verified: number | null;
  moderation_status: number; created_at: string; updated_at: string;
}

function toEmployer(r: EmployerRow): Employer {
  return {
    id: r.id, ownerUserId: r.owner_user_id, companyName: r.company_name, logoKey: r.logo_key,
    description: r.description, website: r.website, contactEmail: r.contact_email,
    billingEmail: r.billing_email, subscriptionTier: r.subscription_tier,
    stripeCustomerId: r.stripe_customer_id, companyUid: r.company_uid ?? null,
    verified: bool(r.verified), moderationStatus: r.moderation_status,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

interface JobRow {
  id: string; employer_id: string; title: string; description: string; location: string;
  canton_code: string | null; country_code?: string | null; category: string | null; legal_attested: number | null;
  employment_type: string; salary_min: number | null; salary_max: number | null;
  currency: string; requirements: string | null; status: string; moderation_status: number;
  created_at: string; updated_at: string; expires_at: string | null;
}

function toJob(r: JobRow): Job {
  return {
    id: r.id, employerId: r.employer_id, title: r.title, description: r.description,
    location: r.location, cantonCode: r.canton_code ?? null, country: r.country_code ?? "CH", category: r.category ?? null,
    legalAttested: bool(r.legal_attested),
    employmentType: r.employment_type, salaryMin: r.salary_min,
    salaryMax: r.salary_max, currency: r.currency, requirements: r.requirements,
    status: r.status, moderationStatus: r.moderation_status,
    createdAt: r.created_at, updatedAt: r.updated_at, expiresAt: r.expires_at,
  };
}

export async function getEmployerByOwner(ownerUserId: string): Promise<Employer | null> {
  const row = await getDB().prepare("SELECT * FROM employers WHERE owner_user_id = ? LIMIT 1").bind(ownerUserId).first<EmployerRow>();
  return row ? toEmployer(row) : null;
}

export async function getEmployerById(id: string): Promise<Employer | null> {
  const row = await getDB().prepare("SELECT * FROM employers WHERE id = ? LIMIT 1").bind(id).first<EmployerRow>();
  return row ? toEmployer(row) : null;
}

export async function createEmployer(employer: Omit<Employer, "createdAt" | "updatedAt">): Promise<void> {
  await getDB().prepare(
    `INSERT INTO employers (id, owner_user_id, company_name, logo_key, description, website, contact_email, billing_email, subscription_tier, stripe_customer_id, company_uid, moderation_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(employer.id, employer.ownerUserId, employer.companyName, employer.logoKey, employer.description, employer.website, employer.contactEmail, employer.billingEmail, employer.subscriptionTier, employer.stripeCustomerId, employer.companyUid, employer.moderationStatus).run();
}

/** Admin: a munkáltató „Hiteles cég" jelzésének ki/be kapcsolása. */
export async function setEmployerVerified(id: string, verified: boolean): Promise<boolean> {
  const res = await getDB()
    .prepare("UPDATE employers SET verified = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(verified ? 1 : 0, id)
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

export async function getJobs(opts: { status?: string; employerId?: string; includeAllStatuses?: boolean } = {}): Promise<Job[]> {
  const where: string[] = [];
  const binds: unknown[] = [];
  if (!opts.includeAllStatuses) {
    where.push("moderation_status = 1");
    if (opts.status) { where.push("status = ?"); binds.push(opts.status); }
    // Nincs explicit status-szűrés → a publikus lista alapértelmezetten CSAK
    // a látható állapotokat adja (a 'expired' NEM publikus, lásd expireOldJobs).
    else { where.push("status IN ('active', 'featured')"); }
  } else if (opts.status) {
    where.push("status = ?"); binds.push(opts.status);
  }
  if (opts.employerId) { where.push("employer_id = ?"); binds.push(opts.employerId); }
  let sql = "SELECT * FROM jobs";
  if (where.length > 0) sql += " WHERE " + where.join(" AND ");
  sql += " ORDER BY created_at DESC";
  const { results } = await getDB().prepare(sql).bind(...binds).all<JobRow>();
  return results.map(toJob);
}

export async function getJobById(id: string): Promise<Job | null> {
  const row = await getDB().prepare("SELECT * FROM jobs WHERE id = ? LIMIT 1").bind(id).first<JobRow>();
  return row ? toJob(row) : null;
}

/**
 * A LEJÁRT kiemelt állások visszaállítása 'active'-ra (a 30 napos „Kiemelt Állás"
 * vége). Csak a NEM-null `featured_until`-lal rendelkező, lejárt sorokat érinti
 * (a régi, lejárat nélküli kiemeléseket nem). Napi cronból hívva. Visszaadja a
 * leváltott sorok számát.
 */
export async function unfeatureExpiredJobs(): Promise<number> {
  const res = await getDB()
    .prepare(
      "UPDATE jobs SET status = 'active', featured_until = NULL, updated_at = datetime('now') " +
      "WHERE status = 'featured' AND featured_until IS NOT NULL AND featured_until < datetime('now')",
    )
    .run();
  return res.meta?.changes ?? 0;
}

/**
 * A LEJÁRT hirdetések lezárása (`JOB_LISTING_DAYS` nap a feladás/utolsó
 * megújítás óta). A `status='expired'` sor mostantól kiesik a publikus
 * listából (lásd getJobs default szűrője), de NEM törlődik — a munkáltató a
 * dashboardján egy kattintással megújíthatja (renewJob), tartalom-szerkesztés
 * nélkül. Napi cronból hívva, `unfeatureExpiredJobs` UTÁN (hogy egy frissen
 * lejárt kiemelés ne kerülje el ugyanebben a körben az expirálást).
 */
export async function expireOldJobs(): Promise<number> {
  const res = await getDB()
    .prepare(
      "UPDATE jobs SET status = 'expired', updated_at = datetime('now') " +
      "WHERE status IN ('active', 'featured') AND expires_at IS NOT NULL AND expires_at < datetime('now')",
    )
    .run();
  return res.meta?.changes ?? 0;
}

/**
 * Lejárt hirdetés ingyenes megújítása — a munkáltató saját tartalma
 * változatlan marad (nincs újra-moderáció, hisz semmi nem módosult), csak a
 * láthatóság és a lejárat éled újra. Csak 'expired' státuszból engedett (egy
 * még élő hirdetésen a gomb nem is jelenik meg, lásd JobCardActions).
 */
export async function renewJob(id: string, employerId: string): Promise<boolean> {
  const res = await getDB()
    .prepare(
      "UPDATE jobs SET status = 'active', expires_at = ?, updated_at = datetime('now') " +
      "WHERE id = ? AND employer_id = ? AND status = 'expired'",
    )
    .bind(jobExpiryIso(), id, employerId)
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

export async function createJob(job: Omit<Job, "createdAt" | "updatedAt">): Promise<void> {
  await getDB().prepare(
    `INSERT INTO jobs (id, employer_id, title, description, location, canton_code, country_code, category, legal_attested, employment_type, salary_min, salary_max, currency, requirements, status, moderation_status, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(job.id, job.employerId, job.title, job.description, job.location, job.cantonCode, job.country ?? "CH", job.category, job.legalAttested ? 1 : 0, job.employmentType, job.salaryMin, job.salaryMax, job.currency, job.requirements, job.status, job.moderationStatus, job.expiresAt).run();
}

export interface UpdateJobInput {
  title: string;
  description: string;
  location: string;
  cantonCode: string | null;
  category: string | null;
  legalAttested: boolean;
  employmentType: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  requirements: string | null;
}

/**
 * Saját hirdetés szerkesztése. A moderation_status visszaáll 0-ra (pending):
 * a szerkesztett tartalom újra admin-jóváhagyásra vár (visszaélés-védelem).
 * @returns true, ha a hirdetés a munkáltatóé volt és frissült.
 */
export async function updateJob(id: string, employerId: string, fields: UpdateJobInput): Promise<boolean> {
  const res = await getDB()
    .prepare(
      `UPDATE jobs SET title = ?, description = ?, location = ?, canton_code = ?, category = ?,
         legal_attested = ?, employment_type = ?, salary_min = ?, salary_max = ?, currency = ?, requirements = ?,
         moderation_status = 0, updated_at = datetime('now')
       WHERE id = ? AND employer_id = ?`,
    )
    .bind(
      fields.title, fields.description, fields.location, fields.cantonCode, fields.category,
      fields.legalAttested ? 1 : 0, fields.employmentType, fields.salaryMin, fields.salaryMax, fields.currency, fields.requirements,
      id, employerId,
    )
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

/** Saját hirdetés törlése. A FK ON DELETE CASCADE törli a hozzá tartozó jelentkezéseket is. */
export async function deleteJob(id: string, employerId: string): Promise<boolean> {
  const res = await getDB()
    .prepare("DELETE FROM jobs WHERE id = ? AND employer_id = ?")
    .bind(id, employerId)
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

// --- CV → állás illesztés (Job Matching) -------------------------------------

/** Egy illesztett Kinti-hirdetés lean, publikus szelete (cégnévvel, kontakt nélkül). */
export interface JobMatch {
  id: string;
  title: string;
  location: string;
  companyName: string | null;
  featured: boolean;
}

/**
 * Aktív, moderált Kinti-hirdetések egy szakma-kategóriára + országra — a CV-készítő
 * „hozzád illő állások" ajánlójához. A fizetett kiemelés itt is érvényesül
 * (featured elöl), utána a legfrissebb. A kategória-id a job-categories.ts kulcsa,
 * ugyanaz, amire a CV-varázsló szakma-választója is épül.
 */
export async function getMatchingJobs(country: string, category: string, limit = 5): Promise<JobMatch[]> {
  const { results } = await getDB()
    .prepare(
      `SELECT j.id, j.title, j.location, j.status, e.company_name
         FROM jobs j
         LEFT JOIN employers e ON e.id = j.employer_id
        WHERE j.moderation_status = 1 AND j.status IN ('active', 'featured')
          AND j.category = ? AND COALESCE(j.country_code, 'CH') = ?
        ORDER BY (j.status = 'featured') DESC, j.created_at DESC
        LIMIT ?`,
    )
    .bind(category, country, Math.min(Math.max(1, limit), 10))
    .all<{ id: string; title: string; location: string; status: string; company_name: string | null }>();
  return (results ?? []).map((r) => ({
    id: r.id, title: r.title, location: r.location,
    companyName: r.company_name, featured: r.status === "featured",
  }));
}

/** Bérsáv-illesztett hirdetés a bérkalkulátor tölcséréhez (fizetés-mezőkkel). */
export interface SalaryJobMatch extends JobMatch {
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
}

/**
 * Aktív, moderált Kinti-hirdetések a felhasználó BÉRSÁVJÁBAN (havi bruttó ±20%,
 * sáv-átfedéssel) — a bérkalkulátor → állások tölcsérhez. Csak a fizetést
 * FELTÜNTETŐ hirdetések játszanak; a kiemelt (fizetett) hirdetés itt is elöl —
 * ez a „szponzorált hely a kalkulátor végén" értéke.
 */
export async function getMatchingJobsBySalary(
  country: string,
  grossMonthly: number,
  limit = 3,
): Promise<SalaryJobMatch[]> {
  const lo = Math.round(grossMonthly * 0.8);
  const hi = Math.round(grossMonthly * 1.2);
  const { results } = await getDB()
    .prepare(
      `SELECT j.id, j.title, j.location, j.status, j.salary_min, j.salary_max, j.currency,
              e.company_name
         FROM jobs j
         LEFT JOIN employers e ON e.id = j.employer_id
        WHERE j.moderation_status = 1 AND j.status IN ('active', 'featured')
          AND COALESCE(j.country_code, 'CH') = ?
          AND (j.salary_min IS NOT NULL OR j.salary_max IS NOT NULL)
          AND COALESCE(j.salary_min, 0) <= ?
          AND COALESCE(j.salary_max, j.salary_min) >= ?
        ORDER BY (j.status = 'featured') DESC, j.created_at DESC
        LIMIT ?`,
    )
    .bind(country, hi, lo, Math.min(Math.max(1, limit), 10))
    .all<{
      id: string; title: string; location: string; status: string;
      salary_min: number | null; salary_max: number | null; currency: string;
      company_name: string | null;
    }>();
  return (results ?? []).map((r) => ({
    id: r.id, title: r.title, location: r.location,
    companyName: r.company_name, featured: r.status === "featured",
    salaryMin: r.salary_min, salaryMax: r.salary_max, currency: r.currency,
  }));
}

// --- Jelentkezések (job_applications) ---------------------------------------

export interface JobApplication {
  id: string;
  jobId: string;
  employerId: string;
  fullName: string;
  email: string;
  phone: string | null;
  message: string | null;
  cvKey: string | null;
  status: string;
  submittedAt: string;
}

interface JobApplicationRow {
  id: string; job_id: string; employer_id: string; full_name: string; email: string;
  phone: string | null; message: string | null; cv_key: string | null; status: string; submitted_at: string;
}

function toApplication(r: JobApplicationRow): JobApplication {
  return {
    id: r.id, jobId: r.job_id, employerId: r.employer_id, fullName: r.full_name,
    email: r.email, phone: r.phone, message: r.message, cvKey: r.cv_key ?? null,
    status: r.status, submittedAt: r.submitted_at,
  };
}

/** Egy pályázat lekérése id alapján (pl. a CV-letöltés jogosultság-ellenőrzéséhez). */
export async function getJobApplicationById(id: string): Promise<JobApplication | null> {
  const row = await getDB()
    .prepare("SELECT * FROM job_applications WHERE id = ? LIMIT 1")
    .bind(id)
    .first<JobApplicationRow>();
  return row ? toApplication(row) : null;
}

/** Egy munkáltató összes (vagy adott álláshoz tartozó) jelentkezője, legújabb elöl. */
export async function getJobApplications(employerId: string, jobId?: string): Promise<JobApplication[]> {
  const where = ["employer_id = ?"];
  const binds: unknown[] = [employerId];
  if (jobId) { where.push("job_id = ?"); binds.push(jobId); }
  const { results } = await getDB()
    .prepare(`SELECT * FROM job_applications WHERE ${where.join(" AND ")} ORDER BY submitted_at DESC`)
    .bind(...binds)
    .all<JobApplicationRow>();
  return results.map(toApplication);
}

/** jobId → jelentkező-szám térkép a munkáltató dashboardjához. */
export async function getApplicationCounts(employerId: string): Promise<Record<string, number>> {
  const { results } = await getDB()
    .prepare("SELECT job_id, COUNT(*) AS n FROM job_applications WHERE employer_id = ? GROUP BY job_id")
    .bind(employerId)
    .all<{ job_id: string; n: number }>();
  const map: Record<string, number> = {};
  for (const r of results) map[r.job_id] = r.n;
  return map;
}

/** A jelölt (email alapján) saját jelentkezései — a „Jelentkezéseim" nézethez. */
export interface CandidateApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string | null;
  location: string | null;
  status: string;
  submittedAt: string;
}

export async function getApplicationsByEmail(email: string): Promise<CandidateApplication[]> {
  const { results } = await getDB()
    .prepare(
      `SELECT a.id AS id, a.job_id AS job_id, a.status AS status, a.submitted_at AS submitted_at,
              j.title AS job_title, j.location AS location,
              e.company_name AS company_name
         FROM job_applications a
         JOIN jobs j ON j.id = a.job_id
         LEFT JOIN employers e ON e.id = a.employer_id
        WHERE lower(a.email) = lower(?)
        ORDER BY a.submitted_at DESC`,
    )
    .bind(email)
    .all<{ id: string; job_id: string; status: string; submitted_at: string; job_title: string; location: string | null; company_name: string | null }>();
  return results.map((r) => ({
    id: r.id, jobId: r.job_id, jobTitle: r.job_title, companyName: r.company_name,
    location: r.location, status: r.status, submittedAt: r.submitted_at,
  }));
}
