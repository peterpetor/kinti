/**
 * orszag-osszehasonlito.ts — „Hol marad több?" ország-összehasonlítás motorja.
 *
 * Egy relatív jövedelem-szintből (a helyi medián bér hány százaléka) kiszámolja
 * mind a 6 országra a nettót, a lakhatást, a biztosítást és a megélhetést, majd
 * ezek ARÁNYÁT a nettó jövedelemhez képest.
 *
 * ⚠️ MIÉRT RELATÍV A CSÚSZKA, ÉS NEM ABSZOLÚT ÖSSZEG?
 * Mert a hat ország három pénznemet használ (CHF / EUR / GBP), és „6000" nem
 * ugyanaz a szám Zürichben és Sevillában. Egy közös pénznemre váltás sem
 * segítene: attól még nem keresel Spanyolországban svájci bért. A helyi
 * mediánhoz mérés az egyetlen összevetés, ami mindenhol ugyanazt jelenti —
 * „az ottani átlagkereső helyzete". Az abszolút összegeket ettől még kiírjuk,
 * mindig a HELYI pénznemben.
 *
 * ⚠️ A SZÁZALÉKOK A NETTÓHOZ mérnek, nem a bruttóhoz. A bruttóhoz mérve az
 * országok adóterhelése beleolvadna a „megélhetés" sávba, és egy magas adójú
 * ország hamisan tűnne drágábbnak. Az adót a nettó már levonta.
 */

import { computeSalary, computeSalaryAT, computeSalaryDE, computeSalaryNL, computeSalaryGB,
  NATIONAL_MEDIAN_GROSS, AT_NATIONAL_MEDIAN_GROSS, DE_NATIONAL_MEDIAN_GROSS,
  NL_NATIONAL_MEDIAN_GROSS, GB_NATIONAL_MEDIAN_GROSS } from "./salary-calc";
import { computeSalaryES, ES_NATIONAL_MEDIAN_GROSS } from "./salary-calc-es";
import { baselineCosts, budgetCurrency, type BudgetCountry } from "./budget-plan";

export const OSSZEHASONLITO_ORSZAGOK: BudgetCountry[] = ["CH", "AT", "DE", "NL", "GB", "ES"];

/** Országos medián bruttó (havi, helyi pénznemben) — a csúszka viszonyítási alapja. */
export const MEDIAN_GROSS: Record<BudgetCountry, number> = {
  CH: NATIONAL_MEDIAN_GROSS,
  AT: AT_NATIONAL_MEDIAN_GROSS,
  DE: DE_NATIONAL_MEDIAN_GROSS,
  NL: NL_NATIONAL_MEDIAN_GROSS,
  GB: GB_NATIONAL_MEDIAN_GROSS,
  ES: ES_NATIONAL_MEDIAN_GROSS,
};

/** A négy sáv — a sorrend a grafikon rétegsorrendje is. */
export type SavId = "lakhatas" | "megelhetes" | "biztositas" | "marad";

/*
 * A `rovid` a TÁBLÁZATOS nézet fejléce. Nem kozmetika: a teljes szavakkal a
 * táblázat 390px-es telefonon ~400px-re hízott, és épp a legfontosabb („Marad")
 * oszlop csúszott ki a képernyő szélén — vízszintes görgetés mögé rejtve.
 * A „Megélhetés" egy szó, tördeléssel sem fér el.
 */
export const SAVOK: { id: SavId; label: string; rovid: string; emoji: string }[] = [
  { id: "lakhatas", label: "Lakhatás", rovid: "Lakhat.", emoji: "🏠" },
  { id: "megelhetes", label: "Megélhetés", rovid: "Megélh.", emoji: "🛒" },
  { id: "biztositas", label: "Biztosítás", rovid: "Bizt.", emoji: "🛡️" },
  { id: "marad", label: "Marad", rovid: "Marad", emoji: "💰" },
];

/** A megélhetés-sávba tartozó költség-kategóriák (a `budget-plan` COST_BASELINE id-jei). */
const MEGELHETES_IDS = new Set(["kaja", "kozlekedes", "internet_mobil", "szabadido"]);

export interface OrszagSor {
  country: BudgetCountry;
  currency: "CHF" | "EUR" | "GBP";
  /** A csúszka szerinti havi bruttó, helyi pénznemben. */
  gross: number;
  /** Havi nettó, helyi pénznemben. */
  net: number;
  /** Havi összegek, helyi pénznemben. */
  osszeg: Record<SavId, number>;
  /** A nettó hány százaléka — ez megy a grafikonra. Összegük 100. */
  arany: Record<SavId, number>;
  /** A lakbér-medián mintaszáma (hány beküldésből jött). */
  rentMinta: number;
  /** Nincs elég lakbér-adat → a sor nem rangsorolható. */
  keves: boolean;
}

/** Egy ország havi nettója a megadott havi bruttóból, egyszemélyes háztartásra. */
function nettoHavi(country: BudgetCountry, gross: number): number {
  switch (country) {
    case "CH":
      // ZH mint referencia-kanton: a forrásadó kantononként eltér, de az
      // ország-összevetéshez egy rögzített, tipikus kanton kell.
      return computeSalary({ gross, period: "month", canton: "ZH", age: "25-34", civil: "A", kids: 0, churchTax: false, months: 13 }).netYearly / 12;
    case "AT":
      return computeSalaryAT({ gross, period: "month", months: 14, kids: 0, soleEarner: false }).netYearly / 12;
    case "DE":
      return computeSalaryDE({ gross, period: "month", steuerklasse: 1, kids: 0, churchTax: false }).netMonthly;
    case "NL":
      return computeSalaryNL({ gross, period: "month", holidayAllowance: true }).netMonthly;
    case "GB":
      return computeSalaryGB({ gross, period: "month", pension: true }).netMonthly;
    case "ES":
      return computeSalaryES({ gross, period: "month", pagas: 12, children: 0 }).netMonthlyAverage;
  }
}

export const RENT_MIN_MINTA = 5;

/**
 * Egy ország sora. A `rentMedian` a közösségi lakbér-medián (helyi pénznem);
 * ha nincs (vagy túl kicsi a minta), a sor `keves` jelzést kap, és a hívónak
 * NEM szabad rangsorolnia — enélkül egy 2 elemű minta ugyanolyan magabiztosan
 * kerülne az élre, mint egy 70 elemű.
 */
export function orszagSor(
  country: BudgetCountry,
  szazalek: number,
  rentMedian: number | null,
  rentMinta: number,
): OrszagSor {
  const gross = Math.round((MEDIAN_GROSS[country] * szazalek) / 100);
  const net = Math.max(0, Math.round(nettoHavi(country, gross)));

  const koltsegek = baselineCosts(country, 1, 0);
  const rezsi = koltsegek.find((c) => c.id === "rezsi")?.amount ?? 0;
  const biztositas = koltsegek.find((c) => c.id === "krankenkasse")?.amount ?? 0;
  const megelhetes = koltsegek.filter((c) => MEGELHETES_IDS.has(c.id)).reduce((s, c) => s + c.amount, 0);
  const lakber = rentMedian ?? 0;

  const osszeg: Record<SavId, number> = {
    lakhatas: lakber + rezsi,
    megelhetes,
    biztositas,
    marad: 0,
  };
  osszeg.marad = Math.max(0, net - osszeg.lakhatas - osszeg.megelhetes - osszeg.biztositas);

  // ⚠️ Az arány NEM a nettóhoz, hanem a NÉGY SÁV ÖSSZEGÉHEZ normalizál. Ha a
  // költségek meghaladják a nettót, a „marad" 0, és a nettóval osztva a sávok
  // összege 100% FÖLÉ menne — a grafikon kilógna a sávjából. Így mindig
  // pontosan 100%-ot ad ki, és a hiány külön (negatív egyenlegként) jelezhető.
  const ossz = osszeg.lakhatas + osszeg.megelhetes + osszeg.biztositas + osszeg.marad;
  const arany: Record<SavId, number> = { lakhatas: 0, megelhetes: 0, biztositas: 0, marad: 0 };
  if (ossz > 0) for (const s of SAVOK) arany[s.id] = (osszeg[s.id] / ossz) * 100;

  return {
    country,
    currency: budgetCurrency(country),
    gross,
    net,
    osszeg,
    arany,
    rentMinta,
    keves: rentMedian == null || rentMinta < RENT_MIN_MINTA,
  };
}

/** A hónap végi egyenleg (negatív = hiány) — a „marad" a 0-nál elvágott érték. */
export function egyenleg(sor: OrszagSor): number {
  return sor.net - sor.osszeg.lakhatas - sor.osszeg.megelhetes - sor.osszeg.biztositas;
}
