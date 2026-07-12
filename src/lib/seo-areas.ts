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
  /**
   * VÁROS-szintű oldal: a régió-kódon BELÜL a cím is tartalmazza valamelyik
   * névváltozatot (szó-határosan — a „Kölner Str." nem köln-i találat).
   * A helyi írásmódot add meg (Köln, Düsseldorf) — a címek úgy tárolódnak.
   */
  cityMatch?: string[];
}

/**
 * Szó-határos város-illesztés a cím-szövegre: a név előtt/után nem állhat
 * újabb betű (különben „Köln" ⊂ „Kölner Straße" hamis találat lenne).
 */
export function addressMatchesCity(address: string | null | undefined, names: string[]): boolean {
  if (!address) return false;
  const addr = address.toLowerCase();
  return names.some((name) => {
    const n = name.toLowerCase();
    let from = 0;
    for (;;) {
      const i = addr.indexOf(n, from);
      if (i === -1) return false;
      const before = i === 0 ? "" : addr[i - 1];
      const after = i + n.length >= addr.length ? "" : addr[i + n.length];
      const isLetter = (ch: string) => !!ch && ch.toLowerCase() !== ch.toUpperCase();
      if (!isLetter(before) && !isLetter(after)) return true;
      from = i + 1;
    }
  });
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
  // Ausztria — mind a 9 Bundesland (magyar exonimákkal) + a nagyvárosok.
  { slug: "becs", country: "AT", code: "W", name: "Bécs", locative: "Bécsben" },
  { slug: "burgenland", country: "AT", code: "BGL", name: "Burgenland", locative: "Burgenlandban" },
  { slug: "salzburg", country: "AT", code: "SBG", name: "Salzburg", locative: "Salzburgban" },
  { slug: "felso-ausztria", country: "AT", code: "OOE", name: "Felső-Ausztria", locative: "Felső-Ausztriában" },
  { slug: "also-ausztria", country: "AT", code: "NOE", name: "Alsó-Ausztria", locative: "Alsó-Ausztriában" },
  { slug: "stajerorszag", country: "AT", code: "STM", name: "Stájerország", locative: "Stájerországban" },
  { slug: "tirol", country: "AT", code: "TIR", name: "Tirol", locative: "Tirolban" },
  { slug: "vorarlberg", country: "AT", code: "VBG", name: "Vorarlberg", locative: "Vorarlbergben" },
  { slug: "karintia", country: "AT", code: "KTN", name: "Karintia", locative: "Karintiában" },
  { slug: "graz", country: "AT", code: "STM", name: "Graz", locative: "Grazban", cityMatch: ["Graz"] },
  { slug: "linz", country: "AT", code: "OOE", name: "Linz", locative: "Linzben", cityMatch: ["Linz"] },
  { slug: "innsbruck", country: "AT", code: "TIR", name: "Innsbruck", locative: "Innsbruckban", cityMatch: ["Innsbruck"] },
  { slug: "klagenfurt", country: "AT", code: "KTN", name: "Klagenfurt", locative: "Klagenfurtban", cityMatch: ["Klagenfurt"] },
  // Németország — mind a 16 Land + a magyarok-lakta nagyvárosok.
  { slug: "berlin", country: "DE", code: "BE", name: "Berlin", locative: "Berlinben" },
  { slug: "munchen", country: "DE", code: "BY", name: "München és környéke", locative: "München környékén" },
  { slug: "frankfurt", country: "DE", code: "HE", name: "Frankfurt és környéke", locative: "Frankfurt környékén" },
  { slug: "baden-wurttemberg", country: "DE", code: "BW", name: "Baden-Württemberg", locative: "Baden-Württembergben" },
  { slug: "eszak-rajna-vesztfalia", country: "DE", code: "NW", name: "Észak-Rajna-Vesztfália", locative: "Észak-Rajna-Vesztfáliában" },
  { slug: "hamburg", country: "DE", code: "HH", name: "Hamburg", locative: "Hamburgban" },
  { slug: "rajna-videk-pfalz", country: "DE", code: "RP", name: "Rajna-vidék-Pfalz", locative: "Rajna-vidék-Pfalzban" },
  { slug: "szaszorszag", country: "DE", code: "SN", name: "Szászország", locative: "Szászországban" },
  { slug: "also-szaszorszag", country: "DE", code: "NI", name: "Alsó-Szászország", locative: "Alsó-Szászországban" },
  { slug: "turingia", country: "DE", code: "TH", name: "Türingia", locative: "Türingiában" },
  { slug: "szasz-anhalt", country: "DE", code: "ST", name: "Szász-Anhalt", locative: "Szász-Anhaltban" },
  { slug: "saar-videk", country: "DE", code: "SL", name: "Saar-vidék", locative: "a Saar-vidéken" },
  { slug: "schleswig-holstein", country: "DE", code: "SH", name: "Schleswig-Holstein", locative: "Schleswig-Holsteinben" },
  { slug: "mecklenburg", country: "DE", code: "MV", name: "Mecklenburg-Elő-Pomeránia", locative: "Mecklenburg-Elő-Pomerániában" },
  { slug: "brandenburg", country: "DE", code: "BB", name: "Brandenburg", locative: "Brandenburgban" },
  { slug: "brema", country: "DE", code: "HB", name: "Bréma", locative: "Brémában" },
  { slug: "stuttgart", country: "DE", code: "BW", name: "Stuttgart", locative: "Stuttgartban", cityMatch: ["Stuttgart"] },
  { slug: "koln", country: "DE", code: "NW", name: "Köln", locative: "Kölnben", cityMatch: ["Köln"] },
  { slug: "dusseldorf", country: "DE", code: "NW", name: "Düsseldorf", locative: "Düsseldorfban", cityMatch: ["Düsseldorf"] },
  { slug: "nurnberg", country: "DE", code: "BY", name: "Nürnberg", locative: "Nürnbergben", cityMatch: ["Nürnberg"] },
  // Hollandia — mind a 12 provincia + a nagyvárosok.
  { slug: "amszterdam", country: "NL", code: "NH", name: "Amszterdam és környéke", locative: "Amszterdam környékén" },
  { slug: "zuid-holland", country: "NL", code: "ZH", name: "Zuid-Holland (Rotterdam, Leiden)", locative: "Zuid-Hollandban" },
  { slug: "utrecht", country: "NL", code: "UT", name: "Utrecht", locative: "Utrechtben" },
  { slug: "groningen", country: "NL", code: "GR", name: "Groningen", locative: "Groningenben" },
  { slug: "noord-brabant", country: "NL", code: "NB", name: "Noord-Brabant", locative: "Noord-Brabantban" },
  { slug: "limburg", country: "NL", code: "LI", name: "Limburg", locative: "Limburgban" },
  { slug: "gelderland", country: "NL", code: "GE", name: "Gelderland", locative: "Gelderlandban" },
  { slug: "overijssel", country: "NL", code: "OV", name: "Overijssel", locative: "Overijsselben" },
  { slug: "flevoland", country: "NL", code: "FL", name: "Flevoland", locative: "Flevolandban" },
  { slug: "zeeland", country: "NL", code: "ZE", name: "Zeeland", locative: "Zeelandban" },
  { slug: "friesland", country: "NL", code: "FR", name: "Friesland", locative: "Frieslandban" },
  { slug: "drenthe", country: "NL", code: "DR", name: "Drenthe", locative: "Drenthében" },
  { slug: "rotterdam", country: "NL", code: "ZH", name: "Rotterdam", locative: "Rotterdamban", cityMatch: ["Rotterdam"] },
  { slug: "haga", country: "NL", code: "ZH", name: "Hága", locative: "Hágában", cityMatch: ["Den Haag", "'s-Gravenhage", "The Hague"] },
  { slug: "eindhoven", country: "NL", code: "NB", name: "Eindhoven", locative: "Eindhovenben", cityMatch: ["Eindhoven"] },
];

export const SEO_AREAS: SeoArea[] = [...CH_CANTON_AREAS, ...EXTRA_AREAS];

export function areaFromSlug(slug: string): SeoArea | null {
  return SEO_AREAS.find((a) => a.slug === slug) ?? null;
}

/** Egy vállalkozás ebbe a területbe tartozik-e. */
export function businessInArea(b: Business, area: SeoArea): boolean {
  if ((b.country || "CH") !== area.country) return false;
  if (area.code === null) return true;
  let inRegion = b.canton === area.code;
  // Svájci örökség: sok régi sor canton-kód nélkül — a cím PLZ-jéből (mint a Szaknévsor).
  if (!inRegion && area.country === "CH" && !b.canton) {
    inRegion = cantonFromAddress(b.address ?? null)?.code === area.code;
  }
  if (!inRegion) return false;
  // Város-szintű terület: a régión belül a címnek is illeszkednie kell.
  if (area.cityMatch) return addressMatchesCity(b.address, area.cityMatch);
  return true;
}

/** Az összes terület, amibe a vállalkozás beleesik (sitemap-kombókhoz). */
export function areasForBusiness(b: Business): SeoArea[] {
  return SEO_AREAS.filter((a) => businessInArea(b, a));
}
