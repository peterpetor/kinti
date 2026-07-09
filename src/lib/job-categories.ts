/**
 * Álláshirdetés-szakmák (job board kategóriák).
 *
 * Stabil `id` kerül a DB-be (jobs.category), a `label` jelenik meg a UI-ban.
 * A lista a kint (CH/AT/DE/NL) dolgozó magyarok tipikus szektoraira ÉS gyakori
 * konkrét szakmáira fókuszál (finomabb bontás: festő, villanyszerelő, gondozás
 * stb.). Bővíthető, de a meglévő `id`-ket NE írd át (a régi hirdetések
 * elvesztenék a szakmájukat). Sorrend = megjelenítési sorrend (rokon szakmák
 * egy csoportban); nincs DB-CHECK, a validáció app-szintű (isValidJobCategory).
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
  // Építőipar + kapcsolódó szakiparok
  { id: "epitoipar",         label: "Építőipar",                emoji: "🏗️" },
  { id: "villanyszerelo",    label: "Villanyszerelő / Elektro", emoji: "⚡" },
  { id: "vizszerelo",        label: "Víz- / Fűtésszerelő",      emoji: "🚿" },
  { id: "festo",             label: "Festő / Mázoló",           emoji: "🎨" },
  { id: "asztalos",          label: "Asztalos / Ács",           emoji: "🪚" },
  { id: "hegeszto",          label: "Hegesztő / Lakatos",       emoji: "🔩" },
  // Vendéglátás
  { id: "vendeglatas",       label: "Vendéglátás / Gastro",     emoji: "🍽️" },
  // Egészségügy + gondozás
  { id: "egeszsegugy",       label: "Egészségügy / Ápolás",     emoji: "🩺" },
  { id: "idosgondozas",      label: "Idős- / Beteggondozás",    emoji: "🧓" },
  { id: "gyermekfelugyelet", label: "Gyermekfelügyelet / Au pair", emoji: "🧸" },
  // Szállítás + ipar
  { id: "logisztika",        label: "Logisztika / Sofőr",       emoji: "🚚" },
  { id: "gepjarmu",          label: "Autószerelő / Gépjármű",   emoji: "🚗" },
  { id: "ipar-gyartas",      label: "Ipar / Gyártás",           emoji: "🏭" },
  // Szolgáltatás + kereskedelem
  { id: "takaritas",         label: "Takarítás / Háztartás",    emoji: "🧹" },
  { id: "kereskedelem",      label: "Kereskedelem / Eladó",     emoji: "🛒" },
  { id: "mezogazdasag",      label: "Mezőgazdaság",             emoji: "🌱" },
  { id: "kertesz",           label: "Kertészet / Zöldterület",  emoji: "🌳" },
  { id: "szepsegipar",       label: "Szépségipar",              emoji: "💇" },
  // Iroda / szellemi
  { id: "iroda",             label: "Iroda / Adminisztráció",   emoji: "💼" },
  { id: "penzugy",           label: "Pénzügy / Könyvelés",      emoji: "📊" },
  { id: "it",                label: "Informatika (IT)",         emoji: "💻" },
  { id: "oktatas",           label: "Oktatás / Nevelés",        emoji: "🎓" },
  { id: "biztonsag",         label: "Biztonság / Őrzés",        emoji: "🛡️" },
  { id: "egyeb",             label: "Egyéb",                    emoji: "🔧" },
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
