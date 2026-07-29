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
  /** Napijegy ára CHF (1 zónás). */
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
    description: "Bern, Solothurn és Biel régiói. Egyszerű 100-as zónaszámozás.",
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
    description: "Egy útra szól, megadott zónákban. Általában 1 óráig érvényes, és ezalatt szabadon átszállhatsz.",
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
    pros: ["Nem kell jegyet választani", "Mindig a legolcsóbb opció", "Multi-rendszer kompatibilis"],
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
    body: "Az egyszeri jegy max 6 zónáig 1 óráig érvényes. Ezalatt szabadon szállhatsz át bármilyen jármű között (vonat, busz, villamos, hajó).",
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
    body: "Ha bizonytalan vagy, mit vegyél, telepítsd a FAIRTIQ-ot. Indulj el → start gomb → leszálláskor stop. Az app a legolcsóbb jegyet veszi.",
  },
  {
    emoji: "🎫",
    title: "GA + Halbtax külön család-tagoknak",
    body: "Egy családban: 1× GA (ingázó) + 2× Halbtax (alkalmi) gyakran olcsóbb, mint 3× GA. Számold ki!",
  },
  {
    emoji: "🌅",
    title: "SuperSaver akciós jegyek",
    body: "Hosszútávú SBB-utazás (pl. ZRH → Genf)? Az SBB Mobile-on akciós SuperSaver jegyek 30-70%-kal olcsóbbak — de adott vonatra szólnak.",
  },
  {
    emoji: "🌐",
    title: "Hétvégi tarifa (GA Bonus)",
    body: "GA-val hétvégén ingyen viszed a 2. személyt (családtag, partner). Ha barátoddal utazol hétvégén, jelezd ezt.",
  },
  {
    emoji: "🚲",
    title: "Bicikli a vonaton",
    body: "Kérj 'Velobillet' jegyet (kb. 14 CHF/nap) ha biciklit viszel. SuperSaver opció: csak nagy ünnepekkor / korlátozottan elérhető.",
  },
];

// ════════════════════ AUSZTRIA ════════════════════
// Osztrák Verkehrsverbünde + jegyek + Klimaticket-kalkulátor. Az árak tájékoztató
// jellegűek (EUR), a pontosakat a hivatalos oldalon ellenőrizd.

export const AT_TARIF_SYSTEMS: TarifSystem[] = [
  {
    id: "wl", name: "Wiener Linien (Wien)", abbreviation: "WL", region: "Bécs (Kernzone Wien / 100-as zóna)", emoji: "🚇",
    zonesCount: 1, description: "Bécs egyetlen zóna (Kernzone Wien). A jegy idő-alapú: a városban szabadon átszállhatsz metróra (U-Bahn), villamosra (Bim), buszra.",
    exampleZones: [{ name: "Egész Bécs", zones: "Kernzone (100)" }, { name: "U-Bahn / Bim / Bus", zones: "ugyanaz a jegy" }],
    singleZonePrice: 2.40, dailyPrice: 8.00, websiteUrl: "https://www.wienerlinien.at/", color: "#E2231A",
  },
  {
    id: "vor", name: "VOR — Verkehrsverbund Ost-Region", abbreviation: "VOR", region: "Bécs + Alsó-Ausztria + Burgenland", emoji: "🚆",
    zonesCount: 0, description: "A keleti régió (Bécsen túl NÖ + Burgenland). A Kernzonén kívül zóna-alapú; ingázóknak (pl. Sopron–Bécs felé) ez a rendszer.",
    exampleZones: [{ name: "Bécs Kernzone", zones: "100" }, { name: "Wiener Neustadt → Wien", zones: "több zóna" }, { name: "Regionalbahn / S-Bahn", zones: "VOR-jegy" }],
    singleZonePrice: 2.40, dailyPrice: 8.00, websiteUrl: "https://www.vor.at/", color: "#005CA9",
  },
  {
    id: "vlbg-stmk", name: "Verbundlinie (Steiermark)", abbreviation: "Verbundlinie", region: "Stájerország (Graz + környék)", emoji: "🚊",
    zonesCount: 0, description: "Graz és Stájerország tarifaszövetsége. Zóna-alapú; Graz városa egy zóna.",
    exampleZones: [{ name: "Graz-város", zones: "Zóna 101" }, { name: "Graz → környék", zones: "több zóna" }],
    singleZonePrice: 2.90, dailyPrice: 5.90, websiteUrl: "https://www.verbundlinie.at/", color: "#009640",
  },
  {
    id: "ooevv", name: "OÖVV (Oberösterreich)", abbreviation: "OÖVV", region: "Felső-Ausztria (Linz + környék)", emoji: "🚍",
    zonesCount: 0, description: "Felső-Ausztria tarifaszövetsége (Linz központtal). Zóna-alapú.",
    exampleZones: [{ name: "Linz-város", zones: "Kernzone Linz" }, { name: "Linz → Wels", zones: "több zóna" }],
    singleZonePrice: 2.60, dailyPrice: 5.10, websiteUrl: "https://www.ooevv.at/", color: "#E2007A",
  },
  {
    id: "vvt", name: "VVT (Tirol)", abbreviation: "VVT", region: "Tirol (Innsbruck + környék)", emoji: "🚞",
    zonesCount: 0, description: "Tirol tarifaszövetsége (Innsbruck központtal). Zóna-alapú, sok hegyi járattal.",
    exampleZones: [{ name: "Innsbruck-város", zones: "Kernzone" }, { name: "Innsbruck → völgyek", zones: "több zóna" }],
    singleZonePrice: 2.70, dailyPrice: 5.40, websiteUrl: "https://www.vvt.at/", color: "#1D70B7",
  },
];

export const AT_TICKET_TYPES: TicketType[] = [
  { id: "einzel", name: "Egyszeri jegy (Einzelfahrt)", emoji: "🎫", description: "Egy útra szól. Bécsben a Kernzonén belül idő-alapú: szabadon átszállhatsz metróra/villamosra/buszra egy irányba.", price: "2,40 € (Wien); régiónként eltér", validity: "Egy út (Wien: átszállással, megszakítás nélkül)", bestFor: "Alkalmi utazás" },
  { id: "h24", name: "24/48/72 órás jegy", emoji: "📅", description: "Korlátlan utazás a zónában a megadott időtartamig. 24h kb. 3 egyszeri jegy ára — intenzív naphoz megéri.", price: "8,00 € (24h Wien)", validity: "24 / 48 / 72 óra", bestFor: "Turista nap / intenzív utazás" },
  { id: "woche", name: "Hetijegy (Wochenkarte)", emoji: "🗓️", description: "Egy hét korlátlan utazás a zónában.", price: "kb. 17 € (Wien)", validity: "Hétfőtől vasárnapig (Wien)", bestFor: "Rövid távú itt-tartózkodás" },
  { id: "monat", name: "Havijegy (Monatskarte)", emoji: "📆", description: "Egy hónap korlátlan utazás a zónában.", price: "kb. 51 € (Wien)", validity: "1 naptári hónap", bestFor: "Rendszeres városi utazás" },
  { id: "jahres", name: "Éves bérlet (Jahreskarte / Klimaticket Wien)", emoji: "🎟️", description: "Egy év korlátlan utazás Bécsben. A híres »365 €/év« = napi 1 euró! (Klimaticket Wien.)", price: "365 € / év (Wien)", validity: "1 év", bestFor: "Bécsi lakosok — verhetetlen ár" },
  { id: "klima-at", name: "Klimaticket Österreich", emoji: "🌍", description: "EGÉSZ Ausztria összes tömegközlekedése (ÖBB + összes Verbund + város) egy bérlettel, egy évig — vonat, busz, villamos, regionális.", price: "kb. 1 095 € / év (kedvezménnyel kevesebb)", validity: "1 év, országosan", bestFor: "Aki sokat utazik országon belül / ingázik" },
  { id: "vorteilscard", name: "ÖBB Vorteilscard", emoji: "✂️", description: "Éves kártya, ami kb. 45-50% kedvezményt ad az ÖBB-vonatjegyekre (nem városi).", price: "kb. 66 € / év (fiataloknak/nyugdíjasoknak olcsóbb)", validity: "1 év", bestFor: "Aki gyakran utazik vonattal városok között" },
];

export const AT_MOBILE_APPS: MobileApp[] = [
  { id: "oebb", name: "ÖBB", emoji: "🚉", description: "Az osztrák vasút hivatalos appja. Menetrend, jegyvásárlás, mobil-jegy, Klimaticket, real-time késés.", iosUrl: "https://apps.apple.com/at/app/öbb/id476256388", androidUrl: "https://play.google.com/store/apps/details?id=at.oebb.ts", pros: ["Országos vonat + busz", "Mobil-jegy + Klimaticket", "Real-time info"] },
  { id: "wienmobil", name: "WienMobil", emoji: "🚇", description: "A Wiener Linien hivatalos appja. Bécsi jegyek, útvonaltervező, Jahreskarte, megosztott mobilitás (bike, e-scooter).", iosUrl: "https://apps.apple.com/at/app/wienmobil/id1110988201", androidUrl: "https://play.google.com/store/apps/details?id=at.wienerlinien.wienmobillab", pros: ["Bécsi jegyek + Jahreskarte", "Útvonaltervező", "Megosztott mobilitás"] },
  { id: "vor-anachb", name: "VOR AnachB", emoji: "🗺️", description: "A keleti régió (Bécs/NÖ/Bgld) útvonaltervezője és jegyvásárlása az egész VOR-területre.", iosUrl: "https://apps.apple.com/at/app/vor-anachb/id412341736", androidUrl: "https://play.google.com/store/apps/details?id=at.itsmobility.android", pros: ["VOR egész terület", "Régiós jegyek", "Door-to-door tervező"] },
];

export const AT_TRANSPORT_TIPS: { emoji: string; title: string; body: string }[] = [
  { emoji: "💶", title: "Jahreskarte Wien = napi 1 euró", body: "Ha Bécsben élsz, a 365 €/év éves bérlet (Klimaticket Wien) szinte verhetetlen — kb. 7 havijegy áráért egy egész év." },
  { emoji: "🌍", title: "Klimaticket Österreich — minden, mindenhol", body: "Ha az egész országban utazol (ingázol, sokat vonatozol), a Klimaticket Österreich (~1095 €/év) MINDEN tömegközlekedést fedez országosan." },
  { emoji: "🎫", title: "Bécsben a jegy idő-alapú", body: "A Kernzonén belül egy egyszeri jegy egy IRÁNYBA, megszakítás nélkül érvényes — szabadon átszállhatsz U-Bahn / Bim / Bus között." },
  { emoji: "✂️", title: "Vorteilscard a vonatozáshoz", body: "Ha gyakran utazol ÖBB-vonattal városok között (de nincs Klimaticketed), a Vorteilscard kb. fél áron viszi a jegyeket." },
  { emoji: "🅿️", title: "Park & Ride", body: "Bécs szélén sok P&R parkoló van a metró-végállomásoknál — autóval a szélére, onnan U-Bahn-nal a központba (olcsóbb, mint bent parkolni)." },
  { emoji: "🚲", title: "Bicikli + WienMobil Rad", body: "Bécsben a WienMobil Rad (városi bringa) az első óra olcsó; a vonaton/U-Bahn-on a biciklihez külön jegy kell (csúcsidőn kívül)." },
];

const AT_JAHRESKARTE = 365;
const AT_KLIMATICKET = 1095;

export interface AtTransportResult {
  yearlyTrips: number;
  fullPriceCost: number;
  jahreskarteCost: number;
  klimaticketCost: number;
  recommendation: "full-price" | "jahreskarte" | "klimaticket";
}

/** Ausztria: Einzeltickets vs Jahreskarte Wien (365) vs Klimaticket Österreich (1095). */
export function calculateAtTransport(input: GaVsHalbtaxInput): AtTransportResult {
  const yearlyTrips = input.tripsPerWeek * 52;
  const fullPriceCost = Math.round(yearlyTrips * input.avgTripPrice);
  let recommendation: "full-price" | "jahreskarte" | "klimaticket";
  if (AT_JAHRESKARTE <= fullPriceCost && AT_JAHRESKARTE <= AT_KLIMATICKET) recommendation = "jahreskarte";
  else if (AT_KLIMATICKET < fullPriceCost && AT_KLIMATICKET < AT_JAHRESKARTE) recommendation = "klimaticket";
  else recommendation = "full-price";
  return { yearlyTrips, fullPriceCost, jahreskarteCost: AT_JAHRESKARTE, klimaticketCost: AT_KLIMATICKET, recommendation };
}

// ════════════════════ NÉMETORSZÁG ════════════════════
// Német Verkehrsverbünde + jegyek + Deutschlandticket-kalkulátor. Árak tájékoztató
// jellegűek (EUR); a pontosakat a hivatalos oldalon ellenőrizd. A sztár a
// Deutschlandticket: 58 €/hó, EGÉSZ Németország összes helyi/regionális közlekedése.

export const DE_TARIF_SYSTEMS: TarifSystem[] = [
  {
    id: "vbb", name: "VBB (Berlin-Brandenburg)", abbreviation: "VBB", region: "Berlin + Brandenburg", emoji: "🚇",
    zonesCount: 3, description: "Berlin három tarifa-zónája: A (belváros), B (külváros), C (Brandenburg + BER reptér). A jegyet zóna-kombóra veszed (AB, BC, ABC).",
    exampleZones: [{ name: "Berlin belváros", zones: "AB" }, { name: "BER reptér", zones: "ABC" }, { name: "Potsdam", zones: "ABC" }],
    singleZonePrice: 3.80, dailyPrice: 9.90, websiteUrl: "https://www.vbb.de/", color: "#E30613",
  },
  {
    id: "mvv", name: "MVV (München)", abbreviation: "MVV", region: "München + környék", emoji: "🚆",
    zonesCount: 7, description: "München gyűrűs zóna-rendszere: M (város) + 1–6 külső zóna. A jegy a bejárt zónáktól függ.",
    exampleZones: [{ name: "München-város", zones: "M" }, { name: "Reptér (MUC)", zones: "M-5" }, { name: "Dachau", zones: "M-1" }],
    singleZonePrice: 3.90, dailyPrice: 9.20, websiteUrl: "https://www.mvv-muenchen.de/", color: "#0065B1",
  },
  {
    id: "hvv", name: "HVV (Hamburg)", abbreviation: "HVV", region: "Hamburg + környék", emoji: "🚊",
    zonesCount: 8, description: "Hamburg gyűrűs rendszere (Ringe A–F). A belváros az A-gyűrű; kifelé drágul.",
    exampleZones: [{ name: "Hamburg belváros", zones: "Ring A" }, { name: "Reptér (HAM)", zones: "Ring A" }, { name: "Norderstedt", zones: "Ring B" }],
    singleZonePrice: 3.80, dailyPrice: 8.90, websiteUrl: "https://www.hvv.de/", color: "#C50018",
  },
  {
    id: "rmv", name: "RMV (Rhein-Main / Frankfurt)", abbreviation: "RMV", region: "Frankfurt + Rajna-Majna régió", emoji: "🚍",
    zonesCount: 0, description: "A frankfurti régió tarifaszövetsége (Frankfurt, Wiesbaden, Mainz, Darmstadt). Ár-fokozatos (Preisstufe).",
    exampleZones: [{ name: "Frankfurt-város", zones: "Preisstufe 1-2" }, { name: "Reptér (FRA)", zones: "Frankfurt + 1" }, { name: "Wiesbaden", zones: "magasabb fokozat" }],
    singleZonePrice: 3.65, dailyPrice: 6.45, websiteUrl: "https://www.rmv.de/", color: "#1A9F4B",
  },
  {
    id: "vrr", name: "VRR (Rhein-Ruhr)", abbreviation: "VRR", region: "Düsseldorf, Essen, Dortmund, Köln-közel", emoji: "🚞",
    zonesCount: 0, description: "A Ruhr-vidék tarifaszövetsége (Düsseldorf, Essen, Dortmund, Duisburg). Preisstufe A–D, a megtett táv szerint.",
    exampleZones: [{ name: "Egy városon belül", zones: "Preisstufe A" }, { name: "Szomszéd város", zones: "Preisstufe B" }, { name: "Régión át", zones: "Preisstufe C-D" }],
    singleZonePrice: 3.40, dailyPrice: 8.60, websiteUrl: "https://www.vrr.de/", color: "#0072BC",
  },
];

export const DE_TICKET_TYPES: TicketType[] = [
  { id: "einzel", name: "Egyszeri jegy (Einzelfahrt)", emoji: "🎫", description: "Egy útra szól a megadott zónákban, jellemzően átszállással egy irányba. Városonként eltér.", price: "kb. 3,40–3,90 €", validity: "Egy út (átszállással, megszakítás nélkül)", bestFor: "Alkalmi utazás" },
  { id: "tages", name: "Napijegy (Tageskarte)", emoji: "📅", description: "Egész napos korlátlan utazás a zónában. 2–3 egyszeri jegy ára.", price: "kb. 6,5–10 €", validity: "Aznap (gyakran 3:00-ig másnap)", bestFor: "Intenzív nap / turista" },
  { id: "deutschlandticket", name: "Deutschlandticket (D-Ticket)", emoji: "🇩🇪", description: "A sztár: EGÉSZ Németország ÖSSZES helyi és regionális közlekedése (U-Bahn, S-Bahn, Tram, Bus, RB/RE-vonatok) — országosan, egy bérlettel. NEM érvényes ICE/IC/EC távolsági vonatra. Havi felmondású előfizetés.", price: "58 € / hó (2025-től)", validity: "1 naptári hónap (megújuló)", bestFor: "Szinte mindenkinek, aki rendszeresen utazik" },
  { id: "monat", name: "Havi/éves bérlet (helyi)", emoji: "📆", description: "Városi havi/éves bérlet — a legtöbb helyen a Deutschlandticket már olcsóbb és többet tud, kivéve speciális eseteket (pl. Jobticket-kedvezmény).", price: "városonként eltér", validity: "1 hónap / 1 év", bestFor: "Ahol a Jobticket a D-Ticketet még olcsóbbá teszi" },
  { id: "bahncard25", name: "BahnCard 25", emoji: "✂️", description: "Éves kártya, 25% kedvezmény a DB távolsági (ICE/IC) és sok regionális jegyre. Kombinálható a Sparpreis-akciókkal.", price: "kb. 62,90 € / év (2. osztály)", validity: "1 év (automatikusan megújul!)", bestFor: "Aki néhányszor utazik ICE-vel" },
  { id: "bahncard50", name: "BahnCard 50", emoji: "🎟️", description: "50% kedvezmény a DB rugalmas (Flexpreis) jegyekre. Sok utazásnál hamar megtérül.", price: "kb. 244 € / év (2. osztály)", validity: "1 év (automatikusan megújul!)", bestFor: "Gyakori ICE/IC-utazó" },
];

export const DE_MOBILE_APPS: MobileApp[] = [
  { id: "db-navigator", name: "DB Navigator", emoji: "🚉", description: "A Deutsche Bahn hivatalos appja. Országos menetrend, jegy- és Deutschlandticket-vásárlás, Sparpreis-akciók, real-time késés és vágány-info.", iosUrl: "https://apps.apple.com/de/app/db-navigator/id343555245", androidUrl: "https://play.google.com/store/apps/details?id=de.hafas.android.db", pros: ["Országos vonat (ICE-ig)", "Deutschlandticket + Sparpreis", "Real-time késés/vágány"] },
  { id: "bvg-fahrinfo", name: "BVG (Berlin)", emoji: "🚇", description: "A berlini közlekedés (BVG) hivatalos appja: helyi jegyek, útvonaltervező, Deutschlandticket.", iosUrl: "https://apps.apple.com/de/app/bvg-fahrinfo-plus-berlin/id296872036", androidUrl: "https://play.google.com/store/apps/details?id=de.hafas.android.bvg", pros: ["Berlini jegyek", "Útvonaltervező", "U/S-Bahn térkép"] },
  { id: "mvgo", name: "MVGO (München)", emoji: "🚆", description: "A müncheni közlekedés (MVG) appja: helyi jegyek, útvonaltervező, megosztott mobilitás.", iosUrl: "https://apps.apple.com/de/app/mvgo/id1543812645", androidUrl: "https://play.google.com/store/apps/details?id=de.swm.mvgo", pros: ["Müncheni jegyek", "MVV-zónák", "Bike/e-scooter"] },
];

export const DE_TRANSPORT_TIPS: { emoji: string; title: string; body: string }[] = [
  { emoji: "🇩🇪", title: "Deutschlandticket — szinte mindig megéri", body: "58 €/hó az EGÉSZ ország helyi és regionális közlekedéséért. Ha havonta 15+ helyi utazásod van, vagy ingázol regionális vonattal, ez verhetetlen. Havonta felmondható." },
  { emoji: "🚄", title: "ICE/IC ≠ Deutschlandticket", body: "A D-Ticket a távolsági gyorsvonatra (ICE/IC/EC) NEM érvényes — azokra külön DB-jegy kell. De az RB/RE regionális vonatok mennek vele országosan (lassabb, de ingyen)." },
  { emoji: "💸", title: "Sparpreis a DB-n", body: "ICE-re a DB Navigatorban a kötött idejű Sparpreis-jegyek sokkal olcsóbbak a Flexpreisnál (akár 17,90 €-tól). Foglalj előre, és BahnCard-dal még olcsóbb." },
  { emoji: "✂️", title: "BahnCard automatikusan megújul!", body: "A BahnCard 1 év után MAGÁTÓL meghosszabbodik — ha nem akarod, 6 héttel a lejárat ELŐTT mondd fel írásban, különben kifizeted a következő évet." },
  { emoji: "💼", title: "Jobticket / Deutschlandticket a munkahelytől", body: "Sok munkáltató kedvezményesen (vagy ingyen) adja a Deutschlandticketet (Jobticket). Kérdezd meg a HR-t — gyakran 25–100%-ot átvállalnak." },
  { emoji: "🎓", title: "Semesterticket diákoknak", body: "Egyetemistáknál a Semesterticket gyakran a beiratkozási díjban van — sokszor a kibővített D-Ticket-verzió (Semesterticket Deutschland) ~30 €/hó." },
];

const DE_DEUTSCHLANDTICKET_MONTHLY = 58;

export interface DeTransportResult {
  yearlyTrips: number;
  fullPriceCost: number;
  deutschlandticketCost: number;
  recommendation: "full-price" | "deutschlandticket";
}

/** Németország: Einzeltickets vs Deutschlandticket (58 €/hó = 696 €/év). */
export function calculateDeTransport(input: GaVsHalbtaxInput): DeTransportResult {
  const yearlyTrips = input.tripsPerWeek * 52;
  const fullPriceCost = Math.round(yearlyTrips * input.avgTripPrice);
  const deutschlandticketCost = DE_DEUTSCHLANDTICKET_MONTHLY * 12;
  return {
    yearlyTrips,
    fullPriceCost,
    deutschlandticketCost,
    recommendation: deutschlandticketCost < fullPriceCost ? "deutschlandticket" : "full-price",
  };
}

// ════════════════════ HOLLANDIA ════════════════════
// Holland tömegközlekedés: OVpay / OV-chipkaart (in- és uitchecken), TÁV-alapú
// (per km, nem zóna!), NS-vonatok + regionális operátorok (GVB/RET/HTM). A
// „féláras" analóg az NS Dal Voordeel (40% kedvezmény csúcsidőn kívül). EUR.

export const NL_TARIF_SYSTEMS: TarifSystem[] = [
  {
    id: "ovpay", name: "OVpay / OV-chipkaart (országos)", abbreviation: "OVpay", region: "Egész Hollandia", emoji: "💳",
    zonesCount: 0, description: "NEM zóna-alapú! Beszállásnál BE- (inchecken), kiszállásnál KI-jelentkezel (uitchecken) az érintős bankkártyáddal/telefonoddal (OVpay) vagy az OV-chipkaarttal. A díj a megtett TÁV szerint (alapdíj + km-díj).",
    exampleZones: [{ name: "Beszállás (instaptarief)", zones: "~1,10 €" }, { name: "Városi villamos/busz-út", zones: "~2–3 €" }, { name: "Elfelejtett uitchecken", zones: "büntetődíj (~4–20 €)!" }],
    singleZonePrice: 2.5, dailyPrice: 8.0, websiteUrl: "https://www.ovpay.nl/", color: "#0090D2",
  },
  {
    id: "ns", name: "NS (Nederlandse Spoorwegen)", abbreviation: "NS", region: "Országos vonat", emoji: "🚆",
    zonesCount: 0, description: "A holland vasút. A jegy táv-alapú (per km); nincs kötött »Sparpreis«, de a Dal Voordeel abbonnement 40% kedvezményt ad csúcsidőn kívül.",
    exampleZones: [{ name: "Amsterdam → Utrecht", zones: "~8,90 €" }, { name: "Amsterdam → Rotterdam", zones: "~17 €" }, { name: "Schiphol → Amsterdam CS", zones: "~5,40 €" }],
    singleZonePrice: 8.9, dailyPrice: 0, websiteUrl: "https://www.ns.nl/", color: "#FFC917",
  },
  {
    id: "gvb", name: "GVB (Amsterdam)", abbreviation: "GVB", region: "Amszterdam (metró/villamos/busz)", emoji: "🚇",
    zonesCount: 0, description: "Amszterdam városi közlekedése. OVpay-jel táv-alapú, vagy vehetsz GVB-dagkaartot (napijegy) korlátlan utazásra a városban.",
    exampleZones: [{ name: "1 órás jegy", zones: "~3,40 €" }, { name: "1 napos GVB-dagkaart", zones: "~9 €" }, { name: "Reptér (Schiphol) — NS-vonat", zones: "külön NS-jegy" }],
    singleZonePrice: 3.4, dailyPrice: 9.0, websiteUrl: "https://www.gvb.nl/", color: "#EC0000",
  },
  {
    id: "ret", name: "RET (Rotterdam)", abbreviation: "RET", region: "Rotterdam (metró/villamos/busz)", emoji: "🚊",
    zonesCount: 0, description: "Rotterdam városi közlekedése. OVpay-jel táv-alapú; van 1/2/3 napos turista-dagkaart is.",
    exampleZones: [{ name: "1 órás jegy", zones: "~3,50 €" }, { name: "1 napos dagkaart", zones: "~8,50 €" }],
    singleZonePrice: 3.5, dailyPrice: 8.5, websiteUrl: "https://www.ret.nl/", color: "#00A03C",
  },
  {
    id: "htm", name: "HTM (Den Haag)", abbreviation: "HTM", region: "Hága + környék (villamos/busz)", emoji: "🚍",
    zonesCount: 0, description: "Hága városi közlekedése (villamos + busz). OVpay-jel táv-alapú; van dagkaart is.",
    exampleZones: [{ name: "1 órás jegy", zones: "~3,50 €" }, { name: "1 napos dagkaart", zones: "~7,50 €" }],
    singleZonePrice: 3.5, dailyPrice: 7.5, websiteUrl: "https://www.htm.nl/", color: "#E30613",
  },
];

export const NL_TICKET_TYPES: TicketType[] = [
  { id: "ovpay", name: "OVpay (érintős fizetés)", emoji: "💳", description: "A legegyszerűbb: érintős bankkártya/telefon a beszálláskor (inchecken) ÉS a kiszálláskor (uitchecken). A díj automatikusan a megtett táv szerint. Nem kell külön jegyet venni.", price: "táv-alapú (alapdíj ~1,10 € + km)", validity: "Utanként (be+ki kell jelentkezni!)", bestFor: "Alkalmi utazás, turista" },
  { id: "ovchip", name: "OV-chipkaart (anoniem/persoonlijk)", emoji: "🪪", description: "Feltölthető chipkártya. Az anoniem bárkinek jó; a persoonlijke a kedvezményekhez és abbonnementekhez kell (fényképes, névre szóló).", price: "kártya ~7,50 € + feltöltés", validity: "5 év (a kártya)", bestFor: "Rendszeres utazás + kedvezmények" },
  { id: "dagkaart", name: "Dagkaart (napijegy)", emoji: "📅", description: "Korlátlan utazás egy napra egy operátornál (pl. GVB Amsterdam, RET Rotterdam). Turistáknak intenzív napra megéri.", price: "~7,5–9 € (városonként)", validity: "1 nap", bestFor: "Turista / intenzív városi nap" },
  { id: "dalvoordeel", name: "NS Dal Voordeel (40% kedvezmény)", emoji: "✂️", description: "A »féláras« analógja: 40% kedvezmény az NS-vonatjegyekre csúcsidőn KÍVÜL (dal) és hétvégén. Havi előfizetés — gyorsan megtérül, ha nem csúcsban utazol.", price: "~5,60 € / hó", validity: "Havi (felmondható)", bestFor: "Aki csúcsidőn kívül vonatozik" },
  { id: "trajectvrij", name: "NS Traject Vrij (útvonal-bérlet)", emoji: "🎟️", description: "Egy fix útvonalra (pl. otthon↔munkahely) korlátlan vonat — a napi ingázók bérlete. A táv szerint árazva.", price: "táv szerint (havi/éves)", validity: "1 hó / 1 év", bestFor: "Napi vonatos ingázó fix útvonalon" },
  { id: "kidsvrij", name: "NS Kids Vrij", emoji: "👨‍👩‍👧", description: "0–3 év ingyen; a 4–11 éves gyerekek INGYEN utaznak NS-vonaton egy felnőtt mellett (a Kids Vrij ingyenes beállítással).", price: "ingyenes (0 €)", validity: "Folyamatos", bestFor: "Családok" },
];

export const NL_MOBILE_APPS: MobileApp[] = [
  { id: "ns", name: "NS", emoji: "🚉", description: "A holland vasút hivatalos appja. Menetrend, jegyvásárlás, real-time késés/vágány, Dal Voordeel + abbonnementek kezelése.", iosUrl: "https://apps.apple.com/nl/app/ns/id1069773781", androidUrl: "https://play.google.com/store/apps/details?id=nl.ns.android.activity", pros: ["Országos vonat", "Real-time info", "Dal Voordeel / abbonnement"] },
  { id: "9292", name: "9292", emoji: "🗺️", description: "A HIVATALOS országos útvonaltervező — MINDEN közlekedési mód (vonat, metró, villamos, busz, hajó) egy helyen, door-to-door.", iosUrl: "https://apps.apple.com/nl/app/9292/id300794322", androidUrl: "https://play.google.com/store/apps/details?id=nl.negentwee", pros: ["Minden mód egyben", "Door-to-door tervező", "Real-time"] },
  { id: "ovpay", name: "OVpay", emoji: "💳", description: "Az OVpay hivatalos appja: az utazásaid és a levont díjak áttekintése, elfelejtett uitchecken korrekció.", iosUrl: "https://apps.apple.com/nl/app/ovpay/id6444311309", androidUrl: "https://play.google.com/store/apps/details?id=nl.translink.ovpay", pros: ["Utazás-áttekintés", "Uitcheck-korrekció", "Nincs külön kártya"] },
];

export const NL_TRANSPORT_TIPS: { emoji: string; title: string; body: string }[] = [
  { emoji: "⚠️", title: "Uitchecken — NE felejtsd el!", body: "Be- ÉS kijelentkezés kötelező (inchecken + uitchecken). Ha elfelejtesz kijelentkezni, a rendszer magas büntetődíjat (~4–20 €) von le — a felét sokszor visszaigényelheted az OVpay/NS appban." },
  { emoji: "📏", title: "Táv-alapú, nem zóna", body: "Hollandiában nincs »zóna-jegy« mint Németországban — a díj a megtett km szerint (alapdíj + km-díj). Ezért fontos a pontos be/kijelentkezés." },
  { emoji: "✂️", title: "Dal Voordeel = 40% csúcsidőn kívül", body: "Ha nem a spits-ben (reggel ~6:30–9:00, délután ~16:00–18:30) utazol, az NS Dal Voordeel (~5,60 €/hó) 40%-ot lehúz a vonatjegyekből — gyorsan megtérül." },
  { emoji: "🚲", title: "OV-fiets — az utolsó km", body: "Az állomásokon OV-fiets (kölcsönbringa, ~4,55 €/nap) a híres megoldás az állomástól a célig. Az NS persoonlijke OV-chipkaart/abbonnement kell hozzá." },
  { emoji: "💳", title: "OVpay: elég a bankkártyád", body: "Nem kell OV-chipkaartot venni — érintős bankkártya vagy telefon (OVpay) elég a be/kijelentkezéshez. Kedvezményekhez / abbonnementhez viszont persoonlijke OV-chipkaart kell." },
  { emoji: "👨‍👩‍👧", title: "Gyerekek ingyen (Kids Vrij)", body: "0–3 év mindig ingyen; a 4–11 évesek az NS Kids Vrij ingyenes beállítással INGYEN vonatoznak egy felnőtt mellett — állítsd be a persoonlijke kártyán." },
];

const NL_DALVOORDEEL_MONTHLY = 5.6;

export interface NlTransportResult {
  yearlyTrips: number;
  fullPriceCost: number;
  dalVoordeelCost: number;
  recommendation: "full-price" | "dal-voordeel";
}

/** Hollandia: losse ritten vs NS Dal Voordeel (40% kedvezmény csúcsidőn kívül + havidíj). */
export function calculateNlTransport(input: GaVsHalbtaxInput): NlTransportResult {
  const yearlyTrips = input.tripsPerWeek * 52;
  const fullPriceCost = Math.round(yearlyTrips * input.avgTripPrice);
  // Dal Voordeel: havidíj egész évre + a jegyek 60%-a (40% kedvezmény).
  const dalVoordeelCost = Math.round(NL_DALVOORDEEL_MONTHLY * 12 + yearlyTrips * input.avgTripPrice * 0.6);
  return {
    yearlyTrips,
    fullPriceCost,
    dalVoordeelCost,
    recommendation: dalVoordeelCost < fullPriceCost ? "dal-voordeel" : "full-price",
  };
}

/**
 * ⚠️ ANGLIA — a rendszer logikája MÁS, mint bármelyik kontinentális országé:
 *  - Londonban NINCS jegyvásárlás: érintős bankkártyával/telefonnal be- és
 *    kiérintesz, a rendszer pedig automatikusan CAPPING-el (napi és HETI
 *    plafon) — sosem fizetsz többet, mint a napi/heti bérlet ára,
 *  - London ZÓNÁS (1–9), a többi város viszont NEM: ott sima menetdíj van,
 *  - a vonat NEM egységes: sok magáncég (TOC) üzemelteti, és ugyanarra az
 *    útra 3-4 különböző ár létezik attól függően, mikor és hol veszed.
 */
export const GB_TARIF_SYSTEMS: TarifSystem[] = [
  {
    id: "tfl", name: "TfL (London) — érintős fizetés + capping", abbreviation: "TfL", region: "London (1–9 zóna)", emoji: "🚇",
    zonesCount: 9, description: "Londonban NE VEGYÉL JEGYET: érintős bankkártyával vagy telefonnal érints be a kapunál (metró/vonat/DLR esetén KI is), buszon csak be. A rendszer naponta és HETENTE is plafonoz (capping) — automatikusan a legolcsóbb tarifát adja.",
    exampleZones: [{ name: "1-es zóna, egy metróút (csúcs)", zones: "~2,90 £" }, { name: "Busz (bármilyen táv)", zones: "1,75 £" }, { name: "1–2 zóna NAPI plafon", zones: "~8,90 £" }],
    singleZonePrice: 2.9, dailyPrice: 8.9, websiteUrl: "https://tfl.gov.uk/fares", color: "#DC241F",
  },
  {
    id: "national-rail", name: "National Rail (országos vonat)", abbreviation: "Rail", region: "Egész Anglia", emoji: "🚆",
    zonesCount: 0, description: "Nem egy cég: sok magánüzemeltető (TOC) közös hálózata. Ugyanarra az útra több ár is van — az Advance (előre, adott vonatra) a legolcsóbb, az Anytime a legdrágább.",
    exampleZones: [{ name: "London → Manchester (Advance)", zones: "~30–45 £" }, { name: "Ugyanaz aznap (Anytime)", zones: "~180 £!" }, { name: "Split ticketing trükkel", zones: "gyakran 20-40% olcsóbb" }],
    singleZonePrice: 35, dailyPrice: 0, websiteUrl: "https://www.nationalrail.co.uk/", color: "#C00000",
  },
  {
    id: "bus-england", name: "Városi buszok (Londonon kívül)", abbreviation: "Bus", region: "Manchester, Birmingham, Leeds…", emoji: "🚌",
    zonesCount: 0, description: "Londonon kívül NINCS zónarendszer: a buszon sima menetdíjat fizetsz (érintős kártyával is). Az egyszeri buszjegy ára kormányzati sapka alatt van a legtöbb járaton.",
    exampleZones: [{ name: "Egy buszút (sapkázott ár)", zones: "~2–3 £" }, { name: "Napijegy egy városban", zones: "~5–6 £" }, { name: "Manchester (Bee Network) napi plafon", zones: "~5 £" }],
    singleZonePrice: 2.5, dailyPrice: 5.5, websiteUrl: "https://www.gov.uk/apply-for-subsidised-travel", color: "#0075C9",
  },
  {
    id: "metro-regional", name: "Regionális metró/villamos", abbreviation: "Metro", region: "Manchester, Newcastle, Birmingham", emoji: "🚊",
    zonesCount: 0, description: "Manchester (Metrolink), Newcastle (Tyne and Wear Metro), Birmingham (West Midlands Metro) — saját zónás/táv-alapú rendszer, jellemzően saját appal és napi plafonnal.",
    exampleZones: [{ name: "Metrolink, városközpont", zones: "~1,60–3 £" }, { name: "Metrolink napi plafon", zones: "~5–8 £" }, { name: "Tyne and Wear Metro (1 zóna)", zones: "~2,20 £" }],
    singleZonePrice: 2.5, dailyPrice: 6.5, websiteUrl: "https://tfgm.com/", color: "#FFB800",
  },
];

export const GB_TICKET_TYPES: TicketType[] = [
  { id: "contactless", name: "Érintős bankkártya / telefon", emoji: "💳", description: "A legegyszerűbb Londonban: NEM kell jegy és nem kell Oyster. Érints be (metrón/vonaton ki is), a rendszer napi és heti plafonnal a legolcsóbb árat számolja. ⚠️ MINDIG ugyanazt a kártyát/eszközt használd, különben nem áll össze a capping.", price: "használat szerint, plafonnal", validity: "Utanként (napi + heti plafon)", bestFor: "Szinte mindenki Londonban" },
  { id: "oyster", name: "Oyster card", emoji: "🟦", description: "A feltölthető londoni kártya. Ma már főleg annak kell, aki nem érintős bankkártyás, vagy kedvezményt (Railcard-összekötés, Young Visitor) akar rátenni. Az árak azonosak az érintőssel.", price: "7 £ letét + feltöltés", validity: "Korlátlan (feltöltésig)", bestFor: "Kedvezmény vagy nincs érintős kártya" },
  { id: "railcard", name: "Railcard (⅓ kedvezmény)", emoji: "🎫", description: "Éves kedvezménykártya a vonatra: 16-25, 26-30, Two Together (párban), Family & Friends, Senior. ⚠️ Kb. 1-2 hosszabb út alatt megtérül — és Londonban rá lehet kötni az Oysterre a csúcsidőn kívüli plafon csökkentéséhez.", price: "~35 £ / év", validity: "1 év", bestFor: "Aki évente 2+ hosszabb vonatutat tesz" },
  { id: "advance", name: "Advance vonatjegy", emoji: "⏱️", description: "Konkrét vonatra, előre megvásárolt jegy — messze a legolcsóbb. Cserébe kötött: csak arra a járatra érvényes. A jegyek jellemzően 12 héttel előre nyílnak.", price: "az Anytime ár töredéke", validity: "Egy adott vonatra", bestFor: "Tervezett, hosszabb utak" },
  { id: "season", name: "Season ticket (bérlet)", emoji: "📅", description: "Heti, havi vagy éves bérlet egy fix útvonalra — az ingázók megoldása. Az éves nagyjából 40 hét árába kerül. Sok munkáltató kamatmentes kölcsönt ad rá.", price: "útvonal szerint", validity: "1 hét – 1 év", bestFor: "Napi ingázó fix útvonalon" },
  { id: "travelcard", name: "Travelcard (London, zónás bérlet)", emoji: "🎟️", description: "Hagyományos zónás bérlet (heti/havi/éves) Londonra. Érintős fizetésnél a HETI plafon jórészt kiváltja — havi vagy éves távon viszont még mindig olcsóbb lehet.", price: "zóna szerint", validity: "1 nap – 1 év", bestFor: "Havi/éves londoni ingázás" },
];

export const GB_MOBILE_APPS: MobileApp[] = [
  { id: "tfl-go", name: "TfL Go", emoji: "🚇", description: "A londoni közlekedés hivatalos appja: élő menetrend, akadálymentes útvonalak, zsúfoltság, díj- és capping-áttekintés.", iosUrl: "https://apps.apple.com/gb/app/tfl-go/id1477875859", androidUrl: "https://play.google.com/store/apps/details?id=uk.gov.tfl.tflgo", pros: ["Élő metró-státusz", "Lépcsőmentes útvonalak", "Díj-áttekintés"] },
  { id: "citymapper", name: "Citymapper", emoji: "🗺️", description: "A londoniak kedvence: minden közlekedési mód egyben, valós idejű útvonaltervezés, „mikor induljak” és melyik kocsiba szállj.", iosUrl: "https://apps.apple.com/gb/app/citymapper/id469463298", androidUrl: "https://play.google.com/store/apps/details?id=com.citymapper.app.release", pros: ["Minden mód egyben", "Valós idejű", "Melyik kocsiba szállj"] },
  { id: "trainline", name: "Trainline", emoji: "🎫", description: "Vonatjegy-vásárlás az összes üzemeltetőtől egy helyen, árfigyelővel és split-ticketing javaslattal.", iosUrl: "https://apps.apple.com/gb/app/trainline/id417374590", androidUrl: "https://play.google.com/store/apps/details?id=com.thetrainline", pros: ["Minden TOC egy helyen", "Split ticketing", "Digitális jegy"] },
];

export const GB_TRANSPORT_TIPS: { emoji: string; title: string; body: string }[] = [
  { emoji: "💳", title: "Londonban NE vegyél jegyet", body: "Érints be az érintős bankkártyáddal vagy telefonoddal — a rendszer napi ÉS heti plafonnal automatikusan a legolcsóbb tarifát számolja. Egy külön papírjegy szinte mindig drágább." },
  { emoji: "⚠️", title: "Ugyanazt a kártyát használd végig", body: "A capping csak akkor áll össze, ha minden útnál UGYANAZT a kártyát/eszközt érinted. Ha hol a telefonod, hol a kártyád használod, a rendszer két külön utasnak veszi, és kétszer fizetsz." },
  { emoji: "🚪", title: "Metrón/vonaton KI is kell érinteni", body: "Ha elfelejtesz kiérinteni, a maximális díjat (incomplete journey) vonják le. A TfL fiókodban visszaigényelhető, de macerás. Buszon viszont CSAK beérintés van." },
  { emoji: "🎫", title: "Railcard: 1-2 út alatt megtérül", body: "A ~35 £/év Railcard ⅓ kedvezményt ad a vonatjegyekre. Egyetlen London–Manchester oda-vissza út alatt visszahozhatja az árát — és Londonban rá lehet kötni az Oysterre." },
  { emoji: "⏱️", title: "Advance jegy vs Anytime: akár 5× különbség", body: "Ugyanaz a London–Manchester út Advance jeggyel ~35 £, aznapi Anytime jeggyel akár 180 £. A jegyek 12 héttel előre nyílnak — hosszabb útra MINDIG előre vegyél." },
  { emoji: "✂️", title: "Split ticketing", body: "Ugyanarra az útra több, egymást követő szakaszjegy gyakran olcsóbb, mint egy végig-jegy — ugyanazon a vonaton maradsz. A Trainline és a Split My Fare automatikusan megkeresi." },
  { emoji: "🚌", title: "Londonon kívül nincs zóna", body: "Manchesterben, Birminghamben és a legtöbb városban sima menetdíj van, nem zónarendszer. A buszjegy ára kormányzati sapka alatt van, és sok városnak van saját napi plafonja (pl. Bee Network)." },
];

/** Az Anglia-kalkulátor bemenete: heti utak száma és a tipikus egy-út ár. */
/**
 * ⚠️ SPANYOLORSZÁG — a rendszer szervező elve az AUTONÓM KÖZÖSSÉG, nem az állam.
 *
 * Nincs országos városi bérlet-rendszer: Madridnak, Barcelonának és Valenciának
 * KÜLÖN, egymással nem kompatibilis tarifa-rendszere van. Ami viszont országos:
 *   • a Renfe (vasút) — AVE nagysebességű + Cercanías elővárosi,
 *   • és a FIATALOKNAK szóló kedvezmény, ami a legnagyobb pénzt jelenti egy
 *     26 alatti magyarnak (Madridban az abono joven az egész közösségre érvényes,
 *     havi fix áron — ez a hat ország legjobb fiatal-bérlete).
 *
 * ⚠️ Az árak évente változnak, és az elmúlt években több átmeneti állami
 * kedvezmény is volt a Cercanías/Rodalies vonalakon. A konkrét összeget MINDIG
 * az adott üzemeltető oldalán nézd — ezért van minden rendszernél hivatalos URL.
 */
export const ES_TARIF_SYSTEMS: TarifSystem[] = [
  {
    id: "crtm", name: "CRTM (Madrid)", abbreviation: "CRTM", region: "Madrid + az egész közösség", emoji: "🚇",
    zonesCount: 6, description: "Madrid ZÓNÁS rendszer (A, B1–B3, C1–C2): metró, busz, villamos és a Cercanías egy bérletben. A havi bérlet (abono mensual) a zónádig érvényes — a legtöbben az A zónában (a város) élnek.",
    exampleZones: [{ name: "A zóna (Madrid város)", zones: "a belváros egésze" }, { name: "B1–B3", zones: "agglomeráció" }, { name: "⭐ Abono joven (26 alatt)", zones: "az EGÉSZ közösség, egy áron" }],
    singleZonePrice: 1.5, dailyPrice: 8.4, websiteUrl: "https://www.crtm.es/", color: "#E30613",
  },
  {
    id: "atm", name: "ATM (Barcelona)", abbreviation: "ATM", region: "Barcelona + Katalónia", emoji: "🚈",
    zonesCount: 6, description: "Barcelona is zónás (1–6). A leggyakoribb jegy a T-casual (10 utazás egy zónán belül) és a T-usual (30 napos korlátlan). Metró, busz, FGC és a Rodalies (elővárosi vonat) egy rendszerben.",
    exampleZones: [{ name: "1. zóna", zones: "Barcelona város" }, { name: "T-casual", zones: "10 utazás, nem átruházható" }, { name: "T-usual", zones: "30 nap korlátlan" }],
    singleZonePrice: 2.65, dailyPrice: 11.2, websiteUrl: "https://www.atm.cat/", color: "#D50032",
  },
  {
    id: "renfe-cercanias", name: "Renfe Cercanías", abbreviation: "Cercanías", region: "Nagyvárosi agglomerációk", emoji: "🚆",
    zonesCount: 0, description: "Az elővárosi vasút — a napi ingázás gerince Madridban, Barcelonában (ott Rodalies), Valenciában, Sevillában és Bilbaóban. Zóna- vagy táv-alapú, a városi bérletbe jellemzően beleszámít.",
    exampleZones: [{ name: "Madrid, 1 zóna", zones: "~1,80 €" }, { name: "Barcelona, 1 zóna", zones: "~2,65 €" }, { name: "Bérlettel", zones: "a városi abonóba beletartozik" }],
    singleZonePrice: 1.8, dailyPrice: 0, websiteUrl: "https://www.renfe.com/es/es/cercanias", color: "#8B1A3A",
  },
  {
    id: "renfe-ave", name: "Renfe AVE (nagysebességű)", abbreviation: "AVE", region: "Országos", emoji: "🚄",
    zonesCount: 0, description: "Európa leghosszabb nagysebességű hálózata. Madrid–Barcelona ~2,5 óra, Madrid–Sevilla ~2,5 óra — ajtótól ajtóig gyakran GYORSABB, mint a repülő. Az ár a foglalás idejétől függ, mint a repülőnél.",
    exampleZones: [{ name: "Madrid → Barcelona", zones: "~30–120 € (mikor foglalsz)" }, { name: "Madrid → Sevilla", zones: "~25–90 €" }, { name: "Olcsó márkák", zones: "Avlo, Ouigo, Iryo" }],
    singleZonePrice: 30, dailyPrice: 0, websiteUrl: "https://www.renfe.com/", color: "#7B1FA2",
  },
  {
    id: "emt-valencia", name: "Valencia / Alicante (helyi)", abbreviation: "EMT / TRAM", region: "Costa Blanca", emoji: "🚊",
    zonesCount: 0, description: "Valenciában az EMT (busz) és a Metrovalencia, Alicantéban a TRAM. ⚠️ Nem kompatibilisek a madridi vagy barcelonai bérletekkel — külön kártya kell.",
    exampleZones: [{ name: "Valencia, 1 út", zones: "~1,50 €" }, { name: "Alicante TRAM", zones: "~1,45 €-tól" }, { name: "Bérlet", zones: "helyi rendszer szerint" }],
    singleZonePrice: 1.5, dailyPrice: 4.0, websiteUrl: "https://www.metrovalencia.es/", color: "#0072BC",
  },
];

export const ES_TICKET_TYPES: TicketType[] = [
  { id: "sencillo", name: "Billete sencillo (egyszeri jegy)", emoji: "🎫", description: "Egy utazás. A legdrágább mód — ha hetente többször utazol, szinte mindig megéri a 10-utas jegy vagy a bérlet.", price: "~1,50–2,65 € (városonként)", validity: "1 utazás", bestFor: "Alkalmi utazás, turista" },
  { id: "t-casual", name: "10 utazásos jegy (T-casual / metrobús)", emoji: "🎟️", description: "Tíz utazás egy kártyán, jelentős kedvezménnyel az egyszeri jegyhez képest. Barcelonában T-casual, Madridban metrobús a neve. ⚠️ A T-casual NEM osztható meg többek közt.", price: "~12–13 € / 10 út", validity: "Amíg el nem fogy", bestFor: "Heti 2–4 utazás" },
  { id: "abono-mensual", name: "Abono mensual (havi bérlet)", emoji: "📅", description: "Korlátlan utazás a zónádon belül, egy naptári hónapra. Napi ingázónak szinte mindig ez a legolcsóbb.", price: "~20–60 € (zónától függően)", validity: "1 hónap", bestFor: "Napi ingázó" },
  { id: "abono-joven", name: "⭐ Abono joven (26 év alatt)", emoji: "🧑‍🎓", description: "A legnagyobb kedvezmény Spanyolországban. Madridban a 26 év alattiak havi fix áron KORLÁTLANUL utazhatnak az EGÉSZ közösségben — bármelyik zónában. Más közösségekben is van fiatal-kedvezmény, más feltételekkel.", price: "Madrid: ~20 € / hó", validity: "1 hónap (megújítható)", bestFor: "26 év alatti diák vagy dolgozó" },
  { id: "renfe-abono", name: "Renfe bérlet / többutas jegy", emoji: "🚆", description: "A Cercanías és a közepes távú vonatokra van többutas jegy és bérlet is. Az elmúlt években több átmeneti állami kedvezmény is élt ezeken a vonalakon — érdemes ránézni, mi van érvényben.", price: "vonalanként eltérő", validity: "1 hó / utazásszám", bestFor: "Vonatos ingázó" },
  { id: "ave-anticipado", name: "AVE előre foglalt jegy", emoji: "🚄", description: "A nagysebességű vonat ára a repülőjegy logikáját követi: minél korábban foglalsz, annál olcsóbb. Az Avlo (Renfe), az Ouigo és az Iryo a fapados márkák ugyanazokon a vonalakon.", price: "~7 €-tól (Avlo/Ouigo)", validity: "Adott vonatra", bestFor: "Belföldi távolsági út" },
];

export const ES_MOBILE_APPS: MobileApp[] = [
  { id: "renfe", name: "Renfe Cercanías", emoji: "🚆", description: "A spanyol vasút hivatalos elővárosi appja: menetrend, valós idejű járatinformáció, vonalak és állomások.", iosUrl: "https://apps.apple.com/es/app/renfe-cercanias/id1055293155", androidUrl: "https://play.google.com/store/apps/details?id=com.renfe.renfecercanias", pros: ["Hivatalos", "Real-time", "Minden agglomeráció"] },
  { id: "renfe-billetes", name: "Renfe", emoji: "🚄", description: "Jegyvásárlás a nagysebességű és távolsági vonatokra, digitális jegy, foglalás-kezelés.", iosUrl: "https://apps.apple.com/es/app/renfe/id1006925439", androidUrl: "https://play.google.com/store/apps/details?id=com.renfe.renfeticket", pros: ["Jegyvásárlás", "Digitális jegy", "AVE + Avlo"] },
  { id: "citymapper", name: "Citymapper", emoji: "🗺️", description: "Madridra és Barcelonára a legjobb door-to-door útvonaltervező — minden közlekedési mód, valós idejű adatokkal.", iosUrl: "https://apps.apple.com/es/app/citymapper/id469463298", androidUrl: "https://play.google.com/store/apps/details?id=com.citymapper.app.release", pros: ["Door-to-door", "Madrid + Barcelona", "Real-time"] },
];

export const ES_TRANSPORT_TIPS: { emoji: string; title: string; body: string }[] = [
  { emoji: "⭐", title: "26 alatt: az abono joven a legnagyobb spórolás", body: "Madridban a 26 év alattiak havi fix áron (~20 €) KORLÁTLANUL utazhatnak az EGÉSZ közösségben — bármelyik zónában, metrón, buszon és Cercanías-vonaton. Ez nagyságrenddel olcsóbb a felnőtt bérletnél. Más közösségekben is van fiatal-kedvezmény, kérdezz rá." },
  { emoji: "🚄", title: "Belföldön a vonat sokszor jobb, mint a repülő", body: "Madrid–Barcelona AVE-vel ~2,5 óra, városközponttól városközpontig. Repülővel a menetidő rövidebb, de a reptéri transzferrel és a becsekkolással együtt jellemzően hosszabb ÉS drágább. Az Avlo, az Ouigo és az Iryo a fapados márkák ugyanazokon a sínpárokon." },
  { emoji: "⚠️", title: "A városi bérletek NEM kompatibilisek", body: "A madridi abono Barcelonában semmit nem ér, és fordítva. Minden nagyváros önálló rendszer, saját kártyával. Ha költözöl, számolj egy új kártya beszerzésével." },
  { emoji: "🎟️", title: "Ne egyszeri jegyet vegyél", body: "A billete sencillo a legdrágább mód. Már heti 2–3 utazásnál megéri a 10-utas jegy (T-casual / metrobús), napi ingázásnál pedig szinte mindig a havi bérlet." },
  { emoji: "📅", title: "A havi bérlet NAPTÁRI hónapra szól", body: "Nem 30 napra a vásárlástól, hanem a hónap végéig — ha 20-án veszed, 10 napra fizetted ki a teljes árat. Hónap elején vedd meg." },
  { emoji: "🏝️", title: "A szigeteken más a helyzet", body: "A Baleárokon és a Kanári-szigeteken nincs metró és nincs elővárosi vasút (Palma és Tenerife kivételével részben) — ott a busz (guagua a Kanárikon) és az autó a valódi opció. Számolj ezzel, ha ott keresel lakást." },
];

export interface GbTravelInput {
  /** Hány NAPON utazol egy héten (a plafon napi alapon számol). */
  daysPerWeek: number;
  /** Egy napon hány utat teszel (oda-vissza = 2). */
  tripsPerDay: number;
  /** Egy út ára plafon nélkül (£). */
  singleFare: number;
  /** Napi plafon (£) — TfL 1–2 zóna alapértelmezés. */
  dailyCap: number;
  /** Heti plafon (£). */
  weeklyCap: number;
}

export interface GbTravelResult {
  /** Plafon NÉLKÜL mennyi lenne egy hét. */
  rawWeekly: number;
  /** A napi plafon alkalmazása után. */
  afterDailyCap: number;
  /** A heti plafon alkalmazása után — ennyit fizetsz ténylegesen. */
  actualWeekly: number;
  /** Mennyit spórol neked a capping hetente. */
  savedWeekly: number;
  /** Melyik plafon lépett életbe. */
  cappedBy: "none" | "daily" | "weekly";
}

/**
 * TfL capping-számítás. A logika: minden NAP külön a napi plafonig számol,
 * majd a heti összeget a heti plafon vágja le. Ez a valós TfL-mechanika, és
 * ezért éri meg Londonban érintős kártyával utazni jegy helyett.
 */
export function calculateGbTravel(input: GbTravelInput): GbTravelResult {
  const days = Math.max(0, input.daysPerWeek);
  const perDayRaw = Math.max(0, input.tripsPerDay) * Math.max(0, input.singleFare);
  const rawWeekly = perDayRaw * days;

  const perDayCapped = input.dailyCap > 0 ? Math.min(perDayRaw, input.dailyCap) : perDayRaw;
  const afterDailyCap = perDayCapped * days;

  const actualWeekly = input.weeklyCap > 0 ? Math.min(afterDailyCap, input.weeklyCap) : afterDailyCap;

  let cappedBy: "none" | "daily" | "weekly" = "none";
  if (input.weeklyCap > 0 && actualWeekly < afterDailyCap) cappedBy = "weekly";
  else if (perDayCapped < perDayRaw) cappedBy = "daily";

  return {
    rawWeekly,
    afterDailyCap,
    actualWeekly,
    savedWeekly: Math.max(0, rawWeekly - actualWeekly),
    cappedBy,
  };
}
