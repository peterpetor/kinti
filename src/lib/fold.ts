/**
 * Ékezet-hajtó kereső-normalizálás: kisbetű + Unicode-NFD + a kombináló
 * ékezet-jelek törlése. A szóközök és írásjelek MEGMARADNAK, hogy a substring
 * (`includes`) illesztés természetesen működjön.
 *
 * MIÉRT: a Kinti magyar diaszpóra-app — a felhasználók gyakran idegen
 * (német/holland) billentyűzeten, ékezet nélkül gépelnek. Enélkül a puszta
 * `toLowerCase()` szűrő nem találja meg:
 *   "becs"    → "Bécs"        (magyar városnév-átirat)
 *   "fodrasz" → "fodrász"     (magyar szakma ékezet nélkül)
 *   "zurich"  → "Zürich"      (német umlaut)
 *   "muncheni"→ "Müncheni"
 * A kódbázis több pontja (search-heuristic, cantons, region-resolve) már így
 * normalizál; ez a közös, tesztelt helper ugyanazt teszi elérhetővé a
 * kliens-oldali lista-szűrőnek is.
 */
export function foldForSearch(s: string | null | undefined): string {
  if (!s) return "";
  return s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}
