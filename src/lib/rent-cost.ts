/**
 * Lakásbérlés "Rejtett Költség" Kalkulátor — svájci szabályok.
 *
 * FONTOS: tájékoztató jellegű becslés. A pontos kaució-szabály a bérleti
 * szerződésben + OR (Obligationenrecht) 257e §-ban. A Nebenkosten-tételek
 * kantonok közt eltérnek, és a bérleti szerződésben kell részletezni.
 *
 * Forrás: ch.ch, Mieterverband (mv.ch), OR 257e §.
 */

export type FlatSize = "studio" | "1-room" | "2-room" | "3-room" | "4-room" | "5plus-room";
export type HeatingType = "gas" | "oil" | "district" | "heatpump" | "pellet" | "unknown";
export type Region =
  | "city-zh" | "city-ge" | "city-bs" | "city-bern" | "suburb" | "rural"
  | "at-wien" | "at-graz" | "at-linz" | "at-salzburg" | "at-suburb" | "at-rural";

export interface FlatSizeInfo {
  id: FlatSize;
  label: string;
  emoji: string;
  /** Tipikus négyzetméter-tartomány. */
  m2Min: number;
  m2Max: number;
}

export const FLAT_SIZES: FlatSizeInfo[] = [
  { id: "studio",      label: "Studio",    emoji: "🏚️", m2Min: 18, m2Max: 35 },
  { id: "1-room",      label: "1 szoba",   emoji: "🛏️", m2Min: 25, m2Max: 50 },
  { id: "2-room",      label: "2 szoba",   emoji: "🏠", m2Min: 40, m2Max: 75 },
  { id: "3-room",      label: "3 szoba",   emoji: "🏡", m2Min: 60, m2Max: 100 },
  { id: "4-room",      label: "4 szoba",   emoji: "🏘️", m2Min: 80, m2Max: 130 },
  { id: "5plus-room",  label: "5+ szoba",  emoji: "🏰", m2Min: 100, m2Max: 200 },
];

export const HEATING_TYPES: { id: HeatingType; label: string; emoji: string; costMod: number }[] = [
  { id: "gas",       label: "Gáz",          emoji: "🔥", costMod: 1.0 },
  { id: "oil",       label: "Olaj",         emoji: "🛢️", costMod: 1.15 },
  { id: "district",  label: "Távfűtés",     emoji: "♨️", costMod: 0.95 },
  { id: "heatpump",  label: "Hőszivattyú",  emoji: "⚡", costMod: 0.75 },
  { id: "pellet",    label: "Pellet",       emoji: "🪵", costMod: 0.85 },
  { id: "unknown",   label: "Nem tudom",    emoji: "❓", costMod: 1.0 },
];

export const REGIONS: { id: Region; label: string; emoji: string; nebenkostenMod: number; country: "CH" | "AT" }[] = [
  { id: "city-zh",   label: "Zürich város", emoji: "🏙️", nebenkostenMod: 1.25, country: "CH" },
  { id: "city-ge",   label: "Genf város",   emoji: "🏙️", nebenkostenMod: 1.20, country: "CH" },
  { id: "city-bs",   label: "Basel város",  emoji: "🏙️", nebenkostenMod: 1.15, country: "CH" },
  { id: "city-bern", label: "Bern város",   emoji: "🏙️", nebenkostenMod: 1.10, country: "CH" },
  { id: "suburb",    label: "Agglomeráció", emoji: "🏘️", nebenkostenMod: 1.00, country: "CH" },
  { id: "rural",     label: "Vidék",        emoji: "🌳", nebenkostenMod: 0.85, country: "CH" },
  // Ausztria
  { id: "at-wien",     label: "Bécs",        emoji: "🏙️", nebenkostenMod: 1.15, country: "AT" },
  { id: "at-graz",     label: "Graz",        emoji: "🏙️", nebenkostenMod: 1.05, country: "AT" },
  { id: "at-linz",     label: "Linz",        emoji: "🏙️", nebenkostenMod: 1.05, country: "AT" },
  { id: "at-salzburg", label: "Salzburg",    emoji: "🏙️", nebenkostenMod: 1.10, country: "AT" },
  { id: "at-suburb",   label: "Agglomeráció", emoji: "🏘️", nebenkostenMod: 1.00, country: "AT" },
  { id: "at-rural",    label: "Vidék",       emoji: "🌳", nebenkostenMod: 0.85, country: "AT" },
];

/** A választott ország régiói (a régió-választóhoz). */
export function regionsFor(country: string): { id: Region; label: string; emoji: string; nebenkostenMod: number }[] {
  return REGIONS.filter((r) => r.country === (country === "AT" ? "AT" : "CH"));
}

/**
 * Svájci szabály (OR 257e §): a kaució max 3 havi nettó bérleti díj.
 */
export const MAX_KAUTION_MONTHS = 3;

/**
 * Tipikus Mietkautionsversicherung éves díj (a kaúció-összegre).
 * 4-6% évente — átlag 5%.
 */
export const KAUTION_INSURANCE_RATE = 0.05;

/**
 * Tipikus opportunity cost: a kötött kaúciós-számlán a kamat kb. 0%,
 * miközben egy 3a-piller vagy ETF kb. 4-6%-ot hozhatna.
 */
export const OPPORTUNITY_COST_RATE = 0.04;

export interface RentCalcInput {
  /** Havi nettó bérleti díj (CHF), Nebenkosten nélkül. */
  monthlyRentChf: number;
  /** Lakás méret. */
  size: FlatSize;
  /** Fűtés-típus. */
  heating: HeatingType;
  /** Régió. */
  region: Region;
  /** Akontó Nebenkosten (havi, ahogy a szerződésben szerepel). */
  acontoNebenkostenChf: number;
  /** Hány évre kalkulálunk (1-10). */
  yearsToCalculate: number;
}

export interface RentCalcResult {
  // === KAUCIÓ ===
  kautionAmount: number;
  /** A kötött pénz éves opportunity-vesztesége. */
  kautionOpportunityCostPerYear: number;
  /** Mietkautionsversicherung éves díja, ha készpénz helyett azt választod. */
  insurancePremiumPerYear: number;

  // === NEBENKOSTEN ===
  /** Becslés a tényleges éves Nebenkosten-re. */
  estimatedActualNebenkostenPerYear: number;
  /** Akontó éves összege (12 hónap). */
  acontoNebenkostenPerYear: number;
  /** A különbség: pozitív = utánfizetés, negatív = visszatérítés. */
  nebenkostenSettlementPerYear: number;
  /** Várt forgatókönyv. */
  settlementDirection: "underpaid" | "overpaid" | "balanced";

  // === ÖSSZESÍTÉS ===
  /** Éves teljes lakhatási költség (bér + akontó + kaúció-opportunity). */
  firstYearTotalCost: number;
  /** A teljes "rejtett" költség (opportunity + utánfizetés-kockázat) az időszakra. */
  totalHiddenCostOverPeriod: number;
}

export function calculateRentCost(input: RentCalcInput): RentCalcResult {
  // === KAUCIÓ ===
  const kautionAmount = input.monthlyRentChf * MAX_KAUTION_MONTHS;
  const kautionOpportunityCostPerYear = kautionAmount * OPPORTUNITY_COST_RATE;
  const insurancePremiumPerYear = kautionAmount * KAUTION_INSURANCE_RATE;

  // === NEBENKOSTEN BECSLÉS ===
  // Alapérték: kb. CHF/m²/év a méret, fűtés, régió szerint
  const size = FLAT_SIZES.find((s) => s.id === input.size)!;
  const heating = HEATING_TYPES.find((h) => h.id === input.heating)!;
  const region = REGIONS.find((r) => r.id === input.region)!;

  // Átlagos m² (méret kategória közepe)
  const avgM2 = (size.m2Min + size.m2Max) / 2;

  // Tipikus Nebenkosten Svájcban: kb. 25-40 CHF/m²/év (átlag 32)
  const baseNebenkostenPerM2 = 32;
  const estimatedActualNebenkostenPerYear = Math.round(
    avgM2 * baseNebenkostenPerM2 * heating.costMod * region.nebenkostenMod,
  );

  const acontoNebenkostenPerYear = input.acontoNebenkostenChf * 12;
  const diff = estimatedActualNebenkostenPerYear - acontoNebenkostenPerYear;
  const settlementDirection: "underpaid" | "overpaid" | "balanced" =
    diff > 200 ? "underpaid" : diff < -200 ? "overpaid" : "balanced";

  // === ÖSSZESÍTÉS ===
  const yearlyRentTotal = input.monthlyRentChf * 12;
  const firstYearTotalCost =
    yearlyRentTotal + acontoNebenkostenPerYear + Math.max(0, diff) + kautionOpportunityCostPerYear;

  const totalHiddenCostOverPeriod =
    (kautionOpportunityCostPerYear + Math.max(0, diff)) * input.yearsToCalculate;

  return {
    kautionAmount,
    kautionOpportunityCostPerYear,
    insurancePremiumPerYear,
    estimatedActualNebenkostenPerYear,
    acontoNebenkostenPerYear,
    nebenkostenSettlementPerYear: diff,
    settlementDirection,
    firstYearTotalCost,
    totalHiddenCostOverPeriod,
  };
}
