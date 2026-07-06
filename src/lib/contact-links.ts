/**
 * contact-links.ts — a leírás (blurb) végére fűzött weboldal/email kinyerése,
 * hogy NYERS `mailto:…` / URL-szöveg helyett GOMBKÉNT jeleníthessük meg.
 *
 * A seed- és CSV-import pipeline-ok a weboldalt (és néha egy `mailto:` emailt)
 * a leíráshoz fűzik ` · ` elválasztóval (pl. "Leírás · example.com" vagy
 * "Leírás · mailto:x@y.hu"). Ez a helper az UTOLSÓ ` · `-szegmenst vizsgálja:
 * ha weboldalnak/emailnek tűnik, leválasztja és strukturáltan adja vissza, a
 * maradékot pedig tiszta leírásként. Csak szegmens-szintű illesztés (nincs
 * benne szóköz), így a mondatvégi pont vagy a városnév nem téveszti meg.
 */

// „mailto:x@y.hu" vagy „x@y.hu" — a mailto: prefix elhagyva a visszaadott értékből.
const EMAIL_RE = /^(?:mailto:)?([^\s@]+@[^\s@]+\.[a-z]{2,})$/i;
// „example.com", „www.foo.co.uk", „sub.domain.com/path" — séma opcionális.
const URL_RE = /^(?:https?:\/\/)?((?:[a-z0-9-]+\.)+[a-z]{2,})(?:\/\S*)?$/i;

export interface BlurbContact {
  /** A weboldal/email nélküli, megjeleníthető leírás. */
  blurb: string | null;
  /** Teljes http(s) URL, ha az utolsó szegmens weboldal volt. */
  website: string | null;
  /** Email-cím (mailto: prefix nélkül), ha az utolsó szegmens email volt. */
  email: string | null;
}

export function extractContactFromBlurb(raw: string | null | undefined): BlurbContact {
  if (!raw) return { blurb: raw ?? null, website: null, email: null };
  const parts = raw.split(" · ");
  if (parts.length < 2) return { blurb: raw, website: null, email: null };

  const last = parts[parts.length - 1].trim();
  const rest = parts.slice(0, -1).join(" · ").trim() || null;

  const email = last.match(EMAIL_RE);
  if (email) return { blurb: rest, website: null, email: email[1] };

  const url = last.match(URL_RE);
  if (url) {
    const website = /^https?:\/\//i.test(last) ? last : `https://${last}`;
    return { blurb: rest, website, email: null };
  }
  return { blurb: raw, website: null, email: null };
}

/** Rövid, megjeleníthető domain-címke egy URL-ből (pl. „example.com"). */
export function websiteLabel(url: string): string {
  return url
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");
}
