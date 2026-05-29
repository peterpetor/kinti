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

export const DEAL_STORES: DealStore[] = [
  { id: "migros", label: "Migros",    color: "#F60000", initial: "M" },
  { id: "coop",   label: "Coop",      color: "#A11D1D", initial: "C" },
  { id: "denner", label: "Denner",    color: "#E2001A", initial: "D" },
  { id: "lidl",   label: "Lidl",      color: "#0050AA", initial: "L" },
  { id: "aldi",   label: "Aldi Suisse", color: "#0067B1", initial: "A" },
  { id: "volg",   label: "Volg",      color: "#E2001A", initial: "V" },
  { id: "spar",   label: "Spar",      color: "#1A8A3E", initial: "S" },
  { id: "manor",  label: "Manor",     color: "#C8102E", initial: "M" },
  { id: "other",  label: "Egyéb",     color: "#5c6d63", initial: "?" },
];

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
  return DEAL_STORES.find((s) => s.id === id) ?? null;
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
