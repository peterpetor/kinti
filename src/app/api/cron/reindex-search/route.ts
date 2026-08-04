import { NextResponse } from "next/server";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { timingSafeEqualStr } from "@/lib/security";
import { getAdminUserId } from "@/lib/admin";
import { getVectorize, indexPendingBusinessVectors } from "@/lib/vector-search";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST/GET /api/cron/reindex-search — a szemantikus kereső-index feltöltése
 * GÉPI úton (ütemezetten vagy nagy backfillhez).
 *
 * ⚠️ MIÉRT NEM AZ /api/admin/reindex-search-öt bővítettük?
 * Mert a middleware a teljes `/api/admin(.*)` fát Clerk-kel védi, tehát egy
 * Bearer-token kérés még a route ELŐTT a bejelentkezésre fut. A védelmet
 * gyengíteni rossz csere lett volna; a gépi belépő helye a `/api/cron/*` fa,
 * ahol a többi ütemezett feladat is él, ugyanezzel a Bearer-mintával.
 *
 * Auth: `Bearer <CRON_SECRET>` vagy admin session.
 *
 * A tényleges munkát ugyanaz a FOLYTATHATÓ `indexPendingBusinessVectors`
 * végzi, mint az admin gomb — futásonként egy szelet, a válasz megmondja, mi
 * maradt. Nagy hátraléknál addig hívd, amíg a `remaining` 0 nem lesz.
 *
 * Query: `limit` (alap 200, max 500).
 */
async function handle(req: Request): Promise<Response> {
  const env = getCloudflareEnv() as unknown as { CRON_SECRET?: string };
  const auth = req.headers.get("authorization") ?? "";
  const okSecret = !!env.CRON_SECRET && (await timingSafeEqualStr(auth, `Bearer ${env.CRON_SECRET}`));
  const okAdmin = okSecret ? false : !!(await getAdminUserId());
  if (!okSecret && !okAdmin) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!getVectorize()) {
    return NextResponse.json(
      { error: "A Vectorize index nincs beüzemelve (wrangler.toml [[vectorize]])." },
      { status: 409 },
    );
  }

  const raw = Number(new URL(req.url).searchParams.get("limit") ?? 200);
  const limit = Number.isFinite(raw) ? Math.max(1, Math.min(raw, 500)) : 200;

  try {
    const { indexed, remaining } = await indexPendingBusinessVectors(limit);
    return NextResponse.json(
      { ok: true, indexed, remaining, done: remaining === 0 },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (err) {
    safeLogError("api/cron/reindex-search", err);
    return NextResponse.json({ error: "Indexelési hiba." }, { status: 500 });
  }
}

export const POST = handle;
export const GET = handle;
