/**
 * Vállalkozói profilon megjelenő külső social/booking-linkek biztonságos
 * validálása. Csak https:// séma + ismert domain-allowlist.
 *
 * Ezzel kivédjük:
 *   • `javascript:` URL-eket (XSS)
 *   • `data:text/html...` URL-eket (XSS új tabban)
 *   • Phishing-domain-eket (fake-google-login.com)
 *
 * A `update-profile` és a manage-form mind a kettő ezt használja a mentés
 * előtt — ha érvénytelen, mentés helyett 400-as hibát adunk.
 */

/** Az URL-alapú (domain-allowlistes) social-kulcsok — az `email` NEM ilyen. */
type UrlSocialKind = "facebook" | "instagram" | "linkedin" | "booking";

const ALLOWED_DOMAINS: Record<UrlSocialKind, RegExp[]> = {
  facebook: [/^(.+\.)?facebook\.com$/, /^fb\.com$/, /^(.+\.)?fb\.me$/],
  instagram: [/^(.+\.)?instagram\.com$/, /^instagr\.am$/],
  linkedin: [/^(.+\.)?linkedin\.com$/, /^lnkd\.in$/],
  booking: [
    /^(.+\.)?booking\.com$/,
    /^(.+\.)?airbnb\.com$/,
    /^(.+\.)?airbnb\.ch$/,
    /^calendly\.com$/,
    /^(.+\.)?calendly\.com$/,
    /^cal\.com$/,
    /^(.+\.)?cal\.com$/,
  ],
};

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  booking?: string;
  /** Publikus kapcsolattartó e-mail (NEM URL — külön, egyszerű e-mail-validációval). */
  email?: string;
}

/** Egyszerű, konzervatív e-mail-validáció (nem RFC-teljes, de a phishing/XSS-t kizárja). */
export function validateEmail(raw: string): string | null {
  const trimmed = (raw ?? "").trim();
  if (!trimmed || trimmed.length > 254) return null;
  // egy @, ésszerű local + domain, legalább egy pont a domainben, nincs whitespace/<>
  if (!/^[^\s<>@]+@[^\s<>@.]+(\.[^\s<>@.]+)+$/.test(trimmed)) return null;
  return trimmed.toLowerCase();
}

/**
 * Egy URL-t validál a megadott kategóriához (facebook/instagram/linkedin/booking).
 * Visszaadja a tisztított https-URL-t, vagy null-t ha érvénytelen.
 */
export function validateSocialUrl(
  raw: string,
  kind: UrlSocialKind,
): string | null {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return null;
  if (trimmed.length > 500) return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  // Csak https. NEM HTTP, NEM javascript:, NEM data:.
  if (url.protocol !== "https:") return null;

  // Domain-allowlist
  const host = url.hostname.toLowerCase();
  const patterns = ALLOWED_DOMAINS[kind];
  if (!patterns.some((re) => re.test(host))) return null;

  // Visszaadjuk a normalizált formát (a saját URL-konstruktor szabványosít)
  return url.toString();
}

/**
 * Egy teljes social-links objektumot validál. Nem-validnak jelölt mezőket
 * eldobjuk; nem-érvényes mezőnél hiba nélkül kihagyjuk.
 *
 * Ha minden mező üres / érvénytelen → null (mentésnél NULL-t teszünk a DB-be).
 */
export function validateSocialLinks(input: Partial<SocialLinks>): SocialLinks | null {
  const out: SocialLinks = {};
  let hasAny = false;
  (Object.keys(ALLOWED_DOMAINS) as UrlSocialKind[]).forEach((kind) => {
    const raw = input[kind];
    if (typeof raw !== "string" || !raw.trim()) return;
    const ok = validateSocialUrl(raw, kind);
    if (ok) {
      out[kind] = ok;
      hasAny = true;
    }
  });
  // E-mail: külön ág (nem URL-allowlist, hanem e-mail-formátum).
  if (typeof input.email === "string" && input.email.trim()) {
    const okEmail = validateEmail(input.email);
    if (okEmail) {
      out.email = okEmail;
      hasAny = true;
    }
  }
  return hasAny ? out : null;
}
