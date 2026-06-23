import { getDB } from "./cloudflare";

export interface NewsletterSubscriber {
  id: string;
  email: string;
  country: string;
  confirmToken: string;
  manageToken: string;
  confirmedAt: string | null;
  createdAt: string;
}

export async function createNewsletterSubscriber(input: {
  email: string;
  country: string;
  confirmToken: string;
  manageToken: string;
}): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO newsletter_subscribers (id, email, country, confirm_token, manage_token)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(email) DO UPDATE SET
         country = excluded.country,
         confirm_token = excluded.confirm_token,
         manage_token = excluded.manage_token,
         confirmed_at = NULL`
    )
    .bind(
      crypto.randomUUID(),
      input.email,
      input.country,
      input.confirmToken,
      input.manageToken
    )
    .run();
}

export async function confirmNewsletterSubscription(confirmToken: string): Promise<{ manageToken: string } | null> {
  const row = await getDB()
    .prepare("SELECT manage_token FROM newsletter_subscribers WHERE confirm_token = ? AND confirmed_at IS NULL")
    .bind(confirmToken)
    .first<{ manage_token: string }>();

  if (!row) return null;

  await getDB()
    .prepare("UPDATE newsletter_subscribers SET confirmed_at = datetime('now') WHERE confirm_token = ?")
    .bind(confirmToken)
    .run();

  return { manageToken: row.manage_token };
}

export async function deleteNewsletterSubscription(manageToken: string): Promise<boolean> {
  const res = await getDB()
    .prepare("DELETE FROM newsletter_subscribers WHERE manage_token = ?")
    .bind(manageToken)
    .run();
  return res.meta.changes > 0;
}

/** Megerősített feliratkozók (opcionálisan ország-KÓD szerint szűrve) — a hírlevél-küldéshez. */
export async function listConfirmedNewsletterSubscribers(
  country?: string | null,
): Promise<{ email: string; manageToken: string }[]> {
  const filter = !!country && country !== "all";
  const sql = `SELECT email, manage_token FROM newsletter_subscribers
               WHERE confirmed_at IS NOT NULL ${filter ? "AND country = ?" : ""}
               ORDER BY confirmed_at DESC`;
  const stmt = getDB().prepare(sql);
  const { results } = await (filter ? stmt.bind(country) : stmt).all<{ email: string; manage_token: string }>();
  return results.map((r) => ({ email: r.email, manageToken: r.manage_token }));
}

/** Megerősített feliratkozók száma ország-KÓDonként (admin-előnézethez). */
export async function countConfirmedNewsletterSubscribersByCountry(): Promise<Record<string, number>> {
  const { results } = await getDB()
    .prepare("SELECT country, COUNT(*) AS n FROM newsletter_subscribers WHERE confirmed_at IS NOT NULL GROUP BY country")
    .all<{ country: string; n: number }>();
  const out: Record<string, number> = {};
  for (const r of results) out[r.country] = r.n;
  return out;
}
