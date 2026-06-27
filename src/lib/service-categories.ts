/**
 * service-categories.ts — a „Keresek" igény-tábla szakma-kategóriái.
 * Függőség-mentes (kliens + szerver közös): a legördülő és a szerver-validáció.
 */
export const SERVICE_CATEGORIES = [
  { id: "villanyszerelo", label: "Villanyszerelő", emoji: "💡" },
  { id: "vizszerelo", label: "Vízszerelő", emoji: "🚰" },
  { id: "autoszerelo", label: "Autószerelő", emoji: "🚗" },
  { id: "fodrasz", label: "Fodrász / kozmetikus", emoji: "💇" },
  { id: "takaritas", label: "Takarítás", emoji: "🧹" },
  { id: "koltoztetes", label: "Költöztetés / fuvar", emoji: "📦" },
  { id: "epitkezes", label: "Építkezés / felújítás", emoji: "🔨" },
  { id: "fordito", label: "Fordító / tolmács", emoji: "🗣️" },
  { id: "konyvelo", label: "Könyvelő / ügyintézés", emoji: "📊" },
  { id: "babiszitter", label: "Bébiszitter / gyerekfelügyelet", emoji: "🧸" },
  { id: "korrepetalo", label: "Korrepetálás / oktatás", emoji: "📚" },
  { id: "egeszsegugy", label: "Egészségügy / ápolás", emoji: "🩺" },
  { id: "egyeb", label: "Egyéb", emoji: "🔧" },
] as const;

export type ServiceCategoryId = (typeof SERVICE_CATEGORIES)[number]["id"];

export function isValidServiceCategory(id: unknown): id is string {
  return typeof id === "string" && SERVICE_CATEGORIES.some((c) => c.id === id);
}

export function serviceCategory(id: string): { id: string; label: string; emoji: string } | null {
  return SERVICE_CATEGORIES.find((c) => c.id === id) ?? null;
}
