import { NextResponse } from "next/server";
import { verifyPaddleSignature } from "@/lib/paddle";
import { entitlementFromPriceId, type EntitlementType } from "@/lib/payments-config";
import { getDB } from "@/lib/cloudflare";
import { upsertSubscription } from "@/lib/subscriptions";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";

/**
 * POST /api/webhooks/paddle — Paddle (Billing) webhook.
 *
 * Aláírás-ellenőrzés (HMAC) után a FIZETETT Price ID-ból vezeti le a
 * jogosultságot (entitlementFromPriceId), NEM a custom_data-ból → nem
 * hamisítható (olcsót fizetve drágát aktiválni). A custom_data csak a célt
 * azonosítja (businessId/jobId/userId), amit a checkout szerver-oldalon validált.
 */

interface PaddleCustomData {
  jobId?: string;
  businessId?: string;
  userId?: string;
}

interface PaddleEventData {
  custom_data?: PaddleCustomData;
  items?: Array<{ price?: { id?: string }; price_id?: string }>;
  status?: string;
  id?: string | number;
  customer_id?: string | number;
  current_billing_period?: { ends_at?: string };
  next_billed_at?: string;
}

interface PaddleEvent {
  event_type?: string;
  data?: PaddleEventData;
}

export async function POST(req: Request) {
  const raw = await req.text();
  const valid = await verifyPaddleSignature(raw, req.headers.get("paddle-signature"));
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: PaddleEvent;
  try {
    event = JSON.parse(raw) as PaddleEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = event?.event_type as string | undefined;
  const data = event?.data ?? {};
  const customData = data.custom_data ?? {};
  const priceId = data.items?.[0]?.price?.id ?? data.items?.[0]?.price_id;
  const entitlement = entitlementFromPriceId(priceId);

  try {
    switch (eventType) {
      // Egyszeri vásárlás (kiemelt állás). Az előfizetéseket a subscription.* kezeli.
      case "transaction.completed":
        if (entitlement === "job_featured") await activate("job_featured", customData, data);
        break;

      // Előfizetés él → aktiválás.
      case "subscription.created":
      case "subscription.activated":
        if (entitlement === "business_pro" || entitlement === "user_pro") {
          await activate(entitlement, customData, data);
        }
        break;

      // Előfizetés vége / szünet → deaktiválás.
      case "subscription.canceled":
      case "subscription.paused":
        if (entitlement === "business_pro" || entitlement === "user_pro") {
          await deactivate(entitlement, customData, data);
        }
        break;

      default:
        // egyéb esemény → no-op
        break;
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    safeLogError("[webhooks/paddle] processing", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function activate(type: EntitlementType, customData: PaddleCustomData, data: PaddleEventData) {
  const db = getDB();
  const now = new Date().toISOString();

  if (type === "job_featured" && customData.jobId) {
    // A „Kiemelt Állás" 30 napig él; a featured_until lejárta után a napi cron
    // (unfeatureExpiredJobs) állítja vissza 'active'-ra.
    const featuredUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await db.prepare("UPDATE jobs SET status = 'featured', featured_until = ?, updated_at = ? WHERE id = ?")
      .bind(featuredUntil, now, customData.jobId).run();
  } else if (type === "business_pro" && customData.businessId) {
    await db.prepare("UPDATE businesses SET featured = 1, updated_at = ? WHERE id = ?")
      .bind(now, customData.businessId).run();
  } else if (type === "user_pro" && customData.userId) {
    await upsertSubscription({
      userId: customData.userId,
      status: data.status || "active",
      plan: "kinti_pro",
      lsSubscriptionId: data.id?.toString() ?? null,
      lsCustomerId: data.customer_id?.toString() ?? null,
      currentPeriodEnd: data.current_billing_period?.ends_at || data.next_billed_at || null,
    });
  }
}

async function deactivate(type: EntitlementType, customData: PaddleCustomData, data: PaddleEventData) {
  const db = getDB();
  const now = new Date().toISOString();

  if (type === "business_pro" && customData.businessId) {
    await db.prepare("UPDATE businesses SET featured = 0, updated_at = ? WHERE id = ?")
      .bind(now, customData.businessId).run();
  } else if (type === "user_pro" && customData.userId) {
    await upsertSubscription({
      userId: customData.userId,
      status: data.status || "canceled",
      plan: "kinti_pro",
      lsSubscriptionId: data.id?.toString() ?? null,
      lsCustomerId: data.customer_id?.toString() ?? null,
      currentPeriodEnd: data.current_billing_period?.ends_at || new Date().toISOString(),
    });
  }
}
