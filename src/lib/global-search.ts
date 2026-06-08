/**
 * Globális AI-kereső — determinisztikus visszakeresési réteg (retrieval).
 *
 * Tiszta függvények: a szándék-felismerést (kanton, kategória) és a
 * vállalkozás-rangsorolást AI nélkül végzi, hogy a kereső gyorsabb és olcsóbb
 * legyen (kevesebb Workers-AI hívás), és a találatok relevánsan rangsorolódjanak.
 *
 * A magyar toldalékolás miatt NEM pontos token-egyezést használunk, hanem
 * prefix/tő-alapút ("fodrászt" ↔ "fodrász"), különben a keresés a ragozott
 * alakokra elveszne.
 */

import type { Business, Category } from "./types";
import { CANTONS, CANTON_COORDS, cantonFromAddress, matchCantonByName, type Canton } from "./cantons";

/** Diakritika-mentes, kisbetűs forma (Zürich → zurich, fodrászt → fodraszt). */
export function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

/** Gyakori magyar töltelékszavak, amik nem hordoznak keresési jelentést. */
const STOPWORDS = new Set([
  "a", "az", "egy", "es", "vagy", "de", "hol", "van", "vannak", "kell", "lenne",
  "ki", "mi", "ami", "aki", "hogy", "ban", "ben", "nal", "nel", "ra", "re", "tol",
  "keresek", "keres", "keresni", "szeretnek", "kene", "tudna", "valaki", "valamilyen",
  "jo", "jobb", "legjobb", "kozel", "kozeli", "kornyeken", "kornyek", "kantonban",
  "kanton", "varos", "varosban", "svajc", "svajcban", "magyar", "es", "meg", "is",
  "nekem", "nekunk", "kerek", "kellene", "olyan", "ami", "amelyik", "lehet",
]);

/** Szöveg → jelentéses, normalizált tokenek (stopword-mentes, min. 3 karakter). */
export function tokenize(s: string | null | undefined): string[] {
  if (!s) return [];
  return normalizeText(s)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));
}

/**
 * Két token "egyezik"-e a magyar ragozást is elnézve: vagy pontosan egyenlők,
 * vagy az egyik prefixe a másiknak (min. 4 karakteres közös tővel).
 * Pl. "fodrasz" ↔ "fodraszt", "autoszerelo" ↔ "autoszerelot".
 */
export function tokenMatch(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.min(a.length, b.length) < 4) return false;
  return a.startsWith(b) || b.startsWith(a);
}

function anyTokenMatch(haystack: string[], needle: string): boolean {
  return haystack.some((h) => tokenMatch(h, needle));
}

/**
 * A nyers lekérdezésből megpróbálja determinisztikusan kinyerni a kantont.
 * Sorrend: nagybetűs ISO-kód (pl. "ZH") → kanton-név/alias → székhely-város.
 * A 2-betűs kódokat csak nagybetűs alakban fogadjuk el, hogy a magyar
 * töltelékszavak (pl. "ne", "be") ne ütközzenek.
 */
export function detectCanton(query: string): Canton | null {
  const rawTokens = query.split(/[^A-Za-z]+/).filter(Boolean);
  for (const c of CANTONS) {
    if (rawTokens.includes(c.code)) return c;
  }
  const norm = normalizeText(query);
  for (const c of CANTONS) {
    if (norm.includes(normalizeText(c.name))) return c;
    if (c.aliases.some((a) => norm.includes(normalizeText(a)))) return c;
  }
  for (const code of Object.keys(CANTON_COORDS)) {
    if (norm.includes(normalizeText(CANTON_COORDS[code].city))) {
      return CANTONS.find((c) => c.code === code) ?? null;
    }
  }
  return null;
}

/**
 * A lekérdezést a kategória-címkékhez illeszti (toldalék-toleráns).
 * Visszaadja a legjobban illeszkedő kategória ID-t, vagy null-t.
 */
export function detectCategory(query: string, categories: Category[]): string | null {
  const qTokens = tokenize(query);
  if (qTokens.length === 0) return null;
  let bestId: string | null = null;
  let bestScore = 0;
  for (const cat of categories) {
    if (cat.id === "all") continue;
    const labelTokens = tokenize(cat.label);
    let score = 0;
    for (const lt of labelTokens) {
      if (anyTokenMatch(qTokens, lt)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestId = cat.id;
    }
  }
  return bestScore > 0 ? bestId : null;
}

/** Egy vállalkozás relevancia-pontszáma a keresési tokenekre (név>kategória>leírás). */
export function scoreBusiness(biz: Business, queryTokens: string[]): number {
  if (queryTokens.length === 0) return 0;
  const nameTokens = tokenize(biz.name);
  const catTokens = tokenize(biz.categoryLabel);
  const bodyTokens = tokenize(
    [biz.blurb, biz.openText, (biz.languages ?? []).join(" ")].join(" "),
  );
  let score = 0;
  for (const qt of queryTokens) {
    if (anyTokenMatch(nameTokens, qt)) score += 3;
    else if (anyTokenMatch(catTokens, qt)) score += 2;
    else if (anyTokenMatch(bodyTokens, qt)) score += 1;
  }
  return score;
}

export interface RankOptions {
  /** Kanton-szűrő (ISO-kód) vagy null. */
  cantonCode?: string | null;
  /** A keresés szabad-szavas tokenjei a rangsoroláshoz. */
  queryTokens: string[];
}

/**
 * Kanton szerint szűr, relevanciára pontoz, majd rangsorol.
 * Ha bármelyik találat illeszkedik a tokenekre, csak a pozitív pontszámúakat
 * tartjuk meg; ha egyik sem (pl. csak kanton+kategória volt a kérés), mindet
 * megtartjuk, és verified/featured/értékelés szerint rangsoroljuk.
 */
export function rankBusinesses(businesses: Business[], opts: RankOptions): Business[] {
  let list = businesses;
  if (opts.cantonCode) {
    list = list.filter((b) => {
      const c = cantonFromAddress(b.address) || matchCantonByName(b.address ?? "");
      return c?.code === opts.cantonCode;
    });
  }
  const scored = list.map((b) => ({ b, score: scoreBusiness(b, opts.queryTokens) }));
  const anyMatch = opts.queryTokens.length > 0 && scored.some((s) => s.score > 0);
  const kept = anyMatch ? scored.filter((s) => s.score > 0) : scored;
  kept.sort(
    (x, y) =>
      y.score - x.score ||
      Number(y.b.verified) - Number(x.b.verified) ||
      Number(y.b.featured) - Number(x.b.featured) ||
      y.b.rating - x.b.rating,
  );
  return kept.map((s) => s.b);
}
