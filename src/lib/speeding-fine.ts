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

// Svájc: Autobahn 120, Ausserorts 80, Innerorts 50.
export const ROADS: RoadInfo[] = [
  { type: "city",    label: "Településen belül",       emoji: "🏘️", defaultSpeedLimit: 50,  speedLimits: [30, 50] },
  { type: "rural",   label: "Lakott területen kívül",  emoji: "🛣️", defaultSpeedLimit: 80,  speedLimits: [60, 80, 100] },
  { type: "highway", label: "Autópálya",                emoji: "🛣️", defaultSpeedLimit: 120, speedLimits: [100, 120] },
];

// Ausztria: Autobahn 130, Freiland 100, Ortsgebiet 50.
export const ROADS_AT: RoadInfo[] = [
  { type: "city",    label: "Településen belül",       emoji: "🏘️", defaultSpeedLimit: 50,  speedLimits: [30, 50] },
  { type: "rural",   label: "Lakott területen kívül",  emoji: "🛣️", defaultSpeedLimit: 100, speedLimits: [70, 80, 100] },
  { type: "highway", label: "Autópálya",                emoji: "🛣️", defaultSpeedLimit: 130, speedLimits: [100, 130] },
];

// Németország: Autobahn 130 (ahol korlátozott), Landstraße 100, Ortschaft 50.
export const ROADS_DE: RoadInfo[] = [
  { type: "city",    label: "Településen belül",       emoji: "🏘️", defaultSpeedLimit: 50,  speedLimits: [30, 50] },
  { type: "rural",   label: "Lakott területen kívül",  emoji: "🛣️", defaultSpeedLimit: 100, speedLimits: [70, 80, 100] },
  { type: "highway", label: "Autópálya",                emoji: "🛣️", defaultSpeedLimit: 130, speedLimits: [100, 120, 130] },
];

// Hollandia: autosnelweg NAPPAL 100 (6–19h), éjjel egyes szakaszokon 120/130;
// buiten de bebouwde kom 80; binnen de bebouwde kom 50 (sok helyen 30).
export const ROADS_NL: RoadInfo[] = [
  { type: "city",    label: "Lakott területen belül (bebouwde kom)", emoji: "🏘️", defaultSpeedLimit: 50,  speedLimits: [30, 50] },
  { type: "rural",   label: "Lakott területen kívül",                emoji: "🛣️", defaultSpeedLimit: 80,  speedLimits: [60, 80] },
  { type: "highway", label: "Autópálya (autosnelweg)",               emoji: "🛣️", defaultSpeedLimit: 100, speedLimits: [100, 120, 130] },
];

/** Az adott ország útjai (sebesség-limitekkel). */
export function getRoads(country: string | null | undefined): RoadInfo[] {
  if (country === "AT") return ROADS_AT;
  if (country === "DE") return ROADS_DE;
  if (country === "NL") return ROADS_NL;
  return ROADS;
}

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

/**
 * ─────────────── AUSZTRIA (StVO / FSG) ───────────────
 * Az osztrák rendszer ALAPVETŐEN MÁS, mint a svájci: a bírság NEM jövedelem-arányos
 * (nincs Tagessatz), hanem fix sávok / Strafverfügung szerint. A jogosítvány-bevonás
 * (Führerscheinentzug) küszöbe: innerorts +40, außerorts +50 km/h. A 2024-es „Raser”-
 * szabály szerint extrém túllépésnél a jármű elkobozható.
 *
 * A meglévő 5 súlyossági kulcsra képezzük le (a UI újrahasználatához):
 *   ordnungsbusse = Organmandat/Strafverfügung, mittelschwer = +entzug (1 hó),
 *   schwer = +entzug (3 hó), raser = „Rasen” (jármű-elkobzás).
 */
const AT_TOLERANCE = 5;

export function calculateFineAT(input: { roadType: RoadType; speedLimit: number; actualSpeed: number }): FineResult {
  const overage = Math.max(0, Math.max(0, input.actualSpeed - input.speedLimit) - AT_TOLERANCE);
  const innerorts = input.roadType === "city";
  const entzugTh = innerorts ? 40 : 50; // Führerscheinentzug küszöb
  const schwerTh = innerorts ? 60 : 70; // min. 3 hó entzug
  const rasenTh = innerorts ? 80 : 90;  // 2024-es „Raser” — jármű-elkobzás

  const base = { effectiveOverage: overage, tagessatzChf: null, daysOfFine: null, prisonInfo: null as string | null };

  if (overage === 0) {
    return {
      ...base,
      severity: "no-fine",
      estimatedFineChf: 0,
      licenseSuspension: null,
      description: "A sebesség a megengedett kereten belül van (a tolerancia utáni túllépés 0).",
      legalNote: "Ausztriában a rendőrség jellemzően kb. 5 km/h mérési toleranciát von le (radar; nagyobb sebességnél százalékos).",
    };
  }
  if (overage >= rasenTh) {
    return {
      ...base,
      severity: "raser",
      estimatedFineChf: 5000,
      licenseSuspension: "Min. 6 hónap + Nachschulung; a jármű elkobozható (Beschlagnahme)",
      description: `Extrém gyorshajtás (${innerorts ? "innerorts +80" : "außerorts +90"} km/h fölött). A 2024-es „Raser”-szabály szerint a jármű lefoglalható, sőt elkobozható.`,
      legalNote: "A bírság akár 5 000 €-ig; ismétlésnél/extrém esetben a jármű véglegesen elkobozható. Mindenképp fordulj ügyvédhez.",
    };
  }
  if (overage >= schwerTh) {
    return {
      ...base,
      severity: "schwer",
      estimatedFineChf: 1000,
      licenseSuspension: "Min. 3 hónap Führerscheinentzug + kötelező Nachschulung",
      description: "Nagyfokú sebesség-túllépés — Vormerkdelikt, kötelező jogosítvány-bevonás (min. 3 hónap).",
      legalNote: "A bírság jellemzően több száz €-tól ~2 180 €-ig terjedhet. A jogosítvány-bevonás kötelező.",
    };
  }
  if (overage >= entzugTh) {
    return {
      ...base,
      severity: "mittelschwer",
      estimatedFineChf: 400,
      licenseSuspension: "Min. 2 hét – 1 hónap Führerscheinentzug + Vormerkung",
      description: `Jelentős túllépés (${innerorts ? "innerorts +40" : "außerorts +50"} km/h fölött) — Vormerkdelikt, jogosítvány-bevonás jár.`,
      legalNote: "Vormerkung: 2 éven belüli ismétlésnél kötelező Nachschulung. A bírság jellemzően több száz €.",
    };
  }
  // Organmandat / Strafverfügung — fix sávok
  const eur = overage <= 10 ? 30 : overage <= 20 ? 70 : overage <= 30 ? 150 : 300;
  return {
    ...base,
    severity: "ordnungsbusse",
    estimatedFineChf: eur,
    licenseSuspension: null,
    description:
      overage <= 10
        ? "Csekély túllépés — Organmandat (helyszíni bírság), jogosítvány-következmény nélkül."
        : "Strafverfügung (büntetőparancs) — pénzbírság, jogosítvány-bevonás nélkül.",
    legalNote: "Helyszínen (Organmandat, max 90 € készpénz) vagy postán (Anonym-/Strafverfügung) fizetendő.",
  };
}

/**
 * ─────────────── NÉMETORSZÁG (Bußgeldkatalog) ───────────────
 * A német rendszer fix sávos (NEM jövedelem-arányos): Bußgeld (€) + Punkte a
 * flensburgi Fahreignungsregisterbe + esetleg Fahrverbot (vezetési tilalom, hó).
 * A sávok eltérnek innerorts (városban) és außerorts (városon kívül). Tolerancia
 * jellemzően 3 km/h (100 km/h-ig) vagy 3%. A meglévő 5 súlyossági kulcsra képezzük:
 *   ordnungsbusse = Verwarnungsgeld (pont nélkül), mittelschwer = Bußgeld + Punkte,
 *   schwer = + Fahrverbot (1-2 hó), raser = legmagasabb sáv (3 hó Fahrverbot).
 */
const DE_TOLERANCE = 3;

export function calculateFineDE(input: { roadType: RoadType; speedLimit: number; actualSpeed: number }): FineResult {
  const overage = Math.max(0, Math.max(0, input.actualSpeed - input.speedLimit) - DE_TOLERANCE);
  const innerorts = input.roadType === "city";
  const base = { effectiveOverage: overage, tagessatzChf: null, daysOfFine: null, prisonInfo: null as string | null };

  if (overage === 0) {
    return {
      ...base,
      severity: "no-fine",
      estimatedFineChf: 0,
      licenseSuspension: null,
      description: "A sebesség a megengedett kereten belül van (a 3 km/h tolerancia utáni túllépés 0).",
      legalNote: "Németországban jellemzően 3 km/h (100 km/h-ig), felette 3% mérési toleranciát vonnak le.",
    };
  }

  // Bußgeldkatalog (2025) — €, Punkte, Fahrverbot (hó), sávonként.
  const tiers: { max: number; eur: number; pts: number; ban: number }[] = innerorts
    ? [
        { max: 10, eur: 30, pts: 0, ban: 0 }, { max: 15, eur: 50, pts: 0, ban: 0 }, { max: 20, eur: 70, pts: 0, ban: 0 },
        { max: 25, eur: 115, pts: 1, ban: 0 }, { max: 30, eur: 180, pts: 1, ban: 0 }, { max: 40, eur: 260, pts: 2, ban: 1 },
        { max: 50, eur: 400, pts: 2, ban: 1 }, { max: 60, eur: 560, pts: 2, ban: 2 }, { max: 70, eur: 700, pts: 2, ban: 3 },
        { max: Infinity, eur: 800, pts: 2, ban: 3 },
      ]
    : [
        { max: 10, eur: 20, pts: 0, ban: 0 }, { max: 15, eur: 40, pts: 0, ban: 0 }, { max: 20, eur: 60, pts: 0, ban: 0 },
        { max: 25, eur: 100, pts: 1, ban: 0 }, { max: 30, eur: 150, pts: 1, ban: 0 }, { max: 40, eur: 200, pts: 1, ban: 0 },
        { max: 50, eur: 320, pts: 2, ban: 1 }, { max: 60, eur: 480, pts: 2, ban: 1 }, { max: 70, eur: 600, pts: 2, ban: 2 },
        { max: Infinity, eur: 700, pts: 2, ban: 3 },
      ];
  const t = tiers.find((x) => overage <= x.max)!;
  const ban = t.ban > 0 ? `${t.ban} hónap Fahrverbot` : null;
  const ptsText = t.pts > 0 ? ` + ${t.pts} pont (Flensburg)` : "";
  const baseNote = "A Bußgeld FIX (nem jövedelem-arányos). A pontok a flensburgi Fahreignungsregisterbe kerülnek; 8 pontnál bevonják a jogosítványt.";

  if (t.ban >= 3) {
    return { ...base, severity: "raser", estimatedFineChf: t.eur, licenseSuspension: ban,
      description: `Nagyfokú sebesség-túllépés${ptsText}.`,
      legalNote: `${baseNote} Megjegyzés: a verseny-jellegű, illegális gyorshajtás (»Rennen«, §315d StGB) viszont BŰNCSELEKMÉNY — börtönnel is járhat.` };
  }
  if (t.ban >= 1) {
    return { ...base, severity: "schwer", estimatedFineChf: t.eur, licenseSuspension: ban,
      description: `Jelentős túllépés${ptsText} + Fahrverbot.`, legalNote: `${baseNote} A Fahrverbot alatt nem vezethetsz; a 4 hónapos »kezdő« időszakban (Fahranfänger/Probezeit) szigorúbb.` };
  }
  if (t.pts >= 1) {
    return { ...base, severity: "mittelschwer", estimatedFineChf: t.eur, licenseSuspension: null,
      description: `Bußgeld${ptsText} — Fahrverbot nélkül (ismétlésnél jöhet).`, legalNote: baseNote };
  }
  return { ...base, severity: "ordnungsbusse", estimatedFineChf: t.eur, licenseSuspension: null,
    description: "Verwarnungsgeld (csekély túllépés) — nincs pont, nincs Fahrverbot.",
    legalNote: "55 €-ig Verwarnungsgeld (pont nélkül), postán/online fizethető. Nincs hatása a büntetett-előéletre." };
}

// ── Hollandia (boetes — OM/CJIB, WAHV/Mulder) ─────────────────────────────
// A holland boete FIX (nem jövedelem-arányos) + ~9 € administratiekosten.
// Meetcorrectie: 3 km/h a mért 100 km/h-ig, felette 3%. 30 km/h fölötti túllépés
// → strafrecht (OM/rechter), rijontzegging (OBM) lehet. 50 km/h+ → a rendőr a
// helyszínen elveszi a jogosítványt (rijbewijs ingevorderd). Hollandia bírságai
// Európa legmagasabbjai közé tartoznak.
const NL_ADMIN_FEE = 9;

export function calculateFineNL(input: { roadType: RoadType; speedLimit: number; actualSpeed: number }): FineResult {
  // Meetcorrectie: 3 km/h a mért ≤100 km/h-ig, felette a mért sebesség 3%-a.
  const tolerance = input.actualSpeed <= 100 ? 3 : Math.round(input.actualSpeed * 0.03);
  const overage = Math.max(0, Math.max(0, input.actualSpeed - input.speedLimit) - tolerance);
  const innerorts = input.roadType === "city";
  const base = { effectiveOverage: overage, tagessatzChf: null, daysOfFine: null, prisonInfo: null as string | null };

  if (overage === 0) {
    return {
      ...base,
      severity: "no-fine",
      estimatedFineChf: 0,
      licenseSuspension: null,
      description: "A sebesség a megengedett kereten belül van (a meetcorrectie utáni túllépés 0).",
      legalNote: "A rendőrség meetcorrectie-t von le: 3 km/h a mért 100 km/h-ig, felette a mért sebesség 3%-a.",
    };
  }

  // Boetetabel 2025 (€, +9 € administratiekosten), túllépés km/h → boete.
  const tiers: { max: number; eur: number }[] = innerorts
    ? [
        { max: 4, eur: 37 }, { max: 5, eur: 43 }, { max: 10, eur: 85 }, { max: 15, eur: 150 },
        { max: 20, eur: 231 }, { max: 25, eur: 300 }, { max: 30, eur: 377 },
      ]
    : [
        { max: 4, eur: 31 }, { max: 5, eur: 39 }, { max: 10, eur: 73 }, { max: 15, eur: 131 },
        { max: 20, eur: 202 }, { max: 25, eur: 265 }, { max: 30, eur: 335 },
      ];

  const adminNote = "A holland boete FIX (nem jövedelem-arányos), + ~9 € administratiekosten. Hollandia bírságai Európa legmagasabbjai közé tartoznak; a CJIB szedi be. Iskola/30-as zóna környékén szigorúbb.";

  // 50 km/h+ túllépés → a rendőr a helyszínen elveszi a jogosítványt.
  if (overage >= 50) {
    return { ...base, severity: "raser", estimatedFineChf: 0, licenseSuspension: "rijbewijs a helyszínen ingevorderd (elvéve)",
      description: "Rendkívül nagy túllépés (50 km/h+): a rendőr a HELYSZÍNEN elveszi a jogosítványt.",
      legalNote: `${adminNote} 50 km/h vagy afeletti túllépésnél a rijbewijs azonnal ingevorderd; az ügy a bíróságra (OM) kerül, tényleges rijontzegging (eltiltás) várható.` };
  }
  // 30 km/h fölött → strafrecht (bíróság), OBM lehetséges.
  if (overage > 30) {
    return { ...base, severity: "schwer", estimatedFineChf: 0, licenseSuspension: "rijontzegging (OBM) lehetséges a bíróságon",
      description: "30 km/h fölötti túllépés: az ügy a bíróságra (OM/strafrecht) kerül — dagvaarding.",
      legalNote: `${adminNote} 30 km/h fölött már NEM fix WAHV-boete, hanem a bíróság szab ki büntetést; rijontzegging (vezetéstől eltiltás) is lehet.` };
  }

  const t = tiers.find((x) => overage <= x.max) ?? tiers[tiers.length - 1];
  const total = t.eur + NL_ADMIN_FEE;

  // 25-30 közötti túllépés — magas boete, közelít a strafrechthez.
  if (overage > 20) {
    return { ...base, severity: "mittelschwer", estimatedFineChf: total, licenseSuspension: null,
      description: "Jelentős túllépés — magas WAHV-boete, de még adminisztratív (nincs bírósági ügy 30 km/h-ig).",
      legalNote: adminNote };
  }

  return { ...base, severity: "ordnungsbusse", estimatedFineChf: total, licenseSuspension: null,
    description: "Adminisztratív boete (WAHV/Mulder) — a CJIB postázza, online fizethető.",
    legalNote: adminNote };
}
