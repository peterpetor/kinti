/**
 * keresek-lead-map.ts — „Keresek" → fordított lead-routing TISZTA logikája
 * (vitest-elhető — Cloudflare-import tilos; a DB-réteg a keresek-routing.ts).
 *
 * Elv (quiz-pro-map minta): a Keresek-kategóriákat CSAK oda képezzük le, ahol a
 * Szaknévsor-kategória őszintén releváns — a gyenge párok (egyeb) szándékosan
 * kimaradnak. A kategória-id-k az ÉLES categories táblából ellenőrzöttek (2026-07-12).
 */

import type { ServiceCategoryId } from "./service-categories";

/** Keresek-kategória → Szaknévsor kategória-id-k, relevancia-sorrendben. */
export const KERESEK_BUSINESS_CATS: Partial<Record<ServiceCategoryId, string[]>> = {
  villanyszerelo: ["villany"],
  vizszerelo: ["gazvez", "epuletgepeszet"],
  autoszerelo: ["autoszer", "gumiszerviz", "autovillamossag", "karosszeria"],
  fodrasz: ["fodrasz", "szepseg"],
  takaritas: ["takarito", "takaritas_ablak", "takaritas_irodai", "tisztito"],
  koltoztetes: ["koltoztetes", "futar", "szallitmanyozo"],
  epitkezes: ["lakasfelujitas", "festo", "kőműves", "burkolo", "asztalos", "epitoipar"],
  fordito: ["fordito", "nemet_tolmacs", "forditasszak"],
  konyvelo: ["konyveles", "adotanacsado"],
  babiszitter: ["babysitter"],
  korrepetalo: ["korrepetitor", "maganora", "idegennyelv_tanar"],
  egeszsegugy: ["gyogytornasz", "orvos"],
  // egyeb: NINCS routing — nincs őszinte kategória-pár, a tábla így is mutatja.
};

/**
 * A Keresek szabad-szöveges elérhetőségének szétosztása a lead email/telefon
 * mezőibe. Email-szerű tokent emailként emelünk ki; telefon-szerű futamot
 * telefonként; ha egyik sincs, a nyers szöveg a telefon-mezőbe kerül (megjelenítés).
 */
export function classifyKeresekContact(contact: string): { email: string; phone: string | null } {
  const raw = contact.trim();
  const emailMatch = raw.match(/[^\s@,;]+@[^\s@,;]+\.[^\s@,;]{2,}/);
  const email = emailMatch?.[0] ?? "";
  const rest = email ? raw.replace(email, "").trim().replace(/^[,;·|/-]+|[,;·|/-]+$/g, "").trim() : raw;
  if (!rest) return { email, phone: null };
  const phoneMatch = rest.match(/[+\d][\d\s()\/.-]{5,}\d/);
  // Telefon-szerű futam → tiszta tel: link; különben a maradék szöveg egészben
  // (pl. „WhatsApp-on"), hogy az információ ne vesszen el a postaládában.
  return { email, phone: (phoneMatch?.[0] ?? rest).trim() };
}

export interface KeresekBusinessRow {
  id: string;
  featured: number;
  contactEmail: string | null;
  regionCode: string | null;
}

export interface KeresekRecipient {
  id: string;
  /** Nem-PRO címzettnek MINDIG zárolt (rendszer-osztott lead, mint a csoportos
   *  ajánlatkérés extra-címzettjei) — nem fogyasztja a havi 5 ingyenes keretet. */
  locked: boolean;
  /** Azonnali email jár-e (a first-ping napi 1/cég kapu a DB-rétegben szűr tovább). */
  immediateEmail: boolean;
}

// Azonnali email-plafonok (Resend-kvóta): PRO teljes lead + pár nem-PRO teaser.
const PRO_IMMEDIATE_MAX = 3;
const TEASER_IMMEDIATE_MAX = 2;
// Összes címzett-plafon: az inbox-only (email nélküli) cégek is kapnak lead-sort —
// a zárolt kártya a profil-igénylés + PRO-váltás motorja —, de mértékkel.
const TOTAL_MAX = 10;

/**
 * Címzett-választás egy jóváhagyott Keresek-kéréshez. A bemenet featured DESC,
 * rating DESC sorrendű. Régió-egyezés előnyben; ha a régióban senki sincs,
 * országos fallback (az ajanlatkeres-mintával azonosan).
 */
export function pickKeresekRecipients(
  businesses: KeresekBusinessRow[],
  requestRegion: string | null,
): KeresekRecipient[] {
  let pool = businesses;
  if (requestRegion) {
    const inRegion = businesses.filter((b) => b.regionCode === requestRegion);
    if (inRegion.length > 0) pool = inRegion;
  }
  pool = pool.slice(0, TOTAL_MAX);

  const hasEmail = (b: KeresekBusinessRow) =>
    !!b.contactEmail && b.contactEmail.trim().length > 0;

  let proEmails = 0;
  let teaserEmails = 0;
  return pool.map((b) => {
    const pro = Number(b.featured) === 1;
    let immediateEmail = false;
    if (hasEmail(b)) {
      if (pro && proEmails < PRO_IMMEDIATE_MAX) { immediateEmail = true; proEmails++; }
      else if (!pro && teaserEmails < TEASER_IMMEDIATE_MAX) { immediateEmail = true; teaserEmails++; }
    }
    return { id: b.id, locked: !pro, immediateEmail };
  });
}

/** A lead üzenet-szövege a kérés mezőiből (a kontakt KÜLÖN mezőben utazik). */
export function buildKeresekLeadMessage(req: {
  title: string;
  description: string | null;
  city: string | null;
  whenText: string | null;
}): string {
  const parts = [req.title];
  if (req.description) parts.push(req.description);
  const meta = [req.city ? `📍 ${req.city}` : null, req.whenText ? `🗓️ ${req.whenText}` : null]
    .filter(Boolean)
    .join(" · ");
  if (meta) parts.push(meta);
  parts.push("(A kérés a Kinti nyilvános „Keresek” táblájáról érkezett.)");
  return parts.join("\n\n");
}
