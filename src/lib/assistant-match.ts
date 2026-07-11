/**
 * assistant-match.ts — a Kinti Asszisztens tudásbázis-illesztője (TISZTA lib).
 *
 * A user szabad szöveges problémájára determinisztikus token-átfedéssel
 * pontozza a 81 kurált útmutatót (cím > slug > összefoglaló súllyal), a cikk
 * országára szűrve. NEM Vectorize: az index kicsi (24 vektor), a kurált bank
 * pontozása pedig ingyenes, determinisztikus és magyarul pontos. Az asszisztens
 * NEM generál szabad-szöveges tanácsot (hallucináció + jogi kockázat) — ide
 * irányít: útmutató + szakember.
 */

export interface ScorableGuide {
  slug: string;
  title: string;
  summary: string;
}

export interface GuideHit {
  slug: string;
  title: string;
  score: number;
}

/** Ékezet-hajtás + kisbetű (a search-heuristic fold-mintája). */
function fold(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function tokenize(s: string): string[] {
  return fold(s)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 3);
}

/** Nagyon gyakori, téma-semleges magyar szavak — ne adjanak pontot. */
const NOISE = new Set([
  "hogy", "hogyan", "mit", "mikor", "miert", "melyik", "kell", "lehet", "van",
  "nincs", "vagyok", "csinaljak", "tudom", "nem", "igen", "egy", "meg", "mar",
  "most", "utan", "elott", "nagyon", "koszi", "kerlek", "segitseg", "segitsetek",
  "magyar", "kinti", "eltort", "tortent", "hete", "napja", "eve",
]);

/**
 * Útmutatók pontozása a kérdés tokenjeivel: cím-találat 3, slug-találat 2,
 * összefoglaló-találat 1 pont tokenenként. MIN_SCORE alatt nem találat
 * (inkább semmi, mint irreleváns cikk). Top N, pont szerint csökkenő.
 */
export const GUIDE_MIN_SCORE = 3;

export function scoreGuides(query: string, guides: ScorableGuide[], topN = 3): GuideHit[] {
  // Enyhe „szótövezés": a hosszú (6+) tokenek utolsó 2 karakterét levágjuk, hogy
  // a magyar toldalék-eltérés (javítást ↔ javítási, adóbevallás ↔ adóbevallást)
  // ne törje az illesztést. Rövid tokennél marad az egzakt alak.
  const tokens = [...new Set(tokenize(query))]
    .filter((t) => !NOISE.has(t))
    .map((t) => (t.length >= 6 ? t.slice(0, t.length - 2) : t));
  if (tokens.length === 0) return [];
  const hits: GuideHit[] = [];
  for (const g of guides) {
    const title = fold(g.title);
    const slug = fold(g.slug);
    const summary = fold(g.summary);
    let score = 0;
    for (const t of tokens) {
      if (title.includes(t)) score += 3;
      else if (slug.includes(t)) score += 2;
      else if (summary.includes(t)) score += 1;
    }
    if (score >= GUIDE_MIN_SCORE) hits.push({ slug: g.slug, title: g.title, score });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, topN);
}
