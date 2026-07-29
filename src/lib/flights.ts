/**
 * Repülőjegy „Járatfigyelő" — ország-tudatos (CH ↔ BUD, AT ↔ BUD).
 *
 * NEM real-time ár-API (drága/regisztrációs). Helyette:
 *   - Szezonális ár-sávok történelmi átlagok alapján (helyi pénznemben)
 *   - Heti minta (mely napokon olcsóbb)
 *   - Tippek (foglalási idő, légitársaság, AT-nél vonat/busz előny)
 *   - Deep-link generátorok a fő foglalási oldalakhoz
 *
 * Új ország: vedd fel a `FLIGHT_CONFIG`-ba (origins + airlines + seasons + tips).
 */

export interface Airport {
  code: string;
  name: string;
  city: string;
  emoji: string;
}

export interface Airline {
  id: string;
  name: string;
  type: "low-cost" | "full-service";
  /** Mely indulási reptér-kódokról jár (az adott ország origins-eiből). */
  routes: string[];
  color: string;
  emoji: string;
  notes: string;
  url: string;
}

export type Season = "off-peak" | "shoulder" | "peak" | "super-peak";

export interface SeasonInfo {
  id: Season;
  label: string;
  emoji: string;
  description: string;
  color: string;
  /** Becsült egyirányú ár-sáv a config pénznemében (low → high). */
  priceMin: number;
  priceMax: number;
}

export interface FlightTip {
  emoji: string;
  title: string;
  body: string;
}

export interface FlightConfig {
  country: string;
  /** Indulási repterek (az adott országban). Az első a „fő" (drágább) hub. */
  origins: Airport[];
  /** Magyar célállomás (BUD). */
  home: Airport;
  originFlag: string;
  homeFlag: string;
  /** Pénznem-felirat (pl. "CHF", "€"). */
  currency: string;
  /** Kerekítés lépcsője (CHF 50, EUR 10) — hogy ne nézzen ki real-time-nak. */
  roundStep: number;
  airlines: Airline[];
  seasons: SeasonInfo[];
  tips: FlightTip[];
}

const BUD: Airport = { code: "BUD", name: "Liszt Ferenc", city: "Budapest", emoji: "🇭🇺" };

// ── Szezon-árak (egyirányú, gazdaságos) ─────────────────────────────────────
function seasons(currency: string, p: [number, number][]): SeasonInfo[] {
  const meta: Omit<SeasonInfo, "priceMin" | "priceMax">[] = [
    { id: "off-peak", label: "Olcsó szezon", emoji: "💚", color: "#16a34a", description: "Január közepétől márciusig, illetve október–november eleje. Hidegebb idő, kevesebb utazó." },
    { id: "shoulder", label: "Átmeneti", emoji: "💛", color: "#e3a233", description: "Április–május + szeptember. Még/már jó idő, de a nyári csúcs előtt/után." },
    { id: "peak", label: "Csúcs", emoji: "🧡", color: "#f97316", description: "Június–augusztus, nyári szünet + nyaralás." },
    { id: "super-peak", label: "Szuper-csúcs", emoji: "❤️", color: "#dc2626", description: "Karácsony–újév (dec 18–jan 6), húsvét körül, augusztus első hete. Csúcsárak." },
  ];
  void currency;
  return meta.map((m, i) => ({ ...m, priceMin: p[i][0], priceMax: p[i][1] }));
}

export const FLIGHT_CONFIG: Record<string, FlightConfig> = {
  CH: {
    country: "CH",
    origins: [
      { code: "ZRH", name: "Zürich Flughafen", city: "Zürich", emoji: "🇨🇭" },
      { code: "BSL", name: "EuroAirport Basel", city: "Basel", emoji: "🇨🇭" },
      { code: "GVA", name: "Genève Aéroport", city: "Genf", emoji: "🇨🇭" },
    ],
    home: BUD,
    originFlag: "🇨🇭",
    homeFlag: "🇭🇺",
    currency: "CHF",
    roundStep: 50,
    airlines: [
      { id: "wizzair", name: "WizzAir", type: "low-cost", routes: ["ZRH", "BSL"], color: "#C6037E", emoji: "💜", notes: "Olcsó, kézipoggyász díjas, WizzAir Discount Club éves díjjal megéri.", url: "https://wizzair.com/" },
      { id: "swiss", name: "Swiss", type: "full-service", routes: ["ZRH", "GVA"], color: "#E2001A", emoji: "🇨🇭", notes: "Drágább, de 23 kg poggyász az alapcsomagban, jó szolgáltatás.", url: "https://www.swiss.com/" },
      { id: "edelweiss", name: "Edelweiss", type: "full-service", routes: ["ZRH"], color: "#E2001A", emoji: "🌸", notes: "Swiss leányvállalat, főleg üdülő-célokra, BUD nem mindennapos.", url: "https://www.flyedelweiss.com/" },
      { id: "easyjet", name: "EasyJet", type: "low-cost", routes: ["BSL", "GVA"], color: "#FF6600", emoji: "🧡", notes: "Bázis Basel + Genf, kézipoggyász díjas, néha extra-olcsó akciók.", url: "https://www.easyjet.com/" },
    ],
    seasons: seasons("CHF", [[50, 150], [80, 220], [150, 350], [250, 600]]),
    tips: [
      { emoji: "📅", title: "Foglalj 6–8 héttel előre", body: "Túl korán (5+ hónappal) az árak még magasak. Túl későn (2 hét alatt) is drága. A 6–8 hetes ablak a legjobb." },
      { emoji: "🗓️", title: "Hét közepe = olcsóbb", body: "Kedd–szerda jellemzően 15–20%-kal olcsóbb mint csütörtök–péntek–vasárnap." },
      { emoji: "✈️", title: "BSL és GVA gyakran olcsóbb mint ZRH", body: "Basel-Mulhouse és Genf low-cost bázisok (WizzAir, EasyJet). ZRH a Swiss otthona — drágább, de kényelmesebb." },
      { emoji: "🎒", title: "WizzAir trükkök", body: "Az alap-jegy CSAK egy kis táskát enged. Plus 10 kg = +30–50 CHF. Discount Club éves díj megéri 3+ utazásnál." },
      { emoji: "💸", title: "Szuper-csúcs elkerülés", body: "Karácsonyt érdemes dec 23-án visszamenni és jan 7-én visszajönni — 2–3×olcsóbb mint dec 24 → jan 2." },
      { emoji: "🚆", title: "Vonat-alternatíva", body: "Zürich → Budapest ÖBB Nightjet ~140 CHF, 12–13 óra. Drága repülős időszakban érdemes vonatra váltani." },
    ],
  },
  AT: {
    country: "AT",
    origins: [
      { code: "VIE", name: "Wien-Schwechat", city: "Bécs", emoji: "🇦🇹" },
      { code: "GRZ", name: "Graz", city: "Graz", emoji: "🇦🇹" },
      { code: "SZG", name: "Salzburg", city: "Salzburg", emoji: "🇦🇹" },
    ],
    home: BUD,
    originFlag: "🇦🇹",
    homeFlag: "🇭🇺",
    currency: "€",
    roundStep: 10,
    airlines: [
      { id: "wizzair", name: "WizzAir", type: "low-cost", routes: ["VIE"], color: "#C6037E", emoji: "💜", notes: "Nagy bécsi bázis. Olcsó, kézipoggyász díjas; sok közép-európai célpont.", url: "https://wizzair.com/" },
      { id: "ryanair", name: "Ryanair", type: "low-cost", routes: ["VIE"], color: "#073590", emoji: "💙", notes: "Bécsi bázis (Laudamotion is). Nagyon olcsó alap-ár, minden extra fizetős.", url: "https://www.ryanair.com/" },
      { id: "austrian", name: "Austrian Airlines", type: "full-service", routes: ["VIE"], color: "#E2001A", emoji: "🇦🇹", notes: "Star Alliance, 23 kg poggyász az alapban. Drágább, de átszállásos magyar célokra (pl. Debrecenen túl) jó.", url: "https://www.austrian.com/" },
    ],
    // Bécs↔Budapest rövid táv → olcsó EUR-sávok (Ryanair/WizzAir).
    seasons: seasons("€", [[20, 70], [30, 110], [60, 180], [120, 320]]),
    tips: [
      { emoji: "🚆", title: "Bécsből a vonat/busz veri a repülőt", body: "Bécs → Budapest ÖBB RailJet ~2 óra 40 perc, gyakran 19,90 € Sparschiene-áron. FlixBus 2,5–3 óra, már 10–20 €-tól. Rövid táv → repülni ritkán éri meg." },
      { emoji: "📅", title: "Foglalj 6–8 héttel előre", body: "Repülőre a 6–8 hetes ablak a legjobb. A vonat Sparschiene-jegyek is hamarabb olcsóbbak — 3 napon belül a teljes árat fizeted." },
      { emoji: "✈️", title: "Mikor éri meg mégis repülni?", body: "Ha Bécstől nyugatra laksz (Salzburg, Graz, Innsbruck), vagy a célod Budapesten túl van (átszállással). Vienna→BUD direktjárat ritka — inkább összekötés." },
      { emoji: "🎒", title: "Ryanair / WizzAir trükkök", body: "Az alap-jegy CSAK egy kis táskát enged. Plus poggyász = +20–40 €. Online check-in kötelező, különben reptéri díj." },
      { emoji: "💸", title: "Szuper-csúcs elkerülés", body: "Karácsony/húsvét körül a vonat is megdrágul és telik — foglalj korán. Dec 23 oda / jan 7 vissza olcsóbb mint a 24/2 csúcs." },
      { emoji: "🚗", title: "Autó-alternatíva", body: "Bécs → Budapest autóval ~2,5 óra (M1/A4). Matrica (Vignette) + magyar e-matrica kell. Többen utazva gyakran a legolcsóbb." },
    ],
  },
  DE: {
    country: "DE",
    origins: [
      { code: "BER", name: "Berlin Brandenburg", city: "Berlin", emoji: "🇩🇪" },
      { code: "MUC", name: "München Franz Josef Strauß", city: "München", emoji: "🇩🇪" },
      { code: "FRA", name: "Frankfurt am Main", city: "Frankfurt", emoji: "🇩🇪" },
    ],
    home: BUD,
    originFlag: "🇩🇪",
    homeFlag: "🇭🇺",
    currency: "€",
    roundStep: 10,
    airlines: [
      { id: "wizzair", name: "WizzAir", type: "low-cost", routes: ["BER"], color: "#C6037E", emoji: "💜", notes: "Nagy berlini bázis, gyakori BER↔BUD járatok. Olcsó alap-ár, kézipoggyász díjas.", url: "https://wizzair.com/" },
      { id: "ryanair", name: "Ryanair", type: "low-cost", routes: ["BER"], color: "#073590", emoji: "💙", notes: "Berlinből, illetve Memmingen (München-nyugat) és Dortmund reptérről nagyon olcsón. Minden extra fizetős.", url: "https://www.ryanair.com/" },
      { id: "lufthansa", name: "Lufthansa", type: "full-service", routes: ["FRA", "MUC"], color: "#05164D", emoji: "🤍", notes: "FRA és MUC hubokról direkt BUD. 23 kg poggyász az alapban, drágább, de kényelmes és gyakori.", url: "https://www.lufthansa.com/" },
      { id: "eurowings", name: "Eurowings", type: "low-cost", routes: ["MUC"], color: "#A4126F", emoji: "💗", notes: "Lufthansa low-cost leánya, több német városból BUD-ra. Köztes ár-kategória.", url: "https://www.eurowings.com/" },
    ],
    // Németország távolabb → kicsit magasabb EUR-sávok, de erős low-cost kínálat.
    seasons: seasons("€", [[25, 90], [40, 140], [70, 220], [140, 380]]),
    tips: [
      { emoji: "✈️", title: "Berlinből a legolcsóbb", body: "BER↔BUD a legsűrűbb low-cost útvonal (WizzAir, Ryanair, easyJet). München/Frankfurt inkább Lufthansa — drágább, de gyakori." },
      { emoji: "🛫", title: "Másodlagos repterek = mély-olcsó", body: "Ha Bajorországban élsz: Memmingen (FMM, München-nyugat, Ryanair/Wizz). NRW-ben: Dortmund (DTM) vagy Weeze (NRN). Gyakran feleannyi, mint a nagy hubok." },
      { emoji: "📅", title: "Foglalj 6–8 héttel előre", body: "A 6–8 hetes ablak a legjobb. Túl korán (5+ hó) még magas, túl későn (2 hét) drága." },
      { emoji: "🗓️", title: "Hét közepe = olcsóbb", body: "Kedd–szerda jellemzően 15–20%-kal olcsóbb, mint csütörtök–péntek–vasárnap." },
      { emoji: "🎒", title: "Ryanair / WizzAir trükkök", body: "Az alap-jegy CSAK egy kis táskát enged. Plus poggyász = +20–45 €. Online check-in kötelező, különben reptéri díj." },
      { emoji: "🚆", title: "Vonat csak rövid távon éri meg", body: "München → Budapest DB+ÖBB ~7–8 óra, Frankfurtból még több. Repülni általában gyorsabb és olcsóbb — a vonat inkább Bécs-közeli német határvárosokból." },
    ],
  },
  NL: {
    country: "NL",
    origins: [
      { code: "AMS", name: "Amsterdam Schiphol", city: "Amszterdam", emoji: "🇳🇱" },
      { code: "EIN", name: "Eindhoven Airport", city: "Eindhoven", emoji: "🇳🇱" },
      { code: "RTM", name: "Rotterdam The Hague", city: "Rotterdam", emoji: "🇳🇱" },
    ],
    home: BUD,
    originFlag: "🇳🇱",
    homeFlag: "🇭🇺",
    currency: "€",
    roundStep: 10,
    airlines: [
      { id: "klm", name: "KLM", type: "full-service", routes: ["AMS"], color: "#00A1DE", emoji: "🇳🇱", notes: "Schipholról NAPI direkt BUD-ra. 23 kg poggyász az alapcsomagban (a legolcsóbb Light-tarifon nem), gyakori és kényelmes.", url: "https://www.klm.nl/" },
      { id: "transavia", name: "Transavia", type: "low-cost", routes: ["AMS", "EIN", "RTM"], color: "#00D1B0", emoji: "💚", notes: "Holland low-cost (KLM-leány). Schiphol/Eindhoven/Rotterdam bázis, szezonálisan BUD. Kézipoggyász díjas.", url: "https://www.transavia.com/" },
      { id: "wizzair", name: "WizzAir", type: "low-cost", routes: ["EIN"], color: "#C6037E", emoji: "💜", notes: "Nagy eindhoveni bázis, gyakori EIN↔BUD. Olcsó alap-ár, minden extra fizetős.", url: "https://wizzair.com/" },
      { id: "ryanair", name: "Ryanair", type: "low-cost", routes: ["EIN"], color: "#073590", emoji: "💙", notes: "Eindhovenből nagyon olcsó alap-ár. Online check-in kötelező, minden extra fizetős.", url: "https://www.ryanair.com/" },
    ],
    // Hollandia távolabb (AMS–BUD ~1150 km), de erős low-cost Eindhovenből.
    seasons: seasons("€", [[30, 100], [45, 150], [75, 230], [150, 400]]),
    tips: [
      { emoji: "🛫", title: "Eindhoven (EIN) a low-cost gyöngyszem", body: "WizzAir/Ryanair/Transavia bázis — gyakran feleannyi, mint a Schiphol. Ha az ország déli felén laksz, EIN-ből indulj." },
      { emoji: "✈️", title: "Schipholról KLM direkt", body: "AMS→BUD napi direkt (KLM); Transavia szezonálisan. Kényelmes, de a low-cost Eindhovenből általában olcsóbb." },
      { emoji: "📅", title: "Foglalj 6–8 héttel előre", body: "A 6–8 hetes ablak a legjobb. Túl korán (5+ hó) még magas, túl későn (2 hét) drága." },
      { emoji: "🗓️", title: "Hét közepe = olcsóbb", body: "Kedd–szerda jellemzően 15–20%-kal olcsóbb, mint csütörtök–péntek–vasárnap." },
      { emoji: "🎒", title: "Ryanair / WizzAir / Transavia trükkök", body: "Az alap-jegy CSAK egy kis táskát enged. Plus poggyász = +20–45 €. Online check-in kötelező, különben reptéri díj." },
      { emoji: "🚆", title: "Vonat Hollandiából nem alternatíva", body: "Amszterdam → Budapest vonattal 15+ óra, több átszállással (Németországon/Ausztrián át). BUD-ra repülni gyorsabb és olcsóbb; a vonat inkább Bécs/München felé jó." },
    ],
  },
  /**
   * ⚠️ ANGLIA — a leghosszabb táv a négy kontinentális országhoz képest
   * (London–Budapest ~2,5 óra), és Brexit óta a repülő gyakorlatilag az
   * EGYETLEN reális út: nincs értelmes vonat-alternatíva, mint Bécsből vagy
   * Zürichből. Ezért a szezonális sávok magasabbak, és a tippek a
   * poggyász-politikára és a reptér-választásra összpontosítanak.
   */
  GB: {
    country: "GB",
    origins: [
      { code: "LTN", name: "London Luton", city: "London", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
      { code: "STN", name: "London Stansted", city: "London", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
      { code: "LGW", name: "London Gatwick", city: "London", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
      { code: "LHR", name: "London Heathrow", city: "London", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
      { code: "MAN", name: "Manchester", city: "Manchester", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
      { code: "BHX", name: "Birmingham", city: "Birmingham", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
      { code: "BRS", name: "Bristol", city: "Bristol", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    ],
    home: BUD,
    originFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    homeFlag: "🇭🇺",
    currency: "£",
    roundStep: 10,
    airlines: [
      { id: "wizzair", name: "WizzAir", type: "low-cost", routes: ["LTN", "LGW", "MAN", "BHX", "BRS"], color: "#C6037E", emoji: "💜", notes: "A legsűrűbb magyar útvonalhálózat Angliából (Luton a fő bázis). Olcsó alapár, minden poggyász külön fizetős.", url: "https://wizzair.com/" },
      { id: "ryanair", name: "Ryanair", type: "low-cost", routes: ["STN", "MAN", "BRS"], color: "#073590", emoji: "💙", notes: "Stansted-bázis. Nagyon olcsó alapár, szigorú kézipoggyász-méret és fizetős beszállókártya-nyomtatás.", url: "https://www.ryanair.com/" },
      { id: "britishairways", name: "British Airways", type: "full-service", routes: ["LHR"], color: "#075AAA", emoji: "🇬🇧", notes: "Heathrow-ról, drágább, de a jegyben van kézipoggyász, és Heathrow jobban megközelíthető a belvárosból.", url: "https://www.britishairways.com/" },
    ],
    // ⚠️ Hosszabb táv + erős szezonalitás → magasabb sávok, mint Bécsnél.
    seasons: seasons("£", [[25, 90], [45, 140], [90, 240], [160, 400]]),
    tips: [
      { emoji: "🛫", title: "Luton és Stansted az olcsó, Heathrow a kényelmes", body: "A WizzAir Lutonról, a Ryanair Stanstedről repül Budapestre — ezek a legolcsóbbak, de a belvárosból 1–1,5 óra kijutni. Számold bele a reptéri transzfer árát (vonat 15–25 £), mert gyakran elviszi a különbséget." },
      { emoji: "🎒", title: "A poggyász viszi el a különbséget", body: "A low-cost alapjegy CSAK egy ülés alá férő kis táskát enged. Kézipoggyász a kalapba + feladott bőrönd oda-vissza könnyen +60–100 £ — a „20 fontos jegy” így lesz 120." },
      { emoji: "📅", title: "Foglalj 6–8 héttel előre", body: "Ugyanaz a szabály, mint a kontinensen: 5+ hónappal még magas, 2 héten belül drága. A hét közepe (kedd–szerda) 15–20%-kal olcsóbb." },
      { emoji: "🎄", title: "Karácsony: a legdrágább időszak", body: "December 20–24. és január 2–6. között az árak 3–4-szeresükre ugranak. Ha teheted, dec. 23-án menj és jan. 7-én gyere vissza." },
      { emoji: "🛂", title: "⚠️ Brexit óta útlevél kell", body: "Magyar SZEMÉLYI IGAZOLVÁNNYAL már nem lehet belépni az Egyesült Királyságba — érvényes útlevél kell. Indulás előtt ellenőrizd a lejáratot; a beszállásnál a légitársaság is nézi." },
      { emoji: "🚂", title: "Vonat-alternatíva gyakorlatilag nincs", body: "London–Budapest vonattal 20+ óra, több átszállással, és jellemzően DRÁGÁBB a repülőnél. Bécsből vagy Münchenből még van értelme éjszakai vonatnak, Angliából nincs." },
    ],
  },
  // ⚠️ SPANYOLORSZÁG. Két dolog tér el élesen a többi országtól:
  //   1) A magyar közösség NEM a fővárosban koncentrálódik, hanem a tengerparti
  //      és szigeti üdülőövezetekben (Costa del Sol, Costa Blanca, Baleárok,
  //      Kanárik) — ezért az indulási repterek listája nem „Madrid + 2 nagyváros".
  //   2) A KANÁRI-SZIGETEK külön világ: onnan jellemzően NINCS közvetlen járat
  //      Budapestre, mindig át kell szállni. Ezt a tippekben ki is mondjuk,
  //      mert egy Tenerifén élő magyarnak a „2 óra repülés" becslés hamis lenne.
  ES: {
    country: "ES",
    origins: [
      { code: "MAD", name: "Madrid-Barajas", city: "Madrid", emoji: "🇪🇸" },
      { code: "BCN", name: "Barcelona-El Prat", city: "Barcelona", emoji: "🇪🇸" },
      { code: "AGP", name: "Málaga-Costa del Sol", city: "Málaga", emoji: "🇪🇸" },
      { code: "ALC", name: "Alicante-Elche", city: "Alicante", emoji: "🇪🇸" },
      { code: "VLC", name: "Valencia", city: "Valencia", emoji: "🇪🇸" },
      { code: "PMI", name: "Palma de Mallorca", city: "Palma", emoji: "🇪🇸" },
      { code: "TFS", name: "Tenerife Sur", city: "Tenerife", emoji: "🇪🇸" },
    ],
    home: BUD,
    originFlag: "🇪🇸",
    homeFlag: "🇭🇺",
    currency: "€",
    roundStep: 10,
    airlines: [
      { id: "wizzair", name: "WizzAir", type: "low-cost", routes: ["MAD", "BCN", "AGP", "ALC", "VLC", "PMI", "TFS"], color: "#C6037E", emoji: "💜", notes: "A legszélesebb magyar útvonalhálózat Spanyolországból. Olcsó alapár, minden poggyász külön fizetős — a kézipoggyász mérete szigorúan ellenőrzött.", url: "https://wizzair.com/" },
      { id: "ryanair", name: "Ryanair", type: "low-cost", routes: ["MAD", "BCN", "AGP", "ALC", "VLC", "PMI"], color: "#073590", emoji: "💙", notes: "Erős spanyol jelenlét. Nagyon olcsó alapár, de a fizetős extrák (ülőhely, poggyász, beszállókártya) gyorsan hozzáadódnak.", url: "https://www.ryanair.com/" },
      { id: "vueling", name: "Vueling", type: "low-cost", routes: ["BCN"], color: "#FFCC00", emoji: "💛", notes: "Spanyol low-cost, barcelonai bázissal. A belföldi csatlakozásoknál (pl. a szigetekről) gyakran ez a legkényelmesebb kombináció.", url: "https://www.vueling.com/" },
      { id: "iberia", name: "Iberia", type: "full-service", routes: ["MAD"], color: "#D7192D", emoji: "🇪🇸", notes: "Madridból, drágább, de a jegyben van kézipoggyász, és a szigetekről van rá belföldi csatlakozás egy jegyen.", url: "https://www.iberia.com/" },
    ],
    // Hasonló távolság, mint Angliából, de sűrűbb a verseny és erősebb a
    // nyári csúcs (a turista-szezon felnyomja a saját járatainkat is).
    seasons: seasons("€", [[30, 100], [50, 150], [100, 260], [170, 420]]),
    tips: [
      { emoji: "🏝️", title: "⚠️ A Kanári-szigetekről NINCS közvetlen járat", body: "Tenerifétől vagy Gran Canariától Budapestig mindig át kell szállni (jellemzően Madridon, Barcelonán vagy egy másik európai hubon). Számolj 8–12 óra teljes úttal, és a szigetről induló belföldi szakasz árával — ez sokszor annyi, mint maga a nemzetközi jegy." },
      { emoji: "🌞", title: "A tengerparti repterek olcsóbbak lehetnek a fővárosnál", body: "Málaga, Alicante és Palma erős low-cost bázisok a turizmus miatt — a magyar járatokon gyakran olcsóbb jegy van innen, mint Madridból. Ha nem vagy a fővároshoz kötve, hasonlítsd össze mind a hármat." },
      { emoji: "🎒", title: "A poggyász viszi el a különbséget", body: "A low-cost alapjegy CSAK egy ülés alá férő kis táskát enged. Kézipoggyász a kalapba + feladott bőrönd oda-vissza könnyen +70–110 € — a „30 eurós jegy” így lesz 140." },
      { emoji: "📅", title: "Foglalj 6–8 héttel előre", body: "5+ hónappal még magas, 2 héten belül drága. A hét közepe (kedd–szerda) 15–20%-kal olcsóbb, és a kora reggeli járatok is." },
      { emoji: "🎄", title: "Karácsony és augusztus a két csúcs", body: "December 18–január 6. és augusztus első fele a legdrágább. Augusztusban ráadásul a spanyol belföldi turizmus is tetőzik — a szigeti csatlakozások is felmennek." },
      { emoji: "🚄", title: "Belföldön a vonat gyakran jobb, mint a repülő", body: "Madrid–Barcelona, Madrid–Sevilla, Madrid–Valencia között az AVE nagysebességű vonat ajtótól ajtóig sokszor gyorsabb, mint a repülő — és a reptéri transzfer nélkül olcsóbb is. A Budapestre tartó járathoz is jó ráhordó." },
    ],
  },
};

/** Egy ország járat-konfigja (vagy null, ha nincs felvéve). */
export function getFlightConfig(country: string | null | undefined): FlightConfig | null {
  if (!country) return null;
  return FLIGHT_CONFIG[country] ?? null;
}

/** Egy adott dátum szezonja (CH/AT-tipikus iskolaszünettel — közelítés). */
export function getSeason(date: Date): Season {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  if ((m === 12 && d >= 18) || (m === 1 && d <= 6)) return "super-peak";
  if (m === 8 && d <= 7) return "super-peak";
  if (m === 4 && d >= 1 && d <= 15) return "super-peak";
  if (m === 6 || m === 7 || m === 8) return "peak";
  if (m === 4 || m === 5 || m === 9) return "shoulder";
  return "off-peak";
}

/** Hét közepe általában olcsóbb. */
export function getWeekdayMultiplier(date: Date): number {
  const dow = date.getDay();
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

export function estimatePrice(date: Date, originCode: string, config: FlightConfig): PriceEstimate {
  const season = getSeason(date);
  const seasonInfo = config.seasons.find((s) => s.id === season)!;
  const mult = getWeekdayMultiplier(date);
  // A fő (első) hub a teljes ár; a másodlagos repterek picit olcsóbbak (low-cost bázis).
  const isPrimary = config.origins[0]?.code === originCode;
  const airportAdj = isPrimary ? 1.0 : 0.9;
  const step = config.roundStep;
  const round = (n: number) => Math.round(n / step) * step;
  const base = seasonInfo;
  const mid = base.priceMin + (base.priceMax - base.priceMin) * 0.5;
  return {
    season,
    weekdayMultiplier: mult,
    lowCostMin: Math.max(step, round(base.priceMin * mult * airportAdj)),
    lowCostMax: round(mid * mult * airportAdj),
    fullServiceMin: round(mid * mult * airportAdj),
    fullServiceMax: round(base.priceMax * mult * airportAdj),
  };
}

/** Utazási irány. */
export type Direction = "out" | "home";

export function getOrigin(direction: Direction, originCode: string): string {
  return direction === "out" ? originCode : "BUD";
}
export function getDestination(direction: Direction, originCode: string): string {
  return direction === "out" ? "BUD" : originCode;
}

/** Deep-link a Skyscanner-be. YYMMDD a dátum. */
export function skyscannerUrl(from: string, to: string, date: Date, returnDate: Date | null): string {
  const fmt = (d: Date) => `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const base = `https://www.skyscanner.com/transport/flights/${from.toLowerCase()}/${to.toLowerCase()}/${fmt(date)}/`;
  return returnDate ? `${base}${fmt(returnDate)}/` : base;
}

export function googleFlightsUrl(from: string, to: string): string {
  return `https://www.google.com/travel/flights?q=Flights%20from%20${from}%20to%20${to}`;
}

export function kiwiUrl(from: string, to: string, date: Date, returnDate: Date | null): string {
  const fmt = (d: Date) => `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  const base = `https://www.kiwi.com/en/search/results/${from.toLowerCase()}/${to.toLowerCase()}/${fmt(date)}`;
  return returnDate ? `${base}/${fmt(returnDate)}` : base;
}
