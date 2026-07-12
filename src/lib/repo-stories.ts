/**
 * repo-stories.ts — „Élettörténetek" UGC-blog adatrétege (0128 migráció).
 *
 * A publikus vetületben SOHA nincs ip_hash / contact_email (privacy). A
 * moderáció a közös rendszeren fut (repo-spam: ModerationTable "stories");
 * publikálás = moderation_status 1 + published_at (a decide route állítja).
 */
import { getDB } from "./cloudflare";

export interface StoryListItem {
  id: string;
  slug: string;
  title: string;
  authorName: string;
  country: string;
  city: string | null;
  summary: string | null;
  imageKey: string | null;
  publishedAt: string | null;
}

export interface Story extends StoryListItem {
  bodyMd: string;
  moderationStatus: number;
}

interface Row {
  id: string; slug: string; title: string; author_name: string; country_code: string;
  city: string | null; summary: string | null; body_md: string; image_key: string | null;
  moderation_status: number; published_at: string | null;
}

function toListItem(r: Row): StoryListItem {
  return {
    id: r.id, slug: r.slug, title: r.title, authorName: r.author_name,
    country: r.country_code, city: r.city, summary: r.summary,
    imageKey: r.image_key, publishedAt: r.published_at,
  };
}

const COLS = "id, slug, title, author_name, country_code, city, summary, body_md, image_key, moderation_status, published_at";

/** Publikált történetek, legfrissebb elöl (opcionális ország-szűrő). */
export async function getPublishedStories(country?: string | null, limit = 50): Promise<StoryListItem[]> {
  const binds: unknown[] = [];
  let where = "moderation_status = 1";
  if (country) { where += " AND country_code = ?"; binds.push(country); }
  binds.push(limit);
  const { results } = await getDB()
    .prepare(`SELECT ${COLS} FROM stories WHERE ${where} ORDER BY published_at DESC LIMIT ?`)
    .bind(...binds)
    .all<Row>();
  return (results ?? []).map(toListItem);
}

/**
 * Egy történet slug VAGY id alapján — státusztól FÜGGETLENÜL (a hívó oldal
 * dönti el: nem-publikáltat / id-vel elértet csak admin láthat, moderációs
 * előnézetként; a slug a kanonikus publikus URL).
 */
export async function getStoryBySlug(slugOrId: string): Promise<Story | null> {
  const r = await getDB()
    .prepare(`SELECT ${COLS} FROM stories WHERE slug = ? OR id = ? LIMIT 1`)
    .bind(slugOrId, slugOrId)
    .first<Row>();
  if (!r) return null;
  return { ...toListItem(r), bodyMd: r.body_md, moderationStatus: r.moderation_status };
}

/** Mai (24h) beküldések egy ip_hash-ről — rate-limit (2/nap). */
export async function countStoriesByIp(ipHash: string | null): Promise<number> {
  if (!ipHash) return 0;
  const row = await getDB()
    .prepare(`SELECT COUNT(*) AS n FROM stories WHERE ip_hash = ? AND datetime(created_at) > datetime('now', '-1 day')`)
    .bind(ipHash)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

/** Új történet — PENDING (moderation_status=0). */
export async function createStory(input: {
  slug: string; title: string; authorName: string; country: string; city: string | null;
  summary: string | null; bodyMd: string; imageKey: string | null;
  contactEmail: string | null; ipHash: string;
}): Promise<string> {
  const id = crypto.randomUUID();
  await getDB()
    .prepare(
      `INSERT INTO stories
         (id, slug, title, author_name, country_code, city, summary, body_md, image_key,
          contact_email, ip_hash, moderation_status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'))`,
    )
    .bind(
      id, input.slug, input.title, input.authorName, input.country, input.city,
      input.summary, input.bodyMd, input.imageKey, input.contactEmail, input.ipHash,
    )
    .run();
  return id;
}

/** Jóváhagyáskor: publikálás-dátum (egyszer — újra-jóváhagyás nem írja felül). */
export async function markStoryPublished(id: string): Promise<void> {
  await getDB()
    .prepare("UPDATE stories SET published_at = COALESCE(published_at, datetime('now')) WHERE id = ?")
    .bind(id)
    .run();
}

/**
 * DSA notice-and-action: bejelentéskor a történet azonnal eltűnik a publikumból
 * (moderation_status=0 — vissza a moderációs sorba is), keep visszaállítja.
 */
export async function setStoryPublicVisibility(id: string, visible: boolean): Promise<void> {
  await getDB()
    .prepare("UPDATE stories SET moderation_status = ? WHERE id = ?")
    .bind(visible ? 1 : 0, id)
    .run();
}

/** Végleges törlés (DSA remove) — a hívó felel az R2-borítókép takarításáért. */
export async function deleteStoryById(id: string): Promise<string | null> {
  const row = await getDB()
    .prepare("SELECT image_key FROM stories WHERE id = ?")
    .bind(id)
    .first<{ image_key: string | null }>();
  await getDB().prepare("DELETE FROM stories WHERE id = ?").bind(id).run();
  return row?.image_key ?? null;
}

/** A decide route-nak: privát mezőkkel (email-értesítés + R2-takarítás). */
export async function getStoryAdminById(id: string): Promise<{
  id: string; slug: string; title: string; imageKey: string | null; contactEmail: string | null;
  publishedAt: string | null;
} | null> {
  const r = await getDB()
    .prepare("SELECT id, slug, title, image_key, contact_email, published_at FROM stories WHERE id = ?")
    .bind(id)
    .first<{ id: string; slug: string; title: string; image_key: string | null; contact_email: string | null; published_at: string | null }>();
  if (!r) return null;
  return {
    id: r.id, slug: r.slug, title: r.title, imageKey: r.image_key,
    contactEmail: r.contact_email, publishedAt: r.published_at,
  };
}
