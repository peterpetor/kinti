import { getCloudflareEnv } from "./cloudflare";
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

/**
 * Vállalkozások (újra)indexelése a Vectorize-ba. Kötegelt (AI + upsert limit
 * miatt). Visszaadja a feltöltött vektorok számát. Index nélkül → 0.
 */
export async function upsertBusinessVectors(businesses: Business[]): Promise<number> {
  const index = getVectorize();
  if (!index || businesses.length === 0) return 0;

  let done = 0;
  const BATCH = 25;
  for (let i = 0; i < businesses.length; i += BATCH) {
    const chunk = businesses.slice(i, i + BATCH);
    const vectors = await embedTexts(chunk.map(businessVectorText));
    if (!vectors || vectors.length !== chunk.length) continue;
    try {
      await index.upsert(
        chunk.map((b, j) => ({
          id: b.id,
          values: vectors[j],
          metadata: { categoryId: b.categoryId },
        })),
      );
      done += chunk.length;
    } catch {
      /* részleges hiba — a többi köteg menjen tovább */
    }
  }
  return done;
}

/** Egyetlen vállalkozás vektorának frissítése (jóváhagyáskor / szerkesztéskor). */
export async function upsertBusinessVector(business: Business): Promise<void> {
  const index = getVectorize();
  if (!index) return;
  const vec = await embedText(businessVectorText(business));
  if (!vec) return;
  try {
    await index.upsert([{ id: business.id, values: vec, metadata: { categoryId: business.categoryId } }]);
  } catch {
    /* best-effort */
  }
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
  const index = getVectorize();
  if (!index) return null;
  const vec = await embedText(query);
  if (!vec) return null;
  try {
    const res = await index.query(vec, { topK, returnMetadata: false });
    return (res.matches ?? []).map((m) => ({ id: m.id, score: m.score }));
  } catch {
    return null;
  }
}
