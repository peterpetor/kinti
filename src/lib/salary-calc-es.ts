/**
 * salary-calc-es.ts — spanyol nettó-bér számítás (IRPF + Seguridad Social).
 *
 * ⚠️ KÉT DOLGOT KELL TUDNI, MIELŐTT EZT A KÓDOT OLVASOD:
 *
 * 1) A 12 vs 14 FIZETÉS. Spanyolországban bevett, hogy az éves bért 14 részletben
 *    fizetik ki (12 havi + 1 nyári + 1 karácsonyi „paga extra"), de sok cég
 *    12 egyenlő részletre osztja szét. Ez NEM több pénz, csak más eloszlás —
 *    a havi költségvetést viszont teljesen átírja. Ezért itt az ÉVES bruttó a
 *    számítás alapja, és a kimenet MINDKÉT havi nézetet megadja. Ez a
 *    kalkulátor legfontosabb funkciója: egy magyar álláskereső enélkül
 *    összehasonlíthatatlan ajánlatokat lát.
 *
 * 2) AZ IRPF FELE AZ AUTONÓM KÖZÖSSÉGÉ. Az adó egy állami és egy közösségi
 *    sávból áll össze, és a közösségek maguk állapítják meg a sajátjukat.
 *    Itt a REFERENCIA-kulcs (állami + a vele azonos szerkezetű közösségi sáv)
 *    szerepel — ez a bevett közelítés régió-megadás nélkül. Madridban ennél
 *    kevesebb, Katalóniában több jön ki. A UI ezt kimondja, és az AEAT
 *    hivatalos kalkulátorára irányít.
 *
 * A paraméterek 2025-ösek, és ÉVENTE VÁLTOZNAK (a járulékplafon, a MEI-kulcs és
 * a munkabér-kedvezmény minden januárban új értéket kap). Ezért a UI dátumozza
 * őket, és a becslést sosem adjuk ki pontos összegként.
 *
 * A külön fájl SZÁNDÉKOS: a salary-calc.ts már 5 ország logikáját tartja, és a
 * spanyol modell (14 paga, közösségi sáv) elég más ahhoz, hogy ne olvadjon bele.
 */
import type { PayPeriod, SalaryPercentile } from "./salary-calc";

/** Munkavállalói TB-kulcsok (2025). A munkáltatói rész NEM része a nettónak. */
const ES_SS_COMMON = 0.047; // contingencias comunes
const ES_SS_UNEMP_INDEF = 0.0155; // desempleo — határozatlan idejű szerződés
const ES_SS_UNEMP_TEMP = 0.016; // desempleo — határozott idejű (magasabb!)
const ES_SS_TRAINING = 0.001; // formación profesional
const ES_SS_MEI = 0.0013; // MEI munkavállalói rész (2025; fokozatosan nő)

/** Éves járulékplafon: a havi 4 909,50 €-s maximális alap tizenkétszerese (2025). */
const ES_SS_BASE_MAX_YEAR = 58914;

/** Levonható „egyéb költség" átalány (art. 19 LIRPF). */
const ES_OTHER_EXPENSES = 2000;

/**
 * Munkajövedelem-kedvezmény (art. 20 LIRPF, 2025-ös paraméterek).
 * Alacsony keresetnél komoly tétel — a spanyolországi magyarok jelentős része a
 * minimálbér közelében (vendéglátás, mezőgazdaság) dolgozik, ezért NEM hagyható
 * ki a modellből: nélküle a kalkulátor jóval kevesebb nettót mutatna a valósnál.
 */
const ES_WORK_RED_MAX = 7302;
const ES_WORK_RED_FULL_UPTO = 14852;
const ES_WORK_RED_COEFF = 1.75;

/** Személyi minimum (65 év alatt) és a gyerekek utáni minimum (art. 57–58 LIRPF). */
const ES_MIN_PERSONAL = 5550;
const ES_MIN_CHILD = [2400, 2700, 4000, 4500];

/**
 * IRPF-sávok — ÖSSZEVONT (állami + referencia-közösségi) kulcsok.
 * ⚠️ A tényleges kulcs a lakóhelyed autonóm közösségétől függ.
 */
const ES_IRPF_BANDS: { upTo: number; rate: number }[] = [
  { upTo: 12450, rate: 0.19 },
  { upTo: 20200, rate: 0.24 },
  { upTo: 35200, rate: 0.3 },
  { upTo: 60000, rate: 0.37 },
  { upTo: 300000, rate: 0.45 },
  { upTo: Infinity, rate: 0.47 },
];

/**
 * ⚠️ A minimálbér (SMI) éves összege, 14 pagára számolva.
 * 2026: 1 221 €/hó × 14 = 17 094 €/év (BOE, 2026. február, januárra visszamenő
 * hatállyal; +3,1% a 2025-ös 16 576 €-hoz képest).
 *
 * SZÁNDÉKOSAN csak ALSÓ korlátként használjuk: a minimálbér évről évre NŐ, így
 * ami az itteni szint alatt van, az biztosan a mostani alatt is. Fordítva nem
 * igaz — ezért NEM állítjuk, hogy a fölötte lévő bér megfelel a minimálbérnek.
 * Ez a féloldalas következtetés teszi lehetővé, hogy elavult adattal is csak
 * IGAZ figyelmeztetést adjunk.
 */
export const ES_SMI_YEARLY = 17094;

/** Sávos adó egy adóalapra. */
function esScale(base: number): number {
  let tax = 0;
  let prev = 0;
  for (const band of ES_IRPF_BANDS) {
    if (base <= prev) break;
    const slice = Math.min(base, band.upTo) - prev;
    tax += slice * band.rate;
    prev = band.upTo;
  }
  return tax;
}

/** Munkajövedelem-kedvezmény a nettó munkajövedelemből. */
export function esWorkIncomeReduction(netWorkIncome: number): number {
  if (netWorkIncome <= ES_WORK_RED_FULL_UPTO) return ES_WORK_RED_MAX;
  return Math.max(
    0,
    ES_WORK_RED_MAX - ES_WORK_RED_COEFF * (netWorkIncome - ES_WORK_RED_FULL_UPTO),
  );
}

/** A gyerekek utáni minimum összege (a 4. gyerek fölött a 4. tétel ismétlődik). */
export function esChildMinimum(children: number): number {
  let sum = 0;
  for (let i = 0; i < Math.max(0, Math.min(10, children)); i++) {
    sum += ES_MIN_CHILD[Math.min(i, ES_MIN_CHILD.length - 1)];
  }
  return sum;
}

export interface SalaryCalcInputES {
  gross: number;
  /** A megadott összeg időszaka. ⚠️ „month" 14 pagánál EGY PAGÁT jelent. */
  period: PayPeriod;
  /** Hány részletben fizetnek: 12 vagy 14 (a spanyol alapeset a 14). */
  pagas?: 12 | 14;
  /** Szerződéstípus — a munkanélküli-járulék kulcsa eltér. */
  contract?: "indefinido" | "temporal";
  /** Eltartott gyerekek száma (IRPF-minimum). */
  children?: number;
}

export interface SalaryCalcResultES {
  grossYearly: number;
  /** Egy rendes kifizetés bruttója (14 pagánál júliusban/decemberben dupla jön). */
  grossPerPaga: number;
  ssYearly: number;
  /** Munkajövedelem-kedvezmény (art. 20) — alacsony bérnél a fő könnyítés. */
  workReduction: number;
  taxableYearly: number;
  personalMinimum: number;
  irpfYearly: number;
  netYearly: number;
  /** Egy rendes kifizetés nettója (ezt látod a bérpapíron). */
  netPerPaga: number;
  /** A nettó 12 hónapra elosztva — ezzel tervezz, ha havi költséged van. */
  netMonthlyAverage: number;
  /** Hány kifizetés van egy évben (12 vagy 14). */
  pagas: number;
  effectiveRate: number;
  /** ⚠️ Igaz, ha a bér a 2025-ös minimálbér alatt van (ld. a konstans megjegyzését). */
  belowMinimumWage: boolean;
}

/** Spanyol nettó-bér becslés (IRPF + Seguridad Social) — a kalkulátor magja. */
export function computeSalaryES(input: SalaryCalcInputES): SalaryCalcResultES {
  const pagas = input.pagas ?? 14;
  const grossYearly = input.period === "year" ? input.gross : input.gross * pagas;
  const grossPerPaga = pagas > 0 ? grossYearly / pagas : 0;

  const ssRate =
    ES_SS_COMMON +
    (input.contract === "temporal" ? ES_SS_UNEMP_TEMP : ES_SS_UNEMP_INDEF) +
    ES_SS_TRAINING +
    ES_SS_MEI;
  const ssYearly = Math.min(grossYearly, ES_SS_BASE_MAX_YEAR) * ssRate;

  // Rendimiento neto = bruttó − TB − átalány költség; erre jön a kedvezmény.
  const netWorkIncome = Math.max(0, grossYearly - ssYearly - ES_OTHER_EXPENSES);
  const workReduction = esWorkIncomeReduction(netWorkIncome);
  const taxableYearly = Math.max(0, netWorkIncome - workReduction);

  // ⚠️ A személyi minimum NEM az adóalapból való levonás, hanem a legalsó
  // sávban adómentesített összeg: a sávos adóból kivonjuk a minimumra jutó adót.
  // Ha levonásként kezelnénk, magas keresetnél TÚL SOK kedvezményt adnánk.
  const personalMinimum = ES_MIN_PERSONAL + esChildMinimum(input.children ?? 0);
  const irpfYearly = Math.max(
    0,
    esScale(taxableYearly) - esScale(Math.min(personalMinimum, taxableYearly)),
  );

  const netYearly = grossYearly - ssYearly - irpfYearly;

  return {
    grossYearly,
    grossPerPaga,
    ssYearly,
    workReduction,
    taxableYearly,
    personalMinimum,
    irpfYearly,
    netYearly,
    netPerPaga: pagas > 0 ? netYearly / pagas : 0,
    netMonthlyAverage: netYearly / 12,
    pagas,
    effectiveRate: grossYearly > 0 ? ((grossYearly - netYearly) / grossYearly) * 100 : 0,
    belowMinimumWage: grossYearly > 0 && grossYearly < ES_SMI_YEARLY,
  };
}

/** Spanyol medián havi BRUTTÓ (az INE éves medián keresetéből származtatott BECSLÉS). */
export const ES_NATIONAL_MEDIAN_GROSS = 1950;

/** Közösség-medián havi BRUTTÓ — INE regionális kereseti adatokból származtatott
 *  BECSLÉS (nem hivatalos érték). A kódok a regions.ts ES-kódjaival EGYEZNEK. */
export const ES_REGION_MEDIAN_GROSS: Record<string, number> = {
  PV: 2400, // País Vasco
  MD: 2350, // Comunidad de Madrid
  NC: 2250, // Navarra
  CT: 2150, // Cataluña
  AR: 2050, // Aragón
  AS: 2050, // Asturias
  CE: 2000, // Ceuta
  ML: 2000, // Melilla
  CB: 1950, // Cantabria
  RI: 1950, // La Rioja
  CL: 1950, // Castilla y León
  IB: 1900, // Illes Balears
  VC: 1850, // Comunitat Valenciana
  GA: 1850, // Galicia
  CM: 1850, // Castilla-La Mancha
  MC: 1800, // Región de Murcia
  AN: 1800, // Andalucía
  CN: 1750, // Canarias
  EX: 1700, // Extremadura
};

/** Közösség-lista a kalkulátor-választóhoz (regions.ts ES-kódok, medián szerint). */
export const ES_REGIONS_LIST: { code: string; name: string }[] = [
  { code: "MD", name: "Madrid" },
  { code: "CT", name: "Cataluña (Barcelona)" },
  { code: "AN", name: "Andalucía (Málaga, Sevilla)" },
  { code: "VC", name: "Comunitat Valenciana (Alicante)" },
  { code: "IB", name: "Illes Balears (Mallorca, Ibiza)" },
  { code: "CN", name: "Canarias (Tenerife, Gran Canaria)" },
  { code: "PV", name: "País Vasco (Bilbao)" },
  { code: "GA", name: "Galicia (Vigo)" },
  { code: "CL", name: "Castilla y León" },
  { code: "CM", name: "Castilla-La Mancha" },
  { code: "AR", name: "Aragón (Zaragoza)" },
  { code: "MC", name: "Murcia" },
  { code: "AS", name: "Asturias" },
  { code: "EX", name: "Extremadura" },
  { code: "NC", name: "Navarra" },
  { code: "CB", name: "Cantabria" },
  { code: "RI", name: "La Rioja" },
];

/** Standard normális eloszlásfüggvény (Abramowitz–Stegun közelítés). */
function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (1.330274 * t ** 4 - 1.821256 * t ** 3 + 1.781478 * t ** 2 - 0.356538 * t + 0.319381);
  return z > 0 ? 1 - p : p;
}

/** Percentilis a közösség- (vagy nemzeti) mediánhoz (log-normál becslés). */
export function salaryPercentileES(grossMonthly: number, region?: string): SalaryPercentile {
  const median = (region && ES_REGION_MEDIAN_GROSS[region]) || ES_NATIONAL_MEDIAN_GROSS;
  const sigma = 0.34;
  const z = (Math.log(Math.max(1, grossMonthly)) - Math.log(median)) / sigma;
  const p = Math.round(normalCdf(z) * 100);
  return { percentile: Math.min(99, Math.max(1, p)), median };
}
