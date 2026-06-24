/**
 * repo-workers.ts — Munkavállalói profilok (worker_profiles) adatrétege.
 * A profil a Clerk `user_id`-hez kötött (1 user = 1 profil, UNIQUE).
 */
import { getDB } from "./cloudflare";
import { bool } from "./repo-shared";
import type { WorkerProfile } from "./types";

interface WorkerProfileRow {
  id: string; user_id: string; full_name: string; email: string; phone: string | null;
  cv_key: string | null; canton_code: string | null; category: string | null;
  ai_moderation_status: number; searchable: number;
  layer3_opt_in: number; expected_salary_min: number | null;
  created_at: string; updated_at: string;
}

function toWorkerProfile(r: WorkerProfileRow): WorkerProfile {
  return {
    id: r.id, userId: r.user_id, fullName: r.full_name, email: r.email, phone: r.phone,
    cvKey: r.cv_key, cantonCode: r.canton_code ?? null, category: r.category ?? null,
    aiModerationStatus: r.ai_moderation_status, searchable: bool(r.searchable),
    layer3OptIn: bool(r.layer3_opt_in), expectedSalaryMin: r.expected_salary_min,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

export async function getWorkerProfileByUser(userId: string): Promise<WorkerProfile | null> {
  const row = await getDB()
    .prepare("SELECT * FROM worker_profiles WHERE user_id = ? LIMIT 1")
    .bind(userId)
    .first<WorkerProfileRow>();
  return row ? toWorkerProfile(row) : null;
}

export async function getWorkerProfileById(id: string): Promise<WorkerProfile | null> {
  const row = await getDB()
    .prepare("SELECT * FROM worker_profiles WHERE id = ? LIMIT 1")
    .bind(id)
    .first<WorkerProfileRow>();
  return row ? toWorkerProfile(row) : null;
}

export interface SearchableWorkerFilter {
  canton?: string | null;
  category?: string | null;
  limit?: number;
}

/** A kereshetőre (searchable) állított munkavállalói profilok, legfrissebb elöl. */
export async function getSearchableWorkers(opts: SearchableWorkerFilter = {}): Promise<WorkerProfile[]> {
  const where = ["searchable = 1"];
  const binds: unknown[] = [];
  if (opts.canton) { where.push("canton_code = ?"); binds.push(opts.canton); }
  if (opts.category) { where.push("category = ?"); binds.push(opts.category); }
  binds.push(opts.limit ?? 100);
  const { results } = await getDB()
    .prepare(`SELECT * FROM worker_profiles WHERE ${where.join(" AND ")} ORDER BY updated_at DESC LIMIT ?`)
    .bind(...binds)
    .all<WorkerProfileRow>();
  return results.map(toWorkerProfile);
}

/**
 * Aktív közvetítést kérő jelöltek (layer3_opt_in = 1) — a Feedback Jobs admin
 * konzoljához. Ezek a jelöltek KIFEJEZETTEN hozzájárultak, hogy aktívan állást
 * keressenek nekik és a CV-jüket átadják (külön a board-láthatóságtól).
 */
export async function getPlacementCandidates(limit = 500): Promise<WorkerProfile[]> {
  const { results } = await getDB()
    .prepare("SELECT * FROM worker_profiles WHERE layer3_opt_in = 1 ORDER BY updated_at DESC LIMIT ?")
    .bind(limit)
    .all<WorkerProfileRow>();
  return results.map(toWorkerProfile);
}

export interface UpsertWorkerProfileInput {
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  cvKey: string | null;
  cantonCode: string | null;
  category: string | null;
  searchable: boolean;
  layer3OptIn: boolean;
  expectedSalaryMin: number | null;
}

/**
 * Profil létrehozása vagy frissítése a Clerk user_id-re (UNIQUE). A cv_key-t
 * csak akkor írjuk felül, ha a hívó adott újat — `null` esetén a meglévő marad
 * (a felhasználó nem mindig tölt fel új CV-t szerkesztéskor).
 */
export async function upsertWorkerProfile(input: UpsertWorkerProfileInput): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO worker_profiles
         (id, user_id, full_name, email, phone, cv_key, canton_code, category, searchable, layer3_opt_in, expected_salary_min, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(user_id) DO UPDATE SET
         full_name = excluded.full_name,
         email = excluded.email,
         phone = excluded.phone,
         cv_key = COALESCE(excluded.cv_key, worker_profiles.cv_key),
         canton_code = excluded.canton_code,
         category = excluded.category,
         searchable = excluded.searchable,
         layer3_opt_in = excluded.layer3_opt_in,
         expected_salary_min = excluded.expected_salary_min,
         updated_at = datetime('now')`,
    )
    .bind(
      crypto.randomUUID(), input.userId, input.fullName, input.email, input.phone,
      input.cvKey, input.cantonCode, input.category, input.searchable ? 1 : 0,
      input.layer3OptIn ? 1 : 0, input.expectedSalaryMin,
    )
    .run();
}
