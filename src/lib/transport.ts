/**
 * Svájci Tömegközlekedési Zóna-Kalauz — adatok és számítások.
 *
 * Lefedi: SBB országos, ZVV Zürich, Libero Bern, TNW Basel, Mobilis Lausanne,
 * UnireSo Genf, TI/Tessin.
 *
 * FONTOS: tájékoztató eszköz. A pontos árakat és zónákat mindig a hivatalos
 * oldalon ellenőrizd — időnként változnak.
 */

export interface TarifSystem {
  id: string;
  name: string;
  abbreviation: string;
  region: string;
  emoji: string;
  /** Hány zóna van összesen. */
  zonesCount: number;
  /** Hogy működik a zóna-szám. */
  description: string;
  /** Példa: város → zónaszám/k. */
  exampleZones: { name: string; zones: string }[];
  /** 1 zónás jegy ára CHF (2. osztály, normál ár). */
  singleZonePrice: number;
  /** Napi-jegy ára CHF (1 zónás). */
  dailyPrice: number;
  /** Hivatalos URL. */
  websiteUrl: string;
  /** Brand-szín. */
  color: string;
}

export const TARIF_SYSTEMS: TarifSystem[] = [
  {
    id: "zvv",
    name: "ZVV — Zürcher Verkehrsverbund",
    abbreviation: "ZVV",
    region: "Zürich kanton + környék",
    emoji: "🚆",
    zonesCount: 13,
    description: "Zürich városa és környéke. A város központja a 110-es zóna; minden zónának 3-jegyű száma van.",
    exampleZones: [
      { name: "Zürich-város (HB, Altstadt)", zones: "110" },
      { name: "Winterthur", zones: "120" },
      { name: "Glattzentrum", zones: "121" },
      { name: "Zürich → Winterthur", zones: "5 zóna" },
    ],
    singleZonePrice: 2.80,
    dailyPrice: 5.60,
    websiteUrl: "https://www.zvv.ch/",
    color: "#005CA9",
  },
  {
    id: "libero",
    name: "Libero",
    abbreviation: "Libero",
    region: "Bern + Solothurn + Biel",
    emoji: "🚊",
    zonesCount: 21,
    description: "Bern, Solothurn és Biel régiói. Egyszerű 100-as zóna-számozás.",
    exampleZones: [
      { name: "Bern-város", zones: "100/101" },
      { name: "Thun", zones: "330" },
      { name: "Solothurn", zones: "510" },
      { name: "Bern → Thun", zones: "3 zóna" },
    ],
    singleZonePrice: 2.80,
    dailyPrice: 5.60,
    websiteUrl: "https://www.mylibero.ch/",
    color: "#E2231A",
  },
  {
    id: "tnw",
    name: "TNW — Tarifverbund Nordwestschweiz",
    abbreviation: "TNW",
    region: "Basel-Stadt + Basel-Land + Aargau (Frick)",
    emoji: "🚍",
    zonesCount: 14,
    description: "Basel városa és a környékbeli kantonok. A város központja az 'U-Abo' zóna (10+11).",
    exampleZones: [
      { name: "Basel-város (zónák 10+11)", zones: "U-Abo" },
      { name: "EuroAirport", zones: "Zóna 17" },
      { name: "Liestal", zones: "Zóna 13" },
    ],
    singleZonePrice: 2.50,
    dailyPrice: 9.90,
    websiteUrl: "https://www.tnw.ch/",
    color: "#003B71",
  },
  {
    id: "mobilis",
    name: "Mobilis",
    abbreviation: "Mobilis",
    region: "Lausanne + Vaud kanton",
    emoji: "🚎",
    zonesCount: 10,
    description: "Lausanne és Waadt kanton. Zóna 11 = Lausanne központja.",
    exampleZones: [
      { name: "Lausanne", zones: "11+12" },
      { name: "Vevey/Montreux", zones: "Zóna 31" },
      { name: "Yverdon", zones: "Zóna 70" },
    ],
    singleZonePrice: 3.70,
    dailyPrice: 9.00,
    websiteUrl: "https://www.mobilis-vaud.ch/",
    color: "#E2231A",
  },
  {
    id: "unireso",
    name: "UnireSo",
    abbreviation: "UnireSo",
    region: "Genf + szomszéd francia régió",
    emoji: "🚌",
    zonesCount: 9,
    description: "Genf és a francia határ-régió (Pays de Gex). Határátlépő jegyekkel rendelkezik.",
    exampleZones: [
      { name: "Genf-város", zones: "Tout Genève" },
      { name: "Aéroport (CH)", zones: "Tout Genève" },
      { name: "Annemasse (FR)", zones: "Genève + zóna 31" },
    ],
    singleZonePrice: 3.00,
    dailyPrice: 10.00,
    websiteUrl: "https://www.unireso.com/",
    color: "#FF6B00",
  },
  {
    id: "ticino",
    name: "Arcobaleno",
    abbreviation: "Arcobaleno",
    region: "Tessin (Lugano, Locarno, Bellinzona)",
    emoji: "🚞",
    zonesCount: 11,
    description: "Tessin kanton. A 'Arcobaleno' szivárvány-rendszer integrálja a vonatokat és buszokat.",
    exampleZones: [
      { name: "Lugano", zones: "Zóna 100" },
      { name: "Bellinzona", zones: "Zóna 200" },
      { name: "Locarno", zones: "Zóna 200" },
    ],
    singleZonePrice: 3.20,
    dailyPrice: 6.40,
    websiteUrl: "https://www.arcobaleno.ch/",
    color: "#0066CC",
  },
];

export interface TicketType {
  id: string;
  name: string;
  emoji: string;
  description: string;
  price: string;
  validity: string;
  bestFor: string;
}

export const TICKET_TYPES: TicketType[] = [
  {
    id: "single",
    name: "Egyszeri jegy (Einzelbillet)",
    emoji: "🎫",
    description: "Egy útra szól, megadott zónákban. Általában 1 óráig érvényes szabadon átszállhatsz.",
    price: "2.50–10 CHF (zónaszámtól függ)",
    validity: "1 óra (max 6 zónáig), különben hosszabb",
    bestFor: "Alkalmi utazás (1-2x/hó)",
  },
  {
    id: "daily",
    name: "Napijegy (Tageskarte)",
    emoji: "📅",
    description: "Egész napos korlátlan utazás a kiválasztott zónákban. Általában 3x egyszeri jegyért már megéri.",
    price: "5.60–35 CHF",
    validity: "Aznap 5-ig hajnal (a megvétel napja)",
    bestFor: "Egy nap intenzív utazás",
  },
  {
    id: "halbtax",
    name: "Halbtax (féláras kártya)",
    emoji: "✂️",
    description: "Éves előfizetés, ami 50%-os kedvezményt ad MINDEN svájci tömegközlekedési jegyre (vonat, busz, hajó).",
    price: "190 CHF / év (új), 165 CHF / év (megújítás)",
    validity: "1 év",
    bestFor: "Heti 1-2x utazás (hamar megtérül)",
  },
  {
    id: "ga",
    name: "GA — Generalabonnement",
    emoji: "🎟️",
    description: "Korlátlan utazás minden SBB-vonaton, buszon, hajón + sok hegyivasúton 2. osztályon. Az ország teljes tömegközlekedési bérlete.",
    price: "3 995 CHF / év (felnőtt 2. osztály, 2024)",
    validity: "1 év",
    bestFor: "Napi ingázás, heti 3x+ utazás",
  },
  {
    id: "junior",
    name: "Junior-Karte",
    emoji: "👨‍👩‍👧",
    description: "30 CHF / év / gyerek. A gyermekek (6-16) ingyen utazhatnak a szülő/nagyszülő mellett.",
    price: "30 CHF / év / gyerek",
    validity: "1 év",
    bestFor: "Családok",
  },
  {
    id: "supersaver",
    name: "SuperSaver",
    emoji: "💸",
    description: "Akciós jegyek SBB-vonatra, 30-70%-kal olcsóbban. Konkrét időpontra szól, nem rugalmas.",
    price: "30-70% kedvezmény",
    validity: "Adott vonat-csak",
    bestFor: "Tervezett utazás, rugalmas időponttal",
  },
];

export interface MobileApp {
  id: string;
  name: string;
  emoji: string;
  description: string;
  iosUrl: string;
  androidUrl: string;
  pros: string[];
}

export const MOBILE_APPS: MobileApp[] = [
  {
    id: "sbb-mobile",
    name: "SBB Mobile",
    emoji: "🚉",
    description: "Az országos SBB hivatalos appja. Menetrend, jegyvásárlás, mobil-jegy QR-koddal.",
    iosUrl: "https://apps.apple.com/ch/app/sbb-mobile/id294855237",
    androidUrl: "https://play.google.com/store/apps/details?id=ch.sbb.mobile.android.b2c",
    pros: ["Minden CH-i utazáshoz", "Mobil-jegy QR", "Real-time késés-info", "GA / Halbtax integráció"],
  },
  {
    id: "zvv-mobile",
    name: "ZVV App",
    emoji: "🚆",
    description: "Zürich régió hivatalos appja. ZVV-specifikus tarifaopciók, network-térkép.",
    iosUrl: "https://apps.apple.com/ch/app/zvv/id492573033",
    androidUrl: "https://play.google.com/store/apps/details?id=ch.zhvv.client",
    pros: ["ZVV-specifikus jegyek", "Network-térkép", "Real-time"],
  },
  {
    id: "fairtiq",
    name: "FAIRTIQ",
    emoji: "✨",
    description: "Automatikus 'check-in / check-out' app. Csak indulj el — automatikusan megveszi a legolcsóbb jegyet.",
    iosUrl: "https://apps.apple.com/ch/app/fairtiq/id1180268651",
    androidUrl: "https://play.google.com/store/apps/details?id=ch.fairtiq",
    pros: ["Nem kell jegyt választani", "Mindig a legolcsóbb opció", "Multi-rendszer kompatibilis"],
  },
  {
    id: "lezzgo",
    name: "Lezzgo",
    emoji: "🎯",
    description: "Alternatív check-in / check-out, BLS és Postauto együttműködéssel.",
    iosUrl: "https://apps.apple.com/ch/app/lezzgo/id1230127478",
    androidUrl: "https://play.google.com/store/apps/details?id=ch.bls.lezzgo",
    pros: ["BLS-vonatok", "Postauto-busz", "Hasonló a FAIRTIQ-hoz"],
  },
];

// ============== KALKULÁTOR ==============

export interface GaVsHalbtaxInput {
  /** Tipikus egy utazás ára (CHF). */
  avgTripPrice: number;
  /** Heti utazások száma. */
  tripsPerWeek: number;
}

export interface GaVsHalbtaxResult {
  yearlyTrips: number;
  /** Mennyibe kerülne teljes áron (normál jeggyel). */
  fullPriceCost: number;
  /** Mennyibe kerülne Halbtax-szel. */
  halbtaxCost: number;
  /** Halbtax éves megtakarítás (negativ szám = veszteség). */
  halbtaxSavings: number;
  /** Mennyibe kerülne GA-val. */
  gaCost: number;
  /** GA éves megtakarítás Halbtax-hez képest. */
  gaVsHalbtaxSavings: number;
  /** GA éves megtakarítás teljes árhoz képest. */
  gaVsFullPriceSavings: number;
  /** Mit ajánlunk. */
  recommendation: "full-price" | "halbtax" | "ga";
}

const HALBTAX_PRICE = 190;
const GA_PRICE = 3995;

export function calculateGaVsHalbtax(input: GaVsHalbtaxInput): GaVsHalbtaxResult {
  const yearlyTrips = input.tripsPerWeek * 52;
  const fullPriceCost = yearlyTrips * input.avgTripPrice;
  const halbtaxCost = HALBTAX_PRICE + (yearlyTrips * input.avgTripPrice * 0.5);
  const halbtaxSavings = fullPriceCost - halbtaxCost;
  const gaCost = GA_PRICE;
  const gaVsHalbtaxSavings = halbtaxCost - gaCost;
  const gaVsFullPriceSavings = fullPriceCost - gaCost;

  let recommendation: "full-price" | "halbtax" | "ga";
  if (gaCost < halbtaxCost && gaCost < fullPriceCost) {
    recommendation = "ga";
  } else if (halbtaxCost < fullPriceCost) {
    recommendation = "halbtax";
  } else {
    recommendation = "full-price";
  }

  return {
    yearlyTrips,
    fullPriceCost: Math.round(fullPriceCost),
    halbtaxCost: Math.round(halbtaxCost),
    halbtaxSavings: Math.round(halbtaxSavings),
    gaCost: GA_PRICE,
    gaVsHalbtaxSavings: Math.round(gaVsHalbtaxSavings),
    gaVsFullPriceSavings: Math.round(gaVsFullPriceSavings),
    recommendation,
  };
}

// ============== TIPPEK ==============

export const TRANSPORT_TIPS: { emoji: string; title: string; body: string }[] = [
  {
    emoji: "⏰",
    title: "1 óra alatt szabad átszállás",
    body: "Az egyszeri jegy max 6 zónáig 1 óráig érvényes. Ezalatt szabadon szállhatsz át bármilyen jármű közt (vonat, busz, villamos, hajó).",
  },
  {
    emoji: "📅",
    title: "Napijegy 3 utazás felett megéri",
    body: "Ha aznap 3+ utazás várható, vegyél napijegyet — általában csak 2× drágább mint az egyszeri.",
  },
  {
    emoji: "👨‍👩‍👧",
    title: "Junior-Karte családoknak",
    body: "30 CHF / év / gyerek (6-16). A gyermekek INGYEN utazhatnak a szülő/nagyszülő mellett. A legolcsóbb családi opció.",
  },
  {
    emoji: "✨",
    title: "FAIRTIQ automatikusan a legolcsóbb",
    body: "Ha bizonytalan vagy mit vegyél, telepítsd a FAIRTIQ-ot. Indulj el → start gomb → leszálláskor stop. Az app a legolcsóbb jegyet veszi.",
  },
  {
    emoji: "🎫",
    title: "GA + Halbtax külön család-tagoknak",
    body: "Egy családban: 1× GA (ingázó) + 2× Halbtax (alkalmi) gyakran olcsóbb mint 3× GA. Számold ki!",
  },
  {
    emoji: "🌅",
    title: "SuperSaver akciós jegyek",
    body: "Hosszú-távú SBB-utazás (pl. ZRH → Genf)? Az SBB Mobile-on akciós SuperSaver jegyek 30-70%-kal olcsóbbak — de adott vonatra szólnak.",
  },
  {
    emoji: "🌐",
    title: "Hétvégi tarifa (GA Bonus)",
    body: "GA-val hétvégén ingyen viszed a 2. személyt (családi tag, partner). Ha barátoddal utazol hétvégén, jelezzd ezt.",
  },
  {
    emoji: "🚲",
    title: "Bicikli a vonaton",
    body: "Kérj 'Velobillet' jegyet (kb. 14 CHF/nap) ha biciklit viszel. SuperSaver opció: csak nagy ünnepekkor / korlátozottan elérhető.",
  },
];
