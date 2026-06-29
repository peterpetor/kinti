import { getCloudflareEnv } from "@/lib/cloudflare";
import { getAdminUserId } from "@/lib/admin";
import { claimDailyNudge } from "@/lib/repo-misc";
import { unfeatureExpiredJobs } from "@/lib/repo-jobs";
import { notifyCanton } from "@/lib/push-notify";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET|POST /api/cron/daily-nudge — napi „gyere vissza" push az opt-inolt
 * feliratkozóknak (notify_daily kategória). A meglévő push-kategóriák mind
 * esemény-vezéreltek; ez az EGYETLEN napi-ritmusú trigger, ami visszatereli a
 * usert a meglévő napi-hurkokra (streak, napi kvíz, nyelvlecke).
 *
 * Naponta EGYSZER futtatandó (külső ütemező, pl. cron-job.org, ~18:00). Az
 * idempotencia a `daily_nudge_log` napi-kulcsával biztosított: kettős ping sem
 * küld kétszer. Admin kézi teszthez `?force=1`.
 *
 * Auth: `Authorization: Bearer <CRON_SECRET>` (külső ütemező), VAGY admin.
 */
const NUDGES = [
  { title: "🎯 Mai kvíz vár!", body: "3 kérdés, 30 másodperc — tartsd a sorozatod!", url: "/kviz" },
  { title: "🔥 Ne szakadjon meg a sorozat", body: "Egy gyors kvíz, és ma is megvan.", url: "/kviz" },
  { title: "📅 Mi újság ma a Kintin?", body: "Friss állások, események és hírek a környékeden.", url: "/" },
  { title: "🇨🇭 Napi 2 perc német?", body: "Egy mondat Mundartul közelebb visz a beilleszkedéshez.", url: "/nyelvlecke" },
  { title: "📰 Itt a napi adag", body: "Nézd meg, mi történt ma a magyar közösségben.", url: "/" },
];

async function handle(req: Request): Promise<Response> {
  const env = getCloudflareEnv() as unknown as { CRON_SECRET?: string; VAPID_PRIVATE_KEY?: string };
  const auth = req.headers.get("authorization") ?? "";
  const okSecret = !!env.CRON_SECRET && auth === `Bearer ${env.CRON_SECRET}`;
  const okAdmin = okSecret ? false : !!(await getAdminUserId());
  if (!okSecret && !okAdmin) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Piggyback: a LEJÁRT „Kiemelt Állás"-ok visszaállítása 'active'-ra (30 nap után).
  // Saját try/catch — sose törheti a napi nudge-ot; a push-konfigtól független.
  try { await unfeatureExpiredJobs(); } catch (err) { safeLogError("daily-nudge:unfeature", err); }

  if (!env.VAPID_PRIVATE_KEY) {
    return Response.json({ ok: false, error: "VAPID_PRIVATE_KEY missing" }, { status: 503 });
  }

  const now = new Date();
  const day = now.toISOString().slice(0, 10);

  // Idempotencia: napi EGY küldés. Admin teszthíváskor ?force=1 átléphető.
  const force = new URL(req.url).searchParams.get("force") === "1" && okAdmin;
  if (!force) {
    const claimed = await claimDailyNudge(day);
    if (!claimed) return Response.json({ ok: true, skipped: "already-sent-today", day });
  }

  // Üzenet-rotáció a nap sorszáma szerint (determinisztikus, nincs Math.random).
  const dayIndex = Math.floor(now.getTime() / 86_400_000);
  const payload = NUDGES[dayIndex % NUDGES.length];

  try {
    const res = await notifyCanton(null, payload, "daily");
    return Response.json({ ok: true, day, ...res });
  } catch (err) {
    safeLogError("daily-nudge", err);
    return Response.json({ ok: false, error: "internal" }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
