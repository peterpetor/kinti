/**
 * Közös jogosultság-aktiválás — a Paddle webhook ÉS a Google Play (verify +
 * RTDN) útvonalak ugyanezt hívják, hogy a három termék aktiválása egyetlen
 * helyen éljen (ne csússzon szét a két fizetési rendszer viselkedése).
 *
 *   • job_featured  → jobs.status='featured' + featured_until/expires_at (30 nap)
 *   • business_pro  → businesses.featured=1
 *   • user_pro      → subscriptions upsert (Clerk userId-hez kötve)
 */
import { getDB } from "./cloudflare";
import { upsertSubscription } from "./subscriptions";
import { jobExpiryIso } from "./repo-jobs";
import type { EntitlementType } from "./payments-config";

export interface EntitlementTarget {
  jobId?: string;
  businessId?: string;
  userId?: string;
}

export interface SubscriptionMeta {
  status?: string;
  subscriptionId?: string | null;
  customerId?: string | null;
  currentPeriodEnd?: string | null;
}

export async function activateEntitlement(
  type: EntitlementType,
  target: EntitlementTarget,
  meta: SubscriptionMeta = {},
): Promise<void> {
  const db = getDB();
  const now = new Date().toISOString();

  if (type === "job_featured" && target.jobId) {
    // A „Kiemelt Állás" 30 napig él; a featured_until lejárta után a napi cron
    // (unfeatureExpiredJobs) állítja vissza 'active'-ra. A kiemelés a teljes
    // hirdetés lejáratát (expires_at) is felfrissíti ugyanennyivel.
    const featuredUntil = jobExpiryIso();
    await db
      .prepare("UPDATE jobs SET status = 'featured', featured_until = ?, expires_at = ?, updated_at = ? WHERE id = ?")
      .bind(featuredUntil, featuredUntil, now, target.jobId)
      .run();
  } else if (type === "business_pro" && target.businessId) {
    await db
      .prepare("UPDATE businesses SET featured = 1, updated_at = ? WHERE id = ?")
      .bind(now, target.businessId)
      .run();
    // Az előfizetés-metaadat (sub/customer id) tárolása — ebből él a céges
    // „Előfizetésem kezelése / lemondás" portál-gomb. Best-effort: a tábla
    // hiánya (migráció előtt) nem törheti az aktiválást.
    if (meta.subscriptionId) {
      try {
        await db
          .prepare(
            `INSERT INTO business_subscriptions
               (business_id, provider_sub_id, provider_customer_id, status, current_period_end, updated_at)
             VALUES (?, ?, ?, ?, ?, ?)
             ON CONFLICT(business_id) DO UPDATE SET
               provider_sub_id = excluded.provider_sub_id,
               provider_customer_id = excluded.provider_customer_id,
               status = excluded.status,
               current_period_end = excluded.current_period_end,
               updated_at = excluded.updated_at`,
          )
          .bind(
            target.businessId,
            meta.subscriptionId,
            meta.customerId ?? null,
            meta.status || "active",
            meta.currentPeriodEnd ?? null,
            now,
          )
          .run();
      } catch {
        /* metaadat-tárolás sosem törheti az aktiválást */
      }
    }
  } else if (type === "user_pro" && target.userId) {
    await upsertSubscription({
      userId: target.userId,
      status: meta.status || "active",
      plan: "kinti_pro",
      lsSubscriptionId: meta.subscriptionId ?? null,
      lsCustomerId: meta.customerId ?? null,
      currentPeriodEnd: meta.currentPeriodEnd ?? null,
    });
  }
}

export async function deactivateEntitlement(
  type: EntitlementType,
  target: EntitlementTarget,
  meta: SubscriptionMeta = {},
): Promise<void> {
  const db = getDB();
  const now = new Date().toISOString();

  if (type === "business_pro" && target.businessId) {
    await db
      .prepare("UPDATE businesses SET featured = 0, updated_at = ? WHERE id = ?")
      .bind(now, target.businessId)
      .run();
    try {
      await db
        .prepare("UPDATE business_subscriptions SET status = ?, updated_at = ? WHERE business_id = ?")
        .bind(meta.status || "canceled", now, target.businessId)
        .run();
    } catch {
      /* metaadat-frissítés best-effort */
    }
  } else if (type === "user_pro" && target.userId) {
    await upsertSubscription({
      userId: target.userId,
      status: meta.status || "canceled",
      plan: "kinti_pro",
      lsSubscriptionId: meta.subscriptionId ?? null,
      lsCustomerId: meta.customerId ?? null,
      currentPeriodEnd: meta.currentPeriodEnd ?? new Date().toISOString(),
    });
  }
}
