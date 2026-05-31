/**
 * kinti-cron-purge — D1 takarító Worker.
 *
 * Egy `scheduled` handler, ami a lejárt / elavult rekordokat takarítja:
 *   1) review_drafts          → 24h után meg nem erősített vélemény-piszkozat
 *   2) business_submissions   → 24h után meg nem erősített vállalkozás-beküldés
 *   3) events                 → 30 napnál régebbi lezajlott / meg nem erősített
 *   4) business_analytics_dedupe / ai_rate_limit_log → rövid TTL-ű naplók
 *
 * A `fetch` endpoint csak debug-célú, jogosultság-ellenőrzéssel — manuális
 * lefuttatható curl-lel (lásd lent). Production-on a Cron Trigger hajtja.
 */

export interface Env {
  DB: D1Database;
  /** R2 média-tároló — a lejárt tartalmak képeit is töröljük. */
  MEDIA: R2Bucket;
  /** Opcionális — ha be van állítva, a `fetch` endpointhoz kell. */
  CRON_SECRET?: string;
}

/** Kép-kulcs(ok) kinyerése: JSON-tömb vagy egyetlen kulcs. */
function parseImageKeys(keyStr: string | null | undefined): string[] {
  if (!keyStr) return [];
  if (keyStr.startsWith("[")) {
    try {
      const arr = JSON.parse(keyStr);
      return Array.isArray(arr) ? arr.filter((k): k is string => typeof k === "string") : [];
    } catch {
      return [keyStr];
    }
  }
  return [keyStr];
}

/** R2 objektumok törlése (kötegelve). Hiba esetén nem dobunk — best-effort. */
async function deleteR2Keys(env: Env, keys: string[]): Promise<number> {
  const unique = [...new Set(keys.filter(Boolean))];
  if (unique.length === 0) return 0;
  try {
    // Az R2 .delete() tömböt is elfogad (max 1000 / hívás).
    await env.MEDIA.delete(unique);
    return unique.length;
  } catch (err) {
    console.error("[cron-purge] R2 törlési hiba:", err);
    return 0;
  }
}

interface PurgeResult {
  reviewDraftsDeleted: number;
  businessSubmissionsDeleted: number;
  oldEventsDeleted: number;
  imagesDeleted: number;
  analyticsDedupeDeleted: number;
  ranAt: string;
}

async function runPurge(env: Env): Promise<PurgeResult> {
  const db = env.DB;
  let imagesDeleted = 0;

  // 1) Vélemény-piszkozatok takarítása (nincs kép)
  const reviewDraftsRes = await db
    .prepare("DELETE FROM review_drafts WHERE expires_at <= datetime('now')")
    .run();

  // 2) Meg nem erősített vállalkozás-beküldések takarítása (24h után)
  const bizSubsRes = await db
    .prepare("DELETE FROM business_submissions WHERE expires_at <= datetime('now')")
    .run();

  // 3) Régi/inaktív események hard delete (GDPR adattakarékosság):
  //    30 napnál régebben lezajlott események + a 30 napnál régebbi, soha meg
  //    nem erősített beküldések. A képeket (R2), a leadott RSVP-ket és a sort
  //    (benne a beküldő emailje) is véglegesen töröljük.
  const eventCondition =
    "(event_date IS NOT NULL AND event_date < date('now','-30 days')) " +
    "OR (status = 'pending_confirm' AND created_at < datetime('now','-30 days'))";
  const { results: oldEvents } = await db
    .prepare(`SELECT id, image_key FROM events WHERE ${eventCondition}`)
    .all<{ id: string; image_key: string | null }>();
  imagesDeleted += await deleteR2Keys(
    env,
    oldEvents.flatMap((e) => parseImageKeys(e.image_key)),
  );
  // Az RSVP-ket explicit is töröljük (nem csak FK-cascade-re hagyatkozva).
  await db
    .prepare(`DELETE FROM event_rsvps WHERE event_id IN (SELECT id FROM events WHERE ${eventCondition})`)
    .run();
  const oldEventsRes = await db.prepare(`DELETE FROM events WHERE ${eventCondition}`).run();

  // 4) Vállalkozói analitika dedupe-tábla — >7 napos rekordok törlése.
  //    A táblának csak rate-limit célja van; tartós érték nincs benne.
  const analyticsDedupeRes = await db
    .prepare(
      "DELETE FROM business_analytics_dedupe WHERE created_at < datetime('now', '-7 days')",
    )
    .run();

  // 5) AI rate-limit log — >24 órás rekordok törlése (sliding-window max 1h)
  try {
    await db
      .prepare(
        "DELETE FROM ai_rate_limit_log WHERE created_at < datetime('now', '-1 day')",
      )
      .run();
  } catch (err) {
    console.warn("[cron-purge] ai_rate_limit_log takarítás kihagyva:", err);
  }

  return {
    reviewDraftsDeleted: reviewDraftsRes.meta.changes ?? 0,
    businessSubmissionsDeleted: bizSubsRes.meta.changes ?? 0,
    oldEventsDeleted: oldEventsRes.meta.changes ?? 0,
    imagesDeleted,
    analyticsDedupeDeleted: analyticsDedupeRes.meta.changes ?? 0,
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
