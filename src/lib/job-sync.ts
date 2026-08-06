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
import { externalJobDedupeKey } from "./external-job-url";
import { regionCodeFromLocation, isOutsideCountryScope } from "./region-resolve";
import { budgetCurrency, isBudgetCountry } from "./budget-plan";
import { safeLogError } from "./safe-log";

/**
 * Szektor → LOKÁLIS NYELVŰ keresőszó, országnyelv szerint:
 *   de → AT + DE · nl → NL · en → GB · es → ES
 *
 * Egy kategóriához több konkrét szakma is tartozhat (a kint élő magyarok tipikus
 * szakmáira fókuszálva) → szélesebb lefedés.
 *
 * ⚠️ A `core` MEZŐ NEM DÍSZ — KVÓTA-KORLÁT.
 * Az Adzuna ingyenes szintje **250 hívás/nap**. A cron országonként külön fut,
 * napi 2×; egy futás = szektor-szám darab Adzuna-hívás. A számla:
 *
 *   AT + DE + NL:  3 × 24 szektor × 2 futás = 144 hívás/nap   (a mai állapot)
 *   + GB + ES teljes szélességgel: +2 × 24 × 2 =  96          → 240/nap = 96%
 *   + GB + ES csak `core`:          +2 × 12 × 2 =  48          → 192/nap = 77%
 *
 * A 240 nem hagy semmi ráhagyást admin-futtatásra vagy újrapróbálkozásra, ezért
 * GB/ES **kategóriánként EGY kulcsszót** kap — a `core: true` sorokat. A szabály
 * egyszerű és ellenőrizhető (teszt köti): a 12 kategória mindegyikéből pontosan
 * egy sor `core`. Így egyetlen kategória sem marad üresen a két új országban,
 * és a kvótán belül maradunk. Ha az Adzuna-kvóta egyszer megnő, elég a
 * `SECTORS_FOR` szűrőt kivenni.
 */
const SECTOR_QUERIES: { category: string; de: string; nl: string; en: string; es: string; core?: true }[] = [
  // Építőipar / szakmunkák
  { category: "epitoipar",    de: "Bau",            nl: "Bouw",              en: "Construction",          es: "Construcción",   core: true },
  { category: "epitoipar",    de: "Maler",          nl: "Schilder",          en: "Painter Decorator",     es: "Pintor" },
  { category: "epitoipar",    de: "Elektriker",     nl: "Elektricien",       en: "Electrician",           es: "Electricista" },
  { category: "epitoipar",    de: "Installateur",   nl: "Loodgieter",        en: "Plumber",               es: "Fontanero" },
  // Vendéglátás
  { category: "vendeglatas",  de: "Gastronomie",    nl: "Horeca",            en: "Hospitality",           es: "Hostelería",     core: true },
  { category: "vendeglatas",  de: "Koch",           nl: "Kok",               en: "Chef",                  es: "Cocinero" },
  { category: "vendeglatas",  de: "Kellner",        nl: "Ober",              en: "Waiter",                es: "Camarero" },
  // Egészségügy / ápolás
  // ⚠️ GB-ben a magyarok tipikus belépő-állása a „care assistant" (idősgondozás),
  // nem a „nurse" (ahhoz NMC-regisztráció kell) — ezért az a `core`.
  { category: "egeszsegugy",  de: "Pflege",         nl: "Zorg",              en: "Care Assistant",        es: "Cuidador",       core: true },
  { category: "egeszsegugy",  de: "Altenpflege",    nl: "Verpleegkundige",   en: "Nurse",                 es: "Enfermero" },
  // Logisztika / sofőr
  { category: "logisztika",   de: "Lager",          nl: "Logistiek",         en: "Warehouse",             es: "Almacén",        core: true },
  { category: "logisztika",   de: "Fahrer",         nl: "Chauffeur",         en: "Driver",                es: "Conductor" },
  { category: "logisztika",   de: "Staplerfahrer",  nl: "Heftruckchauffeur", en: "Forklift Driver",       es: "Carretillero" },
  // Ipar / gyártás
  { category: "ipar-gyartas", de: "Produktion",     nl: "Productie",         en: "Production Operative",  es: "Producción",     core: true },
  { category: "ipar-gyartas", de: "Schweißer",      nl: "Lasser",            en: "Welder",                es: "Soldador" },
  { category: "ipar-gyartas", de: "Mechaniker",     nl: "Monteur",           en: "Mechanic",              es: "Mecánico" },
  // Takarítás / háztartás
  { category: "takaritas",    de: "Reinigung",      nl: "Schoonmaak",        en: "Cleaner",               es: "Limpieza",       core: true },
  { category: "takaritas",    de: "Hausmeister",    nl: "Huismeester",       en: "Caretaker",             es: "Conserje" },
  // Kereskedelem
  { category: "kereskedelem", de: "Verkauf",        nl: "Verkoop",           en: "Sales Assistant",       es: "Dependiente",    core: true },
  // Szépségipar
  { category: "szepsegipar",  de: "Friseur",        nl: "Kapper",            en: "Hairdresser",           es: "Peluquero",      core: true },
  // Mezőgazdaság / kertészet
  { category: "mezogazdasag", de: "Landwirtschaft", nl: "Landbouw",          en: "Farm Worker",           es: "Agricultura",    core: true },
  { category: "mezogazdasag", de: "Gärtner",        nl: "Tuinder",           en: "Gardener",              es: "Jardinero" },
  // Iroda / adminisztráció
  { category: "iroda",        de: "Büro",           nl: "Kantoor",           en: "Office Administrator",  es: "Administrativo", core: true },
  // IT
  // Spanyolországban az „Informática" hoz többet, mint a puszta „IT" (utóbbi
  // rövidítésként bármibe beleillik).
  { category: "it",           de: "IT",             nl: "IT",                en: "IT",                    es: "Informática",    core: true },
  // Egyéb segéd / betanított
  // A „Helfer" angol megfelelője a „Labourer", spanyolul a „Peón" — mindkettő a
  // betanított/segédmunka hirdetések bevett szava.
  { category: "egyeb",        de: "Helfer",         nl: "Helper",            en: "Labourer",              es: "Peón",           core: true },
];

/**
 * Ország → melyik keresőszó-oszlop. TÁBLA, nem ternárius-lánc: a korábbi
 * `isNL ? sector.nl : sector.de` alak minden NEM-holland országra NÉMET szót
 * adott, tehát Anglia/Spanyolország bekapcsolása németül keresett volna angol és
 * spanyol állásokat. Ismeretlen ország → nincs nyelv → nem keresünk (fail-closed).
 */
const SECTOR_LANG: Record<string, "de" | "nl" | "en" | "es"> = {
  AT: "de", DE: "de", NL: "nl", GB: "en", ES: "es",
};

/** Az adott országon futtatandó szektorok (GB/ES: csak `core` — ld. a kvóta-számlát). */
function sectorsFor(country: string): typeof SECTOR_QUERIES {
  const coreOnly = country === "GB" || country === "ES";
  return coreOnly ? SECTOR_QUERIES.filter((s) => s.core) : SECTOR_QUERIES;
}

/**
 * A szinkronban részt vevő országok — EGYETLEN FORRÁS. A cron-route eddig SAJÁT
 * `COUNTRIES` halmazt tartott; két listát nem lehet szinkronban tartani, és a
 * `?country=GB` így csendben az „összes ország" ágra esett volna.
 *
 * A CH utolsó, mert az a hivatalos Job-Room (SECO) API-t használja, nem az
 * Adzuna/Jooble szektor-keresést.
 */
export const SYNC_COUNTRIES = ["AT", "DE", "NL", "GB", "ES", "CH"] as const;

/** Tömb felaprózása N-es csoportokra (párhuzamos batch-futtatáshoz). */
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * Ország → pénznem. (Jooble amúgy nem ad bért, csak Adzuna.)
 *
 * ⚠️ EZ VALÓDI HIBA VOLT: `country === "CH" ? "CHF" : "EUR"` — vagyis egy angliai
 * hirdetés fontban megadott bére EURÓKÉNT került volna az adatbázisba. A
 * bináris ország-fallthrough hibaosztály. Most a `budgetCurrency` az egyetlen
 * forrás (függőség-mentes tiszta lib, GB-t is ismeri).
 */
function currencyFor(country: string): string {
  const cc = country.toUpperCase();
  return isBudgetCountry(cc) ? budgetCurrency(cc) : "EUR";
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

  // Nyelv nélküli országon NEM keresünk: jobb nulla találat, mint német
  // kulcsszavakkal keresett angol/spanyol állás.
  const lang = SECTOR_LANG[cc];
  if (!lang) return 0;

  const byKey = new Map<string, ExternalJobInput>();

  /**
   * ⚠️ IDŐKERET — VALÓS KIESÉSBŐL (2026-08-05). A „Kinti Job Sync (NL)" cron
   * 30 mp-es timeoutra futott (a szokásos futásidő 7–8 mp), és mivel az upsert
   * a ciklus UTÁN fut egyszer, AZNAP EGYETLEN állás sem frissült.
   *
   * A per-hívás időkorlát (lásd adzuna/jooble/arbeitnow) egyetlen lassú forrás
   * ellen véd; ez a keret az ÖSSZEADÓDÁS ellen: 5 batch × 8 mp worst case már
   * 40 mp. Ha a keret elfogy, abbahagyjuk a további batch-eket — a MÁR
   * összegyűjtött állásokat viszont elmentjük.
   *
   * Részleges szinkron > semmi: a következő futás úgyis mindent újra lekér
   * (nem inkrementális), tehát a kihagyott szektorok 12 óra múlva bejönnek.
   */
  const KEZDET = Date.now();
  const IDOKERET_MS = 20_000; // a cron-job.org 30 mp-es korlátja alatt, a purge-nek is marad
  let kihagyottBatch = 0;

  for (const batch of chunk(sectorsFor(cc), 6)) {
    if (Date.now() - KEZDET > IDOKERET_MS) {
      kihagyottBatch++;
      continue;
    }
    const settled = await Promise.all(
      batch.map(async (sector) => {
        const keyword = sector[lang];
        try {
          return { sector, res: await searchSector(cc, keyword) };
        } catch {
          return { sector, res: [] as SourcedJob[] }; // egy szektor bukása ne állítsa le a többit
        }
      }),
    );
    for (const { sector, res } of settled) {
      for (const { job: j, source } of res) {
        // ⚠️ A kulcs a STABIL dedup-kulcs, NEM a nyers URL. A „első kategória
        // nyer" szándék eddig SOSEM teljesült: az Adzuna/Jooble kérésenként új
        // követő-paramétert tesz ugyanarra az állásra (`elckey`/`se`/`v`), így
        // minden keresőszó külön sort csinált belőle. Egy Waffle House szakács
        // így „egészségügy" és „takarítás" alatt is szerepelt, egy állás pedig
        // akár 23× a listában. Ld. lib/external-job-url.ts.
        const key = externalJobDedupeKey(j.url);
        if (!key || byKey.has(key)) continue; // első kategória nyer
        // ⚠️ Az Adzuna `gb` piaca a TELJES Egyesült Királyság, a Kinti „GB"-je
        // viszont ANGLIA. A skót/walesi/észak-írországi hirdetés nem hiányos, hanem
        // TÉVES adat lenne „Anglia" alatt — élesben 255-ből 30 ilyen sor volt.
        if (isOutsideCountryScope(cc, j.location, j.area)) continue;
        const hasSalary = j.salaryMin != null || j.salaryMax != null;
        byKey.set(key, {
          source,
          sourceUrl: j.url,
          title: j.title,
          company: j.company,
          location: j.location,
          country: cc,
          // Régió-feloldás a strukturált area-ból (Adzuna), különben a location-ból.
          cantonCode: regionCodeFromLocation(cc, j.location, j.area),
          category: sector.category,
          salaryMin: j.salaryMin,
          salaryMax: j.salaryMax,
          currency: hasSalary ? currencyFor(cc) : null,
          postedAt: j.created,
        });
      }
    }
  }

  if (kihagyottBatch > 0) {
    // Nem néma: a kihagyás a riasztó-webhookra is kimegy, hogy a tartósan
    // lassú forrás ne maradjon észrevétlen (ugyanaz a minta, mint az AI-korlát
    // fail-open ágánál).
    safeLogError(
      `job-sync ${cc}: időkeret elfogyott, ${kihagyottBatch} batch kihagyva`,
      new Error("sync-time-budget"),
    );
  }

  const jobs = [...byKey.values()];
  if (jobs.length === 0) return 0;
  return upsertExternalJobs(jobs);
}

/**
 * Az összes lefedett ország szinkronja — 2026-07-30 óta MIND A HAT.
 *
 * ⚠️ EZ A FUNKCIÓ CSAK ADMIN-FUTTATÁSRA VALÓ. Az éles cron ORSZÁGONKÉNT hívja a
 * route-ot (`?country=XX`, eltolt időben), mert mind a hat ország egy futásban,
 * párhuzamos burst-ben túllépi az Adzuna PERCENKÉNTI kvótáját — ez élesben már
 * megtörtént: az első ország elvitte a kvótát, a többi 429-et kapott és üresen
 * tért vissza. Innen a sorrendben (nem párhuzamosan) futó ciklus.
 */
export async function syncAllExternalJobs(): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  for (const c of SYNC_COUNTRIES) {
    try {
      out[c] = await syncExternalJobsForCountry(c);
    } catch {
      out[c] = 0;
    }
  }
  return out;
}
