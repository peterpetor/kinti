/**
 * Álláshirdetés-szakmák (job board kategóriák).
 *
 * Stabil `id` kerül a DB-be (jobs.category), a `label` jelenik meg a UI-ban.
 * A lista a kint (CH/AT/DE/NL) dolgozó magyarok tipikus szektoraira ÉS gyakori
 * konkrét szakmáira fókuszál. Bővíthető, de a meglévő `id`-ket NE írd át (a régi
 * hirdetések elvesztenék a szakmájukat). Nincs DB-CHECK, a validáció app-szintű
 * (isValidJobCategory). A `group` a legördülő <optgroup> fejlécet adja — a hosszú
 * lista így böngészhető marad (lásd JobCategoryOptions komponens).
 */

export interface JobCategory {
  id: string;
  label: string;
  emoji: string;
  /** Melyik szektor-csoportba (optgroup) tartozik — a JOB_CATEGORY_GROUP_ORDER id-je. */
  group: string;
}

export interface JobCategoryGroup {
  id: string;
  label: string;
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

/** Szektor-csoportok megjelenítési sorrendben (a legördülő <optgroup> fejlécek). */
export const JOB_CATEGORY_GROUP_ORDER: JobCategoryGroup[] = [
  { id: "epitoipar",    label: "Építőipar & szakiparok" },
  { id: "ipar",         label: "Ipar, gyártás, technika" },
  { id: "jarmu",        label: "Jármű & szállítás" },
  { id: "vendeglatas",  label: "Vendéglátás & turizmus" },
  { id: "egeszsegugy",  label: "Egészségügy & gondozás" },
  { id: "szepseg",      label: "Szépség & wellness" },
  { id: "kereskedelem", label: "Kereskedelem & ügyfélszolgálat" },
  { id: "szolgaltatas", label: "Szolgáltatás & háztartás" },
  { id: "mezogazdasag", label: "Mezőgazdaság & kertészet" },
  { id: "iroda",        label: "Iroda, pénzügy, jog" },
  { id: "it",           label: "IT & média" },
  { id: "oktatas",      label: "Oktatás & nyelvek" },
  { id: "egyeb",        label: "Egyéb" },
];

export const JOB_CATEGORIES: JobCategory[] = [
  // Építőipar & szakiparok
  { id: "epitoipar",         label: "Építőipar (általános)",        emoji: "🏗️", group: "epitoipar" },
  { id: "komuves",           label: "Kőműves / Betonozó",           emoji: "🧱", group: "epitoipar" },
  { id: "burkolo",           label: "Burkoló / Csempéző",           emoji: "🟫", group: "epitoipar" },
  { id: "padloburkolo",      label: "Parkettázó / Padlóburkoló",    emoji: "🪵", group: "epitoipar" },
  { id: "festo",             label: "Festő / Mázoló",               emoji: "🎨", group: "epitoipar" },
  { id: "asztalos",          label: "Asztalos / Ács",               emoji: "🪚", group: "epitoipar" },
  { id: "tetofedo",          label: "Tetőfedő / Bádogos",           emoji: "🏠", group: "epitoipar" },
  { id: "gipszkarton",       label: "Gipszkarton / Szárazépítő",    emoji: "🔨", group: "epitoipar" },
  { id: "szigetelo",         label: "Szigetelő / Homlokzat",        emoji: "🧊", group: "epitoipar" },
  { id: "uveges",            label: "Üveges / Ablakszerelő",        emoji: "🪟", group: "epitoipar" },
  { id: "villanyszerelo",    label: "Villanyszerelő / Elektro",     emoji: "⚡", group: "epitoipar" },
  { id: "vizszerelo",        label: "Víz- / Fűtésszerelő (SHK)",    emoji: "🚿", group: "epitoipar" },
  { id: "epuletgepesz",      label: "Épületgépész (HLK / Klíma)",   emoji: "🌡️", group: "epitoipar" },
  { id: "hegeszto",          label: "Hegesztő / Lakatos",           emoji: "🔩", group: "epitoipar" },
  { id: "allvanyozo",        label: "Állványozó",                   emoji: "🪜", group: "epitoipar" },
  { id: "foldmunkas",        label: "Földmunkás / Építőgép-kezelő", emoji: "🚜", group: "epitoipar" },
  { id: "daru",              label: "Darukezelő",                   emoji: "🪝", group: "epitoipar" },
  // Ipar, gyártás, technika
  { id: "ipar-gyartas",      label: "Ipar / Gyártás (általános)",   emoji: "🏭", group: "ipar" },
  { id: "szereldei",         label: "Összeszerelő / Betanított munkás", emoji: "🧩", group: "ipar" },
  { id: "cnc",               label: "CNC / Gépkezelő",              emoji: "⚙️", group: "ipar" },
  { id: "forgacsolo",        label: "Forgácsoló / Esztergályos",    emoji: "🗜️", group: "ipar" },
  { id: "gepesz",            label: "Gépész / Karbantartó",         emoji: "🛠️", group: "ipar" },
  { id: "elektronika",       label: "Elektronika / Automatizálás",  emoji: "🔌", group: "ipar" },
  { id: "muanyag",           label: "Műanyag- / Gumifeldolgozó",    emoji: "🧪", group: "ipar" },
  { id: "csomagolo",         label: "Csomagoló / Gyártósori munkás", emoji: "🏷️", group: "ipar" },
  // Jármű & szállítás
  { id: "logisztika",        label: "Logisztika / Raktár",          emoji: "🚚", group: "jarmu" },
  { id: "sofor",             label: "Kamionsofőr (C / CE)",         emoji: "🚛", group: "jarmu" },
  { id: "buszsofor",         label: "Buszsofőr",                    emoji: "🚌", group: "jarmu" },
  { id: "taxi",              label: "Taxi / Személyszállítás",      emoji: "🚕", group: "jarmu" },
  { id: "futar",             label: "Futár / Kézbesítő",            emoji: "📦", group: "jarmu" },
  { id: "targoncas",         label: "Targoncavezető / Raktári gépkezelő", emoji: "📥", group: "jarmu" },
  { id: "gepjarmu",          label: "Autószerelő / Gépjármű",       emoji: "🚗", group: "jarmu" },
  // Vendéglátás & turizmus
  { id: "vendeglatas",       label: "Vendéglátás (általános)",      emoji: "🍽️", group: "vendeglatas" },
  { id: "szakacs",           label: "Szakács / Konyhafőnök",        emoji: "👨‍🍳", group: "vendeglatas" },
  { id: "pincer",            label: "Pincér / Felszolgáló",         emoji: "🍷", group: "vendeglatas" },
  { id: "konyhai",           label: "Konyhai kisegítő / Mosogató",  emoji: "🍴", group: "vendeglatas" },
  { id: "gyorsetterem",      label: "Gyorséttermi munkatárs",       emoji: "🍔", group: "vendeglatas" },
  { id: "pek",               label: "Pék / Cukrász",                emoji: "🥐", group: "vendeglatas" },
  { id: "barista",           label: "Barista / Kávézó",             emoji: "☕", group: "vendeglatas" },
  { id: "csapos",            label: "Csapos / Bártender",           emoji: "🍸", group: "vendeglatas" },
  { id: "catering",          label: "Catering / Rendezvény",        emoji: "🥂", group: "vendeglatas" },
  { id: "hotel",             label: "Szálloda / Recepció",          emoji: "🏨", group: "vendeglatas" },
  { id: "idegenvezeto",      label: "Idegenvezető / Turizmus",      emoji: "🧭", group: "vendeglatas" },
  // Egészségügy & gondozás
  { id: "egeszsegugy",       label: "Egészségügy / Ápolás",         emoji: "🩺", group: "egeszsegugy" },
  { id: "idosgondozas",      label: "Idős- / Beteggondozás",        emoji: "🧓", group: "egeszsegugy" },
  { id: "gyermekfelugyelet", label: "Gyermekfelügyelet / Au pair",  emoji: "🧸", group: "egeszsegugy" },
  { id: "szocialis",         label: "Szociális munkás / Gondozó",   emoji: "🤲", group: "egeszsegugy" },
  { id: "mento",             label: "Mentő / Betegszállító",        emoji: "🚑", group: "egeszsegugy" },
  { id: "fogaszat",          label: "Fogászati asszisztens",        emoji: "🦷", group: "egeszsegugy" },
  { id: "optikus",           label: "Optikus / Látszerész",         emoji: "👓", group: "egeszsegugy" },
  { id: "gyogyszertar",      label: "Gyógyszertár / Asszisztens",   emoji: "💊", group: "egeszsegugy" },
  { id: "laborasszisztens",  label: "Labor-asszisztens",            emoji: "🔬", group: "egeszsegugy" },
  { id: "massaz",            label: "Masszőr / Gyógytornász",       emoji: "💆", group: "egeszsegugy" },
  // Szépség & wellness
  { id: "szepsegipar",       label: "Szépségipar (általános)",      emoji: "💇", group: "szepseg" },
  { id: "fodrasz",           label: "Fodrász",                      emoji: "✂️", group: "szepseg" },
  { id: "borbely",           label: "Borbély / Férfifodrász",       emoji: "💈", group: "szepseg" },
  { id: "kozmetikus",        label: "Kozmetikus",                   emoji: "💄", group: "szepseg" },
  { id: "sminkes",           label: "Sminkes / Make-up",            emoji: "🎭", group: "szepseg" },
  { id: "mukormos",          label: "Műkörmös / Nail",              emoji: "💅", group: "szepseg" },
  { id: "tetovalo",          label: "Tetováló / Piercing",          emoji: "🖊️", group: "szepseg" },
  { id: "wellness",          label: "Wellness / Spa / Szolárium",   emoji: "🧖", group: "szepseg" },
  // Kereskedelem & ügyfélszolgálat
  { id: "kereskedelem",      label: "Kereskedelem / Eladó",         emoji: "🛒", group: "kereskedelem" },
  { id: "penztaros",         label: "Pénztáros / Kassza",           emoji: "🧾", group: "kereskedelem" },
  { id: "arufeltolto",       label: "Árufeltöltő / Polcpakoló",     emoji: "🏬", group: "kereskedelem" },
  { id: "boltvezeto",        label: "Bolt- / Üzletvezető",          emoji: "🔑", group: "kereskedelem" },
  { id: "ugyfelszolgalat",   label: "Ügyfélszolgálat / Call center", emoji: "📞", group: "kereskedelem" },
  { id: "ertekesites",       label: "Értékesítés / Sales",          emoji: "🤝", group: "kereskedelem" },
  { id: "webshop",           label: "Webshop / E-commerce",         emoji: "🛍️", group: "kereskedelem" },
  { id: "ingatlan",          label: "Ingatlanügynök / Makler",      emoji: "🏘️", group: "kereskedelem" },
  { id: "biztositas",        label: "Biztosítási ügynök",           emoji: "📑", group: "kereskedelem" },
  // Szolgáltatás & háztartás
  { id: "takaritas",         label: "Takarítás / Háztartás",        emoji: "🧹", group: "szolgaltatas" },
  { id: "ablaktisztito",     label: "Ablaktisztító / Homlokzat",    emoji: "🧽", group: "szolgaltatas" },
  { id: "mosoda",            label: "Mosoda / Vegytisztító",        emoji: "🧺", group: "szolgaltatas" },
  { id: "koltoztetes",       label: "Költöztető / Bútorszállító",   emoji: "🛋️", group: "szolgaltatas" },
  { id: "biztonsag",         label: "Biztonság / Őrzés",            emoji: "🛡️", group: "szolgaltatas" },
  { id: "karbantartas",      label: "Házmester / Karbantartó",      emoji: "🪛", group: "szolgaltatas" },
  { id: "hulladek",          label: "Hulladékgyűjtő / Köztisztaság", emoji: "♻️", group: "szolgaltatas" },
  // Mezőgazdaság & kertészet
  { id: "mezogazdasag",      label: "Mezőgazdaság",                 emoji: "🌱", group: "mezogazdasag" },
  { id: "idenymunkas",       label: "Idénymunkás / Szüretelő",      emoji: "🍓", group: "mezogazdasag" },
  { id: "kertesz",           label: "Kertészet / Zöldterület",      emoji: "🌳", group: "mezogazdasag" },
  { id: "viragkoto",         label: "Virágkötő / Florista",         emoji: "💐", group: "mezogazdasag" },
  { id: "allattenyesztes",   label: "Állattenyésztés / Farm",       emoji: "🐄", group: "mezogazdasag" },
  { id: "borasz",            label: "Borász / Pincészet",           emoji: "🍇", group: "mezogazdasag" },
  // Iroda, pénzügy, jog
  { id: "iroda",             label: "Iroda / Adminisztráció",       emoji: "💼", group: "iroda" },
  { id: "asszisztens",       label: "Asszisztens / Titkárság",      emoji: "🗂️", group: "iroda" },
  { id: "penzugy",           label: "Pénzügy / Könyvelés",          emoji: "📊", group: "iroda" },
  { id: "bank",              label: "Bank / Pénzügyi tanácsadó",    emoji: "🏦", group: "iroda" },
  { id: "beszerzes",         label: "Beszerzés / Logisztikai admin", emoji: "🧮", group: "iroda" },
  { id: "hr",                label: "HR / Toborzás",                emoji: "🧑‍💼", group: "iroda" },
  { id: "jog",               label: "Jog / Ügyvéd / Jogász",        emoji: "⚖️", group: "iroda" },
  // IT & média
  { id: "it",                label: "Informatika (általános)",      emoji: "💻", group: "it" },
  { id: "rendszergazda",     label: "Rendszergazda / IT support",   emoji: "🖥️", group: "it" },
  { id: "tesztelo",          label: "Szoftvertesztelő (QA)",        emoji: "🐞", group: "it" },
  { id: "adatelemzo",        label: "Adatelemző / Data",            emoji: "📈", group: "it" },
  { id: "media",             label: "Marketing / Média",            emoji: "📣", group: "it" },
  { id: "grafikus",          label: "Grafikus / UX-UI",             emoji: "🖌️", group: "it" },
  { id: "fotos",             label: "Fotós / Videós",               emoji: "📷", group: "it" },
  // Oktatás & nyelvek
  { id: "oktatas",           label: "Oktatás / Nevelés",            emoji: "🎓", group: "oktatas" },
  { id: "ovoda",             label: "Óvoda / Bölcsőde",             emoji: "🧑‍🏫", group: "oktatas" },
  { id: "korrepetalo",       label: "Korrepetáló / Magántanár",     emoji: "📚", group: "oktatas" },
  { id: "nyelvtanar",        label: "Nyelvtanár / Fordító",         emoji: "🗣️", group: "oktatas" },
  { id: "edzo",              label: "Edző / Fitness / Sport",       emoji: "🏋️", group: "oktatas" },
  // Egyéb
  { id: "egyeb",             label: "Egyéb",                        emoji: "🔧", group: "egyeb" },
];

/** A szakmák szektor-csoportokba rendezve (a legördülő <optgroup>-okhoz). Üres
 *  csoport nem kerül bele. */
export const JOB_CATEGORY_GROUPS: (JobCategoryGroup & { items: JobCategory[] })[] =
  JOB_CATEGORY_GROUP_ORDER
    .map((g) => ({ ...g, items: JOB_CATEGORIES.filter((c) => c.group === g.id) }))
    .filter((g) => g.items.length > 0);

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
