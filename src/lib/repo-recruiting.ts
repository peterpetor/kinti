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
  createdAt: string;
  updatedAt: string;
}

interface Row {
  id: string; full_name: string; country: string; keyword: string | null;
  cv_key: string | null; status: string; notes: string | null;
  created_at: string; updated_at: string;
}

function toCandidate(r: Row): RecruitingCandidate {
  return {
    id: r.id, fullName: r.full_name, country: r.country, keyword: r.keyword,
    cvKey: r.cv_key, status: (r.status as RecruitingStatus) ?? "new", notes: r.notes,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

export async function listRecruitingCandidates(limit = 500): Promise<RecruitingCandidate[]> {
  const { results } = await getDB()
    .prepare("SELECT * FROM recruiting_candidates ORDER BY updated_at DESC LIMIT ?")
    .bind(limit)
    .all<Row>();
  return results.map(toCandidate);
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
  fields: { status?: RecruitingStatus; notes?: string | null },
): Promise<boolean> {
  const sets: string[] = [];
  const binds: unknown[] = [];
  if (fields.status !== undefined) { sets.push("status = ?"); binds.push(fields.status); }
  if (fields.notes !== undefined) { sets.push("notes = ?"); binds.push(fields.notes); }
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
