import { NextResponse } from "next/server";
import { verifySignature } from "@/lib/lemonsqueezy";
import { getDB } from "@/lib/cloudflare";
import { clerkClient } from "@clerk/nextjs/server";
import { upsertSubscription } from "@/lib/subscriptions";

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

  const eventName = event.meta.event_name;
  const customData = event.data.attributes.first_order_item?.custom_data || event.meta.custom_data || {};
  const data = event.data.attributes;

  try {
    switch (eventName) {
      case "order_created":
      case "subscription_created":
        await handleSuccessfulPayment(customData, data);
        break;
      
      case "subscription_cancelled":
      case "subscription_expired":
        await handleSubscriptionEnded(customData, data);
        break;
      
      // További események (pl. refund) kezelése ide kerülhet
      default:
        console.log(`Unhandled Lemon Squeezy event: ${eventName}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function handleSuccessfulPayment(customData: any, data: any) {
  const db = getDB();
  const now = new Date().toISOString();

  // Kiemelt Álláshirdetés
  if (customData.type === "job_featured" && customData.jobId) {
    // 30 napos kiemelés beállítása
    await db.prepare(
      "UPDATE jobs SET status = 'featured', updated_at = ? WHERE id = ?"
    ).bind(now, customData.jobId).run();
  }
  
  // Szaknévsor PRO (Vállalkozás Kiemelés)
  else if (customData.type === "business_pro" && customData.businessId) {
    await db.prepare(
      "UPDATE businesses SET featured = 1, updated_at = ? WHERE id = ?"
    ).bind(now, customData.businessId).run();
  }

  // Kinti PRO (Magánszemély)
  else if (customData.type === "user_pro" && customData.userId) {
    try {
      await upsertSubscription({
        userId: customData.userId,
        status: data.status || "active",
        plan: "kinti_pro",
        lsSubscriptionId: data.order_id?.toString() || data.id?.toString(),
        lsCustomerId: data.customer_id?.toString(),
        currentPeriodEnd: data.renews_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      
      await (await clerkClient()).users.updateUserMetadata(customData.userId, {
        publicMetadata: {
          isPro: true,
        },
      });
      console.log(`User PRO activated in Clerk for user: ${customData.userId}`);
    } catch (e) {
      console.error("Failed to update Clerk user metadata for PRO:", e);
    }
  }
}

async function handleSubscriptionEnded(customData: any, data: any) {
  const db = getDB();
  const now = new Date().toISOString();

  // Szaknévsor PRO lejárat
  if (customData.type === "business_pro" && customData.businessId) {
    await db.prepare(
      "UPDATE businesses SET featured = 0, updated_at = ? WHERE id = ?"
    ).bind(now, customData.businessId).run();
  }

  // Kinti PRO lejárat
  else if (customData.type === "user_pro" && customData.userId) {
    try {
      await upsertSubscription({
        userId: customData.userId,
        status: data.status || "expired",
        plan: "kinti_pro",
        lsSubscriptionId: data.order_id?.toString() || data.id?.toString(),
        lsCustomerId: data.customer_id?.toString(),
        currentPeriodEnd: data.renews_at || new Date().toISOString(),
      });

      await (await clerkClient()).users.updateUserMetadata(customData.userId, {
        publicMetadata: {
          isPro: false,
        },
      });
      console.log(`User PRO expired in Clerk for user: ${customData.userId}`);
    } catch (e) {
      console.error("Failed to update Clerk user metadata for PRO expiration:", e);
    }
  }
}
