/**
 * Minimal RSS 2.0 + Atom 1.0 parser hír-szerű feedekhez (pl. konzulátus
 * news/events). Nincs külső függőség — regex-alapú kibontás, a kinti event
 * modellünk csak címet + dátumot + opcionális linket igényel.
 *
 * Mappelés event-modellre:
 *   • title     → events.title
 *   • pubDate / updated / published → events.event_date  (publikálás napja
 *     mint "esemény napja" — hírlistáknál a megjelenés a releváns időpont)
 *   • link      → events.venue (mert nincs külön URL mező az events-en,
 *     a venue szövegként kattintható megjelenhet a kliensen)
 *   • category  → events.tag
 */

export interface RssItem {
  uid: string;        // a forrás egyedi azonosítója (guid / id / link)
  title: string;
  /** Az item publikálási / módosítási dátuma — ezt használjuk eseménydátumnak. */
  date: Date;
  link: string | null;
  category: string | null;
}

/**
 * Visszaadja az RSS/Atom feed összes item-jét (kibontva), a megadott időablakra
 * szűrve (csak amelyik `windowStart <= date <= windowEnd`).
 */
export function parseRss(xml: string, windowStart: Date, windowEnd: Date): RssItem[] {
  const items: RssItem[] = [];
  const isAtom = /<feed[\s>][^>]*xmlns/i.test(xml.slice(0, 2000));

  const itemRegex = isAtom ? /<entry\b[^>]*>([\s\S]*?)<\/entry>/gi : /<item\b[^>]*>([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;
  while ((m = itemRegex.exec(xml)) !== null) {
    const body = m[1];
    const parsed = isAtom ? parseAtomEntry(body) : parseRssItem(body);
    if (!parsed) continue;
    if (parsed.date < windowStart || parsed.date > windowEnd) continue;
    items.push(parsed);
  }

  return items;
}

function parseRssItem(body: string): RssItem | null {
  const title = pickText(body, "title");
  if (!title) return null;

  const pubRaw =
    pickText(body, "pubDate") ||
    pickText(body, "dc:date") ||
    pickText(body, "date") ||
    null;
  const date = parseAnyDate(pubRaw);
  if (!date) return null;

  const link =
    pickText(body, "link") ||
    pickAttr(body, "link", "href") ||
    pickText(body, "guid") ||
    null;

  const guid = pickText(body, "guid") || link || `${title}|${date.toISOString()}`;
  const category = pickText(body, "category");

  return { uid: guid.slice(0, 200), title, date, link, category };
}

function parseAtomEntry(body: string): RssItem | null {
  const title = pickText(body, "title");
  if (!title) return null;

  const pubRaw =
    pickText(body, "published") ||
    pickText(body, "updated") ||
    null;
  const date = parseAnyDate(pubRaw);
  if (!date) return null;

  // Atom <link href="..."/> — href attribútum
  const link = pickAttr(body, "link", "href") || pickText(body, "id");
  const id = pickText(body, "id") || link || `${title}|${date.toISOString()}`;
  const category = pickAttr(body, "category", "term");

  return { uid: id.slice(0, 200), title, date, link, category };
}

// --- helpers ---------------------------------------------------------------

/** Visszaadja az első <tag>...</tag> szöveg-tartalmát (CDATA-mentesítve, trimmelve). */
function pickText(body: string, tag: string): string | null {
  const re = new RegExp(`<${escapeTag(tag)}\\b[^>]*>([\\s\\S]*?)<\\/${escapeTag(tag)}>`, "i");
  const m = body.match(re);
  if (!m) return null;
  return cleanText(m[1]);
}

/** Visszaadja az első <tag ... attr="X" ...> attribútum értékét. */
function pickAttr(body: string, tag: string, attr: string): string | null {
  const re = new RegExp(`<${escapeTag(tag)}\\b[^>]*\\b${attr}=["']([^"']+)["'][^>]*\\/?>`, "i");
  const m = body.match(re);
  return m?.[1]?.trim() ?? null;
}

function escapeTag(tag: string): string {
  return tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanText(raw: string): string {
  const noCdata = raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
  const noTags = noCdata.replace(/<[^>]+>/g, " ");
  const decoded = noTags
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 16)));
  return decoded.replace(/\s+/g, " ").trim();
}

/** Elfogadja az RSS2 (RFC 822-szerű) és az Atom (ISO 8601) dátumformátumot. */
function parseAnyDate(raw: string | null): Date | null {
  if (!raw) return null;
  const t = Date.parse(raw);
  if (!Number.isNaN(t)) return new Date(t);
  return null;
}

/** Auto-detect: a tartalom valószínűleg RSS 2.0 vagy Atom feed-e? */
export function looksLikeXmlFeed(text: string): boolean {
  const head = text.slice(0, 2000).toLowerCase();
  return (
    head.includes("<rss") ||
    head.includes("<feed") ||
    (head.includes("<?xml") && (head.includes("<channel") || head.includes("<entry")))
  );
}
