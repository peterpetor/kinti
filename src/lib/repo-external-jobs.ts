/**
 * repo-external-jobs.ts — API-ból aggregált álláshirdetések (external_jobs) adatréteg.
 * A jogtiszta aggregátor-API-k (Adzuna/Jooble/Arbeitnow) találatainak gyorsítótára;
 * a publikus listázás KIFELÉ, a `source_url`-re mutató linkkel történik. Lásd 0096.
 */
import { getDB } from "./cloudflare";

export interface ExternalJob {
  id: string;
  source: string;
  sourceUrl: string;
  title: string;
  company: string | null;
  location: string | null;
  country: string;
  /** Régió-kód (AT Bundesland / DE Land / NL provincia / CH kanton) vagy null. */
  cantonCode: string | null;
  category: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  postedAt: string | null;
  fetchedAt: string;
}

interface Row {
  id: string; source: string; source_url: string; title: string; company: string | null;
  location: string | null; country_code: string; canton_code: string | null; category: string | null;
  salary_min: number | null; salary_max: number | null; currency: string | null;
  posted_at: string | null; fetched_at: string;
}

function toJob(r: Row): ExternalJob {
  return {
    id: r.id, source: r.source, sourceUrl: r.source_url, title: r.title, company: r.company,
    location: r.location, country: r.country_code, cantonCode: r.canton_code ?? null, category: r.category,
    salaryMin: r.salary_min, salaryMax: r.salary_max, currency: r.currency,
    postedAt: r.posted_at, fetchedAt: r.fetched_at,
  };
}

export interface ExternalJobInput {
  source: string;
  sourceUrl: string;
  title: string;
  company: string | null;
  location: string | null;
  country: string;
  /** Feloldott régió-kód (lib/region-resolve) vagy null. */
  cantonCode: string | null;
  category: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  postedAt: string | null;
}

/**
 * Beszúrás/frissítés source_url alapján (idempotens). Ütközéskor frissül a
 * `fetched_at` (és a változó mezők) — így a friss feedek megújítják a sort, a
 * `purgeStaleExternalJobs` pedig a régóta nem látottakat takarítja.
 */
export async function upsertExternalJobs(jobs: ExternalJobInput[]): Promise<number> {
  if (jobs.length === 0) return 0;
  const db = getDB();
  const stmt = db.prepare(
    `INSERT INTO external_jobs
       (id, source, source_url, title, company, location, country_code, canton_code, category,
        salary_min, salary_max, currency, posted_at, fetched_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(source_url) DO UPDATE SET
       title = excluded.title, company = excluded.company, location = excluded.location,
       canton_code = excluded.canton_code, category = excluded.category, salary_min = excluded.salary_min,
       salary_max = excluded.salary_max, currency = excluded.currency,
       posted_at = excluded.posted_at, fetched_at = datetime('now')`,
  );
  const batch = jobs.map((j) =>
    stmt.bind(
      crypto.randomUUID(), j.source, j.sourceUrl, j.title, j.company, j.location,
      j.country, j.cantonCode, j.category, j.salaryMin, j.salaryMax, j.currency, j.postedAt,
    ),
  );
  await db.batch(batch);
  return jobs.length;
}

/** Friss külső állások egy országban (opcionális kategória- és régió-szűrő). */
export async function getExternalJobs(
  country: string,
  opts: { category?: string | null; cantonCode?: string | null; limit?: number } = {},
): Promise<ExternalJob[]> {
  const binds: unknown[] = [country];
  // Frissesség-védelem: csak a max. 21 napja látott hirdetések (a sync 14 naponta
  // purge-öl + naponta frissíti a fetched_at-et). Ha a külső sync-cron leáll, a
  // börze így fokozatosan kiürül (nem mutat hónapos halott linkeket) — a normál
  // működést nem érinti (a hirdetések ilyenkor <14 naposak).
  let where = "country_code = ? AND fetched_at >= datetime('now', '-21 days')";
  if (opts.category && opts.category !== "all") { where += " AND category = ?"; binds.push(opts.category); }
  // Régió-szűrő: CSAK a feloldott (canton_code IS NOT NULL) sorokra illeszt —
  // a fel nem oldott (null régió) sorok régió-választáskor kiesnek (nem tudjuk,
  // hova valók), de „egész ország" nézetben továbbra is megjelennek.
  if (opts.cantonCode && opts.cantonCode !== "all") { where += " AND canton_code = ?"; binds.push(opts.cantonCode); }
  const limit = Math.min(opts.limit ?? 60, 100);
  const { results } = await getDB()
    .prepare(
      `SELECT * FROM external_jobs WHERE ${where}
        ORDER BY COALESCE(posted_at, fetched_at) DESC LIMIT ${limit}`,
    )
    .bind(...binds)
    .all<Row>();
  return (results ?? []).map(toJob);
}

export async function countExternalJobs(country: string): Promise<number> {
  const row = await getDB()
    .prepare("SELECT COUNT(*) AS n FROM external_jobs WHERE country_code = ?")
    .bind(country)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

/** A megadott napnál régebben látott (nem frissített) sorok törlése. */
export async function purgeStaleExternalJobs(days = 14): Promise<number> {
  const res = await getDB()
    .prepare(`DELETE FROM external_jobs WHERE fetched_at < datetime('now', ?)`)
    .bind(`-${Math.max(1, Math.floor(days))} days`)
    .run();
  return res.meta?.changes ?? 0;
}
