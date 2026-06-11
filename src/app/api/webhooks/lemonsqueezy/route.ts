import { NextResponse } from "next/server";
import { verifySignature } from "@/lib/lemonsqueezy";
import { getDB } from "@/lib/cloudflare";

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
    // Meg kell nézni, hol tároljuk a user szintű előfizetéseket.
    // Ha van subscriptions tábla, oda szúrjuk be.
    // Egyelőre console log, amíg az adatbázis séma tisztázódik.
    console.log(`User PRO activated for user: ${customData.userId}`);
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
    console.log(`User PRO expired for user: ${customData.userId}`);
  }
}
