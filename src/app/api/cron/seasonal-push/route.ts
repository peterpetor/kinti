import { getCloudflareEnv } from "@/lib/cloudflare";
import { getAdminUserId } from "@/lib/admin";
import { claimSeasonalPush } from "@/lib/repo-misc";
import { notifyCanton } from "@/lib/push-notify";
import { activeSeasonalCampaigns, SEASONAL_CAMPAIGNS } from "@/lib/seasonal-push";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * /api/cron/seasonal-push — naptár-vezérelt szezonális push (Krankenkasse-határidő,
 * tanévkezdés, karácsonyi repjegy). Naponta fut; minden kampány ÉVENTE EGYSZER megy ki
 * (idempotencia: seasonal_push_log). A „daily" (re-engagement) kategóriára opt-inolt
 * feliratkozók kapják → tiszteletben tartja a push-preferenciát.
 *
 *   • Külső ütemező (cron-job.org) → `Authorization: Bearer <CRON_SECRET>`
 *   • Admin → manuális; `?force=<id>` (pl. ?force=krankenkasse) az időablak + claim
 *     megkerülésével KIKÜLDI a kampányt (teszthez).
 */
async function handle(req: Request): Promise<Response> {
  const env = getCloudflareEnv() as unknown as { CRON_SECRET?: string; VAPID_PRIVATE_KEY?: string };
  const auth = req.headers.get("authorization") ?? "";
  const okSecret = !!env.CRON_SECRET && auth === `Bearer ${env.CRON_SECRET}`;
  const okAdmin = okSecret ? false : !!(await getAdminUserId());
  if (!okSecret && !okAdmin) return new Response("Unauthorized", { status: 401 });

  if (!env.VAPID_PRIVATE_KEY) return Response.json({ ok: true, skipped: "no-vapid" });

  const send = (c: { title: string; body: string; url: string }) =>
    notifyCanton(null, { title: c.title, body: c.body, url: `https://kinti.app${c.url}` }, "daily");

  try {
    // Admin teszt: ?force=<id> — időablak + idempotencia megkerülésével küld.
    const force = okAdmin ? new URL(req.url).searchParams.get("force") : null;
    if (force) {
      const c = SEASONAL_CAMPAIGNS.find((x) => x.id === force);
      if (!c) return Response.json({ ok: false, error: "ismeretlen kampány" }, { status: 400 });
      const r = await send(c);
      return Response.json({ ok: true, forced: c.id, ...r });
    }

    const year = new Date().getUTCFullYear();
    const active = activeSeasonalCampaigns();
    const results: { id: string; sent?: number; total?: number; skipped?: string }[] = [];
    for (const c of active) {
      // Idempotencia: csak az első futáskor (évente) megy ki.
      const claimed = await claimSeasonalPush(`${c.id}-${year}`);
      if (!claimed) { results.push({ id: c.id, skipped: "already-sent" }); continue; }
      const r = await send(c);
      results.push({ id: c.id, sent: r.sent, total: r.total });
    }
    return Response.json({ ok: true, year, active: active.map((c) => c.id), results });
  } catch (err) {
    safeLogError("seasonal-push", err);
    const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
