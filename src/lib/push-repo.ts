import { getDb } from "./cloudflare";

export interface PushSubscriptionRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  canton_code: string | null;
  created_at: string;
}

export async function addPushSubscription(
  endpoint: string,
  p256dh: string,
  auth: string,
  cantonCode: string | null = null,
): Promise<void> {
  const db = getDb();
  const id = crypto.randomUUID();
  
  await db
    .prepare(
      `INSERT INTO push_subscriptions (id, endpoint, p256dh, auth, canton_code) 
       VALUES (?, ?, ?, ?, ?) 
       ON CONFLICT(endpoint) DO UPDATE SET p256dh=excluded.p256dh, auth=excluded.auth, canton_code=excluded.canton_code`
    )
    .bind(id, endpoint, p256dh, auth, cantonCode)
    .run();
}

export async function removePushSubscription(endpoint: string): Promise<void> {
  const db = getDb();
  await db.prepare("DELETE FROM push_subscriptions WHERE endpoint = ?").bind(endpoint).run();
}

export async function getPushSubscriptions(cantonCode: string | null = null): Promise<PushSubscriptionRow[]> {
  const db = getDb();
  if (cantonCode) {
    const { results } = await db
      .prepare("SELECT * FROM push_subscriptions WHERE canton_code = ? OR canton_code IS NULL")
      .bind(cantonCode)
      .all<PushSubscriptionRow>();
    return results;
  } else {
    const { results } = await db.prepare("SELECT * FROM push_subscriptions").all<PushSubscriptionRow>();
    return results;
  }
}
