import { NextResponse } from "next/server";
import { getDB } from "@/lib/cloudflare";
import { foldSearchText, hungarianFoldSql } from "@/lib/sql-fold";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface SearchResult {
  businesses: Array<{ id: string; name: string; categoryLabel: string | null }>;
  events: Array<{ id: string; title: string; eventDate: string | null; venue: string | null }>;
}

/**
 * GET /api/search?q=...  — globális kereső 2 entitásban (vállalkozás + esemény).
 *
 * ÉKEZET-ÉRZÉKETLEN: a needle-t és az oszlopokat is accent-foldoljuk (lib/sql-fold),
 * így a „fodrasz" a „Fodrász"-t, a „zurich" a „Zürich"-et is megtalálja. A cég-
 * keresés a KATEGÓRIANÉVRE is illeszt (pl. „ügyvéd" → az ügyvéd-kategóriájú cégek),
 * nemcsak a névre/leírásra. Limit per entitás: 5. Min. 2 karakter.
 */

// Az oszlop-oldali accent-fold kifejezések (egyszer felépítve, nem per-kérés).
const FOLD_BIZ_NAME = hungarianFoldSql("b.name");
const FOLD_BIZ_BLURB = hungarianFoldSql("COALESCE(b.blurb, '')");
const FOLD_BIZ_CAT = hungarianFoldSql("COALESCE(b.category_label, '')");
const FOLD_EV_TITLE = hungarianFoldSql("title");
const FOLD_EV_VENUE = hungarianFoldSql("COALESCE(venue, '')");

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    return NextResponse.json({ businesses: [], events: [] } satisfies SearchResult, {
      headers: { "cache-control": "no-store" },
    });
  }

  // A needle ugyanazzal a fold-dal normalizálva, mint az oszlopok — így a LIKE két
  // oldala egyezik. A LIKE-metakaraktereket (% _) kivágjuk, hogy ne legyenek jokerek.
  const needle = `%${foldSearchText(q).replace(/[%_]/g, "")}%`;
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
           AND (${FOLD_BIZ_NAME} LIKE ? OR ${FOLD_BIZ_BLURB} LIKE ? OR ${FOLD_BIZ_CAT} LIKE ?)
         ORDER BY b.featured DESC, b.name ASC LIMIT 5`,
      )
      .bind(needle, needle, needle)
      .all<{ id: string; name: string; category_label: string | null }>(),
    db
      .prepare(
        // A láthatóság-feltételt ZÁRÓJELEZZÜK: az AND erősebben köt mint az OR,
        // ezért zárójel nélkül a `status IS NULL` sorok a keresőszótól függetlenül
        // mind visszajöttek volna.
        `SELECT id, title, event_date, venue
         FROM events
         WHERE (status IS NULL OR status = 'approved')
           AND (${FOLD_EV_TITLE} LIKE ? OR ${FOLD_EV_VENUE} LIKE ?)
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
