/**
 * repo-recruiting.ts — Feedback Jobs közvetítői jelölt-CRM (admin-only).
 * A recruiter által felvitt jelöltek + placement-pipeline (0086 migráció).
 */
import { getDB } from "./cloudflare";

export type RecruitingStatus = "new" | "contacted" | "placed" | "paid" | "dropped";

export interface RecruitingCandidate {
  id: string;
  fullName: string;
  country: string;
  keyword: string | null;
  cvKey: string | null;
  status: RecruitingStatus;
  notes: string | null;
  feeEur: number | null;
  createdAt: string;
  updatedAt: string;
}

interface Row {
  id: string; full_name: string; country: string; keyword: string | null;
  cv_key: string | null; status: string; notes: string | null; fee_eur: number | null;
  created_at: string; updated_at: string;
}

function toCandidate(r: Row): RecruitingCandidate {
  return {
    id: r.id, fullName: r.full_name, country: r.country, keyword: r.keyword,
    cvKey: r.cv_key, status: (r.status as RecruitingStatus) ?? "new", notes: r.notes,
    feeEur: r.fee_eur ?? null, createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

export interface RecruitingStats {
  total: number;        // aktív (nem elejtett) jelöltek
  placed: number;       // elhelyezve + kifizetve
  paid: number;         // kifizetve
  revenueTotal: number; // összes bejött jutalék (kifizetve)
  revenueMonth: number; // ebből e hónapban
  conversionPct: number; // elhelyezve / aktív
}

export async function getRecruitingStats(): Promise<RecruitingStats> {
  const row = await getDB().prepare(
    `SELECT
       SUM(CASE WHEN status != 'dropped' THEN 1 ELSE 0 END) AS total,
       SUM(CASE WHEN status IN ('placed','paid') THEN 1 ELSE 0 END) AS placed,
       SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid,
       SUM(CASE WHEN status = 'paid' THEN COALESCE(fee_eur,0) ELSE 0 END) AS revenue_total,
       SUM(CASE WHEN status = 'paid' AND updated_at >= strftime('%Y-%m-01 00:00:00','now') THEN COALESCE(fee_eur,0) ELSE 0 END) AS revenue_month
     FROM recruiting_candidates`,
  ).first<{ total: number | null; placed: number | null; paid: number | null; revenue_total: number | null; revenue_month: number | null }>();
  const total = row?.total ?? 0;
  const placed = row?.placed ?? 0;
  return {
    total,
    placed,
    paid: row?.paid ?? 0,
    revenueTotal: row?.revenue_total ?? 0,
    revenueMonth: row?.revenue_month ?? 0,
    conversionPct: total > 0 ? Math.round((placed / total) * 100) : 0,
  };
}

export interface CandidateFilter {
  q?: string;
  status?: RecruitingStatus | null;
  country?: string | null;
}

/** Dinamikus WHERE a szűrőkből (név/szakma keresés + státusz + ország). */
function candidateWhere(f: CandidateFilter): { clause: string; binds: unknown[] } {
  const cond: string[] = [];
  const binds: unknown[] = [];
  if (f.status) { cond.push("status = ?"); binds.push(f.status); }
  if (f.country) { cond.push("country = ?"); binds.push(f.country); }
  const q = (f.q ?? "").trim();
  if (q) { const like = `%${q}%`; cond.push("(full_name LIKE ? OR keyword LIKE ?)"); binds.push(like, like); }
  return { clause: cond.length ? `WHERE ${cond.join(" AND ")}` : "", binds };
}

/** Szűrt + LAPOZOTT jelölt-lista (szerveroldali keresés — több ezernél is gyors). */
export async function listRecruitingCandidates(
  opts: CandidateFilter & { limit?: number; offset?: number } = {},
): Promise<RecruitingCandidate[]> {
  const { clause, binds } = candidateWhere(opts);
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 100);
  const offset = Math.max(opts.offset ?? 0, 0);
  const { results } = await getDB()
    .prepare(`SELECT * FROM recruiting_candidates ${clause} ORDER BY updated_at DESC LIMIT ? OFFSET ?`)
    .bind(...binds, limit, offset)
    .all<Row>();
  return results.map(toCandidate);
}

export async function countRecruitingCandidates(f: CandidateFilter = {}): Promise<number> {
  const { clause, binds } = candidateWhere(f);
  const row = await getDB().prepare(`SELECT COUNT(*) AS n FROM recruiting_candidates ${clause}`).bind(...binds).first<{ n: number }>();
  return row?.n ?? 0;
}

/** Státusz-bontás a funnel-áttekintőhöz. */
export async function getRecruitingStatusCounts(): Promise<Record<RecruitingStatus, number>> {
  const { results } = await getDB().prepare("SELECT status, COUNT(*) AS n FROM recruiting_candidates GROUP BY status").all<{ status: string; n: number }>();
  const out: Record<RecruitingStatus, number> = { new: 0, contacted: 0, placed: 0, paid: 0, dropped: 0 };
  for (const r of results) if (r.status in out) out[r.status as RecruitingStatus] = r.n;
  return out;
}

/** Top szakmák (keyword) darabszámmal — a szakma-csoportosító chipekhez. */
export async function getRecruitingProfessions(limit = 12): Promise<{ keyword: string; count: number }[]> {
  const { results } = await getDB()
    .prepare("SELECT keyword, COUNT(*) AS n FROM recruiting_candidates WHERE keyword IS NOT NULL AND keyword != '' GROUP BY keyword ORDER BY n DESC LIMIT ?")
    .bind(Math.min(limit, 30))
    .all<{ keyword: string; n: number }>();
  return results.map((r) => ({ keyword: r.keyword, count: r.n }));
}

export async function getRecruitingCandidate(id: string): Promise<RecruitingCandidate | null> {
  const row = await getDB().prepare("SELECT * FROM recruiting_candidates WHERE id = ? LIMIT 1").bind(id).first<Row>();
  return row ? toCandidate(row) : null;
}

export interface CreateRecruitingInput {
  fullName: string; country: string; keyword: string | null; cvKey: string | null;
}

export async function createRecruitingCandidate(input: CreateRecruitingInput): Promise<string> {
  const id = crypto.randomUUID();
  await getDB()
    .prepare("INSERT INTO recruiting_candidates (id, full_name, country, keyword, cv_key) VALUES (?, ?, ?, ?, ?)")
    .bind(id, input.fullName, input.country, input.keyword, input.cvKey)
    .run();
  return id;
}

export async function updateRecruitingCandidate(
  id: string,
  fields: { status?: RecruitingStatus; notes?: string | null; keyword?: string | null; feeEur?: number | null },
): Promise<boolean> {
  const sets: string[] = [];
  const binds: unknown[] = [];
  if (fields.status !== undefined) { sets.push("status = ?"); binds.push(fields.status); }
  if (fields.notes !== undefined) { sets.push("notes = ?"); binds.push(fields.notes); }
  if (fields.keyword !== undefined) { sets.push("keyword = ?"); binds.push(fields.keyword); }
  if (fields.feeEur !== undefined) { sets.push("fee_eur = ?"); binds.push(fields.feeEur); }
  if (!sets.length) return false;
  sets.push("updated_at = datetime('now')");
  binds.push(id);
  const res = await getDB().prepare(`UPDATE recruiting_candidates SET ${sets.join(", ")} WHERE id = ?`).bind(...binds).run();
  return (res.meta.changes ?? 0) > 0;
}

export async function deleteRecruitingCandidate(id: string): Promise<boolean> {
  const res = await getDB().prepare("DELETE FROM recruiting_candidates WHERE id = ?").bind(id).run();
  return (res.meta.changes ?? 0) > 0;
}

// --- Shortlist (jelölt ↔ állás, 0087) ---------------------------------------

export type ShortlistStatus = "saved" | "contacted";

export interface ShortlistJob {
  id: string;
  candidateId: string;
  jobTitle: string;
  jobCompany: string | null;
  jobLocation: string | null;
  jobUrl: string;
  matchScore: number | null;
  status: ShortlistStatus;
  employerEmail: string | null;
  createdAt: string;
}

interface ShortlistRow {
  id: string; candidate_id: string; job_title: string; job_company: string | null;
  job_location: string | null; job_url: string; match_score: number | null;
  status: string; employer_email: string | null; created_at: string;
}

function toShortlist(r: ShortlistRow): ShortlistJob {
  return {
    id: r.id, candidateId: r.candidate_id, jobTitle: r.job_title, jobCompany: r.job_company,
    jobLocation: r.job_location, jobUrl: r.job_url, matchScore: r.match_score,
    status: (r.status as ShortlistStatus) ?? "saved", employerEmail: r.employer_email ?? null,
    createdAt: r.created_at,
  };
}

export async function listAllShortlist(limit = 1000): Promise<ShortlistJob[]> {
  const { results } = await getDB()
    .prepare("SELECT * FROM recruiting_shortlist ORDER BY created_at DESC LIMIT ?")
    .bind(limit).all<ShortlistRow>();
  return results.map(toShortlist);
}

export interface AddShortlistInput {
  candidateId: string; jobTitle: string; jobCompany: string | null;
  jobLocation: string | null; jobUrl: string; matchScore: number | null;
}

export async function addShortlistJob(input: AddShortlistInput): Promise<string> {
  // Ne duplikáljunk: ugyanaz a jelölt + URL → frissítjük a pontot.
  const existing = await getDB()
    .prepare("SELECT id FROM recruiting_shortlist WHERE candidate_id = ? AND job_url = ? LIMIT 1")
    .bind(input.candidateId, input.jobUrl).first<{ id: string }>();
  if (existing) {
    if (input.matchScore != null) {
      await getDB().prepare("UPDATE recruiting_shortlist SET match_score = ? WHERE id = ?").bind(input.matchScore, existing.id).run();
    }
    return existing.id;
  }
  const id = crypto.randomUUID();
  await getDB()
    .prepare("INSERT INTO recruiting_shortlist (id, candidate_id, job_title, job_company, job_location, job_url, match_score) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(id, input.candidateId, input.jobTitle, input.jobCompany, input.jobLocation, input.jobUrl, input.matchScore)
    .run();
  return id;
}

export async function updateShortlistStatus(id: string, status: ShortlistStatus): Promise<boolean> {
  const res = await getDB().prepare("UPDATE recruiting_shortlist SET status = ? WHERE id = ?").bind(status, id).run();
  return (res.meta.changes ?? 0) > 0;
}

export async function updateShortlistEmail(id: string, email: string | null): Promise<boolean> {
  const res = await getDB().prepare("UPDATE recruiting_shortlist SET employer_email = ? WHERE id = ?").bind(email, id).run();
  return (res.meta.changes ?? 0) > 0;
}

/** Több jelölt shortlistje egyszerre (a látható oldalhoz — nem az ÖSSZES). */
export async function listShortlistByCandidates(ids: string[]): Promise<ShortlistJob[]> {
  if (!ids.length) return [];
  const capped = ids.slice(0, 100);
  const ph = capped.map(() => "?").join(",");
  const { results } = await getDB()
    .prepare(`SELECT * FROM recruiting_shortlist WHERE candidate_id IN (${ph}) ORDER BY created_at DESC`)
    .bind(...capped).all<ShortlistRow>();
  return results.map(toShortlist);
}

/** Egy jelölt shortlistje (a körlevél-kiküldéshez, szerveroldalon). */
export async function listShortlistByCandidate(candidateId: string): Promise<ShortlistJob[]> {
  const { results } = await getDB()
    .prepare("SELECT * FROM recruiting_shortlist WHERE candidate_id = ? ORDER BY created_at DESC")
    .bind(candidateId).all<ShortlistRow>();
  return results.map(toShortlist);
}

/** Több shortlist-tétel státuszának beállítása egyszerre (körlevél után → contacted). */
export async function markShortlistContacted(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const db = getDB();
  await db.batch(ids.map((id) => db.prepare("UPDATE recruiting_shortlist SET status = 'contacted' WHERE id = ?").bind(id)));
}

export async function removeShortlistJob(id: string): Promise<boolean> {
  const res = await getDB().prepare("DELETE FROM recruiting_shortlist WHERE id = ?").bind(id).run();
  return (res.meta.changes ?? 0) > 0;
}

/** A jelölt összes shortlist-tételének törlése (jelölt-törléskor, kaszkád). */
export async function removeShortlistByCandidate(candidateId: string): Promise<void> {
  await getDB().prepare("DELETE FROM recruiting_shortlist WHERE candidate_id = ?").bind(candidateId).run();
}
