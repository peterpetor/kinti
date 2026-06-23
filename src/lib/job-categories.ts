/**
 * Álláshirdetés-szakmák (job board kategóriák).
 *
 * Stabil `id` kerül a DB-be (jobs.category), a `label` jelenik meg a UI-ban.
 * A lista a Svájcban dolgozó magyarok tipikus szektoraira fókuszál. Bővíthető,
 * de a meglévő `id`-ket NE írd át (a régi hirdetések elvesztenék a szakmájukat).
 */

export interface JobCategory {
  id: string;
  label: string;
  emoji: string;
}

/** A tárolt bér-pénznem kód → megjelenítendő címke (pl. CHF_HOUR → „CHF/óra"). */
export function formatJobCurrency(currency: string): string {
  switch (currency) {
    case "CHF": return "CHF/hó";
    case "CHF_HOUR": return "CHF/óra";
    case "EUR": return "EUR/hó";
    case "EUR_HOUR": return "EUR/óra";
    default: return currency;
  }
}

export const JOB_CATEGORIES: JobCategory[] = [
  { id: "epitoipar",    label: "Építőipar",                emoji: "🏗️" },
  { id: "vendeglatas",  label: "Vendéglátás / Gastro",     emoji: "🍽️" },
  { id: "egeszsegugy",  label: "Egészségügy / Ápolás",     emoji: "🩺" },
  { id: "logisztika",   label: "Logisztika / Sofőr",       emoji: "🚚" },
  { id: "ipar-gyartas", label: "Ipar / Gyártás",           emoji: "🏭" },
  { id: "takaritas",    label: "Takarítás / Háztartás",    emoji: "🧹" },
  { id: "kereskedelem", label: "Kereskedelem / Eladó",     emoji: "🛒" },
  { id: "mezogazdasag", label: "Mezőgazdaság",             emoji: "🌱" },
  { id: "szepsegipar",  label: "Szépségipar",              emoji: "💇" },
  { id: "iroda",        label: "Iroda / Adminisztráció",   emoji: "💼" },
  { id: "it",           label: "Informatika (IT)",         emoji: "💻" },
  { id: "egyeb",        label: "Egyéb",                    emoji: "🔧" },
];

const BY_ID = new Map(JOB_CATEGORIES.map((c) => [c.id, c]));

/** Érvényes szakma-id? */
export function isValidJobCategory(id: unknown): id is string {
  return typeof id === "string" && BY_ID.has(id);
}

/** Megjelenítendő címke egy szakma-id-hoz (ismeretlen → null). */
export function jobCategoryLabel(id: string | null | undefined): string | null {
  if (!id) return null;
  return BY_ID.get(id)?.label ?? null;
}
