import { getCloudflareEnv } from "./cloudflare";

/**
 * embeddings.ts — szöveg → vektor (Cloudflare Workers AI).
 *
 * Modell: `@cf/baai/bge-m3` — TÖBBNYELVŰ (a magyar ragozáshoz ez kell, az
 * angol bge-base-en-v1.5 nem alkalmas), 1024 dimenziós, cosine távolsággal.
 * A Vectorize indexet ennek megfelelően kell létrehozni:
 *   wrangler vectorize create kinti-search --dimensions=1024 --metric=cosine
 */
export const EMBEDDING_MODEL = "@cf/baai/bge-m3";
export const EMBEDDING_DIM = 1024;

/** Egyetlen szöveg beágyazása. Hiba/elérhetetlen AI → null (a hívó fallbackol). */
export async function embedText(text: string): Promise<number[] | null> {
  const out = await embedTexts([text]);
  return out?.[0] ?? null;
}

/** Több szöveg beágyazása egy hívásban (indexeléshez). */
export async function embedTexts(texts: string[]): Promise<number[][] | null> {
  const clean = texts.map((t) => (t || "").slice(0, 2000)).filter((t) => t.length > 0);
  if (clean.length === 0) return null;
  const env = getCloudflareEnv();
  if (!env.AI) return null;
  try {
    const res = (await env.AI.run(EMBEDDING_MODEL, { text: clean })) as { data?: number[][], usage?: { prompt_tokens?: number } };
    const data = res?.data;
    
    const { recordAiUsage, estTokens } = await import("./ai");
    const pt = res?.usage?.prompt_tokens ?? clean.reduce((acc, t) => acc + estTokens(t), 0);
    await recordAiUsage(EMBEDDING_MODEL, pt, 0);

    if (!Array.isArray(data) || data.length === 0) return null;
    return data;
  } catch {
    return null;
  }
}
