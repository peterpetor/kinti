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
import { fetchJobRoomJobs } from "./jobroom";
import { upsertExternalJobs, type ExternalJobInput } from "./repo-external-jobs";

/**
 * Szektor → lokális-nyelvű keresőszó (de: AT+DE német; nl: NL holland). Egy
 * kategóriához több konkrét szakma is tartozhat (a kkint élő magyarok tipikus
 * szakmáira fókuszálva) → szélesebb lefedés. Volumen: N × 3 ország × 2 forrás
 * API-hívás futásonként; az Adzuna napi 250-es kvótáját szem előtt tartva ~22
 * szektor a felső határ napi 2 futásnál.
 */
const SECTOR_QUERIES: { category: string; de: string; nl: string }[] = [
  // Építőipar / szakmunkák
  { category: "epitoipar",    de: "Bau",            nl: "Bouw" },
  { category: "epitoipar",    de: "Maler",          nl: "Schilder" },
  { category: "epitoipar",    de: "Elektriker",     nl: "Elektricien" },
  { category: "epitoipar",    de: "Installateur",   nl: "Loodgieter" },
  // Vendéglátás
  { category: "vendeglatas",  de: "Gastronomie",    nl: "Horeca" },
  { category: "vendeglatas",  de: "Koch",           nl: "Kok" },
  { category: "vendeglatas",  de: "Kellner",        nl: "Ober" },
  // Egészségügy / ápolás
  { category: "egeszsegugy",  de: "Pflege",         nl: "Zorg" },
  { category: "egeszsegugy",  de: "Altenpflege",    nl: "Verpleegkundige" },
  // Logisztika / sofőr
  { category: "logisztika",   de: "Lager",          nl: "Logistiek" },
  { category: "logisztika",   de: "Fahrer",         nl: "Chauffeur" },
  { category: "logisztika",   de: "Staplerfahrer",  nl: "Heftruckchauffeur" },
  // Ipar / gyártás
  { category: "ipar-gyartas", de: "Produktion",     nl: "Productie" },
  { category: "ipar-gyartas", de: "Schweißer",      nl: "Lasser" },
  { category: "ipar-gyartas", de: "Mechaniker",     nl: "Monteur" },
  // Takarítás / háztartás
  { category: "takaritas",    de: "Reinigung",      nl: "Schoonmaak" },
  { category: "takaritas",    de: "Hausmeister",    nl: "Huismeester" },
  // Kereskedelem
  { category: "kereskedelem", de: "Verkauf",        nl: "Verkoop" },
  // Szépségipar
  { category: "szepsegipar",  de: "Friseur",        nl: "Kapper" },
  // Mezőgazdaság / kertészet
  { category: "mezogazdasag", de: "Landwirtschaft", nl: "Landbouw" },
  { category: "mezogazdasag", de: "Gärtner",        nl: "Tuinder" },
  // Iroda / adminisztráció
  { category: "iroda",        de: "Büro",           nl: "Kantoor" },
  // IT
  { category: "it",           de: "IT",             nl: "IT" },
  // Egyéb segéd / betanított
  { category: "egyeb",        de: "Helfer",         nl: "Helper" },
];

/** Tömb felaprózása N-es csoportokra (párhuzamos batch-futtatáshoz). */
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** CH → CHF, a többi (AT/DE/NL) → EUR. (Jooble amúgy nem ad bért, csak Adzuna.) */
function currencyFor(country: string): string {
  return country.toUpperCase() === "CH" ? "CHF" : "EUR";
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

  // CH: a hivatalos állami Job-Room (SECO) nyílt API-ja — nem az Adzuna/Jooble
  // szektor-keresés (azok nem fedik CH-t). Egy permentes, nyílt állami forrás.
  if (cc === "CH") {
    const jobs = await fetchJobRoomJobs(3, 50);
    return jobs.length === 0 ? 0 : upsertExternalJobs(jobs);
  }

  const isNL = cc === "NL";
  const byUrl = new Map<string, ExternalJobInput>();

  // A szektorokat 6-os batch-ekben, párhuzamosan futtatjuk (a sok kulcsszó se
  // nyújtsa el a futásidőt; a batch-méret tartja a rate-limit alatt a burst-öt).
  for (const batch of chunk(SECTOR_QUERIES, 6)) {
    const settled = await Promise.all(
      batch.map(async (sector) => {
        const keyword = isNL ? sector.nl : sector.de;
        try {
          return { sector, res: await searchSector(cc, keyword) };
        } catch {
          return { sector, res: [] as SourcedJob[] }; // egy szektor bukása ne állítsa le a többit
        }
      }),
    );
    for (const { sector, res } of settled) {
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
          currency: hasSalary ? currencyFor(cc) : null,
          postedAt: j.created,
        });
      }
    }
  }

  const jobs = [...byUrl.values()];
  if (jobs.length === 0) return 0;
  return upsertExternalJobs(jobs);
}

/** Az összes lefedett ország (AT/DE/NL) szinkronja. */
export async function syncAllExternalJobs(): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  for (const c of ["AT", "DE", "NL", "CH"]) {
    try {
      out[c] = await syncExternalJobsForCountry(c);
    } catch {
      out[c] = 0;
    }
  }
  return out;
}
