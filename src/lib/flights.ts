/**
 * Repülőjegy "Járatfigyelő" — CH ↔ BUD útvonalakra.
 *
 * NEM real-time ár-API (drága/regisztrációs). Helyette:
 *   - Szezonális ár-sávok történelmi átlagok alapján
 *   - Heti minta (mely napokon olcsóbb)
 *   - Tippek (foglalási idő, légitársaság-választás)
 *   - Deep-link generátorok a fő foglalási oldalakhoz
 */

export interface Airport {
  code: "ZRH" | "BSL" | "GVA" | "BUD";
  name: string;
  city: string;
  emoji: string;
}

export const AIRPORTS: Airport[] = [
  { code: "ZRH", name: "Zürich Flughafen", city: "Zürich", emoji: "🇨🇭" },
  { code: "BSL", name: "EuroAirport Basel", city: "Basel", emoji: "🇨🇭" },
  { code: "GVA", name: "Genève Aéroport",   city: "Genf",  emoji: "🇨🇭" },
  { code: "BUD", name: "Liszt Ferenc",      city: "Budapest", emoji: "🇭🇺" },
];

export type SwissAirport = "ZRH" | "BSL" | "GVA";

export interface Airline {
  id: string;
  name: string;
  type: "low-cost" | "full-service";
  routes: SwissAirport[];
  color: string;
  emoji: string;
  notes: string;
}

export const AIRLINES: Airline[] = [
  {
    id: "wizzair",
    name: "WizzAir",
    type: "low-cost",
    routes: ["ZRH", "BSL"],
    color: "#C6037E",
    emoji: "💜",
    notes: "Olcsó, kézipoggyász díjas, WizzAir Discount Club éves díjjal megéri.",
  },
  {
    id: "swiss",
    name: "Swiss",
    type: "full-service",
    routes: ["ZRH", "GVA"],
    color: "#E2001A",
    emoji: "🇨🇭",
    notes: "Drágább, de 23 kg poggyász az alapcsomagban, jó szolgáltatás.",
  },
  {
    id: "edelweiss",
    name: "Edelweiss",
    type: "full-service",
    routes: ["ZRH"],
    color: "#E2001A",
    emoji: "🌸",
    notes: "Swiss leányvállalat, főleg üdülő-célokra, BUD nem mindennapos.",
  },
  {
    id: "easyjet",
    name: "EasyJet",
    type: "low-cost",
    routes: ["BSL", "GVA"],
    color: "#FF6600",
    emoji: "🧡",
    notes: "Bázis Basel + Genf, kézipoggyász díjas, néha extra-olcsó akciók.",
  },
];

export type Season = "off-peak" | "shoulder" | "peak" | "super-peak";

export interface SeasonInfo {
  id: Season;
  label: string;
  emoji: string;
  description: string;
  /** Színkód a naptárhoz. */
  color: string;
  /** Becsült ár-sáv egyirányú CHF-ben (WizzAir low → Swiss high). */
  priceMin: number;
  priceMax: number;
}

export const SEASONS: SeasonInfo[] = [
  {
    id: "off-peak",
    label: "Olcsó szezon",
    emoji: "💚",
    description: "Január közepétől márciusig, illetve október-november eleje. Hidegebb idő, kevesebb utazó.",
    color: "#16a34a",
    priceMin: 50,
    priceMax: 150,
  },
  {
    id: "shoulder",
    label: "Átmeneti",
    emoji: "💛",
    description: "Április-május + szeptember. Még/már jó idő, de a nyári csúcs előtt/után.",
    color: "#e3a233",
    priceMin: 80,
    priceMax: 220,
  },
  {
    id: "peak",
    label: "Csúcs",
    emoji: "🧡",
    description: "Június-augusztus, nyári szünet + nyaralás.",
    color: "#f97316",
    priceMin: 150,
    priceMax: 350,
  },
  {
    id: "super-peak",
    label: "Szuper-csúcs",
    emoji: "❤️",
    description: "Karácsony-újév (dec 18-jan 6), húsvét körül, augusztus első hete. Csúcsárak.",
    color: "#dc2626",
    priceMin: 250,
    priceMax: 600,
  },
];

/** Egy adott dátum szezonja (CH-tipikus iskolaszünet figyelembevételével). */
export function getSeason(date: Date): Season {
  const m = date.getMonth() + 1; // 1-12
  const d = date.getDate();

  // Karácsony-újév
  if ((m === 12 && d >= 18) || (m === 1 && d <= 6)) return "super-peak";

  // Augusztus első hete (CH-i hosszú hétvége: 1-jén nemzeti ünnep)
  if (m === 8 && d <= 7) return "super-peak";

  // Húsvét körül (közelítés: ápr eleje-közepe)
  if (m === 4 && d >= 1 && d <= 15) return "super-peak";

  // Nyári csúcs
  if (m === 6 || m === 7 || m === 8) return "peak";

  // Átmeneti
  if (m === 4 || m === 5 || m === 9) return "shoulder";

  // Off-peak
  return "off-peak";
}

/** Egy adott napon WEEKDAY-rendezés: hét közepe általában olcsóbb. */
export function getWeekdayMultiplier(date: Date): number {
  const dow = date.getDay(); // 0 = vas
  // Kedd/szerda = 0.85, csütörtök = 0.95, péntek/vasárnap = 1.15, szombat = 1.0
  if (dow === 2 || dow === 3) return 0.85;
  if (dow === 4) return 0.95;
  if (dow === 5 || dow === 0) return 1.15;
  return 1.0;
}

export interface PriceEstimate {
  season: Season;
  weekdayMultiplier: number;
  lowCostMin: number;
  lowCostMax: number;
  fullServiceMin: number;
  fullServiceMax: number;
}

/** 50 CHF lépcsőre kerekít, hogy ne nézzen ki pontosnak / real-time-nak. */
function roundTo50(n: number): number {
  return Math.round(n / 50) * 50;
}

export function estimatePrice(date: Date, swissAirport: SwissAirport): PriceEstimate {
  const season = getSeason(date);
  const seasonInfo = SEASONS.find((s) => s.id === season)!;
  const mult = getWeekdayMultiplier(date);

  // BSL és GVA picit olcsóbb (low-cost bázis)
  const airportAdj = swissAirport === "ZRH" ? 1.0 : 0.9;

  const base = seasonInfo;
  // Tág sávok 50 CHF-re kerekítve — nem csalják meg a usert real-time számokkal
  return {
    season,
    weekdayMultiplier: mult,
    lowCostMin: Math.max(50, roundTo50(base.priceMin * mult * airportAdj)),
    lowCostMax: roundTo50((base.priceMin + (base.priceMax - base.priceMin) * 0.5) * mult * airportAdj),
    fullServiceMin: roundTo50((base.priceMin + (base.priceMax - base.priceMin) * 0.5) * mult * airportAdj),
    fullServiceMax: roundTo50(base.priceMax * mult * airportAdj),
  };
}

/** Utazási irány. */
export type Direction = "ch-to-bud" | "bud-to-ch";

/** Egy adott irányhoz a "from" airport-kód. */
export function getOrigin(direction: Direction, swissAirport: SwissAirport): string {
  return direction === "ch-to-bud" ? swissAirport : "BUD";
}

/** Egy adott irányhoz a "to" airport-kód. */
export function getDestination(direction: Direction, swissAirport: SwissAirport): string {
  return direction === "ch-to-bud" ? "BUD" : swissAirport;
}

/** Deep-link a Skyscanner-be (ár-keresőbe). YYMMDD formátumban a dátum. */
export function skyscannerUrl(from: string, to: string, date: Date, returnDate: Date | null): string {
  const fmt = (d: Date) => {
    const y = String(d.getFullYear()).slice(2);
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}${m}${dd}`;
  };
  if (returnDate) {
    return `https://www.skyscanner.com/transport/flights/${from.toLowerCase()}/${to.toLowerCase()}/${fmt(date)}/${fmt(returnDate)}/`;
  }
  return `https://www.skyscanner.com/transport/flights/${from.toLowerCase()}/${to.toLowerCase()}/${fmt(date)}/`;
}

/** Google Flights — egyszerű query. */
export function googleFlightsUrl(from: string, to: string): string {
  return `https://www.google.com/travel/flights?q=Flights%20from%20${from}%20to%20${to}`;
}

/** Kiwi.com keresési URL. */
export function kiwiUrl(from: string, to: string, date: Date, returnDate: Date | null): string {
  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  if (returnDate) {
    return `https://www.kiwi.com/en/search/results/${from.toLowerCase()}/${to.toLowerCase()}/${fmt(date)}/${fmt(returnDate)}`;
  }
  return `https://www.kiwi.com/en/search/results/${from.toLowerCase()}/${to.toLowerCase()}/${fmt(date)}`;
}

export const WIZZAIR_URL = "https://wizzair.com/";
export const SWISS_URL = "https://www.swiss.com/";
export const EASYJET_URL = "https://www.easyjet.com/";

/** Általános tippek az útvonalra. */
export const TIPS: { emoji: string; title: string; body: string }[] = [
  {
    emoji: "📅",
    title: "Foglalj 6-8 héttel előre",
    body: "Túl korán (5+ hónappal) az árak még magasak. Túl későn (2 hét alatt) is drága. A 6-8 hetes ablak a leg-jobb.",
  },
  {
    emoji: "🗓️",
    title: "Hét közepe = olcsóbb",
    body: "Kedd-szerda jellemzően 15-20%-kal olcsóbb mint csütörtök-péntek-vasárnap. Hétfőtől hetente más-más napokon érdemes árakat figyelni.",
  },
  {
    emoji: "✈️",
    title: "BSL és GVA gyakran olcsóbb mint ZRH",
    body: "Basel-Mulhouse és Genf low-cost bázisok (WizzAir, EasyJet). ZRH a Swiss otthona — drágább, de kényelmesebb.",
  },
  {
    emoji: "🎒",
    title: "WizzAir trükkök",
    body: "Az alap-jegy CSAK egy 40x30x20 cm kis táskát enged. Plus 10kg = +30-50 CHF. Discount Club éves díj 50 CHF — meghálálja, ha 3+ utazás évente.",
  },
  {
    emoji: "💸",
    title: "Szuper-csúcs elkerülés",
    body: "Karácsonyt érdemes dec 23-án visszamenni és jan 7-én visszajönni. Ez 2-3x olcsóbb mint dec 24 → jan 2.",
  },
  {
    emoji: "🚆",
    title: "Vonat-alternatíva",
    body: "Zürich → Budapest ÖBB Nightjet ~140 CHF, 12-13 óra. Drágábban repkedéskor érdemes vonatra cserélni.",
  },
];
