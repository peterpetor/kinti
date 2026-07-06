/**
 * email-extract.ts — kapcsolattartó e-mail kinyerése egy állás-hirdetés HTML-jéből.
 *
 * A közvetítői eszköz szűk keresztmetszete: az állás-aggregátorok (Adzuna/Jooble/
 * Arbeitnow) csak URL-t adnak, e-mailt nem — ezért a hirdetőt eddig KÉZZEL kellett
 * egyesével kikeresni. Ez a modul a hirdetés-oldal HTML-jéből próbálja kiszedni a
 * legjobb kapcsolattartó e-mailt: a `mailto:` linkek a legmegbízhatóbbak, a
 * szerep-alapú prefixek (bewerbung@/jobs@/hr@…) és a céghez illő domain előrébb
 * rangsorolódnak; a tracking/no-reply/adatvédelmi címek kiszűrve.
 *
 * FONTOS: tiszta, determinisztikus szöveg-logika (nincs hálózat, nincs AI) — így
 * unit-tesztelhető. A hálózati oldalt (oldalak letöltése) a route intézi.
 */

/** Toborzás-specifikus prefixek — ezek a legjobbak egy állás-megkereséshez. */
const RECRUIT_PREFIXES = [
  "bewerbung", "bewerbungen", "job", "jobs", "karriere", "career", "careers",
  "personal", "hr", "recruiting", "recruitment", "sollicitatie", "sollicitaties",
  "werk", "vacature", "vacatures", "banen", "allas", "munka",
];
/** Általános kapcsolat-prefixek — jók, de gyengébbek a toborzás-specifikusnál. */
const CONTACT_PREFIXES = ["kontakt", "contact", "office", "info", "mail", "post"];

/** local-part prefixek, amiket SOHA nem használunk kapcsolatra (zaj/rendszer). */
const BLOCK_PREFIXES = [
  "noreply", "no-reply", "donotreply", "do-not-reply", "postmaster", "mailer-daemon",
  "abuse", "privacy", "datenschutz", "dataprotection", "webmaster", "hostmaster",
  "example", "test", "sentry", "wordpress", "wixpress",
];

/** Domainek, amik biztosan NEM a hirdető cége (platform/tech/social/tracking). */
const BLOCK_DOMAIN_PARTS = [
  "example.com", "example.org", "sentry.io", "wixpress.com", "wix.com", "w3.org",
  "schema.org", "adzuna", "jooble", "arbeitnow", "indeed", "stepstone", "linkedin",
  "facebook", "twitter", "instagram", "youtube", "google", "gstatic", "googleapis",
  "cloudflare", "sentry-next", "domain.com", "email.com", "yourdomain",
  "sentry.wixpress.com",
];

/** Cégnév-tokenekből kihagyandó jogi/generikus szavak (a domain-egyezéshez). */
const COMPANY_STOPWORDS = new Set([
  "gmbh", "co", "kg", "ag", "ug", "ohg", "mbh", "e.k", "ek", "ltd", "bv", "b.v",
  "nv", "n.v", "und", "the", "group", "gruppe", "holding", "deutschland",
  "germany", "austria", "osterreich", "nederland", "personal", "personalservice",
  "zeitarbeit", "services", "service",
]);

export interface ExtractedEmail {
  email: string;
  /** `mailto:`-ból jött-e (magasabb bizalom, mint a nyers szövegből). */
  viaMailto: boolean;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/gi, "&");
}

/**
 * Spam-védelmi obfuszkáció visszafejtése (német/EU oldalakon gyakori):
 * „info(at)firma(dot)de", „info [at] firma . de", „info&#64;firma.de".
 * CSAK az egyértelmű, zárójeles/kapcsos formákat cseréljük — a nyers „ at "/
 * „ dot " túl kockázatos (prózában is előfordul), azt nem bántjuk.
 */
function deobfuscate(s: string): string {
  return s
    .replace(/\s*[([{]\s*at\s*[)\]}]\s*/gi, "@")
    .replace(/\s*[([{]\s*dot\s*[)\]}]\s*/gi, ".")
    .replace(/\s*[([{]\s*punkt\s*[)\]}]\s*/gi, ".");
}

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;

/** Egy e-mail „józan ész" ellenőrzése (nem kép-fájl, nem tört töredék). */
function isPlausible(email: string): boolean {
  if (email.length < 6 || email.length > 100) return false;
  // Ne szedjünk fel fájlnév-részleteket (pl. "logo@2x.png" nincs, de védekezünk):
  if (/\.(png|jpe?g|gif|webp|svg|css|js|woff2?|ttf)$/i.test(email)) return false;
  const [local, domain] = email.split("@");
  if (!local || !domain || !domain.includes(".")) return false;
  return true;
}

/**
 * Az összes (mailto + nyers) e-mail kinyerése a HTML-ből, deduplikálva.
 * A `viaMailto` jelzi, ha `mailto:` linkből jött (megbízhatóbb).
 */
export function extractEmails(html: string): ExtractedEmail[] {
  const byEmail = new Map<string, boolean>(); // email → viaMailto (OR-olva)

  // 1) mailto: linkek (a query-részt levágva, entitásokat dekódolva)
  for (const m of html.matchAll(/mailto:([^"'>\s?]+)/gi)) {
    const raw = decodeEntities(m[1]).trim().toLowerCase();
    if (EMAIL_RE.test(raw)) {
      EMAIL_RE.lastIndex = 0;
      if (isPlausible(raw)) byEmail.set(raw, true);
    }
    EMAIL_RE.lastIndex = 0;
  }

  // 2) nyers szöveges e-mailek (entitás-dekódolás + obfuszkáció-visszafejtés után)
  const decoded = deobfuscate(decodeEntities(html));
  for (const m of decoded.matchAll(EMAIL_RE)) {
    const e = m[0].trim().toLowerCase().replace(/[.,;:]+$/, "");
    if (isPlausible(e) && !byEmail.has(e)) byEmail.set(e, false);
  }

  return [...byEmail.entries()].map(([email, viaMailto]) => ({ email, viaMailto }));
}

function isBlocked(email: string): boolean {
  const [local, domain] = email.split("@");
  if (BLOCK_PREFIXES.some((p) => local === p || local.startsWith(p + "-") || local.startsWith(p + "."))) return true;
  if (BLOCK_DOMAIN_PARTS.some((d) => domain === d || domain.endsWith("." + d) || domain.includes(d))) return true;
  return false;
}

/** Céghez tartozó jelentős tokenek (jogi/generikus szavak nélkül). */
function companyTokens(company: string): string[] {
  return company
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((t) => t.length >= 3 && !COMPANY_STOPWORDS.has(t));
}

function domainMatchesCompany(domain: string, company: string): boolean {
  const host = domain.split(".").slice(0, -1).join(""); // TLD nélkül, összefűzve
  const tokens = companyTokens(company);
  return tokens.some((t) => host.includes(t) || t.includes(host));
}

const FREE_MAIL_RE = /@(gmail|googlemail|hotmail|outlook|live|yahoo|ymail|gmx|web\.de|t-online|aol|icloud|me\.com|freenet|mail\.com)\./i;

/**
 * A legjobb kapcsolattartó e-mail kiválasztása egy hirdetés-oldal HTML-jéből,
 * vagy `null`, ha nincs használható. Rangsor: szerep-prefix (+3), mailto (+2),
 * céghez illő domain (+2), szabad-mail szolgáltató (−1, mert a cégdomén jobb).
 * Holtversenynél a rövidebb (általánosabb) local-part nyer.
 */
export function pickBestEmail(html: string, company?: string | null): string | null {
  const candidates = extractEmails(html).filter((c) => !isBlocked(c.email));
  if (candidates.length === 0) return null;

  const score = (c: ExtractedEmail): number => {
    const [local, domain] = c.email.split("@");
    let s = 0;
    if (RECRUIT_PREFIXES.some((p) => local === p || local.startsWith(p))) s += 4;
    else if (CONTACT_PREFIXES.some((p) => local === p || local.startsWith(p))) s += 2;
    if (c.viaMailto) s += 2;
    if (company && domainMatchesCompany(domain, company)) s += 2;
    if (FREE_MAIL_RE.test(c.email)) s -= 1;
    return s;
  };

  candidates.sort((a, b) => {
    const d = score(b) - score(a);
    if (d !== 0) return d;
    // Holtverseny: rövidebb local-part (általánosabb, pl. info@ < a.hosszu.nev@).
    return a.email.split("@")[0].length - b.email.split("@")[0].length;
  });

  return candidates[0].email;
}
