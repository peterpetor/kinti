/**
 * repo-jobs.ts — Munkáltatók és álláshirdetések (Job Board) adatrétege.
 */
import { getDB } from "./cloudflare";
import type { Employer, Job } from "./types";

interface EmployerRow {
  id: string; owner_user_id: string; company_name: string; logo_key: string | null;
  description: string | null; website: string | null; contact_email: string;
  billing_email: string | null; subscription_tier: string; stripe_customer_id: string | null;
  moderation_status: number; created_at: string; updated_at: string;
}

function toEmployer(r: EmployerRow): Employer {
  return {
    id: r.id, ownerUserId: r.owner_user_id, companyName: r.company_name, logoKey: r.logo_key,
    description: r.description, website: r.website, contactEmail: r.contact_email,
    billingEmail: r.billing_email, subscriptionTier: r.subscription_tier as any,
    stripeCustomerId: r.stripe_customer_id, moderationStatus: r.moderation_status,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

interface JobRow {
  id: string; employer_id: string; title: string; description: string; location: string;
  canton_code: string | null; category: string | null;
  employment_type: string; salary_min: number | null; salary_max: number | null;
  currency: string; requirements: string | null; status: string; moderation_status: number;
  created_at: string; updated_at: string; expires_at: string | null;
}

function toJob(r: JobRow): Job {
  return {
    id: r.id, employerId: r.employer_id, title: r.title, description: r.description,
    location: r.location, cantonCode: r.canton_code ?? null, category: r.category ?? null,
    employmentType: r.employment_type as any, salaryMin: r.salary_min,
    salaryMax: r.salary_max, currency: r.currency, requirements: r.requirements,
    status: r.status as any, moderationStatus: r.moderation_status,
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
    `INSERT INTO employers (id, owner_user_id, company_name, logo_key, description, website, contact_email, billing_email, subscription_tier, stripe_customer_id, moderation_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(employer.id, employer.ownerUserId, employer.companyName, employer.logoKey, employer.description, employer.website, employer.contactEmail, employer.billingEmail, employer.subscriptionTier, employer.stripeCustomerId, employer.moderationStatus).run();
}

export async function getJobs(opts: { status?: string; employerId?: string; includeAllStatuses?: boolean } = {}): Promise<Job[]> {
  const where: string[] = [];
  const binds: unknown[] = [];
  if (!opts.includeAllStatuses) { where.push("moderation_status = 1"); }
  if (opts.status) { where.push("status = ?"); binds.push(opts.status); }
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

export async function createJob(job: Omit<Job, "createdAt" | "updatedAt">): Promise<void> {
  await getDB().prepare(
    `INSERT INTO jobs (id, employer_id, title, description, location, canton_code, category, employment_type, salary_min, salary_max, currency, requirements, status, moderation_status, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(job.id, job.employerId, job.title, job.description, job.location, job.cantonCode, job.category, job.employmentType, job.salaryMin, job.salaryMax, job.currency, job.requirements, job.status, job.moderationStatus, job.expiresAt).run();
}
