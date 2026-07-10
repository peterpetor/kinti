/**
 * repo-cv.ts — a Német Önéletrajz Készítő OPCIONÁLIS profil-mentése (D1).
 *
 * Csak akkor ír, ha a felhasználó kifejezetten hozzájárult (opt-in). A PDF a
 * böngészőben készül, ez a réteg kizárólag a (hozzájárulás-alapú) közvetítési
 * profil rögzítéséért felel.
 */
import { getDB } from "./cloudflare";

export interface CreateCvSubmissionInput {
  fullName: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  category: string | null;
  professionDe: string | null;
  yearsExperience: number | null;
  summary: string | null;
  payload: string; // teljes CV JSON
  manageToken: string;
}

export async function createCvSubmission(input: CreateCvSubmissionInput): Promise<string> {
  const id = crypto.randomUUID();
  await getDB()
    .prepare(
      `INSERT INTO cv_submissions
         (id, full_name, email, phone, city, category, profession_de,
          years_experience, summary, payload, placement_opt_in, manage_token)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
    )
    .bind(
      id, input.fullName, input.email, input.phone, input.city, input.category,
      input.professionDe, input.yearsExperience, input.summary, input.payload,
      input.manageToken,
    )
    .run();
  return id;
}

export interface CvSubmissionRow {
  id: string;
  createdAt: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  category: string | null;
  professionDe: string | null;
  yearsExperience: number | null;
}

/** Admin-lista: a hozzájárult jelölt-profilok (kontakt + szakma), legfrissebb elöl. */
export async function listCvSubmissionsForAdmin(limit = 50): Promise<CvSubmissionRow[]> {
  const { results } = await getDB()
    .prepare(
      `SELECT id, created_at, full_name, email, phone, city, category,
              profession_de, years_experience
       FROM cv_submissions
       ORDER BY created_at DESC
       LIMIT ?`,
    )
    .bind(Math.min(Math.max(limit, 1), 200))
    .all<{
      id: string; created_at: string; full_name: string; email: string | null;
      phone: string | null; city: string | null; category: string | null;
      profession_de: string | null; years_experience: number | null;
    }>();
  return results.map((r) => ({
    id: r.id,
    createdAt: r.created_at,
    fullName: r.full_name,
    email: r.email,
    phone: r.phone,
    city: r.city,
    category: r.category,
    professionDe: r.profession_de,
    yearsExperience: r.years_experience,
  }));
}

/** Admin-törlés (GDPR törlési kérés). */
export async function deleteCvSubmissionAsAdmin(id: string): Promise<boolean> {
  const res = await getDB().prepare("DELETE FROM cv_submissions WHERE id = ?").bind(id).run();
  return (res.meta.changes ?? 0) > 0;
}
