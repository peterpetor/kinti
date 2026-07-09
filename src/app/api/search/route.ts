import { NextResponse } from "next/server";
import { getDB } from "@/lib/cloudflare";
import { hungarianFoldSql, tokenizeFolded } from "@/lib/sql-fold";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface SearchResult {
  businesses: Array<{ id: string; name: string; categoryLabel: string | null }>;
  jobs: Array<{ id: string; title: string; location: string | null; category: string | null }>;
}

const EMPTY: SearchResult = { businesses: [], jobs: [] };

/**
 * GET /api/search?q=...  — globális kereső 2 entitásban (vállalkozás + Kinti-állás).
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
const FOLD_JOB_TITLE = hungarianFoldSql("title");
const FOLD_JOB_LOC = hungarianFoldSql("COALESCE(location, '')");
const FOLD_JOB_CAT = hungarianFoldSql("COALESCE(category, '')");
const FOLD_JOB_DESC = hungarianFoldSql("COALESCE(description, '')");

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

  // --- Állás-lekérdezés (token-AND + relevancia) ------------------------------
  // Láthatóság a publikus lista (getJobs) KANONIKUS feltételéhez igazítva:
  // moderation_status = 1 ÉS status IN ('active','featured') — a LEJÁRT ('expired')
  // állás ne bukkanjon fel a keresőben (különben a /allasok-ból már eltűnt hirdetésre
  // kattintva a „lejárt, nem jelentkezhetsz" oldalra jutna a felhasználó).
  // Rangsor: kiemelt (featured) elöl, majd cím-találat (2 pont) > kategória-találat
  // (1 pont), végül a legfrissebb.
  const jobWhere = tokens.map(() =>
    `(${FOLD_JOB_TITLE} LIKE ? OR ${FOLD_JOB_LOC} LIKE ? OR ${FOLD_JOB_CAT} LIKE ? OR ${FOLD_JOB_DESC} LIKE ?)`,
  ).join(" AND ");
  const jobScore = tokens.map(() => `((${FOLD_JOB_TITLE} LIKE ?) * 2 + (${FOLD_JOB_CAT} LIKE ?))`).join(" + ");
  const jobSql =
    `SELECT id, title, location, category
     FROM jobs
     WHERE moderation_status = 1
       AND status IN ('active', 'featured')
       AND ${jobWhere}
     ORDER BY (status = 'featured') DESC, (${jobScore}) DESC, created_at DESC
     LIMIT 5`;
  const jobBinds: string[] = [];
  for (const l of likes) jobBinds.push(l, l, l, l);
  for (const l of likes) jobBinds.push(l, l);

  const [biz, job] = await Promise.all([
    db.prepare(bizSql).bind(...bizBinds).all<{ id: string; name: string; category_label: string | null }>(),
    db.prepare(jobSql).bind(...jobBinds).all<{ id: string; title: string; location: string | null; category: string | null }>(),
  ]);

  const result: SearchResult = {
    businesses: biz.results.map((r) => ({ id: r.id, name: r.name, categoryLabel: r.category_label })),
    jobs: job.results.map((r) => ({ id: r.id, title: r.title, location: r.location, category: r.category })),
  };

  return NextResponse.json(result, { headers: { "cache-control": "no-store" } });
}
