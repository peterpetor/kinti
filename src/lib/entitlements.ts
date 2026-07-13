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
