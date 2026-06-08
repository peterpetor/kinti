/**
 * repo-shared.ts — Megosztott segédek a repo-* modulokhoz.
 * Nem exportálódik közvetlenül a repo.ts barrelen keresztül.
 */

/** SQLite 0/1/"1"/true → boolean konverzió. */
export function bool(v: unknown): boolean {
  return v === 1 || v === true || v === "1";
}

/** JSON-tömb szövegből string[]-re. Hibás/üres input → []. */
export function jsonArray(v: unknown): string[] {
  if (typeof v !== "string" || v.length === 0) return [];
  try {
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}
