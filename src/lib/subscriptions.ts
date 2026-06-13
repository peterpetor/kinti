/**
 * Kinti PRO előfizetés-réteg. Az identitás a Clerk userId; a státuszt a
 * Lemon Squeezy webhook frissíti (src/app/api/webhooks/lemonsqueezy).
 *
 * A gate bekapcsolása env-flaggel: amíg `PRO_ENFORCED !== "true"`, a PRO
 * funkciók MINDENKINEK elérhetők (különben élő fizetés nélkül senki sem
 * tudná használni őket). Ha él a Lemon Squeezy, a flag bekapcsolásával
 * aktiválódik a zárolás — kódváltoztatás nélkül.
 */
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getDB } from "./cloudflare";

export interface Subscription {
  userId: string;
  status: string;
  plan: string | null;
  lsSubscriptionId: string | null;
  lsCustomerId: string | null;
  currentPeriodEnd: string | null;
}

interface SubscriptionRow {
  user_id: string; status: string; plan: string | null;
  ls_subscription_id: string | null; ls_customer_id: string | null;
  current_period_end: string | null;
}

function toSubscription(r: SubscriptionRow): Subscription {
  return {
    userId: r.user_id, status: r.status, plan: r.plan,
    lsSubscriptionId: r.ls_subscription_id, lsCustomerId: r.ls_customer_id,
    currentPeriodEnd: r.current_period_end,
  };
}

/** Aktív hozzáférést adó státuszok. */
const ACTIVE_STATUSES = new Set(["active", "on_trial"]);

export async function getSubscription(userId: string): Promise<Subscription | null> {
  try {
    const row = await getDB()
      .prepare("SELECT * FROM subscriptions WHERE user_id = ? LIMIT 1")
      .bind(userId)
      .first<SubscriptionRow>();
    return row ? toSubscription(row) : null;
  } catch {
    return null;
  }
}

/**
 * PRO-e a felhasználó? Aktív/trial státusz VAGY a periódus vége még a jövőben
 * (lemondott, de a végéig járó hozzáférés). Hiba/nincs előfizetés → false.
 */
export async function isPro(userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false;
  const sub = await getSubscription(userId);
  if (!sub) return false;
  if (ACTIVE_STATUSES.has(sub.status)) return true;
  if (sub.currentPeriodEnd && new Date(sub.currentPeriodEnd).getTime() > Date.now()) return true;
  return false;
}

/**
 * PRO oldal-guard szerver-komponensekhez (egységes a szótár-leckék isPro-
 * ellenőrzésével): nem-bejelentkezettet a loginra, nem-PRO-t a /pro vásárló-
 * oldalra irányít. Mivel a Lemon Squeezy él, mindig zárol (nincs env-flag).
 */
export async function requirePro(
  currentPath: string,
  upgradePath: string = "/pro",
): Promise<void> {
  const { userId } = await auth();
  if (!userId) {
    redirect(`/belepes?redirect_url=${encodeURIComponent(currentPath)}`);
  }
  if (!(await isPro(userId))) {
    redirect(upgradePath);
  }
}

export interface UpsertSubscriptionInput {
  userId: string;
  status: string;
  plan: string | null;
  lsSubscriptionId: string | null;
  lsCustomerId: string | null;
  currentPeriodEnd: string | null;
}

/** A webhook hívja: az előfizetés-állapot beírása/frissítése a userId-re. */
export async function upsertSubscription(input: UpsertSubscriptionInput): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO subscriptions
         (id, user_id, status, plan, ls_subscription_id, ls_customer_id, current_period_end, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(user_id) DO UPDATE SET
         status = excluded.status,
         plan = excluded.plan,
         ls_subscription_id = excluded.ls_subscription_id,
         ls_customer_id = excluded.ls_customer_id,
         current_period_end = excluded.current_period_end,
         updated_at = datetime('now')`,
    )
    .bind(
      crypto.randomUUID(), input.userId, input.status, input.plan,
      input.lsSubscriptionId, input.lsCustomerId, input.currentPeriodEnd,
    )
    .run();
}
