/**
 * magyar-bolt.ts — „Magyar bolt a sarkon" hely-kategóriák (közös kliens/szerver).
 * Magyar „otthoni íz" helyek: pékség, hentes, bolt, étterem, cukrászda, piac.
 */
export interface BoltCategory {
  id: string;
  label: string;
  emoji: string;
  color: string;
}

/** Egy térkép-hely (kliens+szerver közös típus — NE a repo-ból importáld kliensbe). */
export interface BoltSpot {
  id: string;
  name: string;
  category: string | null;
  locationName: string | null;
  lat: number;
  lng: number;
  country: string;
  cantonCode: string | null;
  note: string | null;
  createdAt: string;
}

export const BOLT_CATEGORIES: BoltCategory[] = [
  { id: "pekseg",    label: "Pékség / kenyér",        emoji: "🥖", color: "#d97706" },
  { id: "hentes",    label: "Hentes / húsbolt",       emoji: "🥩", color: "#c8392e" },
  { id: "bolt",      label: "Élelmiszerbolt / deli",  emoji: "🛒", color: "#1d4434" },
  { id: "etterem",   label: "Étterem / bisztró",      emoji: "🍽️", color: "#e2901a" },
  { id: "cukraszda", label: "Cukrászda",              emoji: "🍰", color: "#db2777" },
  { id: "piac",      label: "Piac / standos",         emoji: "🧺", color: "#7c3aed" },
];

const BY_ID = new Map(BOLT_CATEGORIES.map((c) => [c.id, c]));

export function isValidBoltCategory(id: unknown): id is string {
  return typeof id === "string" && BY_ID.has(id);
}

export function boltCategory(id: string | null): BoltCategory | null {
  return id ? BY_ID.get(id) ?? null : null;
}
