import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { listPushSubscriptions, deletePushSubscription } from "@/lib/repo";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { sendPush } from "@/lib/push";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/push/notify — ADMIN-only. Push-értesítés kiküldése a feliratkozóknak.
 * Body: { cantonCode?: string }  — ha megadod, csak az adott kanton (+ az
 * „egész Svájc" feliratkozói) kapják; egyébként mindenki (broadcast).
 *
 * A push payload nélküli (a service worker általános „új esemény" értesítést
 * mutat), a célzás itt, szerver-oldalon történik.
 */
export async function POST(req: Request) {
  const adminId = await getAdminUserId();
  if (!adminId) {
    return NextResponse.json({ error: "Csak admin." }, { status: 403 });
  }

  const env = getCloudflareEnv();
  if (!env.VAPID_PRIVATE_KEY) {
    return NextResponse.json(
      { error: "Hiányzik a VAPID_PRIVATE_KEY titok." },
      { status: 500 },
    );
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    /* üres body = broadcast */
  }
  const cantonCode = typeof body.cantonCode === "string" && body.cantonCode !== "all"
    ? body.cantonCode
    : null;

  const subs = await listPushSubscriptions(cantonCode);

  let sent = 0;
  let removed = 0;
  let failed = 0;

  await Promise.all(
    subs.map(async (s) => {
      try {
        const status = await sendPush(env.VAPID_PRIVATE_KEY!, { endpoint: s.endpoint });
        if (status >= 200 && status < 300) sent++;
        else if (status === 404 || status === 410) {
          await deletePushSubscription(s.endpoint);
          removed++;
        } else failed++;
      } catch {
        failed++;
      }
    }),
  );

  return NextResponse.json(
    { ok: true, total: subs.length, sent, removed, failed },
    { headers: { "cache-control": "no-store" } },
  );
}
