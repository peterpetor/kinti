/**
 * salary-calc.ts — svájci nettó-bér becslés tiszta (testelhető) függvénye + a
 * „Jó ez az ajánlat?" benchmarkhoz kanton-medián adat és percentilis-modell.
 *
 * A számítás EGYSZERŰSÍTETT becslés (Quellensteuer kantononként; a tényleges
 * összeg községenként és cégenként eltér). Forrásadat: BFS LSE (medián), ESTV.
 */

export type AgeBracket = "<25" | "25-34" | "35-44" | "45-54" | "55-65";
export type CivilStatus = "A" | "B" | "C"; // A: egyedülálló, B: házas 1 kereső, C: házas 2 kereső
export type PayPeriod = "month" | "year";

// Munkavállalói társadalombiztosítási kulcsok (%)
export const RATE_AHV = 5.3; // AHV/IV/EO (10.6% total -> 5.3% munkavállaló)
export const RATE_ALV = 1.1; // ALV (munkanélküli) 148k CHF-ig
export const RATE_NBU = 1.2; // nem-üzemi baleset (átlag)
export const RATE_KTG = 0.8; // napi betegpénz (átlag)

const BVG_AGE_RATES: Record<AgeBracket, number> = {
  "<25": 1.0,
  "25-34": 3.5,
  "35-44": 5.0,
  "45-54": 7.5,
  "55-65": 9.0,
};

/** Egyszerűsített Quellensteuer-kulcsok (~7000 CHF/hó, 2024/2025). */
export const QST_RATES: Record<string, { A: number; B: number; C: number }> = {
  ZH: { A: 8.5, B: 5.0, C: 8.0 }, BE: { A: 13.0, B: 9.0, C: 12.0 },
  LU: { A: 10.0, B: 6.0, C: 9.5 }, UR: { A: 7.5, B: 4.0, C: 7.0 },
  SZ: { A: 6.5, B: 3.5, C: 6.0 }, OW: { A: 8.5, B: 5.0, C: 8.0 },
  NW: { A: 7.5, B: 4.0, C: 7.0 }, GL: { A: 10.0, B: 6.5, C: 9.5 },
  ZG: { A: 4.5, B: 2.0, C: 4.0 }, FR: { A: 12.5, B: 8.5, C: 12.0 },
  SO: { A: 11.5, B: 8.0, C: 11.0 }, BS: { A: 12.5, B: 8.5, C: 12.0 },
  BL: { A: 11.5, B: 8.0, C: 11.0 }, SH: { A: 11.0, B: 7.5, C: 10.5 },
  AR: { A: 11.0, B: 7.5, C: 10.5 }, AI: { A: 8.5, B: 5.0, C: 8.0 },
  SG: { A: 11.0, B: 7.5, C: 10.5 }, GR: { A: 9.5, B: 6.0, C: 9.0 },
  AG: { A: 10.0, B: 6.5, C: 9.5 }, TG: { A: 10.5, B: 7.0, C: 10.0 },
  TI: { A: 11.0, B: 7.5, C: 10.5 }, VD: { A: 13.5, B: 9.5, C: 13.0 },
  VS: { A: 10.5, B: 7.0, C: 10.0 }, NE: { A: 14.0, B: 10.0, C: 13.5 },
  GE: { A: 13.0, B: 9.0, C: 12.5 }, JU: { A: 13.0, B: 9.0, C: 12.5 },
};

export interface SalaryCalcInput {
  gross: number;
  period: PayPeriod;
  canton: string;
  age: AgeBracket;
  civil: CivilStatus;
  kids: number;
  churchTax: boolean;
  months: number; // 12 vagy 13
}

export interface SalaryCalcResult {
  grossMonthly: number;
  grossYearly: number;
  valAhv: number;
  valAlv: number;
  valNbu: number;
  valKtg: number;
  valBvg: number;
  valQst: number;
  qstRate: number;
  /** AHV+ALV+NBU+KTG (BVG nélkül). */
  socialNonPension: number;
  /** AHV+ALV+NBU+KTG+BVG. */
  socialDeductions: number;
  totalDeductions: number;
  netMonthly: number;
  netYearly: number;
}

/** A nettó-bér becslése — a kalkulátor és a kanton-összehasonlítás közös magja. */
export function computeSalary(input: SalaryCalcInput): SalaryCalcResult {
  const months = input.months || 12;
  const grossMonthly = input.period === "month" ? input.gross : input.gross / months;
  const grossYearly = input.period === "year" ? input.gross : input.gross * months;

  // BVG (2. pillér) — csak a koordinált bérre (~2143 CHF/hó felett)
  const bvgRate = BVG_AGE_RATES[input.age] ?? 3.5;
  const coordinated = Math.max(0, grossMonthly - 2143);
  const valBvg = (coordinated * bvgRate) / 100;

  const valAhv = (grossMonthly * RATE_AHV) / 100;
  const valAlv = (grossMonthly * RATE_ALV) / 100;
  const valNbu = (grossMonthly * RATE_NBU) / 100;
  const valKtg = (grossMonthly * RATE_KTG) / 100;

  const socialNonPension = valAhv + valAlv + valNbu + valKtg;
  const socialDeductions = socialNonPension + valBvg;

  // Quellensteuer
  const cantonRates = QST_RATES[input.canton] || QST_RATES.ZH;
  let qstRate = cantonRates[input.civil];
  if (input.kids > 0) qstRate = Math.max(0, qstRate - input.kids * 2.2);
  if (input.churchTax) qstRate += 1.0;
  qstRate = Math.max(0, qstRate);
  const valQst = (grossMonthly * qstRate) / 100;

  const totalDeductions = socialDeductions + valQst;
  const netMonthly = grossMonthly - totalDeductions;
  const netYearly = netMonthly * months;

  return {
    grossMonthly, grossYearly,
    valAhv, valAlv, valNbu, valKtg, valBvg, valQst, qstRate,
    socialNonPension, socialDeductions, totalDeductions,
    netMonthly, netYearly,
  };
}

/**
 * Kanton-medián teljes munkaidős havi BRUTTÓ bér (CHF) — BFS LSE alapú becslés.
 * A „Jó ez az ajánlat?" benchmarkhoz (nem hivatalos pontos érték).
 */
export const NATIONAL_MEDIAN_GROSS = 6800;
export const CANTON_MEDIAN_GROSS: Record<string, number> = {
  ZH: 7100, BE: 6400, LU: 6300, UR: 6100, SZ: 6400, OW: 6100, NW: 6300,
  GL: 6100, ZG: 7400, FR: 6200, SO: 6300, BS: 7000, BL: 6600, SH: 6300,
  AR: 6000, AI: 5800, SG: 6200, GR: 6100, AG: 6400, TG: 6100, TI: 5600,
  VD: 6700, VS: 6000, NE: 6300, GE: 7000, JU: 5900,
};

/** Normál eloszlás CDF (erf-közelítés, Abramowitz–Stegun). */
function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (z > 0) p = 1 - p;
  return p;
}

export interface SalaryPercentile {
  /** Hány % keres ennél kevesebbet az adott kantonban (1–99). */
  percentile: number;
  /** A kanton medián havi bruttója (CHF). */
  median: number;
}

/**
 * Becsült percentilis: a bérek nagyjából log-normál eloszlásúak, ezért a kanton
 * mediánjához viszonyítva (σ≈0.33) becsüljük, hányad fizet kevesebbet.
 */
export function salaryPercentile(grossMonthly: number, canton: string): SalaryPercentile {
  const median = CANTON_MEDIAN_GROSS[canton] ?? NATIONAL_MEDIAN_GROSS;
  const sigma = 0.33;
  const safeGross = Math.max(1, grossMonthly);
  const z = (Math.log(safeGross) - Math.log(median)) / sigma;
  const p = Math.round(normalCdf(z) * 100);
  return { percentile: Math.min(99, Math.max(1, p)), median };
}

/* ════════════════════════ AUSZTRIA (Lohnsteuer + SV) ════════════════════════
 * Forrás: BMF Lohnsteuertarif 2025, ÖGK SV-kulcsok (Angestellte), Familienbonus
 * Plus. FONTOS: a Lohnsteuer ÉS az SV ORSZÁGOS — nincs Bundesland-szintű adóeltérés
 * (a svájci kantonokkal ellentétben). Az SV MAGÁBAN FOGLALJA az egészségbiztosítást
 * (nincs külön Krankenkasse-díj, mint Svájcban). Egyszerűsített becslés.
 */

/** Éves Lohnsteuer-sávok (2025, BMF). A `upTo` határig az adott `rate`%. */
const AT_TAX_BRACKETS: { upTo: number; rate: number }[] = [
  { upTo: 13308, rate: 0 },
  { upTo: 21617, rate: 20 },
  { upTo: 35836, rate: 30 },
  { upTo: 69166, rate: 40 },
  { upTo: 103072, rate: 48 },
  { upTo: 1000000, rate: 50 },
  { upTo: Infinity, rate: 55 },
];

function atTaxByBrackets(taxable: number, brackets: { upTo: number; rate: number }[]): number {
  let tax = 0;
  let lower = 0;
  for (const b of brackets) {
    if (taxable <= lower) break;
    const slice = Math.min(taxable, b.upTo) - lower;
    tax += (slice * b.rate) / 100;
    lower = b.upTo;
  }
  return tax;
}

/** Sonderzahlungs-tarifa (13./14. — Jahressechstel) a 620 € Freibetrag fölött. */
const AT_SPECIAL_BRACKETS: { upTo: number; rate: number }[] = [
  { upTo: 25000, rate: 6 },
  { upTo: 50000, rate: 27 },
  { upTo: 83333, rate: 35.75 },
  { upTo: Infinity, rate: 50 },
];

// SV munkavállalói kulcsok (Angestellte, 2025)
export const AT_SV_BASE = 15.12;          // KV 3.87 + PV 10.25 + AK 0.50 + WBF 0.50
const AT_SV_HBGL_MONTH = 6450;            // Höchstbeitragsgrundlage 2025 (laufend)
const AT_SV_HBGL_SPECIAL = 12900;         // Sonderzahlungen éves max-alap (2×6450)
export const AT_SV_SPECIAL_RATE = 17.07;  // Sonderzahlungen SV-kulcs

/** ALV (munkanélküli) lépcsős kulcs alacsony jövedelemnél (2025, havi bruttó). */
function atAlvRate(grossMonthly: number): number {
  if (grossMonthly <= 2074) return 0;
  if (grossMonthly <= 2262) return 1;
  if (grossMonthly <= 2451) return 2;
  return 2.95;
}

// Absetzbeträge (éves, 2025)
export const AT_VERKEHRSABSETZBETRAG = 487;
export const AT_FAMILIENBONUS_PER_KID = 2000;  // <18 év / gyerek
const AT_ALLEINVERDIENER_1KID = 601;

export interface SalaryCalcInputAT {
  gross: number;
  period: PayPeriod;
  months: 12 | 14;       // 14 = Urlaubs- + Weihnachtsgeld (13./14.)
  kids: number;          // Familienbonus Plus (<18)
  soleEarner: boolean;   // Alleinverdiener
}

export interface SalaryCalcResultAT {
  grossMonthly: number;   // laufend havi bruttó
  grossYearly: number;    // teljes éves bruttó (14× esetén 14 hónap)
  svRate: number;         // alkalmazott SV-kulcs (laufend)
  svMonthly: number;      // SV laufend / hó
  taxMonthly: number;     // Lohnsteuer laufend / hó (Absetzbeträge után)
  netMonthly: number;     // laufend nettó / hó
  // Sonderzahlungen (13./14.) — csak ha months===14
  specialGross: number;
  specialSv: number;
  specialTax: number;
  specialNet: number;
  netYearly: number;      // teljes éves nettó (laufend×12 + special)
  effectiveRate: number;  // teljes levonás / teljes bruttó (%)
}

/** Osztrák nettó-bér becslés — a kalkulátor és a benchmark közös magja. */
export function computeSalaryAT(input: SalaryCalcInputAT): SalaryCalcResultAT {
  const months = input.months || 14;
  const grossMonthly = input.period === "month" ? input.gross : input.gross / months;
  const grossYearly = input.period === "year" ? input.gross : input.gross * months;

  // — Laufender Bezug (havi rendes bér) —
  const svRate = AT_SV_BASE + atAlvRate(grossMonthly);
  const svMonthly = (Math.min(grossMonthly, AT_SV_HBGL_MONTH) * svRate) / 100;
  const annualTaxable = (grossMonthly - svMonthly) * 12;
  let annualTax = atTaxByBrackets(annualTaxable, AT_TAX_BRACKETS);
  let credits = AT_VERKEHRSABSETZBETRAG + input.kids * AT_FAMILIENBONUS_PER_KID;
  if (input.soleEarner && input.kids >= 1) credits += AT_ALLEINVERDIENER_1KID;
  annualTax = Math.max(0, annualTax - credits);
  const taxMonthly = annualTax / 12;
  const netMonthly = grossMonthly - svMonthly - taxMonthly;

  // — Sonderzahlungen (13./14.) —
  let specialGross = 0, specialSv = 0, specialTax = 0, specialNet = 0;
  if (months === 14) {
    specialGross = grossMonthly * 2;
    specialSv = (Math.min(specialGross, AT_SV_HBGL_SPECIAL) * AT_SV_SPECIAL_RATE) / 100;
    const base = Math.max(0, specialGross - specialSv - 620); // 620 € éves Freibetrag
    specialTax = atTaxByBrackets(base, AT_SPECIAL_BRACKETS);
    specialNet = specialGross - specialSv - specialTax;
  }

  const netYearly = netMonthly * 12 + specialNet;
  const effectiveRate = grossYearly > 0 ? ((grossYearly - netYearly) / grossYearly) * 100 : 0;

  return {
    grossMonthly, grossYearly, svRate, svMonthly, taxMonthly, netMonthly,
    specialGross, specialSv, specialTax, specialNet, netYearly, effectiveRate,
  };
}

/** Bundesland-medián havi BRUTTÓ (full-time, ~14× konvenció) — Statistik Austria becslés. */
export const AT_NATIONAL_MEDIAN_GROSS = 3350;
// FONTOS: a kódok a regions.ts AT-kódjaival EGYEZNEK (W/NOE/OOE/STM/TIR/KTN/SBG/VBG/BGL),
// hogy az egész app egységes legyen (ne legyen kétféle AT-régiókód-séma).
export const BUNDESLAND_MEDIAN_GROSS: Record<string, number> = {
  W: 3400,   // Wien
  NOE: 3450, // Niederösterreich
  OOE: 3400, // Oberösterreich
  VBG: 3450, // Vorarlberg
  SBG: 3300, // Salzburg
  STM: 3300, // Steiermark
  BGL: 3300, // Burgenland
  KTN: 3200, // Kärnten
  TIR: 3150,
};

export const AT_BUNDESLAENDER: { code: string; name: string }[] = [
  { code: "W", name: "Bécs (Wien)" },
  { code: "NOE", name: "Alsó-Ausztria (NÖ)" },
  { code: "OOE", name: "Felső-Ausztria (OÖ)" },
  { code: "STM", name: "Stájerország" },
  { code: "TIR", name: "Tirol" },
  { code: "KTN", name: "Karintia" },
  { code: "SBG", name: "Salzburg" },
  { code: "VBG", name: "Vorarlberg" },
  { code: "BGL", name: "Burgenland" },
];

/** Percentilis az osztrák Bundesland-mediánhoz (log-normál becslés). */
export function salaryPercentileAT(grossMonthly: number, bundesland: string): SalaryPercentile {
  const median = BUNDESLAND_MEDIAN_GROSS[bundesland] ?? AT_NATIONAL_MEDIAN_GROSS;
  const sigma = 0.30;
  const z = (Math.log(Math.max(1, grossMonthly)) - Math.log(median)) / sigma;
  const p = Math.round(normalCdf(z) * 100);
  return { percentile: Math.min(99, Math.max(1, p)), median };
}

/* ════════════════════════ NÉMETORSZÁG (Lohnsteuer + SV) ════════════════════════
 * Forrás: §32a EStG 2025 (Einkommensteuer-tarif), SV-kulcsok 2025 (RV/AV/KV/PV).
 * A jövedelemadó ORSZÁGOS (nincs Bundesland-eltérés). Az SV-ből az egészségbiztosítás
 * a Krankenkassénál van (a Zusatzbeitrag pénztáranként eltér — átlaggal számolunk).
 * EGYSZERŰSÍTETT becslés: a Lohnsteuer a hivatalos PAP-nál egyszerűbb modellel készül
 * (a Vorsorgepauschale helyett a tényleges SV-t vonjuk a zvE-ből), a Steuerklasse V/VI
 * speciális esete nincs külön kezelve.
 */

/** §32a EStG 2025 — éves Einkommensteuer a zu versteuerndes Einkommen (zvE) alapján. */
function estDE(zvE: number): number {
  const x = Math.floor(zvE);
  if (x <= 12096) return 0;
  if (x <= 17443) { const y = (x - 12096) / 10000; return Math.floor((932.30 * y + 1400) * y); }
  if (x <= 68480) { const z = (x - 17443) / 10000; return Math.floor((176.64 * z + 2397) * z + 1015.13); }
  if (x <= 277825) return Math.floor(0.42 * x - 10911.92);
  return Math.floor(0.45 * x - 19246.67);
}

// SV munkavállalói kulcsok (2025) + Beitragsbemessungsgrenzék (havi)
const DE_BBG_RV_AV = 8050;        // RV/AV felső határ (2025, egységes)
const DE_BBG_KV_PV = 5512.5;      // KV/PV felső határ (2025)
const DE_RATE_RV = 0.093;         // Rentenversicherung (munkavállaló)
const DE_RATE_AV = 0.013;         // Arbeitslosenversicherung (munkavállaló)
const DE_RATE_KV = 0.0855;        // KV 7,3% + átlag Zusatzbeitrag fele (~1,25%)
const DE_RATE_PV_KIND = 0.018;    // Pflege (gyermekkel)
const DE_RATE_PV_KINDERLOS = 0.024; // Pflege (gyermektelen, 23+) — +0,6% pótlék
const DE_WERBUNGSKOSTEN = 1230;   // Arbeitnehmer-Pauschbetrag (éves)
const DE_SONDERAUSGABEN = 36;     // Sonderausgaben-Pauschbetrag (éves)
const DE_ENTLASTUNG_II = 4260;    // Entlastungsbetrag für Alleinerziehende (1. gyerek)

export type Steuerklasse = 1 | 2 | 3 | 4;

export interface SalaryCalcInputDE {
  gross: number;
  period: PayPeriod;
  steuerklasse: Steuerklasse;
  kids: number;          // PV-pótlék + Steuerklasse II
  churchTax: boolean;    // Kirchensteuer 9%
}

export interface SalaryCalcResultDE {
  grossMonthly: number;
  grossYearly: number;
  rvMonthly: number;
  avMonthly: number;
  kvMonthly: number;
  pvMonthly: number;
  svMonthly: number;     // RV+AV+KV+PV összesen
  taxMonthly: number;    // Lohnsteuer
  soliMonthly: number;   // Solidaritätszuschlag
  churchMonthly: number; // Kirchensteuer
  netMonthly: number;
  netYearly: number;
  effectiveRate: number; // teljes levonás / bruttó (%)
}

/** Német nettó-bér becslés — a kalkulátor (és benchmark) közös magja. */
export function computeSalaryDE(input: SalaryCalcInputDE): SalaryCalcResultDE {
  const grossMonthly = input.period === "month" ? input.gross : input.gross / 12;
  const grossYearly = input.period === "year" ? input.gross : input.gross * 12;

  // — Sozialversicherung (munkavállalói rész) —
  const rvMonthly = Math.min(grossMonthly, DE_BBG_RV_AV) * DE_RATE_RV;
  const avMonthly = Math.min(grossMonthly, DE_BBG_RV_AV) * DE_RATE_AV;
  const kvMonthly = Math.min(grossMonthly, DE_BBG_KV_PV) * DE_RATE_KV;
  const pvMonthly = Math.min(grossMonthly, DE_BBG_KV_PV) * (input.kids > 0 ? DE_RATE_PV_KIND : DE_RATE_PV_KINDERLOS);
  const svMonthly = rvMonthly + avMonthly + kvMonthly + pvMonthly;

  // — Lohnsteuer (§32a, éves zvE) —
  let zvE = grossYearly - svMonthly * 12 - DE_WERBUNGSKOSTEN - DE_SONDERAUSGABEN;
  if (input.steuerklasse === 2 && input.kids >= 1) zvE -= DE_ENTLASTUNG_II + Math.max(0, input.kids - 1) * 240;
  zvE = Math.max(0, zvE);

  // Steuerklasse: III = Splitting (≈ 2× a fele jövedelem adója); I/II/IV = alap tarifa.
  const estYearly = input.steuerklasse === 3 ? 2 * estDE(zvE / 2) : estDE(zvE);

  // Soli: 5,5% a Lohnsteuerre, csak a Freigrenze fölött (a legtöbb dolgozónál 0).
  const soliThreshold = input.steuerklasse === 3 ? 39900 : 19950;
  const soliYearly = estYearly > soliThreshold ? estYearly * 0.055 : 0;
  // Kirchensteuer: 9% (Bayern/BW: 8%) a Lohnsteuerre, ha egyháztag.
  const churchYearly = input.churchTax ? estYearly * 0.09 : 0;

  const taxMonthly = estYearly / 12;
  const soliMonthly = soliYearly / 12;
  const churchMonthly = churchYearly / 12;
  const netMonthly = grossMonthly - svMonthly - taxMonthly - soliMonthly - churchMonthly;
  const netYearly = netMonthly * 12;
  const effectiveRate = grossYearly > 0 ? ((grossYearly - netYearly) / grossYearly) * 100 : 0;

  return {
    grossMonthly, grossYearly, rvMonthly, avMonthly, kvMonthly, pvMonthly, svMonthly,
    taxMonthly, soliMonthly, churchMonthly, netMonthly, netYearly, effectiveRate,
  };
}

/** Bundesland-medián havi BRUTTÓ (Vollzeit) — Destatis becslés (tájékoztató). */
export const DE_NATIONAL_MEDIAN_GROSS = 4300;
export const DE_LAND_MEDIAN_GROSS: Record<string, number> = {
  HH: 4800, HE: 4700, BW: 4650, BY: 4600, HB: 4400, NW: 4350, BE: 4300,
  NI: 4150, RP: 4150, SL: 4150, SH: 4050, BB: 3900, SN: 3800, TH: 3800,
  ST: 3800, MV: 3750,
};

export const DE_BUNDESLAENDER: { code: string; name: string }[] = [
  { code: "BW", name: "Baden-Württemberg" },
  { code: "BY", name: "Bajorország (Bayern)" },
  { code: "BE", name: "Berlin" },
  { code: "BB", name: "Brandenburg" },
  { code: "HB", name: "Bréma (Bremen)" },
  { code: "HH", name: "Hamburg" },
  { code: "HE", name: "Hessen" },
  { code: "MV", name: "Mecklenburg-Vorpommern" },
  { code: "NI", name: "Alsó-Szászország (Niedersachsen)" },
  { code: "NW", name: "Észak-Rajna-Vesztfália (NRW)" },
  { code: "RP", name: "Rajna-vidék-Pfalz" },
  { code: "SL", name: "Saar-vidék (Saarland)" },
  { code: "SN", name: "Szászország (Sachsen)" },
  { code: "ST", name: "Szász-Anhalt" },
  { code: "SH", name: "Schleswig-Holstein" },
  { code: "TH", name: "Türingia (Thüringen)" },
];

/** Percentilis a német Bundesland-mediánhoz (log-normál becslés). */
export function salaryPercentileDE(grossMonthly: number, land: string): SalaryPercentile {
  const median = DE_LAND_MEDIAN_GROSS[land] ?? DE_NATIONAL_MEDIAN_GROSS;
  const sigma = 0.32;
  const z = (Math.log(Math.max(1, grossMonthly)) - Math.log(median)) / sigma;
  const p = Math.round(normalCdf(z) * 100);
  return { percentile: Math.min(99, Math.max(1, p)), median };
}

// ─────────────────────────────────────────────────────────────────────────────
// HOLLANDIA (NL) — nettó-bér becslés (2025). Box 1 sávos jövedelemadó (benne a
// premie volksverzekeringen) + algemene heffingskorting + arbeidskorting. A
// holland SZJA NEMZETI (nincs provinciánkénti eltérés). BECSLÉS, nem hivatalos:
// nem tartalmazza a munkáltató-specifikus nyugdíjlevonást (pensioenpremie), a
// 30%-regelinget, és AOW-kor alattit feltételez.
// ─────────────────────────────────────────────────────────────────────────────

// Box 1 sávok 2025 (AOW-kor alatt) — a kulcs MÁR tartalmazza a premie volksverz.-t.
const NL_BRACKETS_2025: { upTo: number; rate: number }[] = [
  { upTo: 38441, rate: 0.3582 },
  { upTo: 76817, rate: 0.3748 },
  { upTo: Infinity, rate: 0.495 },
];

function nlBox1Tax(annual: number): number {
  let tax = 0;
  let last = 0;
  for (const b of NL_BRACKETS_2025) {
    if (annual <= last) break;
    const slice = Math.min(annual, b.upTo) - last;
    tax += slice * b.rate;
    last = b.upTo;
  }
  return tax;
}

/** Algemene heffingskorting 2025 (általános adójóváírás), jövedelemfüggő. */
function nlAlgemeneHeffingskorting(annual: number): number {
  const MAX = 3068;
  if (annual <= 28406) return MAX;
  if (annual >= 76817) return 0;
  return Math.max(0, MAX - 0.06337 * (annual - 28406));
}

/** Arbeidskorting 2025 (munkavállalói adójóváírás), jövedelemfüggő. */
function nlArbeidskorting(annual: number): number {
  if (annual <= 12169) return 0.08053 * annual;
  if (annual <= 26288) return 980 + 0.30030 * (annual - 12169);
  if (annual <= 43071) return 5220 + 0.02258 * (annual - 26288);
  if (annual <= 129078) return Math.max(0, 5599 - 0.06510 * (annual - 43071));
  return 0;
}

export interface SalaryCalcInputNL {
  gross: number;
  period: PayPeriod;
  /** A 8% vakantiegeld (szabadságpénz) beleszámítson-e az éves bruttóba. */
  holidayAllowance: boolean;
}

export interface SalaryCalcResultNL {
  grossMonthly: number;        // a megadott havi bruttó (vakantiegeld nélkül)
  grossYearly: number;         // éves bruttó (vakantiegelddel, ha bekapcsolt)
  holidayPayYearly: number;    // 8% vakantiegeld éves összege
  box1TaxYearly: number;       // sávos adó a jóváírások ELŐTT
  algemeneKortingYearly: number;
  arbeidskortingYearly: number;
  loonheffingYearly: number;   // tényleges levonás (adó − jóváírások, min. 0)
  netMonthly: number;          // éves nettó / 12 (átlag, a vakantiegeld elosztva)
  netYearly: number;
  effectiveRate: number;       // teljes levonás / bruttó (%)
}

/** Holland nettó-bér becslés — a kalkulátor magja. */
export function computeSalaryNL(input: SalaryCalcInputNL): SalaryCalcResultNL {
  const grossMonthly = input.period === "month" ? input.gross : input.gross / 12;
  const regularYearly = grossMonthly * 12;
  const holidayPayYearly = input.holidayAllowance ? regularYearly * 0.08 : 0;
  const grossYearly = regularYearly + holidayPayYearly;

  const box1TaxYearly = nlBox1Tax(grossYearly);
  const algemeneKortingYearly = nlAlgemeneHeffingskorting(grossYearly);
  const arbeidskortingYearly = nlArbeidskorting(grossYearly);
  const loonheffingYearly = Math.max(0, box1TaxYearly - algemeneKortingYearly - arbeidskortingYearly);

  const netYearly = grossYearly - loonheffingYearly;
  const netMonthly = netYearly / 12;
  const effectiveRate = grossYearly > 0 ? ((grossYearly - netYearly) / grossYearly) * 100 : 0;

  return {
    grossMonthly, grossYearly, holidayPayYearly, box1TaxYearly,
    algemeneKortingYearly, arbeidskortingYearly, loonheffingYearly,
    netMonthly, netYearly, effectiveRate,
  };
}

/** Holland medián havi BRUTTÓ (teljes munkaidő) — CBS-becslés (tájékoztató). */
export const NL_NATIONAL_MEDIAN_GROSS = 3300;

/** Provincia-medián havi BRUTTÓ — a CBS regionális kereseti statisztikáiból
 *  származtatott becslés (a Randstad-provinciák a nemzeti medián felett).
 *  FONTOS: a kódok a regions.ts NL-kódjaival EGYEZNEK (NH/ZH/UT/NB/GE/OV/LI/FR/GR/DR/FL/ZE). */
export const NL_PROVINCE_MEDIAN_GROSS: Record<string, number> = {
  NH: 3600, // Noord-Holland (Amszterdam)
  UT: 3550, // Utrecht
  ZH: 3450, // Zuid-Holland (Rotterdam/Hága)
  NB: 3300, // Noord-Brabant (Eindhoven)
  FL: 3250, // Flevoland (Randstad-ingázók)
  GE: 3200, // Gelderland
  OV: 3150, // Overijssel
  LI: 3150, // Limburg
  GR: 3100, // Groningen
  ZE: 3100, // Zeeland
  DR: 3050, // Drenthe
  FR: 3050, // Friesland
};

/** Provincia-lista a kalkulátor-választóhoz (regions.ts NL-kódok). */
export const NL_PROVINCES: { code: string; name: string }[] = [
  { code: "NH", name: "Noord-Holland (Amszterdam)" },
  { code: "ZH", name: "Zuid-Holland (Rotterdam/Hága)" },
  { code: "UT", name: "Utrecht" },
  { code: "NB", name: "Noord-Brabant (Eindhoven)" },
  { code: "GE", name: "Gelderland" },
  { code: "OV", name: "Overijssel" },
  { code: "LI", name: "Limburg" },
  { code: "FR", name: "Friesland" },
  { code: "GR", name: "Groningen" },
  { code: "DR", name: "Drenthe" },
  { code: "FL", name: "Flevoland" },
  { code: "ZE", name: "Zeeland" },
];

/** Percentilis a provincia- (vagy nemzeti) mediánhoz (log-normál becslés). */
export function salaryPercentileNL(grossMonthly: number, province?: string): SalaryPercentile {
  const median = (province && NL_PROVINCE_MEDIAN_GROSS[province]) || NL_NATIONAL_MEDIAN_GROSS;
  const sigma = 0.32;
  const z = (Math.log(Math.max(1, grossMonthly)) - Math.log(median)) / sigma;
  const p = Math.round(normalCdf(z) * 100);
  return { percentile: Math.min(99, Math.max(1, p)), median };
}
