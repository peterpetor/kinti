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

/** Egy szegmensről eldönti, hogy weboldal/e-mail-e; ha igen, strukturáltan adja. */
function segmentContact(seg: string, rest: string | null): BlurbContact | null {
  const email = seg.match(EMAIL_RE);
  if (email) return { blurb: rest, website: null, email: email[1] };

  const url = seg.match(URL_RE);
  if (url) {
    const website = /^https?:\/\//i.test(seg) ? seg : `https://${seg}`;
    return { blurb: rest, website, email: null };
  }
  return null;
}

export function extractContactFromBlurb(raw: string | null | undefined): BlurbContact {
  if (!raw) return { blurb: raw ?? null, website: null, email: null };
  const parts = raw.split(" · ");

  // ⚠️ EGYETLEN szegmens is lehet TISZTA weboldal/e-mail — a seed-pipeline több
  // száz sornál CSAK a címet írta a leírásba („www.example.at"), elválasztó
  // nélkül. Amíg ezt nem kezeltük, 35 élő cégnél a weboldal NYERS SZÖVEGKÉNT
  // állt a leírás helyén, és NEM lett belőle kattintható „Weboldal" gomb —
  // vagyis kívülről zsákutcának látszottak, pedig volt elérhetőségük.
  if (parts.length < 2) {
    return segmentContact(raw.trim(), null) ?? { blurb: raw, website: null, email: null };
  }

  const last = parts[parts.length - 1].trim();
  const rest = parts.slice(0, -1).join(" · ").trim() || null;
  return segmentContact(last, rest) ?? { blurb: raw, website: null, email: null };
}

/** Melyik gomb kapja a kiemelt (elsődleges) stílust a cégadatlapon. */
export type PrimaryContactKind = "phone" | "website" | "email" | null;

/**
 * A kapcsolatfelvétel elsődleges csatornája — telefon > weboldal > e-mail.
 *
 * ⚠️ Korábban KIZÁRÓLAG a telefon kapta a kiemelt stílust. A tényleges
 * forgalomban viszont a megnézett cégek nagyjából felénél NINCS telefonszám
 * (egyesületek, iskolák, cserkészcsapatok), és ilyenkor a felhasználó egy csupa
 * szürke gombsort látott — semmi nem jelölte ki a következő lépést.
 *
 * ⚠️ Az „Útvonal" SZÁNDÉKOSAN nem szerepel: odajutni tudni anélkül, hogy bárkit
 * elérnél, még zsákutca — ezért sosem lehet elsődleges akció.
 */
export function primaryContactKind(c: {
  phone?: string | null;
  website?: string | null;
  email?: string | null;
}): PrimaryContactKind {
  if (c.phone?.trim()) return "phone";
  if (c.website?.trim()) return "website";
  if (c.email?.trim()) return "email";
  return null;
}

/** Rövid, megjeleníthető domain-címke egy URL-ből (pl. „example.com"). */
export function websiteLabel(url: string): string {
  return url
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");
}
