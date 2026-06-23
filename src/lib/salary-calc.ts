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
