import { getAdminUserId } from "@/lib/admin";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { runFullEventSync } from "@/lib/repo";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * /api/cron/sync-events — az iCal esemény-feedek manuális / időzített
 * szinkronja. Az app amúgy is frissül magától (lusta, forgalom-vezérelt
 * szinkron a Közösség oldalon), ez az endpoint a PONTOS időzítéshez van:
 *
 *   • Külső ütemező (pl. cron-job.org) → `Authorization: Bearer <CRON_SECRET>`
 *   • Admin felhasználó (bejelentkezve) → a feed-kezelő „Szinkronizálás most"
 *
 * A `CRON_SECRET`-et a Cloudflare Pages secretként kell beállítani:
 *   wrangler pages secret put CRON_SECRET
 * Ha nincs beállítva, csak admin hívhatja.
 */
async function handle(req: Request): Promise<Response> {
  const secret = (getCloudflareEnv() as unknown as { CRON_SECRET?: string }).CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  const okSecret = !!secret && auth === `Bearer ${secret}`;
  const okAdmin = okSecret ? false : !!(await getAdminUserId());

  if (!okSecret && !okAdmin) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Egy lépés bukása NE 500-azza a teljes cront (a külső ütemező „Failed"-et
  // mutatna). Elkapjuk, naplózzuk, és a hiba okát visszaadjuk a válaszban.
  try {
    const { generated, feeds } = await runFullEventSync();
    const imported = feeds.reduce((n, r) => n + r.imported, 0);
    return Response.json({ ok: true, generated, feeds: feeds.length, imported, results: feeds });
  } catch (err) {
    safeLogError("sync-events", err);
    const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    return Response.json({ ok: false, error: message }, { status: 200 });
  }
}

export const POST = handle;
export const GET = handle;
