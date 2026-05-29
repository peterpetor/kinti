/**
 * Hofladen (helyi termelői pontok) modul — térkép-alapú lista a svájci
 * 24h-ban nyitva tartó becsületkasszás / Twint-es farmer-boltokról.
 *
 * Tipikus tartalom: friss tej, tojás, sajt, hús, méz, idényfrissek.
 */

export interface HofladenCategory {
  id: string;
  label: string;
  emoji: string;
}

export const HOFLADEN_CATEGORIES: HofladenCategory[] = [
  { id: "milk",       label: "Tej / tejtermék",   emoji: "🥛" },
  { id: "eggs",       label: "Tojás",              emoji: "🥚" },
  { id: "cheese",     label: "Sajt",               emoji: "🧀" },
  { id: "meat",       label: "Hús / kolbász",      emoji: "🥩" },
  { id: "honey",      label: "Méz",                emoji: "🍯" },
  { id: "vegetables", label: "Zöldség",            emoji: "🥕" },
  { id: "fruits",     label: "Gyümölcs",           emoji: "🍎" },
  { id: "bread",      label: "Kenyér / pékáru",    emoji: "🥖" },
  { id: "wine",       label: "Bor / pálinka",      emoji: "🍷" },
  { id: "other",      label: "Egyéb",              emoji: "🌾" },
];

export interface PaymentMethod {
  id: string;
  label: string;
  emoji: string;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "cash",     label: "Becsületkassza",  emoji: "💵" },
  { id: "twint",    label: "Twint",            emoji: "📱" },
  { id: "card",     label: "Bankkártya",       emoji: "💳" },
  { id: "postcheck",label: "Postcheck",        emoji: "📮" },
];

export function getCategoryById(id: string): HofladenCategory | null {
  return HOFLADEN_CATEGORIES.find((c) => c.id === id) ?? null;
}

export function getPaymentMethodById(id: string): PaymentMethod | null {
  return PAYMENT_METHODS.find((p) => p.id === id) ?? null;
}

/** JSON tömb → string[] helper. */
export function parseStringList(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}
