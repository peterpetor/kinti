/**
 * kinti-cron-purge — D1 takarító Worker.
 *
 * Egy `scheduled` handler, ami kétféle "szemetet" töröl:
 *   1) bulletin_drafts → 24h után meg nem erősített piszkozat
 *   2) bulletin_posts  → 30 nap utáni lejárt poszt (expires_at IS NOT NULL)
 *
 * A `fetch` endpoint csak debug-célú, jogosultság-ellenőrzéssel — manuális
 * lefuttatható curl-lel (lásd lent). Production-on a Cron Trigger hajtja.
 */

export interface Env {
  DB: D1Database;
  /** Opcionális — ha be van állítva, a `fetch` endpointhoz kell. */
  CRON_SECRET?: string;
}

interface PurgeResult {
  draftsDeleted: number;
  postsDeleted: number;
  reviewDraftsDeleted: number;
  ranAt: string;
}

async function runPurge(env: Env): Promise<PurgeResult> {
  const draftsRes = await env.DB.prepare(
    "DELETE FROM bulletin_drafts WHERE expires_at <= datetime('now')",
  ).run();

  const postsRes = await env.DB.prepare(
    "DELETE FROM bulletin_posts WHERE expires_at IS NOT NULL AND expires_at <= datetime('now')",
  ).run();

  const reviewDraftsRes = await env.DB.prepare(
    "DELETE FROM review_drafts WHERE expires_at <= datetime('now')",
  ).run();

  return {
    draftsDeleted: draftsRes.meta.changes ?? 0,
    postsDeleted: postsRes.meta.changes ?? 0,
    reviewDraftsDeleted: reviewDraftsRes.meta.changes ?? 0,
    ranAt: new Date().toISOString(),
  };
}

export default {
  async scheduled(
    _event: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    ctx.waitUntil(
      runPurge(env).then((result) => {
        console.log("[cron-purge]", JSON.stringify(result));
      }),
    );
  },

  async fetch(req: Request, env: Env): Promise<Response> {
    // Manuális lefuttatás: `curl -H 'authorization: Bearer <secret>' <worker-url>`
    const auth = req.headers.get("authorization") ?? "";
    const expected = env.CRON_SECRET ? `Bearer ${env.CRON_SECRET}` : null;
    if (!expected || auth !== expected) {
      return new Response("Unauthorized", { status: 401 });
    }
    const result = await runPurge(env);
    return Response.json(result);
  },
};
