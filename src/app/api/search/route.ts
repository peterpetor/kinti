import { NextResponse } from "next/server";
import { getDB } from "@/lib/cloudflare";
import { hungarianFoldSql, tokenizeFolded } from "@/lib/sql-fold";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface SearchResult {
  businesses: Array<{ id: string; name: string; categoryLabel: string | null }>;
  events: Array<{ id: string; title: string; eventDate: string | null; venue: string | null }>;
}

const EMPTY: SearchResult = { businesses: [], events: [] };

/**
 * GET /api/search?q=...  — globális kereső 2 entitásban (vállalkozás + esemény).
 *
 * ÉKEZET-ÉRZÉKETLEN + TÖBB-SZAVAS: a keresőszót foldolt tokenekre bontjuk
 * (lib/sql-fold), és MINDEN tokennek illeszkednie kell (AND) — bárhol a
 * névben/kategóriában/leírásban. Így a „fodrász zürich" vagy „magyar orvos bécs"
 * is működik, nem csak az összefüggő szó-részlet. A cég-találatokat relevancia
 * szerint rangsoroljuk: névtalálat (2 pont) > kategóriatalálat (1 pont), a PRO
 * (featured) mindig elöl. Limit per entitás: 5. Min. 2 karakter / 1 érdemi token.
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
    return NextResponse.json(EMPTY, { headers: { "cache-control": "no-store" } });
  }

  // Foldolt tokenek (AND-illesztéshez). Ha nincs érdemi token (pl. csak írásjel),
  // úgy kezeljük, mint a túl rövid keresést.
  const tokens = tokenizeFolded(q);
  if (tokens.length === 0) {
    return NextResponse.json(EMPTY, { headers: { "cache-control": "no-store" } });
  }
  const likes = tokens.map((t) => `%${t}%`);
  const db = getDB();

  // --- Vállalkozás-lekérdezés (token-AND + relevancia-rangsor) ---------------
  // WHERE: minden token illeszkedjen névre VAGY leírásra VAGY kategóriára.
  const bizWhere = tokens.map(() => `(${FOLD_BIZ_NAME} LIKE ? OR ${FOLD_BIZ_BLURB} LIKE ? OR ${FOLD_BIZ_CAT} LIKE ?)`).join(" AND ");
  // Relevancia: tokenenként névtalálat=2, kategóriatalálat=1 (SQLite-ban a
  // `X LIKE Y` 1/0-t ad, így összeadható).
  const bizScore = tokens.map(() => `((${FOLD_BIZ_NAME} LIKE ?) * 2 + (${FOLD_BIZ_CAT} LIKE ?))`).join(" + ");
  const bizSql =
    `SELECT b.id, b.name, b.category_label
     FROM businesses b
     WHERE COALESCE(b.hidden, 0) = 0 AND b.moderation_status = 1
       AND ${bizWhere}
     ORDER BY b.featured DESC, (${bizScore}) DESC, b.name ASC
     LIMIT 5`;
  // Bind-sorrend = a ?-ek megjelenési sorrendje: előbb a WHERE (tokenenként
  // name, blurb, cat), majd az ORDER BY score (tokenenként name, cat).
  const bizBinds: string[] = [];
  for (const l of likes) bizBinds.push(l, l, l);
  for (const l of likes) bizBinds.push(l, l);

  // --- Esemény-lekérdezés (token-AND) ----------------------------------------
  // A láthatóság-feltétel zárójelezve (az AND/OR precedencia miatt), + token-AND
  // a címre/helyszínre.
  const evWhere = tokens.map(() => `(${FOLD_EV_TITLE} LIKE ? OR ${FOLD_EV_VENUE} LIKE ?)`).join(" AND ");
  const evSql =
    `SELECT id, title, event_date, venue
     FROM events
     WHERE (status IS NULL OR status = 'approved')
       AND ${evWhere}
     ORDER BY event_date ASC LIMIT 5`;
  const evBinds: string[] = [];
  for (const l of likes) evBinds.push(l, l);

  const [biz, ev] = await Promise.all([
    db.prepare(bizSql).bind(...bizBinds).all<{ id: string; name: string; category_label: string | null }>(),
    db.prepare(evSql).bind(...evBinds).all<{ id: string; title: string; event_date: string | null; venue: string | null }>(),
  ]);

  const result: SearchResult = {
    businesses: biz.results.map((r) => ({ id: r.id, name: r.name, categoryLabel: r.category_label })),
    events: ev.results.map((r) => ({ id: r.id, title: r.title, eventDate: r.event_date, venue: r.venue })),
  };

  return NextResponse.json(result, { headers: { "cache-control": "no-store" } });
}
