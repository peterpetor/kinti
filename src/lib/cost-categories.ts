/**
 * cost-categories.ts — a „Mennyit költesz?" megélhetési-benchmark kategóriái.
 * Függőség-mentes (kliens + szerver közös): a kérdőív és a szerver-validáció.
 * A `min`/`max` a havi összeg ésszerű tartománya (kamu-adat elleni validáció).
 */
export interface CostCategory {
  id: string;
  label: string;
  emoji: string;
  /** Rövid segéd-szöveg az input alá. */
  hint: string;
  min: number;
  max: number;
}

export const COST_CATEGORIES: CostCategory[] = [
  { id: "alberlet",       label: "Albérlet / lakbér",                 emoji: "🏠", hint: "Havi lakbér (mellékköltség nélkül)", min: 300, max: 6000 },
  { id: "rezsi",          label: "Rezsi (áram / fűtés / víz)",        emoji: "🔌", hint: "Havi mellékköltség / Nebenkosten", min: 0, max: 1500 },
  { id: "krankenkasse",   label: "Egészségbiztosítás (Krankenkasse)", emoji: "🏥", hint: "Havi alapdíj fejenként", min: 50, max: 1500 },
  { id: "kaja",           label: "Élelmiszer / havi kaja",            emoji: "🛒", hint: "Bevásárlás havonta (háztartás)", min: 100, max: 3000 },
  { id: "kozlekedes",     label: "Közlekedés",                        emoji: "🚆", hint: "Bérlet / benzin havonta", min: 0, max: 1200 },
  { id: "auto",           label: "Autó fenntartása",                  emoji: "🚗", hint: "Biztosítás, üzemanyag, szerviz havonta", min: 0, max: 2500 },
  { id: "internet_mobil", label: "Internet + mobil",                  emoji: "📱", hint: "Otthoni net + telefon havonta", min: 20, max: 600 },
  { id: "szabadido",      label: "Szabadidő / szórakozás",            emoji: "🎭", hint: "Étterem, mozi, hobbi, sport havonta", min: 0, max: 2500 },
  { id: "ruha",           label: "Ruházkodás",                        emoji: "👕", hint: "Ruha, cipő havi átlag", min: 0, max: 1500 },
  { id: "gyerek",         label: "Gyerek (bölcsőde / óvoda)",         emoji: "🧸", hint: "Havi gyerekfelügyelet, ha van", min: 0, max: 5000 },
];

const BY_ID = new Map(COST_CATEGORIES.map((c) => [c.id, c]));

export function isValidCostCategory(id: unknown): id is string {
  return typeof id === "string" && BY_ID.has(id);
}

export function costCategory(id: string): CostCategory | null {
  return BY_ID.get(id) ?? null;
}
