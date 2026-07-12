import { getCloudflareEnv } from "@/lib/cloudflare";
import { getAdminUserId } from "@/lib/admin";
import { claimDailyNudge, getWeeklyOpsCounts, getFeatureUsageStats } from "@/lib/repo-misc";
import { moderationCount } from "@/lib/repo-spam";
import { sendModerationReminderEmail } from "@/lib/email";
import { getWeeklyCountryScoreCounts } from "@/lib/repo-quiz-stats";
import { buildWeeklyReport } from "@/lib/weekly-report";
import { sendWeeklyOpsReportEmail } from "@/lib/email";
import { unfeatureExpiredJobs, expireOldJobs } from "@/lib/repo-jobs";
import { battleRanking, BATTLE_MIN_COUNTRY } from "@/lib/quiz-battle";
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
  { title: "📅 Mi újság ma a Kintin?", body: "Friss állások, szakik és hírek a környékeden.", url: "/" },
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

  // Piggyback: a LEJÁRT „Kiemelt Állás"-ok visszaállítása 'active'-ra (30 nap után),
  // majd a LEJÁRT hirdetések lezárása ('expired' — kikerülnek a publikus listából,
  // de a munkáltató 1 kattintással megújíthatja). Sorrend fontos: az imént
  // demote-olt 'active' sor is elbírálásra kerül ugyanebben a körben, ha az
  // expires_at is lejárt már. Saját try/catch — sose törheti a napi nudge-ot.
  try { await unfeatureExpiredJobs(); } catch (err) { safeLogError("daily-nudge:unfeature", err); }
  try { await expireOldJobs(); } catch (err) { safeLogError("daily-nudge:expire", err); }

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

  // HÉTFŐ: heti operátori pulzus-email az adminnak (a claim UTÁN vagyunk → napi
  // egyszer fut). Best-effort: sose törheti a napi nudge-ot. Címzett az
  // ADMIN_EMAILS első címe (az admin-notify mintája).
  if (now.getUTCDay() === 1) {
    try {
      const envFull = getCloudflareEnv() as unknown as { ADMIN_EMAILS?: string; RESEND_API_KEY?: string };
      const adminEmail = (envFull.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim()).filter(Boolean)[0];
      if (adminEmail && envFull.RESEND_API_KEY) {
        const [counts, usage] = await Promise.all([getWeeklyOpsCounts(), getFeatureUsageStats(7)]);
        const report = buildWeeklyReport(
          counts,
          usage.rows.map((r) => ({ event: r.event, count: r.count ?? 0 })),
          now,
        );
        await sendWeeklyOpsReportEmail({ to: adminEmail, report });
      }
    } catch (err) {
      safeLogError("daily-nudge:weekly-report", err);
    }
  }

  // NAPI moderációs emlékeztető (a claim után → naponta egyszer): ha bármi vár
  // a sorban, rövid email az adminnak — az ÁSZF „tipikusan 24 órán belül"
  // ígéretének motorja; a Keresek-jóváhagyás ráadásul lead-routingot indít.
  // Üres sornál CSEND (nincs email-zaj). Best-effort, sose töri a nudge-ot.
  try {
    const envFull = getCloudflareEnv() as unknown as { ADMIN_EMAILS?: string; RESEND_API_KEY?: string; PUBLIC_BASE_URL?: string };
    const adminEmail = (envFull.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim()).filter(Boolean)[0];
    if (adminEmail && envFull.RESEND_API_KEY) {
      const [reviews, businesses, requests, stories] = await Promise.all([
        moderationCount("reviews", 0),
        moderationCount("businesses", 0),
        moderationCount("service_requests", 0),
        moderationCount("stories", 0),
      ]);
      if (reviews + businesses + requests + stories > 0) {
        const base = envFull.PUBLIC_BASE_URL?.replace(/\/$/, "") || "https://kinti.app";
        await sendModerationReminderEmail({
          to: adminEmail,
          reviews, businesses, requests, stories,
          moderationUrl: `${base}/admin/moderation`,
        });
      }
    }
  } catch (err) {
    safeLogError("daily-nudge:moderation-reminder", err);
  }

  // Munkáltatói lejárat-értesítők (a fenti expireOldJobs UTÁN fut, így a ma
  // lejártak még ma kapnak „újítsd meg" emailt): (1) 3 napon belül lejáró
  // aktív hirdetés → figyelmeztető; (2) frissen lejárt → megújítás-hívó.
  // Mindkettő EGYSZER megy hirdetésenként (időbélyeg-őr, kudarcnál is jelölünk
  // — a napi újra-próbálkozó spam ellen); a limit a Resend-keret védelme.
  try {
    const { getJobsExpiringSoon, markJobExpiryWarned, getJobsJustExpired, markJobExpiryNotified } =
      await import("@/lib/repo-jobs");
    const { sendJobExpiryWarningEmail, sendJobExpiredEmail } = await import("@/lib/email");
    const fmtHu = (iso: string | null) => {
      const d = iso ? new Date(iso.replace(" ", "T") + (iso.endsWith("Z") ? "" : "Z")) : null;
      return d && !Number.isNaN(d.getTime())
        ? d.toLocaleDateString("hu-HU", { year: "numeric", month: "long", day: "numeric" })
        : undefined;
    };
    for (const j of await getJobsExpiringSoon(15)) {
      try {
        await sendJobExpiryWarningEmail({
          to: j.employerEmail, companyName: j.companyName, jobTitle: j.title, expiresOn: fmtHu(j.expiresAt),
        });
      } catch (e) {
        safeLogError(`daily-nudge:job-expiry-warn [${j.id}]`, e);
      } finally {
        await markJobExpiryWarned(j.id);
      }
    }
    for (const j of await getJobsJustExpired(15)) {
      try {
        await sendJobExpiredEmail({ to: j.employerEmail, companyName: j.companyName, jobTitle: j.title });
      } catch (e) {
        safeLogError(`daily-nudge:job-expired [${j.id}]`, e);
      } finally {
        await markJobExpiryNotified(j.id);
      }
    }
  } catch (err) {
    safeLogError("daily-nudge:job-expiry", err);
  }

  // Üzenet-rotáció a nap sorszáma szerint (determinisztikus, nincs Math.random).
  const dayIndex = Math.floor(now.getTime() / 86_400_000);
  let payload = NUDGES[dayIndex % NUDGES.length];

  // VASÁRNAP: a nudge a heti Kvíz-csata összefoglalója (közösségi büszkeség-hurok,
  // az Országok/Régiók Harca visszahívója) — de CSAK ha van kimutatható verseny
  // (min-minta kapun átjutó ≥2 ország), különben marad a sima rotáció. Üres
  // táblára sosem hívunk (presence-heatmap tanulság). Plusz push-volumen nincs:
  // a napi egy nudge-ot váltja, nem tetézi.
  if (now.getUTCDay() === 0) {
    try {
      const ranking = battleRanking(await getWeeklyCountryScoreCounts(), BATTLE_MIN_COUNTRY);
      if (ranking.length >= 2) {
        payload = {
          title: "🏆 Heti Kvíz-csata: így áll a csapatod!",
          body: "Országok és régiók harca — nézd meg az állást, és erősíts rá egy játékkal!",
          url: "/ranglista",
        };
      }
    } catch (err) {
      safeLogError("daily-nudge:battle", err);
    }
  }

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
