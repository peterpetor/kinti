/**
 * Eldobható (disposable / temporary) email-címek szűrése edge runtime alatt is.
 * Külső API-hívások nélkül, szupergyors Set-alapú kereséssel és aldomain-vizsgálattal.
 */

const DISPOSABLE_DOMAINS = new Set([
  // Leggyakoribb 10 perces és eldobható email szolgáltatók
  "10minutemail.com",
  "10minemail.com",
  "10minutemail.co.za",
  "temp-mail.org",
  "tempmail.com",
  "tempmail.net",
  "temp-mail.net",
  "tempmailo.com",
  "tempmailaddress.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamailblock.com",
  "guerrillamail.de",
  "sharklasers.com",
  "grr.la",
  "pokemail.net",
  "mailinator.com",
  "yopmail.com",
  "dispostable.com",
  "getairmail.com",
  "throwawaymail.com",
  "maildrop.cc",
  "trashmail.com",
  "mintemail.com",
  "mailnesia.com",
  "mailcatch.com",
  "dropmail.me",
  "disposable.com",
  "33mail.com",
  "burnermc.com",
  "crazymailing.com",
  "generator.email",
  "getnada.com",
  "boun.cr",
  "inboxkitten.com",
  "tempmail.plus",
  "moakt.com",
  "moakt.co",
  "moakt.ws",
]);

/**
 * Megvizsgálja, hogy a megadott e-mail cím eldobható (temporary) szolgáltatóhoz tartozik-e.
 */
export function isDisposableEmail(email: string): boolean {
  if (!email || !email.includes("@")) return false;
  
  const domain = email.split("@").pop()?.trim().toLowerCase();
  if (!domain) return false;

  // 1) Pontos egyezés (pl. "10minemail.com")
  if (DISPOSABLE_DOMAINS.has(domain)) return true;

  // 2) Aldomain egyezés (pl. "xyz.10minemail.com")
  for (const blockDomain of DISPOSABLE_DOMAINS) {
    if (domain.endsWith("." + blockDomain)) {
      return true;
    }
  }

  return false;
}
