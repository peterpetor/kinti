/**
 * seo-areas.ts — a /magyar/[kategoria]/[terulet] SEO-céloldalak TERÜLET-modellje.
 *
 * Eredetileg a landing csak svájci kantonokra létezett ([[binary-country-
 * fallthrough]] minta) — 2026-07-03-tól ország-tudatos: a CH-kantonok a RÉGI
 * URL-jeiken maradnak (zurich, bern, …), plusz kurált AT/DE/NL területek
 * (becs, berlin, amszterdam, …) és ország-szintű oldalak (svajc, ausztria, …).
 *
 * Terület-illesztés: business.canton (régió-kód) + ország; a régi svájci sorok
 * canton nélkül a cím PLZ-jéből oldódnak fel (cantonFromAddress — mint a
 * Szaknévsor szűrője). Az ország-terület (code=null) mindenre illik az országban.
 *
 * Bővítés: új terület = egy sor az EXTRA_AREAS-ban (slug ütközés-mentes legyen
 * a kanton-slugokkal). A sitemap és a kapcsolódó-linkek automatikusan követik.
 */
import { CANTONS, cantonFromAddress, cantonToSlug } from "./cantons";
import type { Business } from "./types";

export interface SeoArea {
  /** URL-szegmens: /magyar/[kategoria]/[slug]. */
  slug: string;
  country: "CH" | "AT" | "DE" | "NL";
  /** Régió-kód (business.canton); null = az EGÉSZ ország oldala. */
  code: string | null;
  /** Megjelenő név: „Zürich kanton", „Bécs", „Ausztria". */
  name: string;
  /** Helyhatározós alak a copy-hoz: „Zürich kantonban", „Bécsben". */
  locative: string;
}

export const COUNTRY_NAMES: Record<string, string> = {
  CH: "Svájc",
  AT: "Ausztria",
  DE: "Németország",
  NL: "Hollandia",
};

/** A 26 svájci kanton — a slugok a KORÁBBI landing-URL-ekkel azonosak. */
const CH_CANTON_AREAS: SeoArea[] = CANTONS.map((c) => ({
  slug: cantonToSlug(c.name),
  country: "CH" as const,
  code: c.code,
  name: `${c.name} kanton`,
  locative: `${c.name} kantonban`,
}));

const EXTRA_AREAS: SeoArea[] = [
  // Ország-szintű oldalak — sosem „thin", ha az országban van bármi a kategóriában.
  { slug: "svajc", country: "CH", code: null, name: "Svájc", locative: "Svájcban" },
  { slug: "ausztria", country: "AT", code: null, name: "Ausztria", locative: "Ausztriában" },
  { slug: "nemetorszag", country: "DE", code: null, name: "Németország", locative: "Németországban" },
  { slug: "hollandia", country: "NL", code: null, name: "Hollandia", locative: "Hollandiában" },
  // Ausztria
  { slug: "becs", country: "AT", code: "W", name: "Bécs", locative: "Bécsben" },
  { slug: "burgenland", country: "AT", code: "BGL", name: "Burgenland", locative: "Burgenlandban" },
  // Németország
  { slug: "berlin", country: "DE", code: "BE", name: "Berlin", locative: "Berlinben" },
  { slug: "munchen", country: "DE", code: "BY", name: "München és környéke", locative: "München környékén" },
  { slug: "frankfurt", country: "DE", code: "HE", name: "Frankfurt és környéke", locative: "Frankfurt környékén" },
  // Hollandia
  { slug: "amszterdam", country: "NL", code: "NH", name: "Amszterdam és környéke", locative: "Amszterdam környékén" },
  { slug: "zuid-holland", country: "NL", code: "ZH", name: "Zuid-Holland (Rotterdam, Leiden)", locative: "Zuid-Hollandban" },
  { slug: "utrecht", country: "NL", code: "UT", name: "Utrecht", locative: "Utrechtben" },
  { slug: "groningen", country: "NL", code: "GR", name: "Groningen", locative: "Groningenben" },
];

export const SEO_AREAS: SeoArea[] = [...CH_CANTON_AREAS, ...EXTRA_AREAS];

export function areaFromSlug(slug: string): SeoArea | null {
  return SEO_AREAS.find((a) => a.slug === slug) ?? null;
}

/** Egy vállalkozás ebbe a területbe tartozik-e. */
export function businessInArea(b: Business, area: SeoArea): boolean {
  if ((b.country || "CH") !== area.country) return false;
  if (area.code === null) return true;
  if (b.canton === area.code) return true;
  // Svájci örökség: sok régi sor canton-kód nélkül — a cím PLZ-jéből (mint a Szaknévsor).
  if (area.country === "CH" && !b.canton) {
    return cantonFromAddress(b.address ?? null)?.code === area.code;
  }
  return false;
}

/** Az összes terület, amibe a vállalkozás beleesik (sitemap-kombókhoz). */
export function areasForBusiness(b: Business): SeoArea[] {
  return SEO_AREAS.filter((a) => businessInArea(b, a));
}
