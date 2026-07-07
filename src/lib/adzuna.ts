/**
 * adzuna.ts — VALÓDI állás-listák egy jogtiszta aggregátor-API-ból (Adzuna).
 *
 * Az Adzuna egy legális állás-aggregátor, amelynek API-ja kifejezetten arra
 * való, hogy harmadik felek listázzák a találatokat (nem scrape). Ingyenes
 * kulcs: developer.adzuna.com → app_id + app_key. Lefedés: AT/DE/NL (+ sok más).
 *
 * Env (admin állítja be): `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`. Ha nincs, a hívó a
 * kereső-linkekre esik vissza (graceful).
 */
import { getCloudflareEnv } from "./cloudflare";

export interface AdzunaJob {
  title: string;
  company: string | null;
  location: string | null;
  /** Strukturált hely-hierarchia (Adzuna `location.area`), pl.
   *  ["Österreich","Oberösterreich","Linz"] — a régió-feloldás fő forrása.
   *  Más forrásoknál (Jooble/Arbeitnow) hiányzik → a resolver a location-ra esik. */
  area?: string[];
  salaryMin: number | null;
  salaryMax: number | null;
  url: string;
  created: string | null;
}

/** Adzuna-támogatott (és nálunk EU-placement) országkódok. */
const ADZUNA_COUNTRIES = new Set(["at", "de", "nl"]);

interface AdzunaResult {
  title?: string;
  company?: { display_name?: string };
  location?: { display_name?: string; area?: string[] };
  salary_min?: number;
  salary_max?: number;
  redirect_url?: string;
  created?: string;
}

export interface AdzunaSearch {
  jobs: AdzunaJob[];
  /** false → nincs API-kulcs beállítva (a hívó essen vissza linkekre). */
  configured: boolean;
}

export async function searchAdzunaJobs(country: string, keyword: string, limit = 20, where?: string): Promise<AdzunaSearch> {
  const env = getCloudflareEnv() as unknown as { ADZUNA_APP_ID?: string; ADZUNA_APP_KEY?: string };
  const id = env.ADZUNA_APP_ID;
  const key = env.ADZUNA_APP_KEY;
  if (!id || !key) return { jobs: [], configured: false };

  const cc = country.toLowerCase();
  const q = keyword.trim();
  if (!ADZUNA_COUNTRIES.has(cc) || !q) return { jobs: [], configured: true };

  // Tartomány-szűrő: az Adzuna `where` helyszín-paramétere (pl. "Wien", "Bayern").
  const w = (where ?? "").trim();
  const whereParam = w ? `&where=${encodeURIComponent(w)}` : "";
  const url =
    `https://api.adzuna.com/v1/api/jobs/${cc}/search/1` +
    `?app_id=${encodeURIComponent(id)}&app_key=${encodeURIComponent(key)}` +
    `&what=${encodeURIComponent(q)}${whereParam}&results_per_page=${limit}&content-type=application/json`;

  try {
    const res = await fetch(url, { cf: { cacheTtl: 600, cacheEverything: true } } as RequestInit);
    if (!res.ok) return { jobs: [], configured: true };
    const data = (await res.json()) as { results?: AdzunaResult[] };
    const jobs: AdzunaJob[] = (data.results ?? [])
      .map((r) => ({
        title: String(r.title ?? "").replace(/<[^>]*>/g, "").trim(),
        company: r.company?.display_name ?? null,
        location: r.location?.display_name ?? null,
        area: Array.isArray(r.location?.area) ? r.location!.area!.filter((s) => typeof s === "string") : undefined,
        salaryMin: typeof r.salary_min === "number" ? Math.round(r.salary_min) : null,
        salaryMax: typeof r.salary_max === "number" ? Math.round(r.salary_max) : null,
        url: String(r.redirect_url ?? ""),
        created: r.created ?? null,
      }))
      .filter((j) => j.title && /^https?:\/\//.test(j.url));
    return { jobs, configured: true };
  } catch {
    return { jobs: [], configured: true };
  }
}
