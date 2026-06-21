import { NextResponse } from "next/server";
import { verifySignature } from "@/lib/lemonsqueezy";
import { getDB } from "@/lib/cloudflare";
import { upsertSubscription } from "@/lib/subscriptions";
import { entitlementFromVariantId, type EntitlementType } from "@/lib/payments-config";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get("x-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 401 });
  }

  const isValid = await verifySignature(payload, signature);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(payload);
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventName = event.meta?.event_name;
  const data = event.data?.attributes ?? {};
  const customData = data.first_order_item?.custom_data || event.meta?.custom_data || {};

  // BIZTONSÁG: a jogosultság-típust a FIZETETT variantból vezetjük le, NEM a
  // kliens-megadta `custom_data.type`-ból. Az utóbbi a Lemon Squeezy publikus
  // checkout-URL custom-data paraméterein át hamisítható lenne (olcsó terméket
  // fizetve drága jogosultságot aktiválni). Ismeretlen variant → nem aktiválunk.
  const entitlement = entitlementFromVariantId(
    data.first_order_item?.variant_id ?? data.variant_id,
  );

  try {
    switch (eventName) {
      case "order_created":
      case "subscription_created":
        if (entitlement) await handleSuccessfulPayment(entitlement, customData, data);
        else console.log("[lemonsqueezy] Ismeretlen variant — aktiválás kihagyva.");
        break;

      case "subscription_cancelled":
      case "subscription_expired":
        if (entitlement) await handleSubscriptionEnded(entitlement, customData, data);
        break;
      
      // További események (pl. refund) kezelése ide kerülhet
      default:
        console.log(`Unhandled Lemon Squeezy event: ${eventName}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    safeLogError("[webhooks/lemonsqueezy] processing", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function handleSuccessfulPayment(type: EntitlementType, customData: any, data: any) {
  const db = getDB();
  const now = new Date().toISOString();

  // Kiemelt Álláshirdetés
  if (type === "job_featured" && customData.jobId) {
    // 30 napos kiemelés beállítása
    await db.prepare(
      "UPDATE jobs SET status = 'featured', updated_at = ? WHERE id = ?"
    ).bind(now, customData.jobId).run();
  }

  // Szaknévsor PRO (Vállalkozás Kiemelés)
  else if (type === "business_pro" && customData.businessId) {
    await db.prepare(
      "UPDATE businesses SET featured = 1, updated_at = ? WHERE id = ?"
    ).bind(now, customData.businessId).run();
  }

  // Kinti PRO (Magánszemély)
  else if (type === "user_pro" && customData.userId) {
    try {
      await upsertSubscription({
        userId: customData.userId,
        status: data.status || "active",
        plan: "kinti_pro",
        lsSubscriptionId: data.order_id?.toString() || data.id?.toString(),
        lsCustomerId: data.customer_id?.toString(),
        currentPeriodEnd: data.renews_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    } catch (e) {
      safeLogError("[webhooks/lemonsqueezy] PRO subscription upsert", e);
    }
  }
}

async function handleSubscriptionEnded(type: EntitlementType, customData: any, data: any) {
  const db = getDB();
  const now = new Date().toISOString();

  // Szaknévsor PRO lejárat
  if (type === "business_pro" && customData.businessId) {
    await db.prepare(
      "UPDATE businesses SET featured = 0, updated_at = ? WHERE id = ?"
    ).bind(now, customData.businessId).run();
  }

  // Kinti PRO lejárat
  else if (type === "user_pro" && customData.userId) {
    try {
      await upsertSubscription({
        userId: customData.userId,
        status: data.status || "expired",
        plan: "kinti_pro",
        lsSubscriptionId: data.order_id?.toString() || data.id?.toString(),
        lsCustomerId: data.customer_id?.toString(),
        currentPeriodEnd: data.renews_at || new Date().toISOString(),
      });
    } catch (e) {
      safeLogError("[webhooks/lemonsqueezy] PRO expiration upsert", e);
    }
  }
}
