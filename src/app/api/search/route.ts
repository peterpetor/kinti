import { NextResponse } from "next/server";
import { getDB } from "@/lib/cloudflare";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface SearchResult {
  businesses: Array<{ id: string; name: string; categoryLabel: string | null }>;
  events: Array<{ id: string; title: string; eventDate: string | null; venue: string | null }>;
}

/**
 * GET /api/search?q=...  — globális kereső 2 entitásban.
 *
 * Minden táblán LIKE-kereséssel (case-insensitive a SQLite LIKE-jával).
 * Limit per kategória: 5. A keresés legalább 2 karaktert vár.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    return NextResponse.json({ businesses: [], events: [] } satisfies SearchResult, {
      headers: { "cache-control": "no-store" },
    });
  }

  const needle = `%${q.replace(/[%_]/g, "")}%`;
  const db = getDB();

  const [biz, ev] = await Promise.all([
    db
      .prepare(
        // Csak PUBLIKUS cég: nem-rejtett + admin-jóváhagyott (moderation_status=1) —
        // különben a kereső elrejtett/duplikált/pending sorokat is felhozna, amikre
        // kattintva a /szaknevsor/[id] 404-el (döglött link).
        `SELECT b.id, b.name, b.category_label
         FROM businesses b
         WHERE COALESCE(b.hidden, 0) = 0 AND b.moderation_status = 1
           AND (LOWER(b.name) LIKE LOWER(?) OR LOWER(COALESCE(b.blurb, '')) LIKE LOWER(?))
         ORDER BY b.featured DESC, b.name ASC LIMIT 5`,
      )
      .bind(needle, needle)
      .all<{ id: string; name: string; category_label: string | null }>(),
    db
      .prepare(
        // A láthatóság-feltételt ZÁRÓJELEZZÜK: az AND erősebben köt mint az OR,
        // ezért zárójel nélkül a `status IS NULL` sorok a keresőszótól függetlenül
        // mind visszajöttek volna.
        `SELECT id, title, event_date, venue
         FROM events
         WHERE (status IS NULL OR status = 'approved')
           AND (LOWER(title) LIKE LOWER(?) OR LOWER(COALESCE(venue, '')) LIKE LOWER(?))
         ORDER BY event_date ASC LIMIT 5`,
      )
      .bind(needle, needle)
      .all<{ id: string; title: string; event_date: string | null; venue: string | null }>(),
  ]);

  const result: SearchResult = {
    businesses: biz.results.map((r) => ({ id: r.id, name: r.name, categoryLabel: r.category_label })),
    events: ev.results.map((r) => ({ id: r.id, title: r.title, eventDate: r.event_date, venue: r.venue })),
  };

  return NextResponse.json(result, { headers: { "cache-control": "no-store" } });
}
