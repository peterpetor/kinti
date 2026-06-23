import { getCloudflareEnv } from "@/lib/cloudflare";
import { getAdminUserId } from "@/lib/admin";
import { getStreakSaveTargets, markStreakSaveSent, deletePushSubscription } from "@/lib/repo-misc";
import { sendPush, type PushPayload } from "@/lib/push";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET|POST /api/cron/streak-save — streak-mentő push (veszteség-averzió).
 *
 * Esténként fut (külső ütemező, pl. ~19:30 CET). Azoknak szól, akik TEGNAP
 * voltak aktívak (ma még nem → a sorozatuk ma szakadhat meg), elég hosszú
 * sorozattal (≥3). A „tegnap"/„ma" Europe/Zurich szerint számolva, hogy egyezzen
 * a kliens helyi-dátumú streakjével (CH+AT azonos időzóna). Idempotens:
 * feliratkozásonként napi egy mentő-push.
 *
 * Auth: `Authorization: Bearer <CRON_SECRET>` (külső ütemező), VAGY admin.
 */
const MIN_STREAK = 3;

function buildPayload(streak: number): PushPayload {
  return {
    title: `🔥 Ne veszítsd el a ${streak} napos sorozatod!`,
    body: "Egy gyors kvíz, és ma is megvan. Még belefér az estédbe.",
    url: "/kviz",
  };
}

/** YYYY-MM-DD az adott időpontból Europe/Zurich időzóna szerint. */
function zurichDay(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zurich" }).format(d);
}

async function handle(req: Request): Promise<Response> {
  const env = getCloudflareEnv() as unknown as { CRON_SECRET?: string; VAPID_PRIVATE_KEY?: string };
  const auth = req.headers.get("authorization") ?? "";
  const okSecret = !!env.CRON_SECRET && auth === `Bearer ${env.CRON_SECRET}`;
  const okAdmin = okSecret ? false : !!(await getAdminUserId());
  if (!okSecret && !okAdmin) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!env.VAPID_PRIVATE_KEY) {
    return Response.json({ ok: false, error: "VAPID_PRIVATE_KEY missing" }, { status: 503 });
  }

  const now = new Date();
  const today = zurichDay(now);
  const yesterday = zurichDay(new Date(now.getTime() - 86_400_000));

  let sent = 0;
  let removed = 0;
  try {
    const targets = await getStreakSaveTargets(yesterday, today, MIN_STREAK);
    for (const t of targets) {
      try {
        const status = await sendPush(
          env.VAPID_PRIVATE_KEY,
          { endpoint: t.endpoint, p256dh: t.p256dh, auth: t.auth },
          buildPayload(t.streak_len),
        );
        if (status === 404 || status === 410) {
          await deletePushSubscription(t.endpoint);
          removed++;
        } else {
          sent++;
          await markStreakSaveSent(t.endpoint, today);
        }
      } catch (err) {
        safeLogError("streak-save push", err);
      }
    }
  } catch (err) {
    safeLogError("streak-save", err);
    return Response.json({ ok: false, error: "internal" }, { status: 500 });
  }

  return Response.json({ ok: true, today, sent, removed });
}

export const GET = handle;
export const POST = handle;
