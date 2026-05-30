/**
 * Swiss Post hivatalos díjszabás (2025. január 1-től érvényes).
 * Forrás: https://www.post.ch/en/sending-letters/rates-and-conditions/postage-calculator
 *
 * Megjegyzés: A Swiss Post nem kínál nyilvános, hitelesítés nélkül elérhető
 * díjszabás-API-t. Ez a modul a hivatalos Post-díjtáblázat alapján számol —
 * a díjak évente változhatnak, érdemes ellenőrizni a post.ch oldalán.
 */

export type Destination = "ch" | "eu" | "world";
export type ServiceLevel = "priority" | "economy";
export type ItemType = "letter" | "parcel";

export interface RateTier {
  maxWeightG: number;
  priceCHF: number;
  label: string;          // pl. "≤ 100 g"
}

export interface PostageRate {
  service: string;        // svájci neve
  serviceHU: string;      // magyar megnevezés
  deliveryDays: string;
  accentColor: string;
  tiers: RateTier[];
}

// ---------------------------------------------------------------------------
// Belföldi (CH) levél
// ---------------------------------------------------------------------------
export const CH_LETTER: Record<ServiceLevel, PostageRate> = {
  priority: {
    service: "A-Post / Prioritaire",
    serviceHU: "A-Post – másnap kézbesítés",
    deliveryDays: "1 munkanap",
    accentColor: "#dc2626",
    tiers: [
      { maxWeightG: 100,  priceCHF: 1.20, label: "≤ 100 g" },
      { maxWeightG: 250,  priceCHF: 2.20, label: "≤ 250 g" },
      { maxWeightG: 500,  priceCHF: 3.00, label: "≤ 500 g" },
      { maxWeightG: 1000, priceCHF: 4.00, label: "≤ 1 kg"  },
    ],
  },
  economy: {
    service: "B-Post / Economy",
    serviceHU: "B-Post – 2-3 napos kézbesítés",
    deliveryDays: "2–3 munkanap",
    accentColor: "#2563eb",
    tiers: [
      { maxWeightG: 100,  priceCHF: 1.10, label: "≤ 100 g" },
      { maxWeightG: 250,  priceCHF: 1.90, label: "≤ 250 g" },
      { maxWeightG: 500,  priceCHF: 2.60, label: "≤ 500 g" },
      { maxWeightG: 1000, priceCHF: 3.50, label: "≤ 1 kg"  },
    ],
  },
};

// ---------------------------------------------------------------------------
// Belföldi (CH) csomag — PostPac
// ---------------------------------------------------------------------------
export const CH_PARCEL: Record<ServiceLevel, PostageRate> = {
  priority: {
    service: "PostPac Priority",
    serviceHU: "PostPac Priority – másnap",
    deliveryDays: "1 munkanap",
    accentColor: "#dc2626",
    tiers: [
      { maxWeightG: 2000,  priceCHF: 8.50,  label: "≤ 2 kg"  },
      { maxWeightG: 5000,  priceCHF: 12.00, label: "≤ 5 kg"  },
      { maxWeightG: 10000, priceCHF: 15.50, label: "≤ 10 kg" },
      { maxWeightG: 15000, priceCHF: 18.50, label: "≤ 15 kg" },
      { maxWeightG: 20000, priceCHF: 21.00, label: "≤ 20 kg" },
      { maxWeightG: 30000, priceCHF: 27.00, label: "≤ 30 kg" },
    ],
  },
  economy: {
    service: "PostPac Economy",
    serviceHU: "PostPac Economy – 2-3 nap",
    deliveryDays: "2–3 munkanap",
    accentColor: "#2563eb",
    tiers: [
      { maxWeightG: 2000,  priceCHF: 7.50,  label: "≤ 2 kg"  },
      { maxWeightG: 5000,  priceCHF: 11.00, label: "≤ 5 kg"  },
      { maxWeightG: 10000, priceCHF: 14.00, label: "≤ 10 kg" },
      { maxWeightG: 15000, priceCHF: 16.50, label: "≤ 15 kg" },
      { maxWeightG: 20000, priceCHF: 19.00, label: "≤ 20 kg" },
      { maxWeightG: 30000, priceCHF: 24.00, label: "≤ 30 kg" },
    ],
  },
};

// ---------------------------------------------------------------------------
// Nemzetközi levél
// ---------------------------------------------------------------------------
export const INTL_LETTER: Record<"eu" | "world", Record<ServiceLevel, PostageRate>> = {
  eu: {
    priority: {
      service: "Prioritaire Europa",
      serviceHU: "Prioritaire – EU (3–5 nap)",
      deliveryDays: "3–5 munkanap",
      accentColor: "#dc2626",
      tiers: [
        { maxWeightG: 20,   priceCHF: 2.00,  label: "≤ 20 g"  },
        { maxWeightG: 50,   priceCHF: 2.30,  label: "≤ 50 g"  },
        { maxWeightG: 100,  priceCHF: 3.10,  label: "≤ 100 g" },
        { maxWeightG: 250,  priceCHF: 5.50,  label: "≤ 250 g" },
        { maxWeightG: 500,  priceCHF: 9.20,  label: "≤ 500 g" },
        { maxWeightG: 1000, priceCHF: 14.00, label: "≤ 1 kg"  },
        { maxWeightG: 2000, priceCHF: 21.00, label: "≤ 2 kg"  },
      ],
    },
    economy: {
      service: "Economy Europa",
      serviceHU: "Economy – EU (5–10 nap)",
      deliveryDays: "5–10 munkanap",
      accentColor: "#2563eb",
      tiers: [
        { maxWeightG: 20,   priceCHF: 1.80,  label: "≤ 20 g"  },
        { maxWeightG: 50,   priceCHF: 2.00,  label: "≤ 50 g"  },
        { maxWeightG: 100,  priceCHF: 2.50,  label: "≤ 100 g" },
        { maxWeightG: 250,  priceCHF: 4.00,  label: "≤ 250 g" },
        { maxWeightG: 500,  priceCHF: 7.20,  label: "≤ 500 g" },
        { maxWeightG: 1000, priceCHF: 11.00, label: "≤ 1 kg"  },
        { maxWeightG: 2000, priceCHF: 17.00, label: "≤ 2 kg"  },
      ],
    },
  },
  world: {
    priority: {
      service: "Prioritaire Welt",
      serviceHU: "Prioritaire – Világ (5–10 nap)",
      deliveryDays: "5–10 munkanap",
      accentColor: "#dc2626",
      tiers: [
        { maxWeightG: 20,   priceCHF: 2.30,  label: "≤ 20 g"  },
        { maxWeightG: 50,   priceCHF: 3.00,  label: "≤ 50 g"  },
        { maxWeightG: 100,  priceCHF: 4.10,  label: "≤ 100 g" },
        { maxWeightG: 250,  priceCHF: 7.80,  label: "≤ 250 g" },
        { maxWeightG: 500,  priceCHF: 12.50, label: "≤ 500 g" },
        { maxWeightG: 1000, priceCHF: 19.50, label: "≤ 1 kg"  },
        { maxWeightG: 2000, priceCHF: 30.00, label: "≤ 2 kg"  },
      ],
    },
    economy: {
      service: "Economy Welt",
      serviceHU: "Economy – Világ (10–20 nap)",
      deliveryDays: "10–20 munkanap",
      accentColor: "#2563eb",
      tiers: [
        { maxWeightG: 20,   priceCHF: 2.00,  label: "≤ 20 g"  },
        { maxWeightG: 50,   priceCHF: 2.50,  label: "≤ 50 g"  },
        { maxWeightG: 100,  priceCHF: 3.20,  label: "≤ 100 g" },
        { maxWeightG: 250,  priceCHF: 5.70,  label: "≤ 250 g" },
        { maxWeightG: 500,  priceCHF: 9.50,  label: "≤ 500 g" },
        { maxWeightG: 1000, priceCHF: 14.50, label: "≤ 1 kg"  },
        { maxWeightG: 2000, priceCHF: 22.00, label: "≤ 2 kg"  },
      ],
    },
  },
};

// ---------------------------------------------------------------------------
// Nemzetközi csomag (PostPac International – közelítő díjak)
// ---------------------------------------------------------------------------
export const INTL_PARCEL: Record<"eu" | "world", Record<ServiceLevel, PostageRate>> = {
  eu: {
    priority: {
      service: "PostPac Int'l Priority EU",
      serviceHU: "PostPac Int'l Priority – EU (3–5 nap)",
      deliveryDays: "3–5 munkanap",
      accentColor: "#dc2626",
      tiers: [
        { maxWeightG: 1000,  priceCHF: 19.50, label: "≤ 1 kg"  },
        { maxWeightG: 2000,  priceCHF: 23.00, label: "≤ 2 kg"  },
        { maxWeightG: 5000,  priceCHF: 33.00, label: "≤ 5 kg"  },
        { maxWeightG: 10000, priceCHF: 44.00, label: "≤ 10 kg" },
        { maxWeightG: 20000, priceCHF: 60.00, label: "≤ 20 kg" },
        { maxWeightG: 30000, priceCHF: 78.00, label: "≤ 30 kg" },
      ],
    },
    economy: {
      service: "PostPac Int'l Economy EU",
      serviceHU: "PostPac Int'l Economy – EU (5–10 nap)",
      deliveryDays: "5–10 munkanap",
      accentColor: "#2563eb",
      tiers: [
        { maxWeightG: 1000,  priceCHF: 16.00, label: "≤ 1 kg"  },
        { maxWeightG: 2000,  priceCHF: 20.00, label: "≤ 2 kg"  },
        { maxWeightG: 5000,  priceCHF: 28.00, label: "≤ 5 kg"  },
        { maxWeightG: 10000, priceCHF: 38.00, label: "≤ 10 kg" },
        { maxWeightG: 20000, priceCHF: 52.00, label: "≤ 20 kg" },
        { maxWeightG: 30000, priceCHF: 68.00, label: "≤ 30 kg" },
      ],
    },
  },
  world: {
    priority: {
      service: "PostPac Int'l Priority Welt",
      serviceHU: "PostPac Int'l Priority – Világ (7–14 nap)",
      deliveryDays: "7–14 munkanap",
      accentColor: "#dc2626",
      tiers: [
        { maxWeightG: 1000,  priceCHF: 30.00,  label: "≤ 1 kg"  },
        { maxWeightG: 2000,  priceCHF: 38.00,  label: "≤ 2 kg"  },
        { maxWeightG: 5000,  priceCHF: 55.00,  label: "≤ 5 kg"  },
        { maxWeightG: 10000, priceCHF: 74.00,  label: "≤ 10 kg" },
        { maxWeightG: 20000, priceCHF: 102.00, label: "≤ 20 kg" },
      ],
    },
    economy: {
      service: "PostPac Int'l Economy Welt",
      serviceHU: "PostPac Int'l Economy – Világ (10–20 nap)",
      deliveryDays: "10–20 munkanap",
      accentColor: "#2563eb",
      tiers: [
        { maxWeightG: 1000,  priceCHF: 24.00, label: "≤ 1 kg"  },
        { maxWeightG: 2000,  priceCHF: 31.00, label: "≤ 2 kg"  },
        { maxWeightG: 5000,  priceCHF: 44.00, label: "≤ 5 kg"  },
        { maxWeightG: 10000, priceCHF: 60.00, label: "≤ 10 kg" },
        { maxWeightG: 20000, priceCHF: 84.00, label: "≤ 20 kg" },
      ],
    },
  },
};

// ---------------------------------------------------------------------------
// Számítás
// ---------------------------------------------------------------------------
export interface PostageResult {
  priceCHF: number;
  service: string;
  serviceHU: string;
  deliveryDays: string;
  accentColor: string;
  weightLabel: string;
}

export function calculatePostage(
  itemType: ItemType,
  weightG: number,
  destination: Destination,
  serviceLevel: ServiceLevel,
): PostageResult | { error: string } {
  let rate: PostageRate;

  if (itemType === "letter") {
    if (destination === "ch") {
      rate = CH_LETTER[serviceLevel];
    } else {
      rate = INTL_LETTER[destination][serviceLevel];
    }
  } else {
    if (destination === "ch") {
      rate = CH_PARCEL[serviceLevel];
    } else {
      rate = INTL_PARCEL[destination][serviceLevel];
    }
  }

  const tier = rate.tiers.find((t) => weightG <= t.maxWeightG);
  if (!tier) {
    return { error: `A megadott súly (${weightG} g) meghaladja a maximálisan feladható súlyt ebben a kategóriában.` };
  }

  return {
    priceCHF: tier.priceCHF,
    service: rate.service,
    serviceHU: rate.serviceHU,
    deliveryDays: rate.deliveryDays,
    accentColor: rate.accentColor,
    weightLabel: tier.label,
  };
}
