import { getAdminUserId } from "@/lib/admin";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { syncAllExternalJobs, syncExternalJobsForCountry } from "@/lib/job-sync";
import { purgeStaleExternalJobs } from "@/lib/repo-external-jobs";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const COUNTRIES = new Set(["AT", "DE", "NL"]);

/**
 * /api/cron/sync-jobs — a publikus „Élő állások" feltöltése jogtiszta aggregátor-
 * API-kból (Adzuna/Jooble, vagy ingyenes Arbeitnow-fallback). Külön életciklusú
 * gyorsítótár (external_jobs), a listázás KIFELÉ linkel.
 *
 *   • Külső ütemező (cron-job.org) → `Authorization: Bearer <CRON_SECRET>`
 *   • Admin (bejelentkezve) → manuális futtatás
 *
 * `?country=AT|DE|NL` → CSAK az adott ország (a cron-job.org-on országonként
 * külön, eltolt időben — így nem lépjük túl az Adzuna percenkénti rate-limitjét).
 * Param nélkül mind a három (manuális / admin). A 14 napnál régebbi sorokat takarítja.
 */
async function handle(req: Request): Promise<Response> {
  const secret = (getCloudflareEnv() as unknown as { CRON_SECRET?: string }).CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  const okSecret = !!secret && auth === `Bearer ${secret}`;
  const okAdmin = okSecret ? false : !!(await getAdminUserId());
  if (!okSecret && !okAdmin) return new Response("Unauthorized", { status: 401 });

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
    return Response.json({ ok: true, total, synced, purged });
  } catch (err) {
    safeLogError("sync-jobs", err);
    const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}

export const POST = handle;
export const GET = handle;
