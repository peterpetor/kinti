/**
 * Svájci Kvíz — kérdés-bank.
 *
 * Cél: napi 3 kérdéses tudás-tréning a magyar-svájci közösségnek. Témák:
 * földrajz, történelem, kultúra, ünnepek, kantonok, nyelv, étel, közlekedés,
 * intézmények, mindennapok.
 *
 * Minden kérdés 4 választást + 1 helyes választ tartalmaz, plus magyarázat
 * a válaszhoz (a sikeres válasz után jelenik meg).
 */

export type QuizCategory =
  | "geography"
  | "history"
  | "culture"
  | "language"
  | "food"
  | "transport"
  | "institutions"
  | "everyday";

export interface QuizQuestion {
  id: string;
  category: QuizCategory;
  question: string;
  options: [string, string, string, string];
  /** Helyes válasz index-e (0-3). */
  correct: 0 | 1 | 2 | 3;
  /** Magyarázat — a válasz után jelenik meg. */
  explanation: string;
}

export const QUIZ_CATEGORY_META: Record<QuizCategory, { label: string; emoji: string }> = {
  geography:    { label: "Földrajz",       emoji: "🗺️" },
  history:      { label: "Történelem",     emoji: "📜" },
  culture:      { label: "Kultúra",        emoji: "🎭" },
  language:     { label: "Nyelv",          emoji: "💬" },
  food:         { label: "Étel & ital",    emoji: "🍽️" },
  transport:    { label: "Közlekedés",     emoji: "🚆" },
  institutions: { label: "Intézmények",    emoji: "🏛️" },
  everyday:     { label: "Hétköznapok",    emoji: "🇨🇭" },
};

export const QUIZ_BANK: QuizQuestion[] = [
  // === FÖLDRAJZ ===
  {
    id: "geo-cantons",
    category: "geography",
    question: "Hány kantonja van Svájcnak?",
    options: ["20", "22", "26", "28"],
    correct: 2,
    explanation: "Svájcnak 26 kantonja van — pontosabban 20 teljes kanton és 6 fél-kanton.",
  },
  {
    id: "geo-capital",
    category: "geography",
    question: "Mi Svájc fővárosa?",
    options: ["Zürich", "Genf", "Bern", "Basel"],
    correct: 2,
    explanation: "Bern a 'Bundesstadt' (szövetségi főváros) — bár a legnagyobb város Zürich.",
  },
  {
    id: "geo-largest-city",
    category: "geography",
    question: "Melyik a legnagyobb svájci város népességszám szerint?",
    options: ["Bern", "Zürich", "Basel", "Genf"],
    correct: 1,
    explanation: "Zürich kb. 440 000 fős — a legnagyobb város. A főváros viszont Bern.",
  },
  {
    id: "geo-matterhorn",
    category: "geography",
    question: "Hány méter magas a Matterhorn?",
    options: ["3 998 m", "4 478 m", "4 634 m", "4 810 m"],
    correct: 1,
    explanation: "A Matterhorn 4 478 m magas — de NEM ez a legmagasabb svájci csúcs.",
  },
  {
    id: "geo-dufourspitze",
    category: "geography",
    question: "Melyik a legmagasabb svájci csúcs?",
    options: ["Matterhorn", "Eiger", "Dufourspitze", "Jungfrau"],
    correct: 2,
    explanation: "A Dufourspitze a Monte Rosa-masszívumban — 4 634 m. A Matterhorn 'csak' 4 478 m.",
  },
  {
    id: "geo-largest-canton",
    category: "geography",
    question: "Melyik a legnagyobb kanton terület szerint?",
    options: ["Bern", "Graubünden", "Wallis", "Zürich"],
    correct: 1,
    explanation: "Graubünden (GR) a legnagyobb kanton — 7 105 km². Nyelvileg is különleges: 3 hivatalos nyelv (DE/IT/RM).",
  },
  {
    id: "geo-most-populated",
    category: "geography",
    question: "Melyik a legnépesebb kanton?",
    options: ["Bern", "Zürich", "Waadt", "Aargau"],
    correct: 1,
    explanation: "Zürich kanton kb. 1.6 millió lakossal — a legnépesebb.",
  },
  {
    id: "geo-rivers",
    category: "geography",
    question: "Melyik folyó NEM ered Svájcban?",
    options: ["Rajna", "Rhône", "Duna", "Inn"],
    correct: 2,
    explanation: "A Duna NEM eredete Svájcnak — Németországban, a Fekete-erdőben ered. A Rajna, a Rhône és az Inn viszont igen.",
  },
  {
    id: "geo-borders",
    category: "geography",
    question: "Hány országgal határos Svájc?",
    options: ["3", "4", "5", "6"],
    correct: 2,
    explanation: "5 országgal: Németország, Franciaország, Olaszország, Ausztria, Liechtenstein.",
  },

  // === TÖRTÉNELEM ===
  {
    id: "his-foundation",
    category: "history",
    question: "Mikor alakult meg a Svájci Konföderáció (eredeti szövetség)?",
    options: ["1291", "1389", "1492", "1648"],
    correct: 0,
    explanation: "1291 augusztus 1. — a Rütli-eskü napja. Uri, Schwyz és Unterwalden szövetsége. Ezért nemzeti ünnep aug. 1.",
  },
  {
    id: "his-eu",
    category: "history",
    question: "Mikor lépett be Svájc az EU-ba?",
    options: ["1995", "2002", "2014", "Soha"],
    correct: 3,
    explanation: "Svájc NEM tagja az EU-nak. Számos kétoldalú megállapodással integrálódik, de teljes tagja sosem volt.",
  },
  {
    id: "his-neutrality",
    category: "history",
    question: "Mióta semleges hivatalosan Svájc?",
    options: ["1648 (vesztfáliai béke)", "1815 (bécsi kongresszus)", "1914", "1945"],
    correct: 1,
    explanation: "Az 1815-ös bécsi kongresszus hivatalosan elismerte Svájc örökös semlegességét.",
  },
  {
    id: "his-women-vote",
    category: "history",
    question: "Mikor kaptak választójogot a svájci nők szövetségi szinten?",
    options: ["1918", "1945", "1971", "1990"],
    correct: 2,
    explanation: "1971 — meglepően későn. Appenzell Innerrhoden-ben csak 1990-ben kantoni szinten.",
  },
  {
    id: "his-un",
    category: "history",
    question: "Mikor lett Svájc ENSZ-tag?",
    options: ["1945", "1990", "2002", "2014"],
    correct: 2,
    explanation: "2002. Népszavazáson döntöttek — Svájc volt az utolsó nagy európai ország ami csatlakozott.",
  },

  // === KULTÚRA / ÜNNEPEK ===
  {
    id: "cul-national-day",
    category: "culture",
    question: "Mikor van Svájc nemzeti ünnepe?",
    options: ["Július 14.", "Augusztus 1.", "Szeptember 21.", "December 6."],
    correct: 1,
    explanation: "Augusztus 1. — az 1291-es Rütli-eskü évfordulója. Tűzijáték, máglyák, népi ünnep.",
  },
  {
    id: "cul-sechselauten",
    category: "culture",
    question: "Mi a Sechseläuten?",
    options: [
      "Zürichi tavaszi ünnep, télbúcsúztató",
      "Bázeli farsang",
      "Genfi karácsonyi piac",
      "Berni hagyományos ló-verseny",
    ],
    correct: 0,
    explanation: "Zürichi tavaszi ünnep áprilisban — a 'Böögg' (hóember-szerű figura) elégetése jelképesen elűzi a telet.",
  },
  {
    id: "cul-fasnacht",
    category: "culture",
    question: "Hol tartják Svájc leghíresebb farsangját?",
    options: ["Genf", "Luzern", "Bázel", "Bern"],
    correct: 2,
    explanation: "Bázelben — a 'Basler Fasnacht' UNESCO-örökség. Három nap, hajnali 4-kor kezdődik a 'Morgestraich'.",
  },
  {
    id: "cul-flag",
    category: "culture",
    question: "Milyen alakú a svájci zászló?",
    options: ["Téglalap", "Négyzet", "Háromszög", "Pajzs"],
    correct: 1,
    explanation: "Svájc és a Vatikán az egyetlen két ország, aminek NÉGYZET alakú a zászlója.",
  },
  {
    id: "cul-cross",
    category: "culture",
    question: "Mit jelképez a svájci zászló fehér keresztje?",
    options: [
      "A katolikus egyházat",
      "A semlegességet",
      "A Konföderáció hagyományos jelképét",
      "A négy nemzeti nyelvet",
    ],
    correct: 2,
    explanation: "A keresztet a középkor óta használják a svájci konföderációs csapatok megkülönböztetésére. A Vörös Kereszt szervezet (1863) fordítottja erre.",
  },

  // === NYELV ===
  {
    id: "lang-official",
    category: "language",
    question: "Hány hivatalos nyelve van Svájcnak?",
    options: ["2", "3", "4", "5"],
    correct: 2,
    explanation: "4: német (kb. 62%), francia (23%), olasz (8%), retoromán (0.5%).",
  },
  {
    id: "lang-rumantsch",
    category: "language",
    question: "Melyik kantonban beszélnek hivatalosan retorománul?",
    options: ["Tessin", "Wallis", "Graubünden", "Jura"],
    correct: 2,
    explanation: "Graubünden — az egyetlen hivatalosan három-nyelvű kanton: német, olasz, retoromán.",
  },
  {
    id: "lang-gruezi",
    category: "language",
    question: "Mit jelent a 'Grüezi'?",
    options: ["Köszönöm", "Helló (német-svájci)", "Bocsánat", "Viszlát"],
    correct: 1,
    explanation: "A 'Grüezi' a svájci-német köszönés ('Adj' Isten' jellegű). 'Salü' baráti, 'Adieu' francia területen.",
  },
  {
    id: "lang-rostigraben",
    category: "language",
    question: "Mi az a 'Röstigraben'?",
    options: [
      "Egy hegyvonulat a kantonok közt",
      "A német- és francia-ajkú régiók közti kulturális határvonal",
      "Egy hagyományos étel",
      "Egy folyó-szakasz",
    ],
    correct: 1,
    explanation: "Az image alak a Saane / Sarine folyó mentén — szimbolikus kulturális határ a Deutschschweiz és a Romandie közt.",
  },
  {
    id: "lang-velo",
    category: "language",
    question: "Mit jelent a 'Velo'?",
    options: ["Autó", "Kerékpár", "Vonat", "Sí"],
    correct: 1,
    explanation: "Svájc-németben 'Velo' = bicikli (a francia 'vélocipède' rövidítéséből). Németországban 'Fahrrad'.",
  },

  // === ÉTEL / ITAL ===
  {
    id: "food-fondue",
    category: "food",
    question: "Miből készül a klasszikus svájci fondue?",
    options: [
      "Csak Emmentaler sajtból",
      "Gruyère + Vacherin sajtokból fehérborral",
      "Sajt + tej + tojás",
      "Olvasztott vajból",
    ],
    correct: 1,
    explanation: "Klasszikus 'fondue moitié-moitié' = fele Gruyère + fele Vacherin Fribourgeois, fehérborral és kis kirsch-sel.",
  },
  {
    id: "food-rosti",
    category: "food",
    question: "Mi a Rösti?",
    options: [
      "Sajtos pirított krumpli",
      "Sárgarépás leves",
      "Disznóhús salátával",
      "Sajt-szendvics",
    ],
    correct: 0,
    explanation: "Reszelt és pirított krumpli (mint a hash brown). Klasszikus svájci-német köret, főleg Berni-Solothurn körül.",
  },
  {
    id: "food-raclette",
    category: "food",
    question: "Mi a Raclette?",
    options: [
      "Egy sajt-fajta + a róla nevezett étel (olvasztott sajt krumplival, savanyúsággal)",
      "Egyfajta száraz kolbász",
      "Csokis fondue",
      "Tej-leves",
    ],
    correct: 0,
    explanation: "Wallisi eredetű sajt — kis vasalót használva felolvasztják és krumplira, savanyúságra teszik.",
  },
  {
    id: "food-cervelat",
    category: "food",
    question: "Mi a 'Cervelat'?",
    options: ["Sajt", "Svájci nemzeti kolbász", "Bor-fajta", "Pékáru"],
    correct: 1,
    explanation: "A 'svájci nemzeti kolbász' — főtt-füstölt, marhabél-burkolatban. Tipikusan kettéhasítva grillen sütik.",
  },
  {
    id: "food-toblerone",
    category: "food",
    question: "Melyik svájci város a Toblerone csoki szülőhelye?",
    options: ["Genf", "Zürich", "Bern", "Lausanne"],
    correct: 2,
    explanation: "Bern — 1908-ban Theodor Tobler alkotta. A háromszög-alak a Matterhorn-ra utal.",
  },
  {
    id: "food-rivella",
    category: "food",
    question: "Miből készül a Rivella üdítő?",
    options: ["Tejből", "Tejsavóból", "Almából", "Borból"],
    correct: 1,
    explanation: "Tejsavóból (Molke) — 1952 óta gyártják. Tipikus svájci 'kerékpáros' ital.",
  },

  // === KÖZLEKEDÉS ===
  {
    id: "trans-sbb",
    category: "transport",
    question: "Mi az SBB?",
    options: ["Svájci Bankárszövetség", "Svájci Bizottság", "Svájci Szövetségi Vasút", "Svájci Bor-szervezet"],
    correct: 2,
    explanation: "Schweizerische Bundesbahnen (SBB / CFF / FFS) — a svájci vasúttársaság. Pontos, sűrű, drága.",
  },
  {
    id: "trans-halbtax",
    category: "transport",
    question: "Mit ad a 'Halbtax' kártya?",
    options: [
      "Ingyen utazást",
      "50% kedvezményt vonaton, buszon, hajón",
      "Csak kantoni utazásra",
      "Csak hétvégén",
    ],
    correct: 1,
    explanation: "50% kedvezmény szinte minden tömegközlekedésre. Éves 170 CHF — ha sokat utazol, hamar megtérül.",
  },
  {
    id: "trans-ga",
    category: "transport",
    question: "Mit ad a 'GA' (Generalabonnement)?",
    options: [
      "Csak a vonatokon szabad utazás",
      "Korlátlan utazás minden SBB + buszon + hajón + sok hegyivasúton",
      "Csak a hegyi-vonatok",
      "Csak Zürich kantonban",
    ],
    correct: 1,
    explanation: "Évente kb. 3 860 CHF (felnőtt 2. osztály). Korlátlan utazás — drága, de mindenki esküszik rá.",
  },
  {
    id: "trans-postauto",
    category: "transport",
    question: "Mi a 'PostAuto'?",
    options: [
      "Posta-kézbesítő autó",
      "Sárga svájci poszta-busz, főleg hegyi-utakra",
      "Helyi taxi",
      "Postai pénzátutalás",
    ],
    correct: 1,
    explanation: "A sárga PostAuto-k mennek oda is, ahova a vonat nem — kis falvakba, hegyekbe. Az SBB partnere.",
  },
  {
    id: "trans-license",
    category: "transport",
    question: "Mennyi időn belül kell magyar jogosítványt svájcira cserélni?",
    options: ["3 hónap", "6 hónap", "12 hónap", "24 hónap"],
    correct: 2,
    explanation: "12 hónap a Svájcba érkezéstől. Vizsga nem kell — papíralapú eljárás a Strassenverkehrsamt-on.",
  },

  // === INTÉZMÉNYEK ===
  {
    id: "inst-ahv",
    category: "institutions",
    question: "Mi az AHV?",
    options: [
      "Egészségbiztosítás",
      "Öregségi nyugdíj-biztosítás",
      "Munkanélküli-segély",
      "Lakásépítési alap",
    ],
    correct: 1,
    explanation: "Alters- und Hinterlassenenversicherung — az állami nyugdíj-rendszer (1. piller).",
  },
  {
    id: "inst-eth",
    category: "institutions",
    question: "Mi az ETH Zürich?",
    options: [
      "Zürich városi egyetem",
      "Szövetségi műszaki egyetem",
      "Magán pénzügyi főiskola",
      "Természetgyógyász egyetem",
    ],
    correct: 1,
    explanation: "Eidgenössische Technische Hochschule — Einstein, Pauli, Röntgen iskolája. A világ top 10 egyetemei közt.",
  },
  {
    id: "inst-bag",
    category: "institutions",
    question: "Mi a BAG?",
    options: [
      "Bizalmasok Akciós Gyűlése",
      "Bundesamt für Gesundheit — Egészségügyi Hivatal",
      "Bázeli Akadémia",
      "Berni Adóhivatal",
    ],
    correct: 1,
    explanation: "Bundesamt für Gesundheit — a szövetségi egészségügyi hivatal. Covid-idején vált ismertté.",
  },
  {
    id: "inst-suva",
    category: "institutions",
    question: "Mi a SUVA?",
    options: [
      "Svájci hadsereg",
      "Baleseti biztosító (Schweizerische Unfallversicherungsanstalt)",
      "Bevándorlási hivatal",
      "Diákszervezet",
    ],
    correct: 1,
    explanation: "Schweizerische Unfallversicherungsanstalt — kötelező baleseti biztosító a munkavállalóknak.",
  },
  {
    id: "inst-quellensteuer",
    category: "institutions",
    question: "Mi a Quellensteuer?",
    options: [
      "Forrásadó — a bér-ből automatikusan levont adó",
      "Vízszolgáltatási díj",
      "Sport-egyesületi tagdíj",
      "Helyi parkolási bírság",
    ],
    correct: 0,
    explanation: "A B-engedélyes külföldiek bérét forrás-adózással terhelik. A munkáltató automatikusan vonja le és átutalja.",
  },
  {
    id: "inst-3a",
    category: "institutions",
    question: "Mi a '3a-piller'?",
    options: [
      "Magán nyugdíj-megtakarítás adómentesen",
      "Egészségbiztosítás kiegészítés",
      "Lakhatási támogatás",
      "Munkáltatói bónusz",
    ],
    correct: 0,
    explanation: "A 3. piller 'a' része — adómentes magán nyugdíj-megtakarítás. Max 7 056 CHF/év 2024-ben (alkalmazottaknak).",
  },

  // === HÉTKÖZNAPOK ===
  {
    id: "ev-currency",
    category: "everyday",
    question: "Milyen pénznem hivatalos Svájcban?",
    options: ["Euro", "Svájci frank (CHF)", "Schilling", "Euro és CHF egyszerre"],
    correct: 1,
    explanation: "Svájci frank (CHF) — szinte mindenhol elfogadnak EUR-t is, de visszajárót CHF-ben adnak.",
  },
  {
    id: "ev-postcode",
    category: "everyday",
    question: "Hány számjegyű egy svájci irányítószám?",
    options: ["3", "4", "5", "6"],
    correct: 1,
    explanation: "4 számjegy. Pl. 8001 Zürich, 3000 Bern, 1000 Lausanne.",
  },
  {
    id: "ev-numberplate",
    category: "everyday",
    question: "Mit jelez a rendszámtábla első része (pl. ZH, BE, GE)?",
    options: ["Évjárat", "Modell", "Kanton", "Tulajdonos kora"],
    correct: 2,
    explanation: "A kanton ahol a kocsi regisztrálva van. Pl. ZH = Zürich, BE = Bern, TI = Ticino.",
  },
  {
    id: "ev-recycling",
    category: "everyday",
    question: "Mi a 'Gebührensack'?",
    options: [
      "Egy díjas hivatalos szemeteszsák — különben bírságot kapsz",
      "Bevásárló-szatyor",
      "Adózási iratcsomó",
      "Postai csomag-doboz",
    ],
    correct: 0,
    explanation: "Sok kantonban (ZH, BE, BS, AG) speciális, díjas zsákba kell tenni a szemetet. Normál zsákban hagyni = 200+ CHF bírság.",
  },
  {
    id: "ev-sunday",
    category: "everyday",
    question: "Mit nem szabad vasárnap Svájcban?",
    options: [
      "Sétálni az utcán",
      "Hangos házimunkát végezni (fűnyírás, fúrás, mosógép)",
      "Bevásárolni a benzinkutaknál",
      "Kerékpározni",
    ],
    correct: 1,
    explanation: "'Sonntagsruhe' — vasárnap a lakókörnyezetben tilos a hangos tevékenység (fűnyírás, fúrás, hangos beszéd). A szomszéd feljelenthet.",
  },
  {
    id: "ev-recycling-pet",
    category: "everyday",
    question: "Hol gyűjtik a PET-palackokat?",
    options: [
      "Csak a magán-szelektív házaknál",
      "A boltokban (Migros, Coop) ingyen visszadobható",
      "Csak az újrahasznosító központokban",
      "A normál szemetesbe is mehet",
    ],
    correct: 1,
    explanation: "Minden Migros/Coop-ban van PET-gyűjtő. Ingyenes, kötelező visszahozni a betétdíjas nem-betétdíjasokat sem dobjuk a normál szemétbe.",
  },
];

export function getQuestion(id: string): QuizQuestion | null {
  return QUIZ_BANK.find((q) => q.id === id) ?? null;
}
