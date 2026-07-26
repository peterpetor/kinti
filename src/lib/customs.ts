/**
 * Vám-limitek utazóknak — ORSZÁG-TUDATOS.
 *
 * CH: BAZG / Swiss Customs (bazg.admin.ch).
 * GB: HM Revenue & Customs (gov.uk) — Brexit UTÁNI szabályok, EU→Nagy-Britannia
 *     irányban. ⚠️ A GB-limitek MÁS logikájúak, mint a svájciak (ld. lent).
 *
 * FONTOS: tájékoztató jelleggel, NEM jogi tanács. A limitek időnként
 * változnak — döntés előtt mindig ellenőrizd a hivatalos forrást.
 */

export type CustomsCountry = "CH" | "GB";

export interface CustomsCategory {
  id: string;
  label: string;
  emoji: string;
  /** Vámmentes mennyiség FŐPÉR. `prohibited` kategóriánál 0. */
  limitPerPerson: number;
  /** Mértékegység (kg / liter / db). */
  unit: "kg" | "liter" | "db";
  /** Vám-kulcs egységenként, ha túl van a limiten (a config pénznemében). */
  dutyPerUnit: number;
  /** Egyéb megjegyzés (pl. életkor-korlátozás). */
  note?: string;
  /**
   * TELJESEN TILTOTT behozatal (nem „limit fölött vámköteles", hanem tilos).
   * GB-ben az EU-ból érkező hús- és tejtermék személyes behozatala tiltott.
   */
  prohibited?: boolean;
  /**
   * Vagylagos csoport: a csoporton belül a limitek EGYMÁST helyettesítik
   * (pl. GB: 4 l tömény VAGY 9 l pezsgő). Csak jelölés a UI-nak.
   */
  eitherOrGroup?: string;
}

export interface CustomsConfig {
  country: CustomsCountry;
  /** Pénznem-kód a megjelenítéshez. */
  currency: string;
  /** Általános érték-küszöb fő — afölött áfa/vám-köteles. */
  valueThreshold: number;
  /** Honnan-hova irány rövid leírása (a UI fejlécében). */
  directionNote: string;
  /** Hivatalos forrás URL. */
  sourceUrl: string;
  sourceLabel: string;
  categories: CustomsCategory[];
  /** Extra figyelmeztetés a UI tetején (opcionális). */
  warning?: string;
}

const CH_CATEGORIES: CustomsCategory[] = [
  {
    id: "meat",
    label: "Hús / hústermék",
    emoji: "🥩",
    limitPerPerson: 1,
    unit: "kg",
    dutyPerUnit: 17,
    note: "Friss, hűtött, fagyasztott hús + kolbász, sonka, szárított.",
  },
  {
    id: "butter",
    label: "Vaj / margarin / étkezési olaj",
    emoji: "🧈",
    limitPerPerson: 5,
    unit: "kg",
    dutyPerUnit: 16,
  },
  {
    id: "wine",
    label: "Bor / pezsgő (<18% alkohol)",
    emoji: "🍷",
    limitPerPerson: 5,
    unit: "liter",
    dutyPerUnit: 0.6,
    note: "17 éves kortól.",
  },
  {
    id: "beer",
    label: "Sör",
    emoji: "🍺",
    limitPerPerson: 5,
    unit: "liter",
    dutyPerUnit: 0.25,
    note: "17 éves kortól.",
  },
  {
    id: "spirits",
    label: "Tömény (>18% alkohol)",
    emoji: "🥃",
    limitPerPerson: 1,
    unit: "liter",
    dutyPerUnit: 29,
    note: "18 éves kortól. Pálinka, whisky, vodka, gin.",
  },
  {
    id: "cigarettes",
    label: "Cigaretta",
    emoji: "🚬",
    limitPerPerson: 250,
    unit: "db",
    dutyPerUnit: 0.27,
    note: "17 éves kortól. VAGY 250g dohány VAGY 50 szivar.",
  },
];

/**
 * GB (Nagy-Britannia) — Brexit utáni, EU-ból érkező utasokra vonatkozó
 * személyes vámmentes keretek (gov.uk „Bringing goods into the UK for personal
 * use"). Lényeges eltérések a svájci rendszertől:
 *  - az alkohol-keret JÓVAL nagyobb (42 l sör, 18 l csendes bor),
 *  - a tömény ÉS a pezsgő/likőrbor VAGYLAGOS (4 l VAGY 9 l),
 *  - a hús- és tejtermék személyes behozatala az EU-ból TILTOTT,
 *  - az egyéb áruk kerete értékalapú (£390), nem tételes.
 * A limit fölötti mennyiségnél GB-ben nem tételes „vám-kulcs" jár, hanem a
 * TELJES mennyiség után kell adót/vámot fizetni (deklarálási kötelezettség) —
 * ezért a dutyPerUnit itt 0, és a UI a túllépést deklarálandóként jelzi.
 */
const GB_CATEGORIES: CustomsCategory[] = [
  {
    id: "beer",
    label: "Sör",
    emoji: "🍺",
    limitPerPerson: 42,
    unit: "liter",
    dutyPerUnit: 0,
    note: "18 éves kortól.",
  },
  {
    id: "wine",
    label: "Csendes bor",
    emoji: "🍷",
    limitPerPerson: 18,
    unit: "liter",
    dutyPerUnit: 0,
    note: "18 éves kortól.",
  },
  {
    id: "spirits",
    label: "Tömény (>22% alkohol)",
    emoji: "🥃",
    limitPerPerson: 4,
    unit: "liter",
    dutyPerUnit: 0,
    eitherOrGroup: "strong",
    note: "18 éves kortól. VAGY 9 l pezsgő/likőrbor — a kettő megosztható.",
  },
  {
    id: "sparkling",
    label: "Pezsgő / likőrbor (<22%)",
    emoji: "🥂",
    limitPerPerson: 9,
    unit: "liter",
    dutyPerUnit: 0,
    eitherOrGroup: "strong",
    note: "18 éves kortól. VAGY 4 l tömény — a kettő megosztható.",
  },
  {
    id: "cigarettes",
    label: "Cigaretta",
    emoji: "🚬",
    limitPerPerson: 200,
    unit: "db",
    dutyPerUnit: 0,
    note: "18 éves kortól. VAGY 250g dohány VAGY 50 szivar VAGY 100 cigarillo.",
  },
  {
    id: "meat",
    label: "Hús / hústermék",
    emoji: "🥩",
    limitPerPerson: 0,
    unit: "kg",
    dutyPerUnit: 0,
    prohibited: true,
    note: "EU-ból Nagy-Britanniába NEM hozható be személyes csomagban.",
  },
  {
    id: "dairy",
    label: "Tej- és tejtermék",
    emoji: "🧀",
    limitPerPerson: 0,
    unit: "kg",
    dutyPerUnit: 0,
    prohibited: true,
    note: "EU-ból Nagy-Britanniába NEM hozható be személyes csomagban (sajt, vaj, tej).",
  },
];

export const CUSTOMS_CONFIG: Record<CustomsCountry, CustomsConfig> = {
  CH: {
    country: "CH",
    currency: "CHF",
    valueThreshold: 300,
    directionNote: "Svájcba belépve, személyenként",
    sourceUrl: "https://www.bazg.admin.ch/",
    sourceLabel: "bazg.admin.ch (Svájci Vámhivatal)",
    categories: CH_CATEGORIES,
  },
  GB: {
    country: "GB",
    currency: "GBP",
    valueThreshold: 390,
    directionNote: "Nagy-Britanniába belépve, személyenként",
    sourceUrl: "https://www.gov.uk/duty-free-goods",
    sourceLabel: "gov.uk (HM Revenue & Customs)",
    categories: GB_CATEGORIES,
    warning:
      "Brexit óta az EU-ból Nagy-Britanniába érkezve vámhatárt lépsz át. A hús- és tejtermék személyes behozatala TILTOTT, a limit fölötti mennyiséget pedig deklarálni kell — ilyenkor a teljes mennyiség után fizetsz adót, nem csak a többlet után.",
  },
};

/** Az adott országhoz tartozó config (ismeretlen ország → CH, a régi viselkedés). */
export function getCustomsConfig(country: string | null | undefined): CustomsConfig {
  return country === "GB" ? CUSTOMS_CONFIG.GB : CUSTOMS_CONFIG.CH;
}

/** Visszafelé kompatibilis export (a meglévő CH-hívók miatt). */
export const CUSTOMS_CATEGORIES = CH_CATEGORIES;
export const VALUE_THRESHOLD_CHF = CUSTOMS_CONFIG.CH.valueThreshold;

export interface CalcInput {
  persons: number;
  amounts: Record<string, number>;
  /** Melyik ország szabályai szerint. Elhagyva: CH. */
  country?: string | null;
}

export interface CategoryResult {
  category: CustomsCategory;
  amount: number;
  totalLimit: number;
  overage: number;
  estimatedDuty: number;
  status: "ok" | "warning" | "over" | "prohibited";
  /** % a limitnek (>100 = túl). */
  pct: number;
}

/** Egy kategória eredménye. */
export function calculateCategory(
  category: CustomsCategory,
  persons: number,
  amount: number,
): CategoryResult {
  if (category.prohibited) {
    return {
      category,
      amount,
      totalLimit: 0,
      overage: amount,
      estimatedDuty: 0,
      status: amount > 0 ? "prohibited" : "ok",
      pct: amount > 0 ? 100 : 0,
    };
  }

  const totalLimit = category.limitPerPerson * persons;
  const overage = Math.max(0, amount - totalLimit);
  const estimatedDuty = overage * category.dutyPerUnit;
  const pct = totalLimit > 0 ? (amount / totalLimit) * 100 : 0;

  let status: "ok" | "warning" | "over" = "ok";
  if (overage > 0) status = "over";
  else if (pct >= 80) status = "warning";

  return { category, amount, totalLimit, overage, estimatedDuty, status, pct };
}

/** Az összes kategória eredménye + összegzés. */
export interface CalcResult {
  config: CustomsConfig;
  results: CategoryResult[];
  totalDuty: number;
  /** Hány kategóriában van túllépés (a tiltottakat is beleértve). */
  overCount: number;
  /** Bármi alkohol túllépett? — más rendszerben adózik. */
  anyAlcoholOver: boolean;
  /** Van-e TILTOTT tétel megadva (GB: hús/tej). */
  anyProhibited: boolean;
}

const ALCOHOL_IDS = new Set(["wine", "beer", "spirits", "sparkling"]);

export function calculateAll(input: CalcInput): CalcResult {
  const config = getCustomsConfig(input.country);
  const results = config.categories.map((c) =>
    calculateCategory(c, input.persons, input.amounts[c.id] ?? 0),
  );
  const totalDuty = results.reduce((s, r) => s + r.estimatedDuty, 0);
  const overCount = results.filter((r) => r.status === "over" || r.status === "prohibited").length;
  const anyAlcoholOver = results.some(
    (r) => ALCOHOL_IDS.has(r.category.id) && r.status === "over",
  );
  const anyProhibited = results.some((r) => r.status === "prohibited");
  return { config, results, totalDuty, overCount, anyAlcoholOver, anyProhibited };
}
