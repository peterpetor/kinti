import { NextResponse } from "next/server";
import { getDB } from "@/lib/cloudflare";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface SearchResult {
  businesses: Array<{ id: string; name: string; categoryLabel: string | null }>;
  bulletins: Array<{ id: string; title: string; kindLabel: string | null; cantonCode: string | null }>;
  events: Array<{ id: string; title: string; eventDate: string | null; venue: string | null }>;
  rides: Array<{ id: string; departureCity: string; destinationCity: string; departureTime: string }>;
}

/**
 * GET /api/search?q=...  — globális kereső 4 entitásban.
 *
 * Minden táblán LIKE-kereséssel (case-insensitive a SQLite LIKE-jával).
 * Limit per kategória: 5. A keresés legalább 2 karaktert vár.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    return NextResponse.json({ businesses: [], bulletins: [], events: [], rides: [] } satisfies SearchResult, {
      headers: { "cache-control": "no-store" },
    });
  }

  const needle = `%${q.replace(/[%_]/g, "")}%`;
  const db = getDB();

  const [biz, bull, ev, rd] = await Promise.all([
    db
      .prepare(
        `SELECT b.id, b.name, b.category_label
         FROM businesses b
         WHERE LOWER(b.name) LIKE LOWER(?) OR LOWER(COALESCE(b.blurb, '')) LIKE LOWER(?)
         ORDER BY b.featured DESC, b.name ASC LIMIT 5`,
      )
      .bind(needle, needle)
      .all<{ id: string; name: string; category_label: string | null }>(),
    db
      .prepare(
        `SELECT p.id, p.title, p.canton_code, k.label AS kind_label
         FROM bulletin_posts p
         LEFT JOIN bulletin_kinds k ON k.id = p.kind_id
         WHERE p.is_pending = 0 AND p.hidden = 0
           AND (p.expires_at IS NULL OR p.expires_at > datetime('now'))
           AND (LOWER(p.title) LIKE LOWER(?) OR LOWER(COALESCE(p.body, '')) LIKE LOWER(?))
         ORDER BY p.published_at DESC LIMIT 5`,
      )
      .bind(needle, needle)
      .all<{ id: string; title: string; canton_code: string | null; kind_label: string | null }>(),
    db
      .prepare(
        `SELECT id, title, event_date, venue
         FROM events
         WHERE status IS NULL OR status = 'approved'
         AND (LOWER(title) LIKE LOWER(?) OR LOWER(COALESCE(venue, '')) LIKE LOWER(?))
         ORDER BY event_date ASC LIMIT 5`,
      )
      .bind(needle, needle)
      .all<{ id: string; title: string; event_date: string | null; venue: string | null }>(),
    db
      .prepare(
        `SELECT id, departure_city, destination_city, departure_time
         FROM rides
         WHERE expires_at > datetime('now')
           AND (LOWER(departure_city) LIKE LOWER(?) OR LOWER(destination_city) LIKE LOWER(?))
         ORDER BY departure_time ASC LIMIT 5`,
      )
      .bind(needle, needle)
      .all<{ id: string; departure_city: string; destination_city: string; departure_time: string }>(),
  ]);

  const result: SearchResult = {
    businesses: biz.results.map((r) => ({ id: r.id, name: r.name, categoryLabel: r.category_label })),
    bulletins: bull.results.map((r) => ({
      id: r.id,
      title: r.title,
      kindLabel: r.kind_label,
      cantonCode: r.canton_code,
    })),
    events: ev.results.map((r) => ({ id: r.id, title: r.title, eventDate: r.event_date, venue: r.venue })),
    rides: rd.results.map((r) => ({
      id: r.id,
      departureCity: r.departure_city,
      destinationCity: r.destination_city,
      departureTime: r.departure_time,
    })),
  };

  return NextResponse.json(result, { headers: { "cache-control": "no-store" } });
}
