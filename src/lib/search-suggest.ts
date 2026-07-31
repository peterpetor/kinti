/**
 * Kereső-javaslatok a szaknévsorhoz („autocomplete").
 *
 * ⚠️ MIÉRT KELL: 70 különböző szakma van az adatbázisban, de a kategória-pillek
 * csak néhányat mutatnak (a többi a „+N további" mögött). Aki nem tudja a szó
 * PONTOS alakját, nem talál rá — pedig ott van. A kereső eddig néma volt:
 * semmit nem ajánlott gépelés közben.
 *
 * ⚠️ CSAK OLYAT AJÁNLUNK, AMIBEN VAN TALÁLAT. Egy 0 elemű kategória
 * felajánlása zsákutcába küld — rosszabb, mint a semmi.
 *
 * A javaslat KÉT úton születhet:
 *  1. szó-eleji / részlánc egyezés (a gyakori eset),
 *  2. ELGÉPELÉS-javítás (szerkesztési távolság) — a „fogorovs" ma nulla
 *     találatot ad, mert az előző körben épített ragozás-tűrés betűhibát nem
 *     kezel. Ez a „Ezt kerested?" ág.
 */
import { foldSearchText } from "./sql-fold";

export interface SuggestCategory {
  id: string;
  label: string;
}

export interface SearchSuggestion {
  categoryId: string;
  label: string;
  count: number;
  /** true, ha elgépelés-javítással találtuk — a felület külön jelöli. */
  fuzzy: boolean;
}

/** Ennél rövidebb bemenetre nem ajánlunk (túl sok és túl zajos lenne). */
export const MIN_QUERY = 2;
/** Ennél rövidebb szónál nem próbálunk elgépelést javítani. */
const MIN_FUZZY_QUERY = 4;

/**
 * Szerkesztési távolság felső korláttal — ha biztosan nagyobb `max`-nál,
 * korán kilép (nem számoljuk végig a teljes mátrixot).
 */
export function editDistanceWithin(a: string, b: string, max: number): number | null {
  if (Math.abs(a.length - b.length) > max) return null;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      cur.push(v);
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return null; // ebben a sorban már mind túl nagy
    prev = cur;
  }
  const d = prev[b.length];
  return d <= max ? d : null;
}

/** A megengedett betűhiba a szó hosszától függ (rövid szónál szigorúbb). */
function maxTypos(len: number): number {
  return len >= 8 ? 2 : 1;
}

export function buildSearchSuggestions(
  query: string,
  categories: readonly SuggestCategory[],
  counts: Readonly<Record<string, number>>,
  limit = 6,
): SearchSuggestion[] {
  const q = foldSearchText(query.trim());
  if (q.length < MIN_QUERY) return [];

  // A felhasználó jellemzően az UTOLSÓ szót gépeli épp („fodrász bé…").
  const lastWord = q.split(/[^\p{L}\p{N}]+/u).filter(Boolean).pop() ?? q;

  const scored: { s: SearchSuggestion; rank: number }[] = [];
  for (const c of categories) {
    if (c.id === "all") continue;
    const count = counts[c.id] ?? 0;
    if (count <= 0) continue; // ⚠️ zsákutcát nem ajánlunk

    const label = foldSearchText(c.label);
    const words = label.split(/[^\p{L}\p{N}]+/u).filter(Boolean);

    // 1) szó-eleji egyezés a legerősebb jel („fo" → „fodrász")
    if (words.some((w) => w.startsWith(lastWord))) {
      scored.push({ s: { categoryId: c.id, label: c.label, count, fuzzy: false }, rank: 0 });
      continue;
    }
    // 2) bárhol részlánc
    if (label.includes(lastWord)) {
      scored.push({ s: { categoryId: c.id, label: c.label, count, fuzzy: false }, rank: 1 });
      continue;
    }
    // 3) elgépelés-javítás — csak ha nincs pontosabb jel
    if (lastWord.length >= MIN_FUZZY_QUERY) {
      const max = maxTypos(lastWord.length);
      const hit = words.some((w) => editDistanceWithin(w, lastWord, max) !== null);
      if (hit) {
        scored.push({ s: { categoryId: c.id, label: c.label, count, fuzzy: true }, rank: 2 });
      }
    }
  }

  return scored
    .sort((a, b) => a.rank - b.rank || b.s.count - a.s.count || a.s.label.localeCompare(b.s.label, "hu"))
    .slice(0, limit)
    .map((x) => x.s);
}
