/**
 * job-sync.ts — a publikus „Élő állások" feltöltése jogtiszta aggregátor-API-kból.
 *
 * Forrás-stratégia (a meglévő admin-keresővel azonos): ha van Adzuna/Jooble kulcs,
 * onnan (URL-dedup); különben ingyenes Arbeitnow-fallback. Szektoronként (a mi
 * job-categories kategóriáink) futtatunk egy lokális-nyelvű kulcsszavas keresést,
 * a találatot a kategóriával címkézzük, és source_url alapján upsert-eljük az
 * external_jobs gyorsítótárba. A publikus listázás KIFELÉ linkel (link-out). Lásd
 * [[jobs-aggregation-strategy]], [[recruitment-placement]].
 */
import { searchAdzunaJobs, type AdzunaJob } from "./adzuna";
import { searchJoobleJobs } from "./jooble";
import { searchArbeitnowJobs } from "./arbeitnow";
import { upsertExternalJobs, type ExternalJobInput } from "./repo-external-jobs";

/** A szektor → lokális-nyelvű keresőszó (de: AT+DE német; nl: NL holland). */
const SECTOR_QUERIES: { category: string; de: string; nl: string }[] = [
  { category: "epitoipar",    de: "Bau",          nl: "Bouw" },
  { category: "vendeglatas",  de: "Gastronomie",  nl: "Horeca" },
  { category: "egeszsegugy",  de: "Pflege",       nl: "Zorg" },
  { category: "logisztika",   de: "Lager",        nl: "Logistiek" },
  { category: "ipar-gyartas", de: "Produktion",   nl: "Productie" },
  { category: "takaritas",    de: "Reinigung",    nl: "Schoonmaak" },
  { category: "kereskedelem", de: "Verkauf",      nl: "Verkoop" },
  { category: "szepsegipar",  de: "Friseur",      nl: "Kapper" },
  { category: "iroda",        de: "Büro",         nl: "Kantoor" },
  { category: "it",           de: "IT",           nl: "IT" },
];

/** AT/DE/NL mind EUR. */
function currencyFor(): string {
  return "EUR";
}

interface SourcedJob { job: AdzunaJob; source: string }

async function searchSector(country: string, keyword: string): Promise<SourcedJob[]> {
  const [ad, jb] = await Promise.all([
    searchAdzunaJobs(country, keyword, 20),
    searchJoobleJobs(country, keyword, 20),
  ]);
  if (ad.configured || jb.configured) {
    return [
      ...ad.jobs.map((job) => ({ job, source: "adzuna" })),
      ...jb.jobs.map((job) => ({ job, source: "jooble" })),
    ];
  }
  // Nincs kulcs → ingyenes fallback.
  const jobs = await searchArbeitnowJobs(country, keyword, 20);
  return jobs.map((job) => ({ job, source: "arbeitnow" }));
}

/** Egy ország szinkronja: szektoronként keres, címkéz, upsertel. @returns upsertelt sorok száma. */
export async function syncExternalJobsForCountry(country: string): Promise<number> {
  const cc = country.toUpperCase();
  const isNL = cc === "NL";
  const byUrl = new Map<string, ExternalJobInput>();

  for (const sector of SECTOR_QUERIES) {
    const keyword = isNL ? sector.nl : sector.de;
    let res: SourcedJob[];
    try {
      res = await searchSector(cc, keyword);
    } catch {
      continue; // egy szektor bukása ne állítsa le a többit
    }
    for (const { job: j, source } of res) {
      if (!j.url || byUrl.has(j.url)) continue; // első kategória nyer
      const hasSalary = j.salaryMin != null || j.salaryMax != null;
      byUrl.set(j.url, {
        source,
        sourceUrl: j.url,
        title: j.title,
        company: j.company,
        location: j.location,
        country: cc,
        category: sector.category,
        salaryMin: j.salaryMin,
        salaryMax: j.salaryMax,
        currency: hasSalary ? currencyFor() : null,
        postedAt: j.created,
      });
    }
  }

  const jobs = [...byUrl.values()];
  if (jobs.length === 0) return 0;
  return upsertExternalJobs(jobs);
}

/** Az összes lefedett ország (AT/DE/NL) szinkronja. */
export async function syncAllExternalJobs(): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  for (const c of ["AT", "DE", "NL"]) {
    try {
      out[c] = await syncExternalJobsForCountry(c);
    } catch {
      out[c] = 0;
    }
  }
  return out;
}
