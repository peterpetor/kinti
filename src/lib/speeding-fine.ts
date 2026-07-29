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

/**
 * ⚠️ MÉRTÉKEGYSÉG. Ez NEM kozmetikai kérdés: Angliában a táblák, a bírság és a
 * jogszabály MÉRFÖLD/ÓRÁBAN mérnek. Ha a UI „km/h”-t írna a brit 30/60/70
 * értékek mellé, az számszerűen hamis lenne (a 30 mph ≈ 48 km/h), és a
 * felhasználó rossz sebességnél hinné magát biztonságban.
 */
export type SpeedUnit = "kmh" | "mph";

/** Az adott ország sebesség-mértékegysége. ⚠️ Csak Anglia mérföldes. */
export function getSpeedUnit(country: string | null | undefined): SpeedUnit {
  return country === "GB" ? "mph" : "kmh";
}

/** A mértékegység megjelenítendő címkéje. */
export function speedUnitLabel(country: string | null | undefined): string {
  return getSpeedUnit(country) === "mph" ? "mph" : "km/h";
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

// ⚠️ ANGLIA — MÉRFÖLD/ÓRA, nem km/h! Built-up area 30 mph (egyre több 20-as
// zóna), single carriageway 60, dual carriageway és motorway 70.
export const ROADS_GB: RoadInfo[] = [
  { type: "city",    label: "Lakott területen (built-up)", emoji: "🏘️", defaultSpeedLimit: 30, speedLimits: [20, 30] },
  { type: "rural",   label: "Egysávos országút",           emoji: "🛣️", defaultSpeedLimit: 60, speedLimits: [40, 50, 60] },
  { type: "highway", label: "Autópálya / osztott pályás",  emoji: "🛣️", defaultSpeedLimit: 70, speedLimits: [70] },
];

// Spanyolország: autopista/autovía 120, carretera convencional 90, városban 50.
// ⚠️ 2021 májusa óta a városi, IRÁNYONKÉNT EGYSÁVOS utakon 30 km/h az általános
// limit (és 20, ahol az útpálya és a járda egy szintben van) — ezt a legtöbb
// külföldi nem tudja, és pont ez a leggyakoribb városi bírság-ok.
export const ROADS_ES: RoadInfo[] = [
  { type: "city",    label: "Városban (zona urbana)",      emoji: "🏘️", defaultSpeedLimit: 30,  speedLimits: [20, 30, 50] },
  { type: "rural",   label: "Országút (convencional)",     emoji: "🛣️", defaultSpeedLimit: 90,  speedLimits: [70, 80, 90] },
  { type: "highway", label: "Autópálya (autovía/autopista)", emoji: "🛣️", defaultSpeedLimit: 120, speedLimits: [80, 100, 120] },
];

/** Az adott ország útjai (sebesség-limitekkel). */
export function getRoads(country: string | null | undefined): RoadInfo[] {
  if (country === "AT") return ROADS_AT;
  if (country === "DE") return ROADS_DE;
  if (country === "NL") return ROADS_NL;
  if (country === "GB") return ROADS_GB;
  if (country === "ES") return ROADS_ES;
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

// ════════════════════════════════════════════════════════════════════════════
// ANGLIA — Fixed Penalty Notice + Sentencing Council A/B/C sávok
//
// ⚠️ HÁROM DOLOG, AMI A BRIT RENDSZERT MÁSSÁ TESZI:
//
// 1) MÉRFÖLD/ÓRA. A limitek 20/30/40/50/60/70 mph — a bemenet is mérföld.
//
// 2) A BÍRÓSÁGI BÍRSÁG JÖVEDELEM-ARÁNYOS, mint a svájci Tagessatz: a
//    Sentencing Council sávjai a HETI nettó jövedelem százalékában adják meg
//    (A: 50%, B: 100%, C: 150%), felső korláttal (1 000 £, autópályán 2 500 £).
//    A kisebb túllépés viszont FIX: Fixed Penalty Notice 100 £ + 3 pont.
//
// 3) A PONTRENDSZER FORDÍTVA MŰKÖDIK, mint a magyar: pontokat GYŰJTESZ, és
//    12 pont / 3 év után jön az eltiltás. ⚠️ ÚJ VEZETŐNÉL (a jogosítvány első
//    2 évében) már 6 pont VISSZAVONÁST jelent — ezt a legtöbben nem tudják,
//    és két apró gyorshajtás elég hozzá.
//
// Forrás: gov.uk (speeding penalties, penalty points) + Sentencing Council
// speeding guideline. Tájékoztató becslés, NEM jogi tanács.
// ════════════════════════════════════════════════════════════════════════════

/**
 * ACPO/NPCC iránymutatás: a rendőrség jellemzően a limit 10%-a + 2 mph fölött
 * jár el. ⚠️ Ez NEM jogszabály — jogilag már 1 mph túllépés is szabálysértés,
 * a tolerancia csak vádemelési gyakorlat. A UI ezt kimondja.
 */
function gbToleranceMph(limit: number): number {
  return Math.floor(limit * 0.1) + 2;
}

/**
 * ⚠️ A BRIT RENDSZER KÉTLÉPCSŐS, és ezt az első modellem elrontotta: a
 * Sentencing Council A/B/C sávjai CSAK a bírósági ügyre vonatkoznak. A kisebb
 * túllépés nem bíróságra megy, hanem fix bírságot (FPN) vagy tanfolyamot kap —
 * és mivel a Band A alsó határa (30-as limitnél 31 mph) a tolerancia-küszöb
 * ALATT van, a sávok önmagukban használva ELÉRHETETLENNÉ tették az FPN-t.
 *
 * Az NPCC vádemelési iránymutatás felső határa az FPN-re: limit + 10% + 9 mph.
 * (30-as limitnél 42, 70-esnél 86 — egyezik a közzétett táblázattal.)
 * Efölött megy az ügy bíróságra, és ONNAN számítanak a sávok.
 */
function gbFpnMaxMph(limit: number): number {
  return limit + Math.floor(limit * 0.1) + 9;
}

/**
 * Sentencing Council sáv-táblázat: a MÉRT sebesség alapján (nem a túllépésből).
 * Band C = eltiltás vagy 6 pont, Band B = 4–6 pont vagy rövid eltiltás,
 * Band A = 3 pont.
 */
const GB_BANDS: { limit: number; bandC: number; bandB: number; bandA: number }[] = [
  { limit: 20, bandC: 41, bandB: 31, bandA: 21 },
  { limit: 30, bandC: 51, bandB: 41, bandA: 31 },
  { limit: 40, bandC: 66, bandB: 56, bandA: 41 },
  { limit: 50, bandC: 76, bandB: 66, bandA: 51 },
  { limit: 60, bandC: 91, bandB: 81, bandA: 61 },
  { limit: 70, bandC: 101, bandB: 91, bandA: 71 },
];

const GB_FPN_POUNDS = 100;
const GB_FINE_CAP = 1000;
const GB_FINE_CAP_MOTORWAY = 2500;

export function calculateFineGB(input: {
  roadType: RoadType;
  speedLimit: number;
  actualSpeed: number;
  /** Havi NETTÓ jövedelem fontban — a bírósági sávok ebből számolnak. */
  monthlyNetIncome?: number;
}): FineResult {
  const tolerance = gbToleranceMph(input.speedLimit);
  const rawOver = Math.max(0, input.actualSpeed - input.speedLimit);
  const overage = Math.max(0, rawOver - tolerance);
  const base = { effectiveOverage: overage, tagessatzChf: null, daysOfFine: null, prisonInfo: null as string | null };

  const toleranceNote = `A rendőrség jellemzően a limit 10%-a + 2 mph fölött jár el (itt ${input.speedLimit} mph-nál kb. ${input.speedLimit + tolerance} mph). ⚠️ Ez NEM jogszabály, csak vádemelési gyakorlat — jogilag már 1 mph túllépés is szabálysértés.`;

  if (rawOver === 0) {
    return {
      ...base,
      severity: "no-fine",
      estimatedFineChf: 0,
      licenseSuspension: null,
      description: "A sebesség a megengedett limiten belül van.",
      legalNote: toleranceNote,
    };
  }

  if (overage === 0) {
    return {
      ...base,
      severity: "no-fine",
      estimatedFineChf: 0,
      licenseSuspension: null,
      description: "A túllépés a rendőrségi tolerancia-sávon belül van — jellemzően nem indul eljárás.",
      legalNote: toleranceNote,
    };
  }

  // Heti nettó jövedelem a sávos bírsághoz (havi × 12 / 52).
  const weekly = input.monthlyNetIncome && input.monthlyNetIncome > 0
    ? Math.round((input.monthlyNetIncome * 12) / 52)
    : null;
  const cap = input.roadType === "highway" ? GB_FINE_CAP_MOTORWAY : GB_FINE_CAP;
  const capped = (v: number) => Math.min(v, cap);

  // A táblázat sora a legközelebbi (nem nagyobb) kitáblázott limithez.
  const row = [...GB_BANDS].reverse().find((b) => input.speedLimit >= b.limit) ?? GB_BANDS[0];
  const measured = input.actualSpeed;

  const pointsNote = "⚠️ A pontrendszer fordítva működik, mint otthon: pontokat GYŰJTESZ. 12 pont 3 év alatt → legalább 6 hónap eltiltás. ⚠️ ÚJ VEZETŐNÉL (az első 2 évben) már 6 pont a jogosítvány VISSZAVONÁSÁT jelenti — ehhez két apró gyorshajtás is elég.";
  const nipNote = "A hatóságnak 14 napon belül ki kell postáznia a NIP-et (Notice of Intended Prosecution) a jármű nyilvántartott üzembentartójának. ⚠️ A vezető megnevezése KÖTELEZŐ: ha nem adod meg, az önálló szabálysértés (6 pont + akár 1 000 £ bírság), és jellemzően súlyosabb, mint maga a gyorshajtás.";

  // ⚠️ ELSŐ LÉPCSŐ: fix bírság (FPN) vagy tanfolyam — a túllépések nagy része
  // ide esik, és NEM kerül bíróságra. Ez az ág a Band-ellenőrzések ELŐTT áll,
  // különben a bírósági sávok elnyelnék (a Band A alsó határa a tolerancia
  // küszöbe alatt van).
  if (measured <= gbFpnMaxMph(input.speedLimit)) {
    return {
      ...base,
      severity: "ordnungsbusse",
      estimatedFineChf: GB_FPN_POUNDS,
      licenseSuspension: null,
      description: `Fixed Penalty Notice (FPN): ${GB_FPN_POUNDS} £ fix bírság + 3 büntetőpont. Első alkalommal jellemzően felajánlják helyette a Speed Awareness Course-t.`,
      legalNote: `A Speed Awareness Course (kb. 100 £, félnapos online/tantermi tanfolyam) esetén NINCS büntetőpont — de 3 éven belül csak EGYSZER kapható, és a biztosítónak jellemzően be kell jelenteni. Ha nem fogadod el az FPN-t, az ügy bíróságra kerül, ahol a bírság jövedelem-arányos lesz. ${pointsNote} ${nipNote}`,
    };
  }

  if (measured >= row.bandC) {
    return {
      ...base,
      severity: "raser",
      estimatedFineChf: weekly ? capped(Math.round(weekly * 1.5)) : 0,
      licenseSuspension: "7–56 nap eltiltás VAGY 6 büntetőpont",
      description: `Band C — a legsúlyosabb sáv (${row.limit} mph-os limitnél ${row.bandC} mph-tól). A bíróság jellemzően ELTILTÁST szab ki, nem csak pontot.`,
      legalNote: `A Band C bírság a heti nettó jövedelem ~150%-a, felső korláttal (${cap.toLocaleString("hu-HU")} £${input.roadType === "highway" ? " autópályán" : ""}). ${pointsNote} ${nipNote}`,
    };
  }

  if (measured >= row.bandB) {
    return {
      ...base,
      severity: "schwer",
      estimatedFineChf: weekly ? capped(weekly) : 0,
      licenseSuspension: "4–6 büntetőpont VAGY 7–28 nap eltiltás",
      description: `Band B (${row.limit} mph-os limitnél ${row.bandB}–${row.bandC - 1} mph). Bíróság dönt: pont vagy rövid eltiltás.`,
      legalNote: `A Band B bírság a heti nettó jövedelem ~100%-a, felső korláttal (${cap.toLocaleString("hu-HU")} £). ${pointsNote} ${nipNote}`,
    };
  }

  return {
    ...base,
    severity: "mittelschwer",
    estimatedFineChf: weekly ? capped(Math.round(weekly * 0.5)) : 0,
    licenseSuspension: null,
    description: `Band A (${row.limit} mph-os limitnél ${row.bandA}–${row.bandB - 1} mph). Bírósági ügyként jellemzően 3 büntetőpont — de ebben a sávban a rendőrség gyakran még fix bírságot vagy tanfolyamot ajánl.`,
    legalNote: `A Band A bírság a heti nettó jövedelem ~50%-a. ${pointsNote} ${nipNote}`,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// SPANYOLORSZÁG — DGT fix bírságsávok + pronto pago
//
// ⚠️ HÁROM DOLOG, AMI A SPANYOL RENDSZERT MÁSSÁ TESZI:
//
// 1) 50%-OS KEDVEZMÉNY 20 NAPON BELÜL („pronto pago”). Ez a legfontosabb
//    gyakorlati tudás: a 300 €-s bírság 150 € lesz, ha időben fizetsz — DE
//    ezzel lemondasz a jogorvoslatról. A kalkulátor MINDKÉT összeget kiírja.
//
// 2) A PONTRENDSZER FORDÍTVA: 12 ponttal indulsz és VESZÍTED őket (kezdő
//    vezetőként csak 8-cal). Nullánál a jogosítvány felfüggesztésre kerül, és
//    tanfolyammal kell visszaszerezni.
//
// 3) BÜNTETŐJOGI HATÁR (Código Penal 379. cikk): városban +60, országúton
//    +80 km/h fölött már NEM szabálysértés, hanem BŰNCSELEKMÉNY — börtön,
//    közmunka vagy napi-pénzbírság, PLUS 1–4 év vezetéstől eltiltás.
//
// Forrás: DGT + Ley de Seguridad Vial (Anexo IV bírságtábla) + Código Penal.
// ⚠️ A sávhatárok a hivatalos táblázat SZERKEZETÉT követik; a pontos sávot a
// DGT határozata adja meg. Tájékoztató becslés, NEM jogi tanács.
// ════════════════════════════════════════════════════════════════════════════

/**
 * Radar-tolerancia: fix radarnál 5 km/h a 100 km/h-ig, felette a mért 5%-a.
 * (Mobil radarnál nagyobb, 7 km/h illetve 7% — itt a szigorúbbal számolunk,
 * hogy a becslés ne legyen megnyugtatóbb a valóságnál.)
 */
function esTolerance(actualSpeed: number): number {
  return actualSpeed <= 100 ? 5 : Math.round(actualSpeed * 0.05);
}

/** A pronto pago kedvezmény mértéke és határideje. */
export const ES_PRONTO_PAGO_RATE = 0.5;
export const ES_PRONTO_PAGO_DAYS = 20;

/**
 * Bírságsávok a TÚLLÉPÉS alapján. A hivatalos tábla a mért sebességet veti
 * össze a limittel; a sávok szélessége attól függ, hogy a limit 50 km/h-ig
 * terjed-e (városi jelleg) vagy fölötte van.
 */
const ES_TIERS_LOW: { maxOver: number; eur: number; points: number }[] = [
  { maxOver: 20, eur: 100, points: 0 },
  { maxOver: 30, eur: 300, points: 2 },
  { maxOver: 40, eur: 400, points: 4 },
  { maxOver: 50, eur: 500, points: 6 },
  { maxOver: Infinity, eur: 600, points: 6 },
];
const ES_TIERS_HIGH: { maxOver: number; eur: number; points: number }[] = [
  { maxOver: 30, eur: 100, points: 0 },
  { maxOver: 50, eur: 300, points: 2 },
  { maxOver: 60, eur: 400, points: 4 },
  { maxOver: 70, eur: 500, points: 6 },
  { maxOver: Infinity, eur: 600, points: 6 },
];

/** A büntetőjogi határ: városban +60, egyéb úton +80 km/h túllépés. */
function esCriminalThreshold(roadType: RoadType): number {
  return roadType === "city" ? 60 : 80;
}

export interface FineResultES extends FineResult {
  /** Levont pontok (0/2/4/6). */
  penaltyPoints: number;
  /** A bírság 20 napon belüli fizetés esetén (50% kedvezmény). */
  discountedFineEur: number;
}

export function calculateFineES(input: {
  roadType: RoadType;
  speedLimit: number;
  actualSpeed: number;
}): FineResultES {
  const tolerance = esTolerance(input.actualSpeed);
  const rawOver = Math.max(0, input.actualSpeed - input.speedLimit);
  const overage = Math.max(0, rawOver - tolerance);
  const base = {
    effectiveOverage: overage,
    tagessatzChf: null,
    daysOfFine: null,
    prisonInfo: null as string | null,
    penaltyPoints: 0,
    discountedFineEur: 0,
  };

  const toleranceNote = `A radar toleranciát von le: 5 km/h a mért 100 km/h-ig, felette a mért sebesség 5%-a (mobil radarnál nagyobb).`;
  const pointsNote = "⚠️ A spanyol pontrendszer fordítva működik, mint a magyar: 12 ponttal INDULSZ és veszíted őket (kezdő vezetőként csak 8-cal). Nullánál a jogosítványt felfüggesztik, és tanfolyammal kell visszaszerezni.";
  const prontoNote = `⚠️ PRONTO PAGO: ha ${ES_PRONTO_PAGO_DAYS} naptári napon belül fizetsz, a bírság 50%-át kell megfizetni — DE ezzel lemondasz a jogorvoslatról (a pontlevonás viszont NEM csökken).`;

  if (rawOver === 0) {
    return { ...base, severity: "no-fine", estimatedFineChf: 0, licenseSuspension: null,
      description: "A sebesség a megengedett limiten belül van.", legalNote: toleranceNote };
  }
  if (overage === 0) {
    return { ...base, severity: "no-fine", estimatedFineChf: 0, licenseSuspension: null,
      description: "A túllépés a radar-tolerancián belül van — jellemzően nem szankcionálják.",
      legalNote: toleranceNote };
  }

  // Büntetőjogi sáv (Código Penal 379. cikk).
  const crimAt = esCriminalThreshold(input.roadType);
  if (overage > crimAt) {
    return {
      ...base,
      severity: "raser",
      estimatedFineChf: 0,
      penaltyPoints: 6,
      prisonInfo: "3–6 hónap börtön VAGY 6–12 hónap napi-pénzbírság VAGY 31–90 nap közmunka",
      licenseSuspension: "1–4 év vezetéstől eltiltás (kötelező)",
      description: `⚠️ BŰNCSELEKMÉNY, nem szabálysértés. ${input.roadType === "city" ? "Városban +60" : "Országúton/autópályán +80"} km/h fölött a Código Penal 379. cikke alkalmazandó.`,
      legalNote: `Itt már nem a DGT szab bírságot, hanem BÍRÓSÁG ítélkezik: börtön, napi-pénzbírság vagy közmunka, ÉS kötelező 1–4 év eltiltás. A pronto pago kedvezmény NEM alkalmazható. ${pointsNote} Ilyen ügyben azonnal keress ügyvédet (abogado).`,
    };
  }

  const tiers = input.speedLimit <= 50 ? ES_TIERS_LOW : ES_TIERS_HIGH;
  const tier = tiers.find((t) => overage <= t.maxOver)!;
  const discounted = Math.round(tier.eur * (1 - ES_PRONTO_PAGO_RATE));

  const common = {
    ...base,
    estimatedFineChf: tier.eur,
    penaltyPoints: tier.points,
    discountedFineEur: discounted,
  };

  if (tier.points >= 6) {
    return { ...common, severity: "schwer", licenseSuspension: null,
      description: `Súlyos túllépés: ${tier.eur} € bírság és ${tier.points} pont levonása. Két ilyen eset a pontkeret felét elviszi.`,
      legalNote: `${prontoNote} ${pointsNote} ${toleranceNote}` };
  }
  if (tier.points > 0) {
    return { ...common, severity: "mittelschwer", licenseSuspension: null,
      description: `Jelentős túllépés: ${tier.eur} € bírság és ${tier.points} pont levonása.`,
      legalNote: `${prontoNote} ${pointsNote} ${toleranceNote}` };
  }
  return { ...common, severity: "ordnungsbusse", licenseSuspension: null,
    description: `Könnyű szabálysértés (infracción leve): ${tier.eur} € bírság, pontlevonás NÉLKÜL.`,
    legalNote: `${prontoNote} ${toleranceNote} A bírságot a DGT postázza vagy a hivatalos elektronikus kézbesítésen (DEV) küldi — érdemes regisztrálni rá, mert a nem átvett levél is kézbesítettnek számít.` };
}
