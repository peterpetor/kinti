/**
 * repo-b2b.ts — B2B Hub (Alvállalkozó & Projektkereső) adatréteg.
 *
 * Zárt, PRÉMIUM modul: a hozzáférést a Szaknévsor PRO (businesses.featured=1)
 * szabja meg — a bejelentkezett userhez tartozó cégnek AKTÍV kiemelése kell.
 * (Ez a CÉG-szintű PRO, amit a `business_pro_monthly` Paddle termék állít be —
 * NEM a user-szintű Kinti PRO / `subscriptions`.) Minden mutáció szerveroldalon
 * ELŐSZÖR a `getB2bAccess`-t hívja, így API-szinten sem lehet megkerülni.
 */
import { getDB } from "./cloudflare";
import { getBusinessByOwner } from "./repo-business";
import type { Business } from "./types";

export interface B2bProject {
  id: string;
  authorId: string;
  businessId: string;
  title: string;
  description: string;
  targetCountry: string;
  targetCity: string | null;
  categoryNeeded: string | null;
  contactPhone: string | null;
  status: string; // 'open' | 'closed'
  createdAt: number; // epoch ms
  // JOIN-olt cég-adatok: „melyik (ellenőrzött) PRO cég írta ki a munkát".
  businessName: string | null;
  businessFeatured: boolean;
  businessLogoKey: string | null;
  businessCategoryLabel: string | null;
}

interface B2bProjectRow {
  id: string;
  author_id: string;
  business_id: string;
  title: string;
  description: string;
  target_country: string;
  target_city: string | null;
  category_needed: string | null;
  contact_phone: string | null;
  status: string;
  created_at: number;
  business_name: string | null;
  business_featured: number;
  business_logo_key: string | null;
  business_category_label: string | null;
}

function toB2bProject(r: B2bProjectRow): B2bProject {
  return {
    id: r.id,
    authorId: r.author_id,
    businessId: r.business_id,
    title: r.title,
    description: r.description,
    targetCountry: r.target_country,
    targetCity: r.target_city,
    categoryNeeded: r.category_needed,
    contactPhone: r.contact_phone,
    status: r.status,
    createdAt: Number(r.created_at),
    businessName: r.business_name,
    businessFeatured: Number(r.business_featured) === 1,
    businessLogoKey: r.business_logo_key,
    businessCategoryLabel: r.business_category_label,
  };
}

/**
 * B2B-hozzáférés a bejelentkezett userre: a hozzá tartozó cég + PRO-e (featured)
 * + admin-jóváhagyott-e. Ezt hívja a page (paywall-döntés) ÉS minden API-mutáció
 * (szerver-gate). Az isApproved külön mező: a Paddle webhook moderációs státusztól
 * függetlenül ad featured=1-et, de a zárt feedbe POSZTOLNI csak jóváhagyott
 * (moderation_status=1) cég tud — különben a friss, még nem ellenőrzött regisztráció
 * fizetéssel azonnal moderálatlan tartalmat tolhatna a többi PRO tag elé.
 */
export interface B2bAccess {
  business: Business | null;
  isPro: boolean;
  isApproved: boolean;
}

export async function getB2bAccess(userId: string): Promise<B2bAccess> {
  const business = await getBusinessByOwner(userId);
  return {
    business,
    isPro: Boolean(business?.featured),
    isApproved: business ? (business.moderationStatus ?? 1) === 1 : false,
  };
}

/**
 * Kliensnek szánt projekt-alak: az authorId-t NEM tartalmazza (a Clerk user-id
 * ne szivárogjon minden B2B tag böngészőjébe) — helyette a szerveren számított
 * `isMine` mondja meg, lezárhatja-e a néző.
 */
export interface B2bProjectView extends Omit<B2bProject, "authorId"> {
  isMine: boolean;
}

export function toB2bProjectView(p: B2bProject, viewerId: string): B2bProjectView {
  const { authorId, ...rest } = p;
  return { ...rest, isMine: authorId === viewerId };
}

export interface CreateB2bProjectInput {
  authorId: string;
  businessId: string;
  title: string;
  description: string;
  targetCountry: string;
  targetCity?: string | null;
  categoryNeeded?: string | null;
  contactPhone?: string | null;
}

export async function createB2bProject(input: CreateB2bProjectInput): Promise<string> {
  const id = crypto.randomUUID();
  await getDB()
    .prepare(
      `INSERT INTO b2b_projects
         (id, author_id, business_id, title, description, target_country,
          target_city, category_needed, contact_phone, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?)`,
    )
    .bind(
      id, input.authorId, input.businessId, input.title, input.description,
      input.targetCountry, input.targetCity ?? null, input.categoryNeeded ?? null,
      input.contactPhone ?? null, Date.now(),
    )
    .run();
  return id;
}

export interface B2bProjectFilters {
  country?: string; // "all" vagy CH/AT/DE/NL
  category?: string; // "all" vagy categories(id)
  limit?: number;
}

/**
 * Nyitott projektek, legfrissebb elöl. JOIN a businesses-re: a kiíró (ellenőrzött)
 * cég nevét/logóját/kiemelt-státuszát is visszaadja a trust badge-hez. A kódbázis
 * konvenciója szerint (repo-business) a rejtett (hidden=1) vagy nem-jóváhagyott
 * cég posztjai NEM jelennek meg — így az admin cég-elrejtése a B2B posztjait is
 * azonnal eltünteti.
 */
export async function getB2bProjects(filters: B2bProjectFilters = {}): Promise<B2bProject[]> {
  const where: string[] = [
    "p.status = 'open'",
    "COALESCE(b.hidden, 0) = 0",
    "b.moderation_status = 1",
  ];
  const binds: unknown[] = [];
  if (filters.country && filters.country !== "all") {
    where.push("p.target_country = ?");
    binds.push(filters.country);
  }
  if (filters.category && filters.category !== "all") {
    where.push("p.category_needed = ?");
    binds.push(filters.category);
  }
  const limit = Math.min(Math.max(filters.limit ?? 100, 1), 200);
  const { results } = await getDB()
    .prepare(
      `SELECT p.id, p.author_id, p.business_id, p.title, p.description,
              p.target_country, p.target_city, p.category_needed, p.contact_phone,
              p.status, p.created_at,
              b.name AS business_name,
              COALESCE(b.featured, 0) AS business_featured,
              b.logo_key AS business_logo_key,
              b.category_label AS business_category_label
       FROM b2b_projects p
       JOIN businesses b ON b.id = p.business_id
       WHERE ${where.join(" AND ")}
       ORDER BY p.created_at DESC
       LIMIT ?`,
    )
    .bind(...binds, limit)
    .all<B2bProjectRow>();
  return results.map(toB2bProject);
}

/** Lezárás — CSAK a szerző (author_id egyezés a WHERE-ben). */
export async function closeB2bProject(projectId: string, authorId: string): Promise<boolean> {
  const res = await getDB()
    .prepare("UPDATE b2b_projects SET status = 'closed' WHERE id = ? AND author_id = ? AND status = 'open'")
    .bind(projectId, authorId)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

/** Nyitott projektek száma (marketing-teaser; opcionális ország-szűrővel).
 *  Ugyanazokkal a cég-szűrőkkel, mint a feed — a teaser ne ígérjen olyan
 *  projektet, amit a feed már nem mutat. */
export async function countOpenB2bProjects(country?: string): Promise<number> {
  const where: string[] = [
    "p.status = 'open'",
    "COALESCE(b.hidden, 0) = 0",
    "b.moderation_status = 1",
  ];
  const binds: unknown[] = [];
  if (country && country !== "all") {
    where.push("p.target_country = ?");
    binds.push(country);
  }
  const row = await getDB()
    .prepare(
      `SELECT COUNT(*) AS n FROM b2b_projects p
       JOIN businesses b ON b.id = p.business_id
       WHERE ${where.join(" AND ")}`,
    )
    .bind(...binds)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

/**
 * Admin-lista: MINDEN projekt (nyitott+lezárt, rejtett/függő cégé is — pont a
 * problémásakat kell látnia), legfrissebb elöl. LEFT JOIN: a cég törlése után
 * árván maradt posztok is látszanak (és törölhetők).
 */
export async function listB2bProjectsForAdmin(limit = 50): Promise<B2bProject[]> {
  const { results } = await getDB()
    .prepare(
      `SELECT p.id, p.author_id, p.business_id, p.title, p.description,
              p.target_country, p.target_city, p.category_needed, p.contact_phone,
              p.status, p.created_at,
              b.name AS business_name,
              COALESCE(b.featured, 0) AS business_featured,
              b.logo_key AS business_logo_key,
              b.category_label AS business_category_label
       FROM b2b_projects p
       LEFT JOIN businesses b ON b.id = p.business_id
       ORDER BY p.created_at DESC
       LIMIT ?`,
    )
    .bind(Math.min(Math.max(limit, 1), 200))
    .all<B2bProjectRow>();
  return results.map(toB2bProject);
}

/** Admin-törlés (moderáció): bármely projekt végleges eltávolítása. */
export async function deleteB2bProjectAsAdmin(projectId: string): Promise<boolean> {
  const res = await getDB()
    .prepare("DELETE FROM b2b_projects WHERE id = ?")
    .bind(projectId)
    .run();
  return (res.meta.changes ?? 0) > 0;
}
