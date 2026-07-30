import { getAdminUserId } from "@/lib/admin";
import { timingSafeEqualStr } from "@/lib/security";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { syncAllExternalJobs, syncExternalJobsForCountry, SYNC_COUNTRIES } from "@/lib/job-sync";
import { purgeStaleExternalJobs } from "@/lib/repo-external-jobs";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * ⚠️ NO-STORE — VALÓDI, ÉLESBEN MEGFIGYELT HIBA MIATT.
 *
 * 2026-07-30: a `?country=GB` kézi próbafuttatás 2,5 s alatt tért vissza egy
 * KORÁBBI futás válaszával (`{"AT":480,"DE":20,...}`), pedig a kód már a
 * per-ország ágat futtatta volna. Cache-törő paraméterrel azonnal a helyes
 * `{"GB":255}` jött. Vagyis a POST-válasz az él-hálózaton CACHE-ELŐDÖTT.
 *
 * Ez nem kozmetikai: ha egy ÜTEMEZETT futás kap cache-elt választ, a szinkron
 * ELVÉGZÉS NÉLKÜL jelent sikert — a cron zöld, az adat áll. Innen a `no-store`.
 *
 * Megj.: ha a jelenség ezzel együtt is megmarad, akkor Cloudflare-oldali
 * cache-szabály van az `/api/*`-ra (a Workerünk ilyenkor le sem fut, tehát
 * kódból nem is javítható) — azt a dashboardon kell kivenni.
 */
const NO_STORE = { "cache-control": "no-store, no-cache, must-revalidate" } as const;

// ⚠️ A lista a `job-sync`-ből jön, NEM kézzel írva ide. Korábban két külön lista
// volt, és két listát nem lehet szinkronban tartani: egy új ország itt hiányozva
// azt jelentette volna, hogy a `?country=GB` CSENDBEN az „összes ország" ágra
// esik — vagyis a percenkénti Adzuna-kvótát túllépő burst indul.
const COUNTRIES = new Set<string>(SYNC_COUNTRIES);

/**
 * /api/cron/sync-jobs — a publikus „Élő állások" feltöltése jogtiszta aggregátor-
 * API-kból (Adzuna/Jooble, vagy ingyenes Arbeitnow-fallback). Külön életciklusú
 * gyorsítótár (external_jobs), a listázás KIFELÉ linkel.
 *
 *   • Külső ütemező (cron-job.org) → `Authorization: Bearer <CRON_SECRET>`
 *   • Admin (bejelentkezve) → manuális futtatás
 *
 * `?country=AT|DE|NL|GB|ES|CH` → CSAK az adott ország (a cron-job.org-on
 * országonként külön, eltolt időben — így nem lépjük túl az Adzuna percenkénti
 * rate-limitjét). Param nélkül MIND A HAT egymás után — ez csak admin-futtatásra
 * való, a cron sosem hívja param nélkül. A 14 napnál régebbi sorokat takarítja.
 */
async function handle(req: Request): Promise<Response> {
  const secret = (getCloudflareEnv() as unknown as { CRON_SECRET?: string }).CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  const okSecret = !!secret && (await timingSafeEqualStr(auth, `Bearer ${secret}`));
  const okAdmin = okSecret ? false : !!(await getAdminUserId());
  if (!okSecret && !okAdmin) return new Response("Unauthorized", { status: 401, headers: NO_STORE });

  const reqCountry = (new URL(req.url).searchParams.get("country") ?? "").toUpperCase();

  try {
    let synced: Record<string, number>;
    if (COUNTRIES.has(reqCountry)) {
      synced = { [reqCountry]: await syncExternalJobsForCountry(reqCountry) };
    } else {
      synced = await syncAllExternalJobs();
    }
    const purged = await purgeStaleExternalJobs(14);
    const total = Object.values(synced).reduce((n, v) => n + v, 0);
    return Response.json({ ok: true, total, synced, purged }, { headers: NO_STORE });
  } catch (err) {
    safeLogError("sync-jobs", err);
    const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    return Response.json({ ok: false, error: message }, { status: 500, headers: NO_STORE });
  }
}

export const POST = handle;
export const GET = handle;
