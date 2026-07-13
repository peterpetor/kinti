import { NextResponse } from "next/server";
import { getDB, getCloudflareEnv } from "@/lib/cloudflare";
import { activateEntitlement, deactivateEntitlement } from "@/lib/entitlements";
import { isPlayConfigured, getSubscriptionState } from "@/lib/google-play";
import type { EntitlementType } from "@/lib/payments-config";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";

/**
 * POST /api/webhooks/play?key=... — Google Play RTDN (Real-Time Developer
 * Notifications) fogadó, Pub/Sub push-előfizetésen át.
 *
 * Beállítás (android/README.md): Play Console → Monetization setup → RTDN
 * topic → Pub/Sub push subscription erre az URL-re, a ?key= titokkal.
 *
 * BIZTONSÁGI MODELL: a push-üzenetnek NEM hiszünk — az üzenet csak trigger.
 * A tényleges állapotot MINDIG a Play Developer API-tól kérdezzük le
 * (getSubscriptionState), így hamisított push legfeljebb egy felesleges
 * Google-lekérdezést okoz, jogosultságot nem tud állítani. A ?key= titok a
 * zaj/DoS ellen van. Válasz mindig 200 (a Pub/Sub különben végtelen retry-t
 * nyomna), kivéve a rossz kulcsot (401).
 */

interface RtdnPayload {
  subscriptionNotification?: {
    purchaseToken?: string;
    subscriptionId?: string;
    notificationType?: number;
  };
  oneTimeProductNotification?: {
    purchaseToken?: string;
  };
}

export async function POST(req: Request) {
  // Titok-ellenőrzés (query param — a Pub/Sub push URL részeként adjuk meg).
  let secret: string | undefined;
  try {
    secret = (getCloudflareEnv() as { PLAY_RTDN_SECRET?: string }).PLAY_RTDN_SECRET;
  } catch {
    secret = process.env.PLAY_RTDN_SECRET;
  }
  const key = new URL(req.url).searchParams.get("key");
  if (!secret || key !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isPlayConfigured()) return NextResponse.json({ ok: true, skipped: "not-configured" });

  try {
    // Pub/Sub boríték: { message: { data: base64(JSON) } }
    const envelope = (await req.json()) as { message?: { data?: string } };
    const raw = envelope?.message?.data;
    if (!raw) return NextResponse.json({ ok: true, skipped: "no-data" });

    let payload: RtdnPayload;
    try {
      payload = JSON.parse(atob(raw)) as RtdnPayload;
    } catch {
      return NextResponse.json({ ok: true, skipped: "bad-payload" });
    }

    const token = payload.subscriptionNotification?.purchaseToken;
    if (!token) {
      // Egyszeri termék (job_featured) élete a vásárláskor lezárul — a 30 nap
      // lejáratát a meglévő napi cron kezeli; itt nincs teendő.
      return NextResponse.json({ ok: true, skipped: "not-subscription" });
    }

    // A token → cél leképezés a verify-kor tárolt sorból.
    const row = await getDB()
      .prepare("SELECT product_id, entitlement, ref_id, user_id FROM play_purchases WHERE purchase_token = ? LIMIT 1")
      .bind(token)
      .first<{ product_id: string; entitlement: EntitlementType; ref_id: string | null; user_id: string | null }>();
    if (!row) return NextResponse.json({ ok: true, skipped: "unknown-token" });

    // A VALÓS állapot a Google-tól (a push tartalmának nem hiszünk).
    const sub = await getSubscriptionState(token);
    const target = {
      userId: row.user_id ?? undefined,
      businessId: row.entitlement === "business_pro" ? row.ref_id ?? undefined : undefined,
    };
    const meta = {
      status: sub.active ? "active" : "canceled",
      subscriptionId: `play:${token.slice(0, 24)}`,
      customerId: null,
      currentPeriodEnd: sub.expiryTime,
    };

    if (sub.active) {
      await activateEntitlement(row.entitlement, target, meta);
    } else {
      // Lejárt/lemondott — de a már KIFIZETETT időszak végéig jár: user_pro-nál
      // a subscriptions.current_period_end őrzi ezt (isPro nézi); business_pro-nál
      // csak tényleges lejáratkor kapcsolunk le.
      const stillPaid = sub.expiryTime && new Date(sub.expiryTime).getTime() > Date.now();
      if (row.entitlement === "user_pro" || !stillPaid) {
        await deactivateEntitlement(row.entitlement, target, meta);
      }
    }

    await getDB()
      .prepare("UPDATE play_purchases SET status = ?, expiry_time = ?, updated_at = datetime('now') WHERE purchase_token = ?")
      .bind(sub.active ? "active" : "canceled", sub.expiryTime, token)
      .run();

    return NextResponse.json({ ok: true });
  } catch (error) {
    safeLogError("[webhooks/play]", error);
    // 200: a Pub/Sub retry-storm elkerülése — a hibát a monitoring látja.
    return NextResponse.json({ ok: false });
  }
}
