/**
 * Svájci akció-térkép modul — konstansok és típusok.
 *
 * Bolt-láncok, kategóriák, kedvezmény-fokozatok. NEM tárol képet — anti-abuse.
 * Jelentés-TTL: aznap éjfélig (Europe/Zurich).
 */

export interface DealStore {
  id: string;
  label: string;
  /** Brand-szín — a térképi pin színe. */
  color: string;
  /** Rövid betű a pin közepére (ha nincs logo). */
  initial: string;
}

export interface DealCategory {
  id: string;
  label: string;
  emoji: string;
}

const OTHER_STORE: DealStore = { id: "other", label: "Egyéb", color: "#5c6d63", initial: "?" };

/** Svájci bolt-láncok. */
export const DEAL_STORES_CH: DealStore[] = [
  { id: "migros", label: "Migros",      color: "#F60000", initial: "M" },
  { id: "coop",   label: "Coop",        color: "#A11D1D", initial: "C" },
  { id: "denner", label: "Denner",      color: "#E2001A", initial: "D" },
  { id: "lidl",   label: "Lidl",        color: "#0050AA", initial: "L" },
  { id: "aldi",   label: "Aldi Suisse", color: "#0067B1", initial: "A" },
  { id: "volg",   label: "Volg",        color: "#E2001A", initial: "V" },
  { id: "spar",   label: "Spar",        color: "#1A8A3E", initial: "S" },
  { id: "manor",  label: "Manor",       color: "#C8102E", initial: "M" },
  OTHER_STORE,
];

/** Osztrák bolt-láncok. */
export const DEAL_STORES_AT: DealStore[] = [
  { id: "billa",  label: "Billa",   color: "#E2001A", initial: "B" },
  { id: "spar",   label: "Spar",    color: "#1A8A3E", initial: "S" },
  { id: "hofer",  label: "Hofer",   color: "#0067B1", initial: "H" },
  { id: "lidl",   label: "Lidl",    color: "#0050AA", initial: "L" },
  { id: "penny",  label: "Penny",   color: "#D40511", initial: "P" },
  { id: "merkur", label: "Merkur",  color: "#004F9F", initial: "M" },
  { id: "mpreis", label: "MPREIS",  color: "#E2001A", initial: "M" },
  OTHER_STORE,
];

/** Német bolt-láncok. */
export const DEAL_STORES_DE: DealStore[] = [
  { id: "rewe",     label: "Rewe",     color: "#CC071E", initial: "R" },
  { id: "edeka",    label: "Edeka",    color: "#005CA9", initial: "E" },
  { id: "aldi-de",  label: "Aldi",     color: "#00005F", initial: "A" },
  { id: "lidl",     label: "Lidl",     color: "#0050AA", initial: "L" },
  { id: "kaufland", label: "Kaufland", color: "#E10915", initial: "K" },
  { id: "penny",    label: "Penny",    color: "#D40511", initial: "P" },
  { id: "netto",    label: "Netto",    color: "#E30613", initial: "N" },
  OTHER_STORE,
];

/** Vissza-kompat: a régi `DEAL_STORES` = svájci lista. */
export const DEAL_STORES = DEAL_STORES_CH;

/** Az adott ország bolt-listája (a bejelentő boltválasztójához). */
export function getDealStores(country: string | null | undefined): DealStore[] {
  if (country === "AT") return DEAL_STORES_AT;
  if (country === "DE") return DEAL_STORES_DE;
  return DEAL_STORES_CH;
}

// Lookup minden ország boltjaiból (a térkép a régi/más-országú jelzéseket is
// helyesen jeleníti meg). Ütközésnél az első nyer (azonos brand → mindegy).
const STORE_BY_ID = new Map<string, DealStore>();
for (const s of [...DEAL_STORES_CH, ...DEAL_STORES_AT, ...DEAL_STORES_DE]) {
  if (!STORE_BY_ID.has(s.id)) STORE_BY_ID.set(s.id, s);
}

export const DEAL_CATEGORIES: DealCategory[] = [
  { id: "meat",        label: "Hús",                emoji: "🥩" },
  { id: "fish",        label: "Hal",                emoji: "🐟" },
  { id: "bakery",      label: "Pékáru",             emoji: "🥖" },
  { id: "produce",     label: "Zöldség / gyümölcs", emoji: "🥬" },
  { id: "dairy",       label: "Tejtermék",          emoji: "🧀" },
  { id: "alcohol",     label: "Bor / alkohol",      emoji: "🍷" },
  { id: "sweets",      label: "Édesség",            emoji: "🍫" },
  { id: "ready",       label: "Készétel",           emoji: "🍕" },
  { id: "bio",         label: "Bio termék",         emoji: "🌍" },
  { id: "household",   label: "Háztartási",         emoji: "🧴" },
  { id: "other",       label: "Egyéb",              emoji: "🏷️" },
];

export const DEAL_DISCOUNTS = [20, 25, 30, 40, 50, 60, 75] as const;
export type DealDiscount = typeof DEAL_DISCOUNTS[number];

export function getStoreById(id: string): DealStore | null {
  return STORE_BY_ID.get(id) ?? null;
}

export function getCategoryById(id: string): DealCategory | null {
  return DEAL_CATEGORIES.find((c) => c.id === id) ?? null;
}

/**
 * Az aznapi éjfél (Europe/Zurich) ISO datetime stringje, SQLite-formátum.
 * Ha már éjfél után 0-3h vagyunk, akkor is a következő éjfélig számolunk.
 */
export function todayMidnightCh(): string {
  // Egyszerűsítés: a szerver UTC-ben fut, de a Europe/Zurich +1/+2 UTC.
  // A user-élmény szempontjából: a poszt aznap este látszik, és holnap reggelre eltűnik.
  // ISO-formátum 'YYYY-MM-DD HH:MM:SS' (SQLite-kompatibilis).
  const now = new Date();
  // Z-időben az "aznapi" Z-éjfél
  const midnight = new Date(now);
  midnight.setUTCHours(22, 0, 0, 0); // 22:00 UTC ≈ 23:00/24:00 CH-time
  // Ha már elmúlt, holnapi éjfél
  if (midnight.getTime() < now.getTime()) {
    midnight.setUTCDate(midnight.getUTCDate() + 1);
  }
  return midnight.toISOString().slice(0, 19).replace("T", " ");
}
