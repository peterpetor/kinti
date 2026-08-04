import { getCloudflareEnv, getDB } from "./cloudflare";
import { embedText, embedTexts } from "./embeddings";
import type { Business } from "./types";

/**
 * vector-search.ts — szemantikus vállalkozás-keresés Cloudflare Vectorize-zal.
 *
 * Ha a `VECTORIZE` binding nincs beüzemelve (index nem létezik / nincs kötve),
 * minden függvény no-op / null → a hívó visszaesik a kulcsszavas keresésre.
 * Így a kód éles környezetben akkor sem tör el, ha az index még nincs meg.
 *
 * Beüzemelés (egyszeri, kézi):
 *   1) wrangler vectorize create kinti-search --dimensions=1024 --metric=cosine
 *   2) wrangler.toml: vedd ki a [[vectorize]] blokk kommentjét
 *   3) deploy után: POST /api/admin/reindex-search (admin) — feltölti a vektorokat
 */

interface VectorizeLike {
  upsert(vectors: { id: string; values: number[]; metadata?: Record<string, unknown> }[]): Promise<unknown>;
  query(
    vector: number[],
    opts?: { topK?: number; returnValues?: boolean; returnMetadata?: boolean | "all" },
  ): Promise<{ matches: { id: string; score: number }[] }>;
}

export function getVectorize(): VectorizeLike | null {
  const v = (getCloudflareEnv() as unknown as { VECTORIZE?: unknown }).VECTORIZE;
  return v ? (v as VectorizeLike) : null;
}

/** Az indexelendő/kereshető szöveg egy vállalkozásból. */
export function businessVectorText(b: Pick<Business, "name" | "categoryLabel" | "blurb" | "address">): string {
  return [b.name, b.categoryLabel, b.blurb, b.address].filter(Boolean).join(" — ").slice(0, 1500);
}

// ⚠️ ELTÁVOLÍTVA: `upsertBusinessVectors(businesses[])` — a teljes listát egyetlen
// hívásban indexelő változat. Ez volt az oka, hogy az index sosem készült el:
// ~2400 sorra 95 egymás utáni AI+upsert kört tett EGY edge-kérésbe, ami
// CPU-/alkérés-limitbe ütközött és félbeszakadt. Helyette: a lentebbi,
// FOLYTATHATÓ `indexPendingBusinessVectors(limit)` — ne vezesd vissza a régit.

/** Egyetlen vállalkozás vektorának frissítése (jóváhagyáskor / szerkesztéskor). */
export async function upsertBusinessVector(business: Business): Promise<void> {
  const index = getVectorize();
  if (!index) return;
  const vec = await embedText(businessVectorText(business));
  if (!vec) return;
  try {
    await index.upsert([{ id: business.id, values: vec, metadata: { categoryId: business.categoryId } }]);
    await markSearchIndexed([business.id]);
  } catch {
    /* best-effort */
  }
}

// --- Fokozatos, folytatható indexelés (a napi cron hajtja) -------------------

/** Az indexelési időbélyeg beírása a sikeresen feltöltött sorokra. */
async function markSearchIndexed(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  try {
    const now = new Date().toISOString();
    const placeholders = ids.map(() => "?").join(",");
    await getDB()
      .prepare(`UPDATE businesses SET search_indexed_at = ? WHERE id IN (${placeholders})`)
      .bind(now, ...ids)
      .run();
  } catch {
    /* ha nem sikerül, a sor egyszerűen a következő futáson újra sorra kerül */
  }
}

export interface PendingIndexResult {
  /** Hány sort dolgoztunk fel ebben a futásban. */
  indexed: number;
  /** Hány sor maradt hátra (a futás UTÁN) — 0 = az index naprakész. */
  remaining: number;
}

/**
 * A hátralévő (soha nem indexelt VAGY a legutóbbi indexelés óta szerkesztett)
 * vállalkozások indexelése, KORLÁTOZOTT darabszámmal.
 *
 * ⚠️ Ez a függvény a `upsertBusinessVectors` teljes-újraindexelő változatának a
 * javítása: az a teljes listán (~2400 sor) 95 egymás utáni AI+upsert körre futott
 * EGYETLEN edge-kérésben, ami CPU-/alkérés-limitbe ütközik — ezért az index
 * sosem készült el (félbeszakadt). Itt a munka darabolva, futásonként `limit`
 * sorra korlátozva megy, és a `search_indexed_at` oszlop teszi folytathatóvá:
 * a hátralék néhány napi cron-futás alatt magától lefogy, utána a lekérdezés
 * nullára apad (nincs fölösleges Workers AI fogyasztás).
 */
export async function indexPendingBusinessVectors(limit = 200): Promise<PendingIndexResult> {
  const index = getVectorize();
  if (!index) return { indexed: 0, remaining: 0 };

  // Csak élő, jóváhagyott cégek — a rejtett/moderálatlan sorok nem kereshetők.
  const PENDING_WHERE =
    "hidden = 0 AND moderation_status = 1 AND (search_indexed_at IS NULL OR search_indexed_at < updated_at)";

  let rows: { id: string; name: string; category_id: string; category_label: string | null; blurb: string | null; address: string | null }[] = [];
  try {
    const res = await getDB()
      .prepare(
        `SELECT id, name, category_id, category_label, blurb, address
           FROM businesses WHERE ${PENDING_WHERE}
          ORDER BY updated_at ASC LIMIT ?`,
      )
      .bind(Math.max(1, Math.min(limit, 500)))
      .all<{ id: string; name: string; category_id: string; category_label: string | null; blurb: string | null; address: string | null }>();
    rows = res.results ?? [];
  } catch {
    return { indexed: 0, remaining: 0 };
  }
  if (rows.length === 0) return { indexed: 0, remaining: 0 };

  let indexed = 0;
  const BATCH = 25; // AI + Vectorize upsert köteg-limit
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const vectors = await embedTexts(
      chunk.map((r) =>
        businessVectorText({
          name: r.name,
          categoryLabel: r.category_label,
          blurb: r.blurb,
          address: r.address,
        } as Pick<Business, "name" | "categoryLabel" | "blurb" | "address">),
      ),
    );
    if (!vectors || vectors.length !== chunk.length) continue;
    try {
      await index.upsert(
        chunk.map((r, j) => ({ id: r.id, values: vectors[j], metadata: { categoryId: r.category_id } })),
      );
      await markSearchIndexed(chunk.map((r) => r.id));
      indexed += chunk.length;
    } catch {
      /* részleges hiba — a köteg a következő futáson újra sorra kerül */
    }
  }

  let remaining = 0;
  try {
    const r = await getDB()
      .prepare(`SELECT COUNT(*) AS n FROM businesses WHERE ${PENDING_WHERE}`)
      .first<{ n: number }>();
    remaining = r?.n ?? 0;
  } catch {
    /* a maradék-szám csak riport, hibája nem számít */
  }
  return { indexed, remaining };
}

export interface SemanticHit {
  id: string;
  score: number;
}

/**
 * Szemantikus találatok a lekérdezésre (vállalkozás-id + hasonlósági pont).
 * Index/embedding nélkül → null (a hívó kulcsszavas keresésre vált).
 */
export async function semanticBusinessIds(query: string, topK = 20): Promise<SemanticHit[] | null> {
  return (await semanticBusinessIdsDiag(query, topK)).hits;
}

/** Hol bukott el a szemantikus keresés. */
export type SzemantikusHiba = "nincs-index" | "embedding" | "lekerdezes" | null;

export interface SzemantikusValasz {
  hits: SemanticHit[] | null;
  hiba: SzemantikusHiba;
  /** A kivétel szövege — CSAK diagnosztikához, felhasználónak SOHA. */
  uzenet?: string;
}

/**
 * Ugyanaz, mint a `semanticBusinessIds`, de MEGMONDJA, hol bukott el.
 *
 * ⚠️ Ez nem kényelmi extra. Az első éles mérésnél minden kérdés üres listát
 * adott, és a `null` visszatérés HÁROM különböző okot takart (nincs binding /
 * embedding-hiba / lekérdezés-hiba). Amíg ezek egyformán néztek ki, a hibát
 * nem lehetett megkülönböztetni a jogos „nincs találat"-tól — a funkció némán
 * halott lett volna. A `catch {}` mindig kényelmes, és mindig ez az ára.
 */
export async function semanticBusinessIdsDiag(query: string, topK = 20): Promise<SzemantikusValasz> {
  const index = getVectorize();
  if (!index) return { hits: null, hiba: "nincs-index" };
  const vec = await embedText(query);
  if (!vec) return { hits: null, hiba: "embedding" };
  try {
    const res = await index.query(vec, { topK, returnMetadata: false });
    return { hits: (res.matches ?? []).map((m) => ({ id: m.id, score: m.score })), hiba: null };
  } catch (e) {
    return { hits: null, hiba: "lekerdezes", uzenet: e instanceof Error ? e.message : String(e) };
  }
}
