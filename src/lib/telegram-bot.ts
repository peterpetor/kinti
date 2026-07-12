/**
 * telegram-bot.ts — a Kinti Telegram-bot TISZTA logikája (parse + formázás).
 *
 * A bot a magyar expat-csoportokban élő keresést szolgálja ki: „villanyszerelő
 * Bécs" → top 3 szaknévsor-találat linkkel. A szöveg-értelmezés a meglévő
 * kereső-heurisztikára épül (heurisztika-először elv — AI nélkül, determinisztikus),
 * ORSZÁG-FÜGGETLENÜL: mind a 4 ország ellen lefuttatjuk, és az nyer, amelyik
 * maradék nélkül értelmezi a szöveget RÉGIÓVAL együtt (a „Bécs" csak AT-ben
 * oldódik fel). Környezet-független (nincs Cloudflare-import) → unit-tesztelhető.
 *
 * ANTI-SCRAPING: a bot SOHA nem ad ki telefont/emailt — nevet, értékelést és
 * profil-linket ad (a kontakt a rate-limitelt reveal mögött marad).
 */
import { heuristicParseSearch, type HeuristicCategory } from "./search-heuristic";
import { regionName } from "./regions";
import { SEO_AREAS } from "./seo-areas";
import { COUNTRIES } from "./countries";

export interface BotParse {
  country: string;
  categoryId: string | null;
  categoryLabel: string | null;
  cantonCode: string | null;
}

export interface BotParseOutcome {
  /** Sikeres feloldás (ország + kategória/régió). */
  parsed: BotParse | null;
  /** true = kategóriát értettünk, de hely nélkül nem tudjuk az országot. */
  needsPlace: boolean;
}

/**
 * Ország-független query-parse: a heurisztika mind a 4 országra fut; az a
 * jelölt nyer, amelyik RÉGIÓT is talált (az dönti el az országot). Ha csak
 * kategória oldódott fel (minden országban ugyanaz), hely kell → needsPlace.
 */
export function parseBotQuery(
  rawQuery: string,
  categories: HeuristicCategory[],
): BotParseOutcome {
  const query = (rawQuery ?? "").trim();
  if (query.length < 3) return { parsed: null, needsPlace: false };

  const labelById = new Map(categories.map((c) => [c.id, c.label]));
  const candidates: BotParse[] = [];
  for (const c of COUNTRIES) {
    const r = heuristicParseSearch(query, c.code, categories);
    if (!r) continue;
    candidates.push({
      country: c.code,
      categoryId: r.categoryId,
      categoryLabel: r.categoryId ? (labelById.get(r.categoryId) ?? r.categoryId) : null,
      cantonCode: r.cantonCode,
    });
  }
  if (candidates.length === 0) return { parsed: null, needsPlace: false };

  // Régiós találat dönti el az országot; kategória+régió erősebb, mint csak-régió.
  const withRegion = candidates.filter((c) => c.cantonCode);
  if (withRegion.length > 0) {
    const full = withRegion.find((c) => c.categoryId);
    return { parsed: full ?? withRegion[0], needsPlace: false };
  }
  // Csak kategória — minden országban ugyanaz → az ország nem eldönthető.
  return { parsed: null, needsPlace: !!candidates[0].categoryId };
}

export interface BotBusiness {
  id: string;
  name: string;
  categoryLabel: string | null;
  cantonCode: string | null;
  rating: number | null;
  reviews: number | null;
}

const BASE = "https://kinti.app";

export function escapeTgHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function businessProfileUrl(id: string): string {
  return `${BASE}/szaknevsor/${encodeURIComponent(id)}?utm_source=telegram`;
}

/** A „Mind a találatok" link: ha van SEO-landing a kombóra, azt adjuk (szinergia). */
export function moreResultsUrl(parsed: BotParse): string {
  if (parsed.categoryId && parsed.cantonCode) {
    const area = SEO_AREAS.find(
      (a) => a.country === parsed.country && a.code === parsed.cantonCode && !a.cityMatch,
    );
    if (area) return `${BASE}/magyar/${encodeURIComponent(parsed.categoryId)}/${area.slug}?utm_source=telegram`;
  }
  return `${BASE}/szaknevsor?utm_source=telegram`;
}

function ratingText(b: BotBusiness): string {
  if (!b.rating || b.rating <= 0) return "";
  const r = b.rating.toFixed(1).replace(".", ",");
  return b.reviews && b.reviews > 0 ? ` ⭐ ${r} (${b.reviews})` : ` ⭐ ${r}`;
}

/**
 * A válasz-üzenet (Telegram HTML parse_mode). Kontakt-adat NINCS benne —
 * a profil-link visz az appba (ott a rate-limitelt reveal).
 */
export function formatBotReply(
  parsed: BotParse,
  businesses: BotBusiness[],
  opts?: { countryWideFallback?: boolean },
): string {
  const place = parsed.cantonCode ? regionName(parsed.country, parsed.cantonCode) : null;
  const what = parsed.categoryLabel ? `magyar ${parsed.categoryLabel.toLowerCase()}` : "magyar szakemberek";
  const header = `🔎 <b>${escapeTgHtml(what.charAt(0).toUpperCase() + what.slice(1))}${place ? ` — ${escapeTgHtml(place)}` : ""}</b>`;

  if (businesses.length === 0) {
    return `${header}\n\nMég nincs ilyen szakember a Szaknévsorban. Add fel te — vagy ajánld be, akit ismersz: ${BASE}/szaknevsor/uj`;
  }

  const note = opts?.countryWideFallback && place
    ? `\n<i>${escapeTgHtml(place)} környékén nem találtunk — a legjobb országos találatok:</i>\n`
    : "";

  const rows = businesses
    .map((b, i) => {
      const region = b.cantonCode ? regionName(parsed.country, b.cantonCode) : null;
      const meta = [b.categoryLabel, region].filter(Boolean).join(" · ");
      return `${i + 1}. <b>${escapeTgHtml(b.name)}</b>${ratingText(b)}${meta ? `\n   ${escapeTgHtml(meta)}` : ""}\n   <a href="${businessProfileUrl(b.id)}">Profil megnyitása →</a>`;
    })
    .join("\n\n");

  return `${header}\n${note}\n${rows}\n\nÖsszes találat: ${moreResultsUrl(parsed)}`;
}

export const BOT_HELP_TEXT = `👋 <b>Szia, én a Kinti bot vagyok!</b>

Magyar szakembert keresek neked ${"Svájcban, Ausztriában, Németországban és Hollandiában"}.

Írd be, mit keresel és hol — például:
• <i>villanyszerelő Bécs</i>
• <i>fodrász Zürich</i>
• <i>fogorvos München</i>

Csoportban így hívj: <code>/kinti fodrász Graz</code>

Az adatok a kinti.app Szaknévsorából jönnek — ${BASE}`;

export const BOT_NEEDS_PLACE_TEXT =
  "Melyik városban/tartományban keresed? Írd a helyet is — például: <i>villanyszerelő Bécs</i> vagy <i>fodrász Stuttgart</i>.";

export const BOT_UNPARSED_TEXT =
  `Ezt nem tudtam biztosan értelmezni. 🙈 Próbáld így: <i>szakma + város</i> — például <i>fogorvos München</i>. A teljes keresőt itt találod: ${BASE}/szaknevsor`;
