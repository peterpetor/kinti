/**
 * Svájci gyorshajtás-büntetés kalkulátor.
 *
 * Forrás: Ordnungsbussenverordnung (OBV) 2026 + StGB (büntetőjog).
 *
 * FONTOS: tájékoztató jellegű becslés, NEM jogi tanács. A pontos
 * büntetést a kantoni hatóság szabja meg az esetleges enyhítő /
 * súlyosító körülmények figyelembe vételével.
 */

export type RoadType = "city" | "rural" | "highway";

export interface RoadInfo {
  type: RoadType;
  label: string;
  emoji: string;
  defaultSpeedLimit: number;
  /** A tipikus elérhető Tempos a road-on. */
  speedLimits: number[];
}

export const ROADS: RoadInfo[] = [
  { type: "city",    label: "Településen belül",       emoji: "🏘️", defaultSpeedLimit: 50,  speedLimits: [30, 50] },
  { type: "rural",   label: "Lakott területen kívül",  emoji: "🛣️", defaultSpeedLimit: 80,  speedLimits: [60, 80, 100] },
  { type: "highway", label: "Autópálya",                emoji: "🛣️", defaultSpeedLimit: 120, speedLimits: [100, 120] },
];

export type FineSeverity =
  | "no-fine"        // Tolerancián belül
  | "ordnungsbusse"  // Fix bírság (kis túllépés)
  | "mittelschwer"   // Közepes — büntetőeljárás + valószínűleg jogosítvány-bevonás
  | "schwer"         // Súlyos — biztos bevonás
  | "raser";         // Száguldó-bűncselekmény

export interface FineResult {
  severity: FineSeverity;
  /** Tényleges túllépés a Messtoleranz után. */
  effectiveOverage: number;
  /** Becsült bírság CHF-ben (Ordnungsbusse-nál fix, egyébként napi-pénz alapú). */
  estimatedFineChf: number;
  /** Esetleges börtön. */
  prisonInfo: string | null;
  /** Jogosítvány-bevonás (legkisebb tipikus időtartam). */
  licenseSuspension: string | null;
  /** Magyarázó szöveg. */
  description: string;
  /** Jogi következmény-info. */
  legalNote: string;
  /** Tagessatz használt-e a számításhoz. */
  tagessatzChf: number | null;
  daysOfFine: number | null;
}

/**
 * Ordnungsbusse-táblázat 2026 (CHF). Túllépés km/h → fix bírság.
 * Ha a túllépés nagyobb a táblázat végpontjánál, már Strafverfahren.
 */
const ORDNUNGSBUSSE: Record<RoadType, Array<{ maxOverage: number; chf: number }>> = {
  city: [
    { maxOverage: 5, chf: 40 },
    { maxOverage: 10, chf: 120 },
    { maxOverage: 15, chf: 250 },
  ],
  rural: [
    { maxOverage: 5, chf: 40 },
    { maxOverage: 10, chf: 100 },
    { maxOverage: 15, chf: 160 },
    { maxOverage: 20, chf: 240 },
  ],
  highway: [
    { maxOverage: 5, chf: 20 },
    { maxOverage: 10, chf: 60 },
    { maxOverage: 15, chf: 120 },
    { maxOverage: 20, chf: 180 },
    { maxOverage: 25, chf: 260 },
  ],
};

/**
 * Súlyos jogsértés (Mittel-/Schwer-) küszöbök km/h.
 * Forrás: art. 16 SVG.
 */
const MITTELSCHWER_THRESHOLD: Record<RoadType, number> = {
  city: 16,    // 50 km/h zónán +16-tól
  rural: 21,   // 80-100 km/h zónán +21-től
  highway: 26, // 120 km/h zónán +26-tól
};

const SCHWER_THRESHOLD: Record<RoadType, number> = {
  city: 25,
  rural: 30,
  highway: 35,
};

/** Raserdelikt küszöbök (art. 90 abs. 3 SVG). */
const RASER_THRESHOLD: Record<RoadType, number> = {
  city: 50,
  rural: 60,
  highway: 80,
};

/** Messtoleranz (rendőrség levon a mért sebességből). */
const MEASUREMENT_TOLERANCE = 5;

export interface FineInput {
  roadType: RoadType;
  speedLimit: number;
  actualSpeed: number;
  /** Havi nettó jövedelem CHF-ben (jövedelem-arányos napi-pénzhez). */
  monthlyNetIncomeChf: number;
}

export function calculateFine(input: FineInput): FineResult {
  // Tényleges túllépés a tolerancia után
  const rawOverage = Math.max(0, input.actualSpeed - input.speedLimit);
  const effectiveOverage = Math.max(0, rawOverage - MEASUREMENT_TOLERANCE);

  // Tagessatz becslés — havi nettó × 12 / 360, plafon 3000 CHF (a törvényi max)
  const tagessatz = Math.min(3000, Math.round((input.monthlyNetIncomeChf * 12) / 360));

  // Nincs túllépés
  if (effectiveOverage === 0) {
    return {
      severity: "no-fine",
      effectiveOverage: 0,
      estimatedFineChf: 0,
      prisonInfo: null,
      licenseSuspension: null,
      description: "A sebesség a megengedett kereten belül van (a Messtoleranz utáni túllépés 0).",
      legalNote: "A svájci rendőrség minden mérésből levon 5 km/h toleranciát (radar) vagy 6 km/h (lézer mobil).",
      tagessatzChf: null,
      daysOfFine: null,
    };
  }

  // Raserdelikt — szándékos rendkívüli gyorshajtás
  if (effectiveOverage >= RASER_THRESHOLD[input.roadType]) {
    const days = 150; // gyakorlati átlag — törvényi minimum 30, de a bíróság 100-300 napi pénzt szab ki tipikusan
    return {
      severity: "raser",
      effectiveOverage,
      estimatedFineChf: days * tagessatz,
      prisonInfo: "MIN 1 év börtön (törvényileg kötelező) + jármű elkobozható",
      licenseSuspension: "2-10 év, első esetben min 24 hónap",
      description: "Raserdelikt — szándékos rendkívüli sebesség-túllépés. BŰNCSELEKMÉNY (art. 90 abs. 3 SVG). A pénzbüntetés MELLETT börtön + jogosítvány-bevonás + jármű-elkobzás is jár.",
      legalNote: "Tipikus pénzbüntetés 100-300 napi pénz (a törvényi minimum 30, de a bíróság ennél jóval többet szab ki). Visszaesés esetén életfogytig bevonható a jogosítvány.",
      tagessatzChf: tagessatz,
      daysOfFine: days,
    };
  }

  // Schwer
  if (effectiveOverage >= SCHWER_THRESHOLD[input.roadType]) {
    const days = 90; // tipikus középérték (60-180 közt)
    return {
      severity: "schwer",
      effectiveOverage,
      estimatedFineChf: days * tagessatz,
      prisonInfo: "Akár 3 év börtönig (feltételes valószínűbb 1. esetben)",
      licenseSuspension: "Min. 3 hónap (1. súlyos eset). Visszaesés esetén 1 év+.",
      description: "Súlyos sebesség-túllépés (schwere Verkehrsregelverletzung) — büntetőeljárás indul.",
      legalNote: "Próbaidős sofőröknek a jogosítvány bevonható ÉS érvénytelenné válik (új vizsga kell).",
      tagessatzChf: tagessatz,
      daysOfFine: days,
    };
  }

  // Mittelschwer
  if (effectiveOverage >= MITTELSCHWER_THRESHOLD[input.roadType]) {
    const days = 40; // tipikus (30-60 közt)
    return {
      severity: "mittelschwer",
      effectiveOverage,
      estimatedFineChf: days * tagessatz,
      prisonInfo: null,
      licenseSuspension: "Min. 1 hónap (1. középsúlyos eset). Visszaesés esetén 4+ hó.",
      description: "Közepes súlyú sebesség-túllépés — büntetőeljárás (pénzbüntetés napi pénz alapján).",
      legalNote: "A pénzbüntetés jövedelem-arányos (Tagessatz). 30-60 napi pénz a tipikus.",
      tagessatzChf: tagessatz,
      daysOfFine: days,
    };
  }

  // Ordnungsbusse — fix bírság
  const table = ORDNUNGSBUSSE[input.roadType];
  for (const row of table) {
    if (effectiveOverage <= row.maxOverage) {
      return {
        severity: "ordnungsbusse",
        effectiveOverage,
        estimatedFineChf: row.chf,
        prisonInfo: null,
        licenseSuspension: null,
        description: "Ordnungsbusse (fix bírság) — nincs büntetőeljárás, nincs jogosítvány-bevonás.",
        legalNote: "Helyszínen vagy postán fizetendő, 30 napon belül. Nincs hatása a büntetett-előéletre.",
        tagessatzChf: null,
        daysOfFine: null,
      };
    }
  }

  // Fallback (nem szabad ide jutnunk)
  return {
    severity: "mittelschwer",
    effectiveOverage,
    estimatedFineChf: 0,
    prisonInfo: null,
    licenseSuspension: "Vélhetően",
    description: "Becslés nem készíthető — konzultálj ügyvéddel.",
    legalNote: "",
    tagessatzChf: tagessatz,
    daysOfFine: null,
  };
}
