/**
 * Okos kategória-szűrők konfigurációja.
 *
 * Minden bulletin_kinds ID-hoz megadunk egy-két "okos" mezőt, amit a hirdetés
 * feladásakor felkínálunk (pl. évjárat autóknál), és ami megjelenik a kártyán +
 * szűrőként a BulletinList-ben.
 *
 * A smartFilters JSON-ként tárolódik a DB-ben (smart_filters TEXT oszlop).
 * Formátum: { [fieldId]: string | number }
 */

export interface SmartFilterField {
  /** Egyedi kulcs, amit a JSON-ban is használunk. */
  id: string;
  /** Magyar felirat az űrlapon. */
  label: string;
  /** Beviteli mező típusa. */
  type: "select" | "number" | "text";
  /** `select` típusnál a lehetséges értékek. */
  options?: string[];
  /** Placeholder szöveg. */
  placeholder?: string;
  /** Ha true, kötelező kitölteni a mező. */
  required?: boolean;
  /** Ha meg van adva, ez a szimbólum/egység jelenik meg (pl. "CHF", "kg"). */
  unit?: string;
}

export interface SmartFilterConfig {
  /** `bulletin_kinds.id` */
  kindId: string;
  /** Emberi felirat (info szöveghez). */
  kindLabel: string;
  /** A megjelenítendő mezők (max 4 javasolt). */
  fields: SmartFilterField[];
}

const currentYear = new Date().getFullYear();

// Évjárat-tartomány: 1980..idei év
const YEARS = Array.from({ length: currentYear - 1979 }, (_, i) =>
  String(currentYear - i)
);

// Svájci ruha/cipőméretek
const EU_CLOTHES_SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL"];
const EU_SHOE_SIZES = Array.from({ length: 20 }, (_, i) => String(34 + i)); // 34–53

export const SMART_FILTER_CONFIGS: SmartFilterConfig[] = [
  // ----- ELADÓ ---------------------------------------------------------------
  {
    kindId: "elado",
    kindLabel: "Eladó",
    fields: [
      {
        id: "subcategory",
        label: "Alkategória",
        type: "select",
        options: [
          "Autó / Jármű",
          "Bútor",
          "Elektronika",
          "Ruha / Cipő",
          "Sport / Szabadidő",
          "Gyerekek",
          "Konyha / Háztartás",
          "Könyv / Játék",
          "Egyéb",
        ],
      },
      {
        id: "condition",
        label: "Állapot",
        type: "select",
        options: ["Új (bontatlan)", "Kiváló", "Jó", "Átlagos", "Alkatrésznek"],
      },
      {
        id: "year",
        label: "Évjárat (ha jármű)",
        type: "select",
        options: ["—", ...YEARS],
        placeholder: "Válassz",
      },
      {
        id: "mileage",
        label: "Kilométer (ha jármű)",
        type: "number",
        placeholder: "pl. 85000",
        unit: "km",
      },
    ],
  },

  // ----- ALBÉRLET ------------------------------------------------------------
  {
    kindId: "alberlet",
    kindLabel: "Albérlet",
    fields: [
      {
        id: "rooms",
        label: "Szobák száma",
        type: "select",
        options: [
          "Studio / 1 szoba",
          "1.5 szoba",
          "2 szoba",
          "2.5 szoba",
          "3 szoba",
          "3.5 szoba",
          "4+ szoba",
        ],
      },
      {
        id: "area",
        label: "Alapterület",
        type: "number",
        placeholder: "pl. 65",
        unit: "m²",
      },
      {
        id: "furnished",
        label: "Bútorozott",
        type: "select",
        options: ["Igen", "Részben", "Nem"],
      },
      {
        id: "availableFrom",
        label: "Elérhető ettől",
        type: "text",
        placeholder: "pl. 2025. aug. 1.",
      },
    ],
  },

  // ----- ÁLLÁS ---------------------------------------------------------------
  {
    kindId: "allas",
    kindLabel: "Állás",
    fields: [
      {
        id: "jobType",
        label: "Foglalkoztatás típusa",
        type: "select",
        options: [
          "Teljes munkaidő",
          "Részmunkaidő",
          "Önálló vállalkozó / Freelance",
          "Diákmunka",
          "Szezonális",
          "Egyéb",
        ],
      },
      {
        id: "sector",
        label: "Ágazat",
        type: "select",
        options: [
          "IT / Tech",
          "Egészségügy",
          "Vendéglátás / Turizmus",
          "Kereskedelem / Logisztika",
          "Építőipar",
          "Pénzügy / Könyvelés",
          "Oktatás",
          "Szépségipar",
          "Egyéb",
        ],
      },
      {
        id: "workPermit",
        label: "Szükséges engedély",
        type: "select",
        options: ["Bármilyen engedéllyel", "B tartózkodási", "C tartózkodási", "EU/EEA állampolgár"],
      },
      {
        id: "salaryMin",
        label: "Bruttó minimálbér",
        type: "number",
        placeholder: "pl. 4500",
        unit: "CHF/hó",
      },
    ],
  },

  // ----- SZOLGÁLTATÁS --------------------------------------------------------
  {
    kindId: "szolg",
    kindLabel: "Szolgáltatás",
    fields: [
      {
        id: "serviceType",
        label: "Szolgáltatás típusa",
        type: "select",
        options: [
          "Takarítás",
          "Költöztetés",
          "Javítás / Szerelés",
          "Kertészet",
          "Tanítás / Korrepetálás",
          "Fordítás / Tolmácsolás",
          "Fotó / Videó",
          "Szállítás",
          "Gyerekfelügyelet",
          "Autószerelés",
          "Egyéb",
        ],
      },
      {
        id: "availability",
        label: "Elérhetőség",
        type: "select",
        options: [
          "Hétköznapokon",
          "Hétvégén",
          "Rugalmasan",
          "Eseti megbízások",
        ],
      },
      {
        id: "ratePerHour",
        label: "Óradíj",
        type: "number",
        placeholder: "pl. 35",
        unit: "CHF/óra",
      },
    ],
  },
];

/** Visszaadja egy kindId-hoz tartozó konfigot, vagy null-t ha nincs. */
export function getSmartFilterConfig(kindId: string): SmartFilterConfig | null {
  return SMART_FILTER_CONFIGS.find((c) => c.kindId === kindId) ?? null;
}

/** Beolvassa a smart_filters JSON-t, hibabiztos. */
export function parseSmartFilters(
  raw: string | null | undefined
): Record<string, string | number> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) return parsed as Record<string, string | number>;
  } catch {}
  return {};
}
